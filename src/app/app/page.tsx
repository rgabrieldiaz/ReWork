"use client";

import Image from "next/image";
import { Copy, Wallet, ChevronRight, TrendingUp, Sparkles, LogOut, ArrowRightLeft } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useGamification } from "@/hooks/useGamification";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/lib/supabase";
import * as StellarSdk from "@stellar/stellar-sdk";
import { X, Clock, ShieldCheck } from "lucide-react";

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
import { useState, useEffect } from "react";

export default function Home() {
  const { connected, address, network, sign } = useFreighter();
  const { profile, addPoints } = useProfile();
  const { xlmBalance, usdcBalance, refresh: refreshBalances } = useSharedBalances();
  const { notifyPointsEarned } = useGamification();
  const { t } = useSettings();

  // Contributors state (Bug 7: real data)
  const [contributors, setContributors] = useState<any[]>([]);

  // Swap Widget State
  const [fromToken, setFromToken] = useState<"USDC" | "XLM">("USDC");
  const [toToken, setToToken] = useState<"USDC" | "XLM">("XLM");
  const [swapAmount, setSwapAmount] = useState<string>("100");
  const [isSwapping, setIsSwapping] = useState(false);

  // Home Marketplace State
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [conditionFilter, setConditionFilter] = useState("TODOS");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loadingBid, setLoadingBid] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Bug 7: Fetch real contributors from Supabase
  useEffect(() => {
    const fetchContributors = async () => {
      const currentWorkspace = localStorage.getItem('rework_current_workspace') || '00000000-0000-0000-0000-000000000000';
      const { data } = await supabase
        .from('users')
        .select('wallet_address, first_name, last_name, avatar_url, points')
        .eq('workspace_id', currentWorkspace)
        .order('points', { ascending: false })
        .limit(5);
      if (data && data.length > 0) setContributors(data);
    };
    fetchContributors();
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*")
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
  }, [conditionFilter]);

  // Bug 2 fix: accept optional direct amount param to avoid async setState race
  const handleBid = async (directAmount?: number) => {
    if (!selectedAuction) return;
    if (!connected || !address) {
      alert(t.alerts.connectWalletFirst);
      return;
    }

    const amount = directAmount !== undefined ? directAmount : Number(bidAmount);
    if (amount <= selectedAuction.current_bid || Math.floor(amount) < Math.floor(selectedAuction.base_price)) {
      alert(t.alerts.bidTooLow);
      return;
    }

    setLoadingBid(true);
    try {
      const assetSymbol = selectedAuction.currency || "USDC";
      const dummyPlatform = "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H";
      const testnetContract = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

      const payload: any = {
        signer: address,
        engagementId: `rework-auction-${selectedAuction.id}-${Date.now()}`,
        title: `Puja para ${selectedAuction.title}`,
        description: `Bloqueando fondos para oferta en Marketplace ReWork.`,
        roles: {
          approver: address,
          serviceProvider: selectedAuction.seller.length > 20 ? selectedAuction.seller : dummyPlatform,
          platformAddress: dummyPlatform,
          releaseSigner: address,
          disputeResolver: dummyPlatform,
          receiver: selectedAuction.seller.length > 20 ? selectedAuction.seller : dummyPlatform,
        },
        amount: amount,
        platformFee: 0.5,
        milestones: [{ description: "Aprobación y entrega" }],
        trustline: { address: testnetContract, symbol: assetSymbol }
      };

      const deployRes = await fetch('/api/trustless-work/deploy-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const deployData = await deployRes.json();
      if (!deployRes.ok) throw new Error(deployData.error || deployData.message || "Error al crear el Escrow.");

      const { unsignedTransaction } = deployData;
      const net = await getNetworkDetails();
      const signedResult = await signTransaction(unsignedTransaction, {
        networkPassphrase: net.networkPassphrase || "Test SDF Network ; September 2015"
      });
      const signedXdr = typeof signedResult === "string" ? signedResult : (signedResult as any)?.signedTxXdr || (signedResult as any)?.signedXdr || (signedResult as any)?.xdr || signedResult;
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

      const newEscrowId = (result as any).contractId || (result as any).id || `escrow-mock-${Date.now()}`;

      const { error: sbError } = await supabase
        .from("auctions")
        .update({
          current_bid: amount,
          current_winner_address: address,
          escrow_contract_id: newEscrowId,
          bid_count: selectedAuction.bid_count + 1
        })
        .eq("id", selectedAuction.id);

      if (sbError) throw sbError;

      setSelectedAuction(prev => prev ? { ...prev, current_bid: amount, current_winner_address: address, escrow_contract_id: newEscrowId, bid_count: prev.bid_count + 1 } : null);
      setAuctions(prev => prev.map(a => a.id === selectedAuction.id ? { ...a, current_bid: amount, current_winner_address: address, escrow_contract_id: newEscrowId, bid_count: a.bid_count + 1 } : a));
      setBidAmount("");
      alert(t.alerts.bidSuccess);
      await addPoints(10, t.alerts.newBidMilestone);
    } catch (error: any) {
      console.error(error);
      alert(`${t.alerts.processError} ${error.message || t.alerts.unknownError}`);
    } finally {
      setLoadingBid(false);
    }
  };

  const getBalanceDisplay = (token: string) => {
    if (!connected) return "0.00";
    if (token === "USDC") return (usdcBalance || 0).toLocaleString();
    if (token === "XLM") return (xlmBalance || 0).toLocaleString();
    return "0.00";
  };

  const getExchangeRate = () => {
    // Mock exchange rates
    if (fromToken === "USDC" && toToken === "XLM") return 3.8;
    if (fromToken === "XLM" && toToken === "USDC") return 0.26;
    return 1;
  };

  const receivedAmount = (Number(swapAmount || 0) * getExchangeRate()).toFixed(2);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const executeSwap = async () => {
    if (!connected || !address || Number(swapAmount) <= 0) return;
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
      alert(`Error en el intercambio: ${msg}`);
    } finally {
      setIsSwapping(false);
    }
  };


  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-8 custom-scrollbar">
        {/* BEGIN: Left Column - Active Contracts & Market */}
        <div className="col-span-12 xl:col-span-8 space-y-8">

          {/* BEGIN: Active Contract Card */}
          <section className="glass-card overflow-hidden p-6 relative group border border-accent-teal/10">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent-teal/10 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 className="text-xs font-bold text-accent-teal uppercase tracking-widest">{t.dashboard.mainPool}</h2>
              </div>
              <span className="text-xs font-mono text-muted bg-muted/10 px-3 py-1 rounded-full border border-slate-700">{t.dashboard.statusInProgress} • {t.dashboard.endsOn} OCT 31</span>
            </div>

            <div className="mb-6 sm:mb-10">
              <h3 className="text-2xl sm:text-4xl font-bold mb-2">Asado de equipo</h3>
              <p className="text-sm sm:text-base text-muted max-w-lg">Ayudanos a financiar el evento de integración de fin de mes para celebrar los objetivos alcanzados de todo el equipo de ReWork.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8">
              <div className="bg-background/30 p-4 rounded-xl border border-border-subtle md:bg-transparent md:p-0 md:border-none">
                <p className="text-muted text-xs sm:text-sm mb-1">{t.dashboard.goal}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tighter">150</span>
                  <span className="text-accent-teal font-bold text-sm sm:text-base">USDC</span>
                </div>
                <div className="mt-4 w-full bg-muted/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent-teal h-full w-[85%] glow-teal"></div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between mt-2 text-[10px] sm:text-xs font-mono gap-1">
                  <span className="text-muted">85% {t.dashboard.completed}</span>
                  <span className="text-accent-teal">+12% {t.dashboard.thisWeek}</span>
                </div>
              </div>
              <div className="md:border-l md:border-border-subtle md:pl-12 flex flex-col justify-center bg-background/30 p-4 rounded-xl border border-border-subtle md:bg-transparent md:p-0 md:border-none">
                <p className="text-muted text-xs sm:text-sm mb-1">{t.dashboard.estimatedContribution}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tighter">15</span>
                  <span className="text-accent-teal font-bold text-sm sm:text-base">USDC</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted mt-2">{t.dashboard.rankingLabel} #12 / 24 {t.dashboard.contributorsLabel}</p>
              </div>
            </div>

            {/* Smart Contract Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContractModalOpen(true)}
                className="flex items-center gap-2 text-xs font-mono text-muted hover:text-accent-teal transition-colors bg-background border border-border-subtle px-4 py-2 rounded-xl group"
              >
                <span>stellar_escrow_contract.rs</span>
                <span className="text-accent-teal border border-accent-teal/20 bg-accent-teal/10 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-accent-teal/20 transition-colors">
                  <ShieldCheck className="w-3 h-3" /> {t.dashboard.verified}
                </span>
              </button>
            </div>
          </section>

          {/* BEGIN: Market Highlights */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold">{t.marketplace.title}</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {[
                  { key: 'TODOS', label: t.marketplace.all },
                  { key: 'NUEVO', label: t.marketplace.new },
                  { key: 'USADO', label: t.marketplace.used }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setConditionFilter(filter.key)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold rounded-xl text-[10px] sm:text-xs transition-colors whitespace-nowrap ${conditionFilter === filter.key
                      ? 'bg-accent-teal text-background border-transparent hover:bg-foreground'
                      : 'bg-foreground/5 border border-border-subtle text-muted hover:text-foreground'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {auctions.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAuction(item)}
                  className="glass-card group cursor-pointer overflow-hidden border-none relative h-72"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
                  {/* Dynamic background array for fallbacks */}
                  <div className={`absolute inset-0 -z-10 ${index % 2 === 0 ? 'bg-gradient-to-br from-emerald-900 to-deep-navy' : 'bg-gradient-to-br from-orange-900 to-deep-navy'}`}></div>

                  {item.image && item.image.length > 5 ? (
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-7xl z-0 group-hover:scale-110 transition-transform duration-500">{item.image}</span>
                  )}

                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase mb-2 inline-block ${item.condition === 'nuevo'
                      ? 'text-accent-teal bg-accent-teal/20'
                      : 'text-orange-400 bg-orange-400/20'
                      }`}>
                      {item.condition || 'nuevo'}
                    </span>
                    <h4 className="text-lg font-bold mb-4 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted uppercase">
                          {item.is_direct_buy ? t.marketplace.buyNow : t.marketplace.currentBid}
                        </span>
                        <span className="font-mono text-accent-teal font-bold">
                          {item.current_bid > 0 ? item.current_bid : item.base_price} {item.currency}
                        </span>
                      </div>
                      <button className="w-10 h-10 bg-foreground/10 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-accent-teal group-hover:text-background transition-all shrink-0 ml-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {auctions.length === 0 && (
                <div className="col-span-12 sm:col-span-2 text-center py-12 border border-border-subtle border-dashed rounded-2xl bg-card/20">
                  <p className="text-muted text-sm">{t.marketplace.noProducts}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* BEGIN: Right Column - Swap Widget & Activity */}
        <div className="col-span-12 xl:col-span-4 space-y-8">

          {/* BEGIN: Swap Widget */}
          <section className="glass-card p-6 border border-border-subtle">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">{t.dashboard.swapTitle}</h2>
              <button className="text-muted hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>
            </div>

            <div className="space-y-4 relative">
              {/* Pay Section */}
              <div className="bg-muted/10 p-5 rounded-2xl border border-border-subtle focus-within:border-accent-teal/50 transition-colors">
                <div className="flex justify-between items-center mb-4 text-xs font-semibold text-muted">
                  <span>{t.dashboard.swapGive}</span>
                  <span>{t.dashboard.swapBalance}: {getBalanceDisplay(fromToken)} {fromToken}</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    className="bg-transparent outline-none border-none p-0 text-3xl font-mono font-bold focus:ring-0 w-1/2 text-foreground placeholder:text-foreground/20"
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => {
                      const val = e.target.value as "USDC" | "XLM";
                      setFromToken(val);
                      if (val === toToken) setToToken(fromToken);
                    }}
                    className="flex items-center gap-2 bg-muted/10/80 hover:bg-border-subtle px-3 py-2 rounded-xl border border-slate-700 font-bold text-sm cursor-pointer outline-none transition-colors appearance-none"
                  >
                    <option value="USDC">USDC</option>
                    <option value="XLM">XLM</option>
                  </select>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pt-1">
                <button
                  onClick={handleSwapTokens}
                  className="w-10 h-10 bg-muted/10 border-4 border-deep-navy rounded-full flex items-center justify-center text-muted hover:text-accent-teal hover:rotate-180 transition-all duration-300 shadow-xl"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Receive Section */}
              <div className="bg-muted/10 p-5 rounded-2xl border border-border-subtle">
                <div className="flex justify-between items-center mb-4 text-xs font-semibold text-muted">
                  <span>{t.dashboard.swapReceive}</span>
                  <span className="text-accent-teal font-mono">1 {fromToken} ≈ {getExchangeRate()} {toToken} ↗</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-mono font-bold text-accent-teal">{receivedAmount}</span>
                  <select
                    value={toToken}
                    onChange={(e) => {
                      const val = e.target.value as "USDC" | "XLM";
                      setToToken(val);
                      if (val === fromToken) setFromToken(toToken);
                    }}
                    className="flex items-center gap-2 bg-muted/10/80 hover:bg-border-subtle px-3 py-2 rounded-xl border border-slate-700 font-bold text-sm cursor-pointer outline-none transition-colors appearance-none"
                  >
                    <option value="XLM">XLM</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs font-mono text-muted px-2">
              <div className="flex justify-between">
                <span>{t.dashboard.swapNetworkFee}</span>
                <span>0.00001 XLM</span>
              </div>
            </div>

            <button
              onClick={executeSwap}
              disabled={!connected || Number(swapAmount) <= 0 || isSwapping}
              className="w-full mt-8 py-4 bg-gradient-to-r from-accent-teal/20 to-accent-teal/40 border border-accent-teal/30 hover:border-accent-teal/60 rounded-2xl font-bold flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className={`absolute left-0 top-0 h-full w-full bg-accent-teal/10 flex items-center justify-center transition-transform duration-500 -translate-x-full ${!(!connected || Number(swapAmount) <= 0 || isSwapping) ? 'group-hover:translate-x-0' : ''}`}>
              </div>
              <span className="uppercase tracking-[0.2em] text-accent-teal group-hover:text-foreground transition-colors z-10">
                {isSwapping ? 'Procesando...' : (!connected ? t.common.connectWallet : t.dashboard.swapConfirm)}
              </span>
            </button>
          </section>

          {/* BEGIN: Live Activity */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t.dashboard.topContributors}</h2>
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="space-y-4">
              {/* Current user row (always first) */}
              <div className="flex items-center gap-4 p-3 rounded-xl border border-accent-teal/20 bg-accent-teal/5">
                <div className="w-10 h-10 rounded-full bg-accent-teal text-background flex items-center justify-center font-bold text-xs">{t.dashboard.you}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{t.dashboard.currentSession}</span>
                    <span className="text-accent-teal font-mono">+{profile?.points || 0} pts</span>
                  </div>
                  <div className="w-full bg-muted/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-teal h-full" style={{ width: `${Math.min(100, ((profile?.points || 0) / 1000) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Real contributors from Supabase */}
              {(contributors.length > 0 ? contributors : [
                { wallet_address: 'mock1', first_name: 'Sarah', last_name: 'Jensen', points: 320 },
                { wallet_address: 'mock2', first_name: 'Mike', last_name: 'Chen', points: 210 },
              ]).filter(c => c.wallet_address !== address).slice(0, 3).map((user: any, idx: number) => {
                const initials = `${user.first_name?.[0] || '?'}${user.last_name?.[0] || ''}`.toUpperCase();
                const colors = ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'bg-blue-500/20 text-blue-400 border-blue-500/30', 'bg-orange-500/20 text-orange-400 border-orange-500/30'];
                return (
                  <div key={user.wallet_address} className="flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/5 transition-colors border border-transparent">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border overflow-hidden ${colors[idx % colors.length]}`}>
                      {user.avatar_url ? <img src={user.avatar_url} alt={initials} className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">{user.first_name} {user.last_name}</span>
                        <span className="text-muted font-mono">{user.points || 0} pts</span>
                      </div>
                      <div className="w-full bg-muted/10 h-1 rounded-full overflow-hidden">
                        <div className="bg-slate-600 h-full" style={{ width: `${Math.min(100, ((user.points || 0) / 1000) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-6 text-xs text-muted hover:text-accent-teal transition-colors font-semibold uppercase tracking-widest">
              {t.dashboard.viewAllContributors}
            </button>
          </section>

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

    </div>
  );
}
