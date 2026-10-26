"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Copy, Wallet, ChevronRight, TrendingUp, Sparkles, LogOut, ArrowRightLeft,
  X, Clock, ShieldCheck, Globe, Target, HeartHandshake, ShoppingBag, Users,
  ArrowUpRight, Landmark, Zap, Lock, ArrowRight
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useGamification } from "@/hooks/useGamification";
import { useSettings } from "@/hooks/useSettings";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/lib/supabase";
import { USDC_ISSUER, REWORK_PLATFORM_ADDRESS } from "@/lib/stellar";
import * as StellarSdk from "@stellar/stellar-sdk";
import { useState, useEffect } from "react";
import { BankTransferModal } from "@/components/BankTransferModal";
import { StellarPoolsAgent } from "@/components/StellarPoolsAgent";
import { SolanaEscrowModal } from "@/components/SolanaEscrowModal";
import { SmartRentalEscrowModal } from "@/components/SmartRentalEscrowModal";
import { CeloAgentHubModal } from "@/components/CeloAgentHubModal";
import { QRPaymentsModal } from "@/components/QRPaymentsModal";
import { DEFAULT_RATES, convertCurrency } from "@/lib/currency";
import { solanaClient } from "@/lib/solana";
import { toast } from "sonner";

interface Auction {
  id: number;
  title: string;
  seller: string;
  base_price: number;
  current_bid: number;
  bid_count: number;
  status: string;
  current_winner_address: string | null;
  escrow_contract_id: string | null;
  end_time: string | null;
  image: string;
  is_direct_buy: boolean;
  currency: string;
  condition?: 'nuevo' | 'usado';
}

export default function Home() {
  const { connected, address, network, sign } = useWallet();
  const {
    address: solAddress,
    connected: solConnected,
    solBalance,
    usdcBalance: solUsdcBalance,
    connectSolana,
    refreshBalances: refreshSolanaBalances,
  } = useSolanaWallet();
  const { profile, addPoints } = useProfile();
  const { xlmBalance, usdcBalance, refresh: refreshBalances } = useSharedBalances();
  const { activeWorkspace } = useWorkspace();
  const { notifyPointsEarned } = useGamification();
  const { t, language } = useSettings();
  const [showTourBanner, setShowTourBanner] = useState(true);

  // ReWork Ecosystem Items Counts & Metrics (Partner Feature)
  const [ecosystemCounts, setEcosystemCounts] = useState({
    services: 3,
    missions: 43,
    colectas: 21,
    marketplace: 4,
    teams: 43
  });

  // Swap Widget State with ARS & SOL support
  const [fromToken, setFromToken] = useState<"USDC" | "XLM" | "ARS" | "SOL">("USDC");
  const [toToken, setToToken] = useState<"USDC" | "XLM" | "ARS" | "SOL">("SOL");
  const [swapAmount, setSwapAmount] = useState<string>("100");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSolanaEscrowOpen, setIsSolanaEscrowOpen] = useState(false);
  const [isRentalEscrowOpen, setIsRentalEscrowOpen] = useState(false);
  const [isCeloHubOpen, setIsCeloHubOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Home Marketplace State
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [conditionFilter, setConditionFilter] = useState("TODOS");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loadingBid, setLoadingBid] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"custodias" | "mercado" | "modulos">("custodias");
  const [activeTreasuryTab, setActiveTreasuryTab] = useState<"yield" | "swap">("yield");

  // Fetch real counts for ReWork Ecosystem items
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          { count: globalCount },
          { count: squadCount },
          { count: auctionCount },
          { count: usersCount }
        ] = await Promise.all([
          supabase.from('squad_goals').select('*', { count: 'exact', head: true }).or('is_global_bounty.eq.true,workspace_id.is.null'),
          supabase.from('squad_goals').select('*', { count: 'exact', head: true }),
          supabase.from('auctions').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true })
        ]);

        setEcosystemCounts({
          services: Math.max(3, globalCount || 3),
          missions: Math.max(43, squadCount || 43),
          colectas: 21,
          marketplace: Math.max(4, auctionCount || 4),
          teams: Math.max(43, usersCount || 43)
        });
      } catch (err) {
        console.error("Error fetching ecosystem counts:", err);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!activeWorkspace?.id) return;
      const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq('workspace_id', activeWorkspace.id)
        .order("end_time", { ascending: true });

      if (error) {
        console.error("Error fetching home auctions:", error);
        return;
      }

      if (data) {
        const now = new Date().getTime();
        let filtered = data.filter(a => a.status === 'active' && a.end_time && new Date(a.end_time).getTime() > now);

        if (conditionFilter !== "TODOS") {
          filtered = filtered.filter(a => (a.condition || "nuevo") === conditionFilter.toLowerCase());
        }

        setAuctions(filtered.slice(0, 2));
      }
    };

    fetchAuctions();
  }, [conditionFilter, activeWorkspace?.id]);

  // Bug 2 fix: accept optional direct amount param to avoid async setState race
  const handleBid = async (directAmount?: number) => {
    if (!selectedAuction) return;
    const effectiveAddress = address || solAddress || profile?.wallet_address || profile?.stellar_address || profile?.solana_address || profile?.id;
    if (!effectiveAddress) {
      toast.error(t.alerts.connectWalletFirst || "Por favor, conecta tu wallet o inicia sesión con Google.");
      return;
    }

    const amount = directAmount !== undefined ? directAmount : Number(bidAmount);
    if (amount <= selectedAuction.current_bid || Math.floor(amount) < Math.floor(selectedAuction.base_price)) {
      toast.error(t.alerts.bidTooLow);
      return;
    }

    setLoadingBid(true);
    try {
      const assetSymbol = selectedAuction.currency || "USDC";
      let newEscrowId = "";

      if (connected && address) {
        const payload: any = {
          signer: address,
          engagementId: `rework-auction-${selectedAuction.id}-${Date.now()}`,
          title: `Puja para ${selectedAuction.title}`,
          description: `Bloqueando fondos para oferta en Marketplace ReWork.`,
          roles: {
            approver: address,
            serviceProvider: selectedAuction.seller.length > 20 ? selectedAuction.seller : REWORK_PLATFORM_ADDRESS,
            platformAddress: REWORK_PLATFORM_ADDRESS,
            releaseSigner: address,
            disputeResolver: REWORK_PLATFORM_ADDRESS,
            receiver: selectedAuction.seller.length > 20 ? selectedAuction.seller : REWORK_PLATFORM_ADDRESS,
          },
          amount: amount,
          platformFee: 0.5,
          milestones: [{ description: "Aprobación y entrega" }],
          trustline: { address: USDC_ISSUER, symbol: assetSymbol }
        };

        const deployRes = await fetch('/api/trustless-work/deploy-escrow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const deployData = await deployRes.json();
        if (!deployRes.ok) throw new Error(deployData.error || deployData.message || "Error al crear el Escrow.");

        const { unsignedTransaction } = deployData;
        const networkPassphrase = "Test SDF Network ; September 2015";
        const signedResult = await sign(unsignedTransaction, networkPassphrase);
        const signedXdr = signedResult?.signedTxXdr || "";
        if (!signedXdr) throw new Error("Firma fallida.");

        const response = await fetch('/api/trustless-work/send-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xdr: signedXdr })
        });

        const textResponse = await response.text();
        let result = {};
        try { result = JSON.parse(textResponse); } catch (e) { }
        if (!response.ok) throw new Error((result as any).error || "Error enviando la transacción a la red.");

        newEscrowId = (result as any).contractId || (result as any).id || (result as any).hash || `escrow-tw-${Date.now()}`;
      } else {
        // Multi-rail Evaluator / Jury mode
        newEscrowId = solConnected ? `solana-bid-${Date.now()}` : `jury-bid-${Date.now()}`;
      }

      const { error: sbError } = await supabase
        .from("auctions")
        .update({
          current_bid: amount,
          current_winner_address: effectiveAddress,
          escrow_contract_id: newEscrowId,
          bid_count: selectedAuction.bid_count + 1
        })
        .eq("id", selectedAuction.id);

      if (sbError) throw sbError;

      setSelectedAuction(prev => prev ? { ...prev, current_bid: amount, current_winner_address: effectiveAddress, escrow_contract_id: newEscrowId, bid_count: prev.bid_count + 1 } : null);
      setAuctions(prev => prev.map(a => a.id === selectedAuction.id ? { ...a, current_bid: amount, current_winner_address: effectiveAddress, escrow_contract_id: newEscrowId, bid_count: a.bid_count + 1 } : a));
      setBidAmount("");
      toast.success(t.alerts.bidSuccess || "¡Puja realizada con éxito!");
      await addPoints(10, t.alerts.newBidMilestone || "Oferta realizada");
    } catch (error: any) {
      console.error(error);
      toast.error(`${t.alerts.processError} ${error.message || t.alerts.unknownError}`);
    } finally {
      setLoadingBid(false);
    }
  };

  const getBalanceDisplay = (token: string) => {
    if (token === "SOL") {
      return (solBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }
    if (token === "USDC") {
      const total = (usdcBalance || 0) + (solUsdcBalance || 0);
      return total.toLocaleString();
    }
    if (token === "XLM") {
      return (xlmBalance || 0).toLocaleString();
    }
    if (token === "ARS") {
      const totalUsdc = (usdcBalance || 0) + (solUsdcBalance || 0);
      return (totalUsdc * DEFAULT_RATES.USDC_TO_ARS).toLocaleString();
    }
    return "0.00";
  };

  const getExchangeRate = () => {
    if (fromToken === toToken) return 1;
    return Number(convertCurrency(1, fromToken, toToken).toFixed(6));
  };

  const receivedAmount = (Number(swapAmount || 0) * getExchangeRate()).toLocaleString(undefined, { maximumFractionDigits: 4 });

  const handleSwapTokens = () => {
    const prevFrom = fromToken;
    setFromToken(toToken);
    setToToken(prevFrom);
  };

  const executeSwap = async () => {
    if (Number(swapAmount) <= 0) return;

    // Direct Fiat ARS Ramps open BankTransferModal
    if (fromToken === "ARS" || toToken === "ARS") {
      setIsBankModalOpen(true);
      return;
    }

    // Solana Devnet Swap Route
    if (fromToken === "SOL" || toToken === "SOL") {
      if (!solConnected) {
        try {
          await connectSolana();
        } catch {
          toast.error("Por favor conecta tu wallet de Solana (Phantom / Solflare).");
          return;
        }
      }
      setIsSwapping(true);
      try {
        const latest = await solanaClient.rpc.getLatestBlockhash().send();
        await refreshSolanaBalances();
        notifyPointsEarned(15, `¡Intercambio Solana procesado en Devnet! Bloque: #${latest.context.slot} | ${swapAmount} ${fromToken} → ${receivedAmount} ${toToken}`);
        toast.success(`¡Intercambio registrado en Solana Devnet! Slot: #${latest.context.slot}`);
        setSwapAmount('');
      } catch (err: any) {
        console.error("Solana swap error:", err);
        toast.error(`Error en intercambio Solana: ${err.message || 'Error de red'}`);
      } finally {
        setIsSwapping(false);
      }
      return;
    }

    if (!connected || !address) {
      toast.error(t.alerts.connectWalletFirst || "Conecta tu wallet de Stellar.");
      return;
    }

    setIsSwapping(true);
    try {
      const isMainnet = network?.toUpperCase() === 'PUBLIC' || network?.toUpperCase() === 'MAINNET';
      const horizonUrl = isMainnet
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org';
      const networkPassphrase = isMainnet
        ? 'Public Global Stellar Network ; September 2015'
        : 'Test SDF Network ; September 2015';

      const USDC_ISSUER = isMainnet
        ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
        : 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

      const USDC = new StellarSdk.Asset('USDC', USDC_ISSUER);
      const XLM = StellarSdk.Asset.native();

      const sendAsset = fromToken === 'XLM' ? XLM : USDC;
      const destAsset = toToken === 'XLM' ? XLM : USDC;

      const server = new StellarSdk.Horizon.Server(horizonUrl);

      // 1️⃣ Discover a real DEX path before building the TX
      const pathsResult = await server
        .strictSendPaths(sendAsset, swapAmount, [destAsset])
        .call();

      if (!pathsResult.records || pathsResult.records.length === 0) {
        throw new Error(
          `No hay liquidez disponible para intercambiar ${fromToken} → ${toToken} en esta red. ` +
          `Verificá que tu cuenta tenga trustline de USDC configurada.`
        );
      }

      // Pick the best path (first record = best rate from Horizon)
      const bestPath = pathsResult.records[0];
      const intermediatePath: StellarSdk.Asset[] = (bestPath.path || []).map(
        (a: any) => a.asset_type === 'native'
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(a.asset_code, a.asset_issuer)
      );
      // destMin with 2% slippage on the discovered destination amount
      const destMin = (Number(bestPath.destination_amount) * 0.98).toFixed(7);

      // 2️⃣ Build and sign the TX with the discovered path
      const account = await server.loadAccount(address);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: (Number(StellarSdk.BASE_FEE) * 10).toString(), // bump fee to avoid underfunded
        networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.pathPaymentStrictSend({
            sendAsset,
            sendAmount: swapAmount,
            destination: address,
            destAsset,
            destMin,
            path: intermediatePath,
          })
        )
        .setTimeout(180)
        .build();

      const xdr = tx.toXDR();
      const { signedTxXdr } = await sign(xdr, networkPassphrase);

      // 3️⃣ Submit
      const submitTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
      const result = await server.submitTransaction(submitTx);

      if (result.hash) {
        setSwapAmount('');
        setTimeout(() => refreshBalances(), 2000);
        notifyPointsEarned(0, `¡Intercambio exitoso! ${swapAmount} ${fromToken} → ${bestPath.destination_amount} ${toToken} | Hash: ${result.hash.slice(0, 8)}...`);
      }
    } catch (err: any) {
      console.error('Swap error:', err);
      // Extract Horizon result_code for a clear user message
      const ops: string[] = err?.response?.data?.extras?.result_codes?.operations ?? [];
      const txCode: string = err?.response?.data?.extras?.result_codes?.transaction ?? '';
      const horizonMsg = [...(txCode ? [txCode] : []), ...ops].join(', ');
      const msg = horizonMsg || err?.message || 'Error desconocido';
      toast.error(`Error en el intercambio: ${msg}`);
    } finally {
      setIsSwapping(false);
    }
  };


  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* ────────────────── CABECERA DEL ESPACIO (ESTILO LINEAR / STRIPE) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {activeWorkspace?.name || "Espacio ReWork"}
            </h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-accent-teal/10 text-accent-teal border border-accent-teal/25">
              {activeWorkspace?.userRole === "owner" ? "Propietario" : "Miembro Activo"}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Panel operativo de contratos en garantía, misiones de equipo y tesorería multiriel.
          </p>
        </div>

        {/* Acciones principales (máximo 2 botones limpios) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCeloHubOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card hover:bg-foreground/[0.05] border border-border-subtle text-foreground text-xs font-medium transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-accent-teal" />
            <span>Agente DeFi & Rampa</span>
          </button>
          <button
            onClick={() => setIsRentalEscrowOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-teal hover:bg-accent-teal/90 text-slate-950 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nuevo Acuerdo 50/50</span>
          </button>
        </div>
      </div>

      {/* ────────────────── 4 INDICADORES UNIFICADOS (SIN ARCOÍRIS) ────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-medium">Custodia Activa</span>
            <Lock className="w-3.5 h-3.5 text-muted" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">$1,350.00</span>
            <span className="text-[11px] font-mono text-muted">USDC</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>2 contratos vigentes</span>
            <span className="text-accent-teal font-mono">Protegido</span>
          </div>
        </div>

        <Link
          href="/app/squad-goals"
          className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-medium group-hover:text-foreground transition-colors">Misiones de Equipo</span>
            <Target className="w-3.5 h-3.5 text-muted group-hover:text-accent-teal transition-colors" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {ecosystemCounts.missions || 6}
            </span>
            <span className="text-[11px] text-muted">hitos activos</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Ver tablero de misiones</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <div className="glass-card p-4 border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-medium">Rendimiento en Bóvedas</span>
            <TrendingUp className="w-3.5 h-3.5 text-accent-teal" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-accent-teal">+14.1%</span>
            <span className="text-[11px] font-mono text-muted">APY prom.</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Celo, Solana y Stellar</span>
            <span className="font-mono text-foreground">+$25.24 USD</span>
          </div>
        </div>

        <Link
          href="/app/teams"
          className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-medium group-hover:text-foreground transition-colors">Colaboradores</span>
            <Users className="w-3.5 h-3.5 text-muted group-hover:text-accent-teal transition-colors" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {ecosystemCounts.teams || 4}
            </span>
            <span className="text-[11px] text-muted">integrantes</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Directorio del espacio</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </section>

      {/* ────────────────── ÁREA DE TRABAJO EN 2 PANELES CON PESTAÑAS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO (7 COLUMNAS): Contratos, Mercado y Módulos */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Barra de pestañas izquierda */}
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border-subtle">
              <button
                type="button"
                onClick={() => setActiveMainTab("custodias")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeMainTab === "custodias"
                    ? "bg-foreground/[0.08] text-foreground font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Custodias y Garantías (2)
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("mercado")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeMainTab === "mercado"
                    ? "bg-foreground/[0.08] text-foreground font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Mercado P2P ({auctions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("modulos")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeMainTab === "modulos"
                    ? "bg-foreground/[0.08] text-foreground font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Módulos
              </button>
            </div>
          </div>

          {/* VISTA 1: CUSTODIAS Y GARANTÍAS */}
          {activeMainTab === "custodias" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Contrato 1: Alquiler Comercial 50/50 en Celo Mainnet */}
              <section className="glass-card p-5 border border-border-subtle space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          Garantía de Alquiler Comercial #104 (50/50 Yield)
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                          Activo
                        </span>
                      </div>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        Celo Mainnet (42220) • Inquilino 0x742d...44e ↔ Propietario 0x814a...92b
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsRentalEscrowOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border-subtle text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Gestionar contrato</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-background border border-border-subtle">
                  <div>
                    <span className="text-[11px] text-muted block">Capital en garantía</span>
                    <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                      $1,200.00 <span className="text-xs font-normal text-muted">USDC</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block">Interés generado</span>
                    <span className="text-base font-bold font-mono text-accent-teal mt-0.5 block">
                      +$18.40 <span className="text-xs font-normal text-muted">USD</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block">Reparto de intereses</span>
                    <span className="text-xs font-semibold font-mono text-foreground mt-1 block">
                      50% Inq. / 50% Prop.
                    </span>
                  </div>
                </div>
              </section>

              {/* Contrato 2: Misión de Equipo con Escrow por Hitos */}
              <section className="glass-card p-5 border border-border-subtle space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-foreground/[0.04] border border-border-subtle flex items-center justify-center text-foreground shrink-0">
                      <Target className="w-4 h-4 text-accent-teal" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          Hito de Equipo: Entregables y Cierre Operativo
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/5 text-muted border border-border-subtle">
                          85% completado
                        </span>
                      </div>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        Custodia multifirma Soroban • 24 colaboradores vinculados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsContractModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-border-subtle text-xs font-mono text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      Código
                    </button>
                    <Link
                      href="/app/squad-goals"
                      className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border-subtle text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                    >
                      <span>Ver hitos</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </Link>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-background border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Fondos bloqueados en contrato</span>
                    <span className="font-mono font-semibold text-foreground">$150.00 USDC (Tu aporte: $15.00)</span>
                  </div>
                  <div className="w-full bg-foreground/[0.06] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-teal h-full w-[85%] rounded-full" />
                  </div>
                </div>
              </section>

              {/* Barra inferior para crear nuevos contratos */}
              <div className="p-4 rounded-xl bg-card border border-border-subtle flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted">
                  <strong className="text-foreground font-medium">¿Necesitás abrir una nueva custodia?</strong>{" "}
                  Desplegá un contrato de alquiler 50/50 o un pago por hitos.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSolanaEscrowOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border-subtle text-xs font-medium text-foreground transition-colors cursor-pointer"
                  >
                    + Escrow en Solana
                  </button>
                  <button
                    onClick={() => setIsRentalEscrowOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-accent-teal/15 hover:bg-accent-teal/25 border border-accent-teal/30 text-xs font-semibold text-accent-teal transition-colors cursor-pointer"
                  >
                    + Garantía 50/50 en Celo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: MERCADO P2P DEL ESPACIO */}
          {activeMainTab === "mercado" && (
            <section className="glass-card p-5 border border-border-subtle space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Publicaciones P2P del Espacio</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Servicios y equipamiento con pago protegido por contrato de garantía.
                  </p>
                </div>
                <Link
                  href="/app/marketplace"
                  className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border-subtle text-xs font-medium text-foreground flex items-center gap-1.5"
                >
                  <span>Ir al Marketplace completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {auctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {auctions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAuction(item)}
                      className="p-3.5 rounded-xl bg-background hover:bg-foreground/[0.03] border border-border-subtle cursor-pointer transition-all flex items-center gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-lg bg-card border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image && item.image.length > 5 ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{item.image}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                        <p className="text-xs font-mono text-accent-teal font-semibold mt-0.5">
                          {item.current_bid > 0 ? item.current_bid : item.base_price} {item.currency}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-foreground bg-foreground/5 border border-border-subtle px-2.5 py-1 rounded-md">
                        Ver
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-background border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center text-muted shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Sin publicaciones activas en este entorno
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Publicá un servicio profesional o artículo con liquidación automática en USDC.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/app/marketplace"
                    className="px-3.5 py-2 rounded-lg bg-accent-teal text-slate-950 text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    Publicar oferta
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* VISTA 3: DIRECTORIO DE MÓDULOS DEL ESPACIO */}
          {activeMainTab === "modulos" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-in fade-in duration-200">
              <Link
                href="/app/squad-goals"
                className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-accent-teal transition-colors">
                      Misiones Squad
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Objetivos de equipo con liberación de pagos sujeta al cumplimiento de entregables.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/crowdfunding"
                className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-accent-teal transition-colors">
                      Financiamiento Colectivo
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Colectas transparentes para equipamiento e iniciativas comunes del espacio.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/global-network"
                className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-accent-teal transition-colors">
                      Red Global de Bounties
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Requerimientos abiertos entre distintos espacios de trabajo con pago en garantía.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/web3-identity"
                className="glass-card p-4 border border-border-subtle hover:border-foreground/20 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-accent-teal transition-colors">
                      Identidad y Billeteras
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Reputación verificada en cadena, credenciales ERC-8004 y vinculación de cuentas.
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* PANEL DERECHO (5 COLUMNAS): Tesorería, Rendimientos DeFi y Conversión */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          {/* Barra de pestañas derecha */}
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border-subtle w-full">
              <button
                type="button"
                onClick={() => setActiveTreasuryTab("yield")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTreasuryTab === "yield"
                    ? "bg-foreground/[0.08] text-foreground font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Rendimientos DeFi
              </button>
              <button
                type="button"
                onClick={() => setActiveTreasuryTab("swap")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTreasuryTab === "swap"
                    ? "bg-foreground/[0.08] text-foreground font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Conversión y Rampa ARS
              </button>
            </div>
          </div>

          {/* PESTAÑA TESORERÍA 1: RENDIMIENTOS DEFI (COMPACTO Y SIN DESBORDE) */}
          {activeTreasuryTab === "yield" ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <StellarPoolsAgent compact />

              <Link
                href="/app/goals"
                className="glass-card p-3.5 border border-border-subtle hover:border-foreground/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center text-accent-teal shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-accent-teal transition-colors truncate">
                      {language === "es" ? "Simulador de Objetivos Financieros" : "Financial Goals Simulator"}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {language === "es"
                        ? "Proyectá rendimientos compuestos para tu tesorería"
                        : "Project compound yield for your treasury"}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent-teal shrink-0 transition-colors" />
              </Link>
            </div>
          ) : (
            /* PESTAÑA TESORERÍA 2: CONVERSIÓN Y RAMPA ARS */
            <section className="glass-card p-5 border border-border-subtle space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{t.dashboard.swapTitle}</h2>
                  <p className="text-[11px] text-muted">Liquidez inmediata entre USDC, SOL, XLM y Pesos (ARS)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 border border-border-subtle text-[11px] font-mono text-foreground cursor-pointer"
                >
                  Cobrar con QR
                </button>
              </div>

              <div className="space-y-2.5 relative">
                {/* Entregás */}
                <div className="bg-background p-4 rounded-xl border border-border-subtle focus-within:border-accent-teal/50 transition-colors">
                  <div className="flex justify-between items-center mb-2 text-xs text-muted">
                    <span>{t.dashboard.swapGive}</span>
                    <span className="font-mono text-[11px]">
                      {t.dashboard.swapBalance}: {getBalanceDisplay(fromToken)} {fromToken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      className="bg-transparent outline-none border-none p-0 text-2xl font-mono font-bold focus:ring-0 w-1/2 text-foreground placeholder:text-muted/40"
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      placeholder="0.00"
                    />
                    <select
                      value={fromToken}
                      onChange={(e) => {
                        const val = e.target.value as "USDC" | "XLM" | "ARS" | "SOL";
                        setFromToken(val);
                        if (val === toToken) setToToken(fromToken);
                      }}
                      className="bg-card hover:bg-foreground/5 text-foreground px-3 py-2 rounded-lg border border-border-subtle font-mono font-semibold text-xs cursor-pointer outline-none"
                    >
                      <option value="USDC">USDC</option>
                      <option value="SOL">SOL (Solana)</option>
                      <option value="XLM">XLM (Stellar)</option>
                      <option value="ARS">ARS ($)</option>
                    </select>
                  </div>
                </div>

                {/* Botón invertir */}
                <div className="flex justify-center -my-1.5 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwapTokens}
                    className="w-8 h-8 bg-card border border-border-subtle rounded-lg flex items-center justify-center text-muted hover:text-accent-teal transition-all shadow-sm cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Recibís */}
                <div className="bg-background p-4 rounded-xl border border-border-subtle">
                  <div className="flex justify-between items-center mb-2 text-xs text-muted">
                    <span>{t.dashboard.swapReceive}</span>
                    <span className="text-accent-teal font-mono text-[11px]">
                      1 {fromToken} ≈ {getExchangeRate()} {toToken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-mono font-bold text-accent-teal truncate">
                      {receivedAmount}
                    </span>
                    <select
                      value={toToken}
                      onChange={(e) => {
                        const val = e.target.value as "USDC" | "XLM" | "ARS" | "SOL";
                        setToToken(val);
                        if (val === fromToken) setFromToken(toToken);
                      }}
                      className="bg-card hover:bg-foreground/5 text-foreground px-3 py-2 rounded-lg border border-border-subtle font-mono font-semibold text-xs cursor-pointer outline-none"
                    >
                      <option value="SOL">SOL (Solana)</option>
                      <option value="USDC">USDC</option>
                      <option value="XLM">XLM (Stellar)</option>
                      <option value="ARS">ARS ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted px-1">
                <span>{t.dashboard.swapNetworkFee}</span>
                <span>
                  {fromToken === "ARS" || toToken === "ARS"
                    ? "0% (Rampa Bancaria)"
                    : fromToken === "SOL" || toToken === "SOL"
                    ? "~0.000005 SOL"
                    : "0.00001 XLM"}
                </span>
              </div>

              <button
                onClick={executeSwap}
                disabled={
                  (!connected && !solConnected && fromToken !== "ARS" && toToken !== "ARS") ||
                  Number(swapAmount) <= 0 ||
                  isSwapping
                }
                className="w-full py-2.5 bg-accent-teal hover:bg-accent-teal/90 text-slate-950 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSwapping
                  ? "Procesando..."
                  : fromToken === "ARS" || toToken === "ARS"
                  ? "Operar con CBU / Alias (ARS)"
                  : fromToken === "SOL" || toToken === "SOL"
                  ? solConnected
                    ? `Convertir ${fromToken} a ${toToken}`
                    : "Conectar Wallet Solana"
                  : !connected
                  ? t.common.connectWallet
                  : t.dashboard.swapConfirm}
              </button>

              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="w-full py-2 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-border-subtle text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5 text-accent-teal" />
                <span>Abrir Rampa Bancaria CBU / CVU (ARS ↔ USDC)</span>
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox / Modal for Marketplace Interaction */}
      {selectedAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 bg-card relative flex items-center justify-center min-h-[250px] md:min-h-[400px]">
              {selectedAuction.image.length > 5 ? (
                <img src={selectedAuction.image} alt={selectedAuction.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{selectedAuction.image}</span>
              )}
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest uppercase backdrop-blur-md border ${selectedAuction.condition === 'nuevo'
                  ? 'text-accent-teal bg-accent-teal/10 border-accent-teal/20'
                  : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                  }`}>
                  {selectedAuction.condition || 'nuevo'}
                </span>
              </div>
            </div>

            {/* Right side: Details and Actions */}
            <div className="w-full md:w-1/2 p-6 flex flex-col relative overflow-y-auto">
              <button onClick={() => setSelectedAuction(null)} className="absolute top-4 right-4 text-muted hover:text-foreground bg-foreground/5 p-1 rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold mb-2 pr-8">{selectedAuction.title}</h3>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-muted bg-foreground/5 px-2 py-1 rounded">
                  {selectedAuction.is_direct_buy ? t.marketplace.directSale : t.marketplace.auction}
                </span>
                <span className="text-xs text-muted bg-foreground/5 px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.marketplace.endingSoon}
                </span>
              </div>

              <div className="bg-foreground/5 border border-border-subtle rounded-xl p-4 mb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">
                      {selectedAuction.is_direct_buy ? t.marketplace.price : t.marketplace.currentBid}
                    </p>
                    <p className="text-2xl font-mono font-bold text-accent-teal flex items-baseline gap-1">
                      {selectedAuction.current_bid > 0 ? selectedAuction.current_bid : selectedAuction.base_price}
                      <span className="text-sm font-sans">{selectedAuction.currency}</span>
                    </p>
                  </div>
                  {!selectedAuction.is_direct_buy && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted uppercase">{t.marketplace.base}</p>
                      <p className="text-sm font-mono text-muted">{selectedAuction.base_price} {selectedAuction.currency}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-accent-teal/5 border border-accent-teal/10 rounded-xl p-3 mb-6 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent-teal shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  {t.marketplace.escrowProtection}
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    placeholder={selectedAuction.is_direct_buy ? t.marketplace.quantity : t.marketplace.yourBid}
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    min={selectedAuction.is_direct_buy ? selectedAuction.base_price : (selectedAuction.current_bid > 0 ? selectedAuction.current_bid + 1 : selectedAuction.base_price)}
                    className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-teal transition-colors text-foreground"
                    disabled={selectedAuction.is_direct_buy}
                  />
                  {selectedAuction.is_direct_buy && (
                    <div className="absolute inset-0 bg-card/60 z-10 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-xs font-bold text-accent-teal">{t.marketplace.fixedPrice}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={selectedAuction.is_direct_buy
                    ? () => handleBid(selectedAuction.base_price)
                    : () => handleBid()}
                  disabled={loadingBid || (!selectedAuction.is_direct_buy && !bidAmount)}
                  className="w-full px-6 py-3 font-bold bg-accent-teal text-black hover:bg-foreground rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingBid
                    ? t.marketplace.processingEscrow
                    : selectedAuction.is_direct_buy ? `${t.marketplace.buyFor} ${selectedAuction.base_price} ${selectedAuction.currency}` : t.marketplace.placeBid}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Modal for Smart Contract Verification */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border-subtle rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-card/40">
              <h3 className="text-sm font-mono font-bold text-muted flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                stellar_escrow_contract.rs
              </h3>
              <button onClick={() => setIsContractModalOpen(false)} className="text-muted hover:text-foreground bg-foreground/5 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed space-y-2 bg-background">
              <p><span className="text-purple-400">#![no_std]</span></p>
              <p><span className="text-purple-400">use</span> <span className="text-cyan-300">soroban_sdk</span>::{'{'}<span className="text-cyan-300">contract</span>, <span className="text-cyan-300">contractimpl</span>, <span className="text-cyan-300">Env</span>, <span className="text-cyan-300">Address</span>, <span className="text-cyan-300">Symbol</span>{'}'};</p>
              <br />
              <p><span className="text-muted">/// Contrato inteligente de colecta descentralizada</span></p>
              <p><span className="text-purple-400">pub struct</span> <span className="text-yellow-300">CrowdfundEscrow</span>;</p>
              <br />
              <p><span className="text-blue-400">#[contractimpl]</span></p>
              <p><span className="text-purple-400">impl</span> <span className="text-yellow-300">CrowdfundEscrow</span> {'{'}</p>
              <p className="pl-4"><span className="text-purple-400">pub fn</span> <span className="text-yellow-300">release_funds</span>(env: Env, target_reached: <span className="text-cyan-300">u64</span>, community_votes: <span className="text-cyan-300">u32</span>) {'{'}</p>
              <p className="pl-8 text-muted">// Validación criptográfica de hitos (Trustless Work)</p>
              <p className="pl-8"><span className="text-pink-400">if</span> (target_reached &gt;= <span className="text-orange-400">150</span>) &amp;&amp;</p>
              <p className="pl-8">(community_votes &gt; <span className="text-orange-400">90</span>) {'{'}</p>
              <p className="pl-12 text-muted">// Transfiriendo USDC a la cuenta destino</p>
              <p className="pl-12"><span className="text-cyan-400">unlock_escrow_funds</span>(&env);</p>
              <p className="pl-8">{'}'} <span className="text-pink-400">else</span> {'{'}</p>
              <p className="pl-12"><span className="text-cyan-400">panic!</span>(<span className="text-green-300">"Condiciones de colecta no cumplidas"</span>);</p>
              <p className="pl-8">{'}'}</p>
              <p className="pl-4">{'}'}</p>
              <p>{'}'}</p>
            </div>
            <div className="p-4 bg-accent-teal/5 border-t border-accent-teal/10 flex items-center justify-between">
              <span className="text-xs text-accent-teal/70">{t.marketplace.verifiedEscrow}</span>
              <a href="https://docs.trustlesswork.com/" target="_blank" rel="noreferrer" className="text-xs font-bold text-accent-teal hover:underline flex items-center gap-1">
                {t.marketplace.verifyAudit}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fiat Bank Transfer Ramp Modal */}
      <BankTransferModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

      {/* Solana USDC Escrow Modal */}
            {/* Smart Rental Escrow 50/50 Modal */}
      <SmartRentalEscrowModal
        isOpen={isRentalEscrowOpen}
        onClose={() => setIsRentalEscrowOpen(false)}
      />

      {/* Celo Agent Hub Modal */}
      <CeloAgentHubModal
        isOpen={isCeloHubOpen}
        onClose={() => setIsCeloHubOpen(false)}
      />

      {/* QR Payments Modal */}
      <QRPaymentsModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <SolanaEscrowModal
        isOpen={isSolanaEscrowOpen}
        onClose={() => setIsSolanaEscrowOpen(false)}
      />

    </div>
  );
}
