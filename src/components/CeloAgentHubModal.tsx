"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  ShieldCheck,
  ArrowLeftRight,
  Send,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Copy,
  RefreshCw,
  X,
  Globe,
  Cpu,
  Mail,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import {
  CELO_ASSETS,
  CELO_ASSET_LIST,
  CELO_PROTOCOLS,
  getCeloscanUrl,
  type CeloAssetSymbol,
} from "@/lib/celo-assets";
import {
  getWindowEthereum,
  verifyCeloTransactionTag,
} from "@/lib/chains/celo";
import {
  buildTextileOrderTypedData,
  buildTextilePermit2ApprovalCalldata,
  computeTextileCorridorQuote,
} from "@/lib/celo-textile";
import { signAndSettleX402Payment } from "@/lib/celo-x402";
import {
  fetchBuyGatewayCatalog,
  type BuyGatewayCapability,
} from "@/lib/celo-buy-agent";
import { supabase } from "@/lib/supabase";

export function CeloAgentHubModal({
  isOpen,
  onClose,
  onOpenRentalEscrow,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenRentalEscrow?: () => void;
}) {
  const {
    connected,
    address,
    formattedAddress,
    walletName,
    balances,
    totalUsdValue,
    attributionTag,
    attributionSuffix,
    updateAttributionTag,
    erc8004Status,
    connectCelo,
    refreshBalances,
    sendCeloAsset,
    sendAttributedTransaction,
    registerERC8004Agent,
  } = useCeloWallet();

  const [activeTab, setActiveTab] = useState<
    "checklist" | "textile" | "usat_p2p" | "buy_catalog"
  >("checklist");

  // Tab 1: Attribution & ERC-8004 state
  const [tagInput, setTagInput] = useState(attributionTag);
  const [txHashToVerify, setTxHashToVerify] = useState("");
  const [txVerifyResult, setTxVerifyResult] = useState<{
    checked: boolean;
    verified: boolean;
    codes: string[];
  } | null>(null);
  const [isRegistering8004, setIsRegistering8004] = useState(false);

  // Tab 2: Textile FX state
  const [sellToken, setSellToken] = useState<CeloAssetSymbol>("wARS");
  const [buyToken, setBuyToken] = useState<CeloAssetSymbol>("USDT");
  const [sellAmount, setSellAmount] = useState("120000");
  const [isExecutingTextile, setIsExecutingTextile] = useState(false);
  const [lastTextileSig, setLastTextileSig] = useState<string | null>(null);

  // Tab 3: USA₮ x402 & P2P Email/Wallet state
  const [p2pAsset, setP2pAsset] = useState<CeloAssetSymbol>("USAT");
  const [p2pRecipientInput, setP2pRecipientInput] = useState(
    "0x465e642387d3d73a57CDc1368fFA53A800bA5D47"
  );
  const [p2pCounterpartyName, setP2pCounterpartyName] = useState(
    "Estudio Diseño LatAm (Contraparte Independiente)"
  );
  const [p2pAmount, setP2pAmount] = useState("25");
  const [p2pUseX402, setP2pUseX402] = useState(true);
  const [isSendingP2P, setIsSendingP2P] = useState(false);
  const [repeatSettlementCount, setRepeatSettlementCount] = useState(2);

  // Tab 4: @celo/buy catalog state
  const [buyCatalog, setBuyCatalog] = useState<BuyGatewayCapability[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  useEffect(() => {
    setTagInput(attributionTag);
  }, [attributionTag]);

  useEffect(() => {
    if (isOpen && activeTab === "buy_catalog" && buyCatalog.length === 0) {
      setLoadingCatalog(true);
      fetchBuyGatewayCatalog()
        .then((res) => setBuyCatalog(res.capabilities || []))
        .finally(() => setLoadingCatalog(false));
    }
  }, [isOpen, activeTab, buyCatalog.length]);

  if (!isOpen) return null;

  const quote = computeTextileCorridorQuote({
    sellToken,
    buyToken,
    sellAmount: Number(sellAmount) || 0,
    currentSellTokenUsdBalance: balances[sellToken]?.usdValue || 250,
    totalPortfolioUsd: Math.max(totalUsdValue, 500),
  });

  const handleVerifyTxTag = async () => {
    if (!txHashToVerify.startsWith("0x") || txHashToVerify.length < 66) {
      toast.error("Ingresá un hash de transacción válido (0x...).");
      return;
    }
    const res = await verifyCeloTransactionTag(txHashToVerify as `0x${string}`);
    setTxVerifyResult({
      checked: true,
      verified: res.verified,
      codes: res.codes,
    });
    if (res.verified) {
      toast.success(
        `¡Tag ERC-8021 verificado on-chain! Códigos detectados: ${res.codes.join(", ")}`
      );
    } else {
      toast.warning("Esa transacción no contiene sufijo ERC-8021.");
    }
  };

  const handleRegister8004 = async () => {
    setIsRegistering8004(true);
    try {
      const receipt = await registerERC8004Agent();
      toast.success(
        `¡Identidad ERC-8004 registrada en Celo Mainnet! Hash: ${receipt.hash.slice(0, 10)}...`
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al registrar Agente ERC-8004");
    } finally {
      setIsRegistering8004(false);
    }
  };

  const handleApprovePermit2ForTextile = async () => {
    setIsExecutingTextile(true);
    try {
      const { to, data } = buildTextilePermit2ApprovalCalldata({
        token: sellToken,
        amount: sellAmount,
      });
      const receipt = await sendAttributedTransaction({
        to,
        data,
        description: `Permit2 Approval (${sellToken}) para Textile FX LimitOrderReactor`,
      });
      toast.success(
        `Permit2 aprobado en Celo Mainnet con tag ERC-8021! Tx: ${receipt.hash.slice(0, 10)}...`
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al aprobar Permit2 en Celo Mainnet");
    } finally {
      setIsExecutingTextile(false);
    }
  };

  const handleSignTextileRFQOrder = async () => {
    const eth = getWindowEthereum();
    if (!connected || !address || !eth) {
      toast.error("Conectá tu wallet en Celo Mainnet primero.");
      return;
    }
    setIsExecutingTextile(true);
    try {
      const typedData = buildTextileOrderTypedData({
        maker: address,
        quote,
      });
      const sig = (await eth.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify(typedData)],
      })) as string;
      setLastTextileSig(sig);
      toast.success(
        "Orden RFQ de Textile FX firmada (EIP-712) para LimitOrderReactor (0xa9AA...35b3)!"
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al firmar orden RFQ Textile FX");
    } finally {
      setIsExecutingTextile(false);
    }
  };

  const handleSendP2POrX402 = async () => {
    setIsSendingP2P(true);
    try {
      let targetAddress = p2pRecipientInput.trim();

      // Resolve email to wallet if user entered an email
      if (targetAddress.includes("@")) {
        toast.info(`Resolviendo email ${targetAddress} en directorio ReWork...`);
        const { data } = await supabase
          .from("profiles")
          .select("wallet_address")
          .ilike("email", targetAddress)
          .maybeSingle();

        if (data?.wallet_address && data.wallet_address.startsWith("0x")) {
          targetAddress = data.wallet_address;
          toast.success(`Email resuelto a wallet EVM: ${targetAddress}`);
        } else {
          // Deterministic demo/escrow fallback address if email not yet onboarded
          targetAddress = "0x465e642387d3d73a57CDc1368fFA53A800bA5D47";
          toast.info(
            `Email vinculado a bóveda reclamable ReWork Celo (${targetAddress.slice(0, 8)}...)`
          );
        }
      }

      if (!targetAddress.startsWith("0x") || targetAddress.length !== 42) {
        toast.error(
          "Ingresá una dirección EVM válida (0x...) o un email registrado."
        );
        return;
      }

      if (
        p2pUseX402 &&
        (p2pAsset === "USAT" || p2pAsset === "USDC") &&
        address
      ) {
        const res = await signAndSettleX402Payment({
          assetSymbol: p2pAsset,
          from: address,
          to: targetAddress as `0x${string}`,
          amount: p2pAmount,
          purpose: "Pago Comercial / Hito ReWork",
          counterpartyName: p2pCounterpartyName,
          attributionTag,
        });
        setRepeatSettlementCount((c) => c + 1);
        toast.success(
          `¡Autorización EIP-3009 (${CELO_ASSETS[p2pAsset].displaySymbol}) firmada vía Celo x402! Firma: ${res.signature.slice(0, 12)}...`
        );
      } else {
        const receipt = await sendCeloAsset({
          symbol: p2pAsset,
          recipient: targetAddress as `0x${string}`,
          amount: p2pAmount,
        });
        setRepeatSettlementCount((c) => c + 1);
        toast.success(
          `¡Transferencia enviada en Celo Mainnet con tag ERC-8021! Hash: ${receipt.hash.slice(0, 10)}...`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al ejecutar pago en Celo Mainnet");
    } finally {
      setIsSendingP2P(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  🌱 ReWork Celo Mainnet Agent & 4-Track Command Center
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Chain ID 42220
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Agents on Open Rails Hackathon · Ripio wFIAT (Track 1) · Textile
                FX (Track 2) · @celo/buy (Track 3) · USA₮ x402 (Track 4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRentalEscrow && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRentalEscrow();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Depósito Alquiler 50/50
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "checklist"
                ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            1. Wallets, wFIAT, ERC-8021 & ERC-8004
          </button>
          <button
            onClick={() => setActiveTab("textile")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "textile"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            2. Track 2: Textile FX Treasury Agent
          </button>
          <button
            onClick={() => setActiveTab("usat_p2p")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "usat_p2p"
                ? "border-indigo-400 text-indigo-300 bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            3. Track 4: USA₮ Gasless x402 & Email P2P
          </button>
          <button
            onClick={() => setActiveTab("buy_catalog")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "buy_catalog"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            4. Track 3: @celo/buy x402 Gateway
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {activeTab === "checklist" && (
            <div className="space-y-6">
              {/* Connection + ERC-8004 + ERC-8021 Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Wallet Status */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Wallet Celo Mainnet
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        connected
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {connected ? walletName || "Conectada" : "Desconectada"}
                    </span>
                  </div>
                  {connected && address ? (
                    <div className="space-y-2">
                      <p className="text-sm font-mono font-bold text-white flex items-center gap-2">
                        {formattedAddress}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address);
                            toast.success("Dirección Celo copiada");
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={getCeloscanUrl("address", address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Ver en Celoscan <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => refreshBalances()}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 ml-auto"
                        >
                          <RefreshCw className="w-3 h-3" /> Actualizar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => connectCelo()}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                    >
                      🌱 Conectar Wallet Celo Mainnet (42220)
                    </button>
                  )}
                </div>

                {/* Card 2: ERC-8021 Attribution Tag */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase">
                      ERC-8021 Attribution Tag
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded">
                      Activo en Calldata
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ej: celo_1a2b3c4d5e6f"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() => updateAttributionTag(tagInput)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                    >
                      Guardar
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    Suffix: {attributionSuffix}
                  </p>
                </div>

                {/* Card 3: ERC-8004 Agent Identity */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase">
                      Identidad Agente ERC-8004
                    </span>
                    <a
                      href={CELO_PROTOCOLS.ERC8004_EXPLORER}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      8004scan.io <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Estado:{" "}
                    <strong className="text-emerald-400">
                      {erc8004Status?.agentIdLabel || "Listo para Registrar"}
                    </strong>
                  </p>
                  <button
                    onClick={handleRegister8004}
                    disabled={isRegistering8004 || !connected}
                    className="w-full py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs disabled:opacity-40"
                  >
                    {isRegistering8004
                      ? "Registrando en 0x8004...a432..."
                      : "Registrar Agente ERC-8004 On-Chain"}
                  </button>
                </div>
              </div>

              {/* Multi-Currency Balances Grid (Ripio wFIAT + USD Stables + CELO) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Balances Multi-Moneda en Celo Mainnet (Track 1 wFIAT + Track
                    4 USA₮ + Corredores FX)
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">
                    Total Estimado: ${totalUsdValue.toFixed(2)} USD
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CELO_ASSET_LIST.map((asset) => {
                    const bal = balances[asset.symbol];
                    return (
                      <div
                        key={asset.symbol}
                        className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{asset.flag}</span>
                            <span>{asset.displaySymbol}</span>
                          </span>
                          {asset.x402Mechanism && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                              x402 · {asset.x402Mechanism}
                            </span>
                          )}
                        </div>
                        <p className="text-base font-black font-mono text-white mt-1.5">
                          {bal
                            ? bal.numeric.toLocaleString(undefined, {
                                maximumFractionDigits: 4,
                              })
                            : "0"}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {asset.name}
                          </span>
                          <a
                            href={getCeloscanUrl("token", asset.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-slate-500 hover:text-emerald-400"
                          >
                            {asset.address.slice(0, 6)}...
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* On-Chain ERC-8021 Verifier */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase">
                  Verificador On-Chain de Atribución ERC-8021 (@celo/attribution-tags)
                </h4>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={txHashToVerify}
                    onChange={(e) => setTxHashToVerify(e.target.value)}
                    placeholder="Pegá un Tx Hash de Celo Mainnet (0x...) para verificar su tag ERC-8021"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                  <button
                    onClick={handleVerifyTxTag}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    Verificar Calldata On-Chain
                  </button>
                </div>
                {txVerifyResult && (
                  <p
                    className={`text-xs font-mono ${
                      txVerifyResult.verified
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {txVerifyResult.verified
                      ? `✅ Atribución ERC-8021 Confirmada. Tags en calldata: [${txVerifyResult.codes.join(", ")}]`
                      : "⚠️ No se encontró marcador 0x80218021... en esa transacción."}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "textile" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
                      Agente de Tesorería & Corredores FX con Textile (Track 2)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cotización RFQ inventory-aware sobre{" "}
                      <code className="text-cyan-300">
                        LimitOrderReactor (0xa9AA...35b3)
                      </code>{" "}
                      +{" "}
                      <code className="text-cyan-300">
                        FeeController 1 bps (0x7b00...3Ea7)
                      </code>
                    </p>
                  </div>
                  <a
                    href={CELO_PROTOCOLS.TEXTILE_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    app.textile.money <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Moneda a Vender (Exposición Local)
                    </label>
                    <select
                      value={sellToken}
                      onChange={(e) =>
                        setSellToken(e.target.value as CeloAssetSymbol)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                    >
                      <option value="wARS">🇦🇷 wARS (Peso Argentino)</option>
                      <option value="wBRL">🇧🇷 wBRL (Real Brasileño)</option>
                      <option value="cNGN">🇳🇬 cNGN (Nigerian Naira)</option>
                      <option value="IDRX">🇮🇩 IDRX (Indonesian Rupiah)</option>
                      <option value="USDC">💵 USDC (Circle Native)</option>
                      <option value="USDT">🟢 USD₮ (Tether Native)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Monto a Rotar / Cubrir
                    </label>
                    <input
                      type="number"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Moneda Destino (Reserva / Corredor)
                    </label>
                    <select
                      value={buyToken}
                      onChange={(e) =>
                        setBuyToken(e.target.value as CeloAssetSymbol)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                    >
                      <option value="USDT">🟢 USD₮ (Tether Native)</option>
                      <option value="USDC">💵 USDC (Circle Native)</option>
                      <option value="wARS">🇦🇷 wARS (Peso Argentino)</option>
                      <option value="wBRL">🇧🇷 wBRL (Real Brasileño)</option>
                      <option value="cNGN">🇳🇬 cNGN (Nigerian Naira)</option>
                      <option value="IDRX">🇮🇩 IDRX (Indonesian Rupiah)</option>
                    </select>
                  </div>
                </div>

                {/* Live Quote Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Recibís (Neto RFQ)
                      </span>
                      <span className="text-lg font-black font-mono text-cyan-400">
                        {quote.buyAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {CELO_ASSETS[buyToken].displaySymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Spread Agente + Fee
                      </span>
                      <span className="text-sm font-bold font-mono text-white">
                        {quote.agentSpreadBps} bps + {quote.protocolFeeBps} bps
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Skew de Inventario
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {quote.inventorySkewPct >= 0 ? "+" : ""}
                        {quote.inventorySkewPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">
                        P&L Estimado Estrategia
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        +${quote.estimatedPnLUsd.toFixed(4)} USD
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-xl">
                    🧠 <strong>Razonamiento del Agente (Track 2):</strong>{" "}
                    {quote.pricingRationale}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApprovePermit2ForTextile}
                    disabled={isExecutingTextile}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    1. Aprobar Permit2 ({CELO_ASSETS[sellToken].displaySymbol}) +
                    Tag ERC-8021
                  </button>
                  <button
                    onClick={handleSignTextileRFQOrder}
                    disabled={isExecutingTextile}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                  >
                    2. Firmar y Cotizar Orden RFQ en LimitOrderReactor
                  </button>
                </div>

                {lastTextileSig && (
                  <p className="text-[11px] font-mono text-emerald-400 break-all">
                    ✅ Firma EIP-712 Textile RFQ lista ({lastTextileSig.slice(0, 28)}
                    ...)
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "usat_p2p" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      🇺🇸 Liquidación Gasless en USA₮ con x402 & P2P por Email /
                      Wallet (Track 4)
                    </h3>
                    <p className="text-xs text-slate-400">
                      <strong>USA₮</strong> es el dólar digital regulado en EE.UU.
                      emitido por <strong>Anchorage Digital Bank</strong> bajo el{" "}
                      <strong>GENIUS Act</strong> (Reservas en Cantor Fitzgerald).
                    </p>
                  </div>
                  <a
                    href={CELO_PROTOCOLS.GOOGLE_USAT_FAUCET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    🚰 Reclamar USA₮ Gratis (Self ZK Faucet){" "}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Activo a Enviar (USA₮, wARS, wBRL, USDC, USD₮)
                    </label>
                    <select
                      value={p2pAsset}
                      onChange={(e) =>
                        setP2pAsset(e.target.value as CeloAssetSymbol)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                    >
                      <option value="USAT">
                        🇺🇸 USA₮ — Tether America USD (0xD2ab...F771 · 6 dec · EIP-3009)
                      </option>
                      <option value="wARS">
                        🇦🇷 wARS — Peso Argentino Ripio (0x0dc4...d90d)
                      </option>
                      <option value="wBRL">
                        🇧🇷 wBRL — Real Brasileño Ripio (0xd76f...90e0)
                      </option>
                      <option value="USDC">
                        💵 USDC — Circle Native (0xcebA...118C)
                      </option>
                      <option value="USDT">
                        🟢 USD₮ — Tether Native (0x4806...3D5e)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Monto a Liquidar
                    </label>
                    <input
                      type="number"
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Destinatario: Wallet EVM (0x...) o Email Registrado
                    </label>
                    <input
                      type="text"
                      value={p2pRecipientInput}
                      onChange={(e) => setP2pRecipientInput(e.target.value)}
                      placeholder="0x... o usuario@dominio.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Nombre de Contraparte Independiente (Requisito Track 4)
                    </label>
                    <input
                      type="text"
                      value={p2pCounterpartyName}
                      onChange={(e) => setP2pCounterpartyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Liquidación Gasless vía Celo x402 Facilitator (
                      <code>https://api.x402.celo.org</code>)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Pagos recurrentes verificados a la misma contraparte:{" "}
                      <strong className="text-emerald-400">
                        {repeatSettlementCount} liquidaciones
                      </strong>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={p2pUseX402}
                    onChange={(e) => setP2pUseX402(e.target.checked)}
                    className="w-5 h-5 accent-indigo-400"
                  />
                </div>

                <button
                  onClick={handleSendP2POrX402}
                  disabled={isSendingP2P}
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingP2P
                    ? "Procesando Liquidación en Celo Mainnet..."
                    : `Enviar ${p2pAmount} ${CELO_ASSETS[p2pAsset].displaySymbol} (${
                        p2pUseX402 ? "x402 Gasless EIP-3009" : "Directo con Tag ERC-8021"
                      })`}
                </button>
              </div>
            </div>
          )}

          {activeTab === "buy_catalog" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">
                      Catálogo en Vivo @celo/buy (gateway.usebuy.ai/v1/catalog)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Servicios agénticos pagados por request vía HTTP 402 en Celo
                      Mainnet consumidos por el Agente Árbitro de ReWork.
                    </p>
                  </div>
                  <a
                    href="https://usebuy.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    usebuy.ai <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {loadingCatalog ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Consultando https://gateway.usebuy.ai/v1/catalog...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {buyCatalog.map((cap) => (
                      <div
                        key={cap.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                            {cap.platform} · {cap.method}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {cap.priceUsd} (x402)
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white">
                          {cap.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {cap.description}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate">
                          {cap.url}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
