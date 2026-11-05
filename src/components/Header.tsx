"use client";

import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useStaking } from "@/hooks/useStaking";
import { useTestnetRails } from "@/lib/feature-flags";
import { ConnectButton } from "@/components/ConnectButton";
import {
  Bell,
  Wallet,
  ExternalLink,
  ChevronDown,
  QrCode,
  Landmark,
  Lock,
  Bot,
  ShieldCheck,
  Compass,
  Copy,
  Check,
} from "lucide-react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { QRPaymentsModal } from "@/components/QRPaymentsModal";
import { BankTransferModal } from "@/components/BankTransferModal";
import { SolanaEscrowModal } from "@/components/SolanaEscrowModal";
import { CeloAgentHubModal } from "@/components/CeloAgentHubModal";
import { SmartRentalEscrowModal } from "@/components/SmartRentalEscrowModal";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import {
  getTripleValues,
  SupportedCurrency,
  DEFAULT_RATES,
} from "@/lib/currency";
import { ReWorkIcon } from "@/components/ReWorkLogo";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { connected, connect, address, isMobile } = useWallet();
  const { profile, loading: profileLoading } = useProfile();
  const { authenticated } = usePrivy();
  const { t } = useSettings();
  const testnetRailsEnabled = useTestnetRails();
  const { xlmBalance, usdcBalance, loading: balanceLoading } =
    useSharedBalances();
  const {
    stakedAmount,
    activeApy,
    activeCurrency,
    setActiveCurrency,
  } = useStaking();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSolanaEscrowOpen, setIsSolanaEscrowOpen] = useState(false);
  const [isCeloAgentHubOpen, setIsCeloAgentHubOpen] = useState(false);
  const [isRentalEscrowOpen, setIsRentalEscrowOpen] = useState(false);
  const [isWalletPopoverOpen, setIsWalletPopoverOpen] = useState(false);
  const [isFinanceDetailOpen, setIsFinanceDetailOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const {
    connected: solConnected,
    address: solAddress,
    walletName: solWalletName,
    usdcBalance: solUsdcBalance,
    solBalance,
    connectSolana,
  } = useSolanaWallet();

  const {
    connected: celoConnected,
    address: celoAddress,
    formattedAddress: celoFormattedAddress,
    walletName: celoWalletName,
    balances: celoBalances,
    totalUsdValue: celoTotalUsd,
    attributionTag,
    connectCelo,
  } = useCeloWallet();

  // Normalize activeCurrency if SOL/XLM was cached from a prior session while testnets are off
  useEffect(() => {
    if (!testnetRailsEnabled && (activeCurrency === "SOL" || activeCurrency === "XLM")) {
      setActiveCurrency("USDC");
    }
  }, [testnetRailsEnabled, activeCurrency, setActiveCurrency]);

  // Allow external triggers (like InteractiveTour or quick links) to open modals
  useEffect(() => {
    const handleOpenOps = () => setIsWalletPopoverOpen(true);
    const handleToggleOps = () => setIsWalletPopoverOpen((prev) => !prev);
    const handleOpenAgentHub = () => setIsCeloAgentHubOpen(true);
    const handleOpenRental = () => setIsRentalEscrowOpen(true);
    window.addEventListener("rework:open-operations", handleOpenOps);
    window.addEventListener("rework:toggle-operations", handleToggleOps);
    window.addEventListener("rework:open-agent-hub", handleOpenAgentHub);
    window.addEventListener("rework:open-rental-escrow", handleOpenRental);
    return () => {
      window.removeEventListener("rework:open-operations", handleOpenOps);
      window.removeEventListener("rework:toggle-operations", handleToggleOps);
      window.removeEventListener("rework:open-agent-hub", handleOpenAgentHub);
      window.removeEventListener("rework:open-rental-escrow", handleOpenRental);
    };
  }, []);

  const isLoggedIn =
    authenticated ||
    celoConnected ||
    (testnetRailsEnabled && (connected || solConnected));
  const firstName = profile?.first_name || t.profile.role;

  // Net Worth: Pure Celo Mainnet by default; includes Testnets only when Labs flag is enabled
  const xlmValue = testnetRailsEnabled
    ? (xlmBalance || 0) * (DEFAULT_RATES.XLM_TO_USDC || 0.28)
    : 0;
  const solValue = testnetRailsEnabled
    ? (solBalance || 0) * (DEFAULT_RATES.SOL_TO_USDC || 152.5)
    : 0;
  const solUsdcVal = testnetRailsEnabled ? solUsdcBalance || 0 : 0;
  const stellarUsdcVal = testnetRailsEnabled ? usdcBalance || 0 : 0;
  const auraValue = (profile?.points || 0) * 0.05;
  const usdcValue = stellarUsdcVal + solUsdcVal + (celoTotalUsd || 0);
  const totalLiquidUsdc = xlmValue + solValue + usdcValue;
  const totalNetWorthUsdc = totalLiquidUsdc + stakedAmount + auraValue;

  const tripleLiquid = getTripleValues(totalLiquidUsdc, "USDC");
  const tripleStake = getTripleValues(stakedAmount, "USDC");
  const tripleNetWorth = getTripleValues(totalNetWorthUsdc, "USDC");

  const getFormattedVal = (tripleObj: ReturnType<typeof getTripleValues>) => {
    const key = activeCurrency.toLowerCase();
    if (key in tripleObj.formatted) {
      return (tripleObj.formatted as Record<string, string>)[key];
    }
    return tripleObj.formatted.usdc;
  };

  const primaryRowCurrencies: SupportedCurrency[] = testnetRailsEnabled
    ? ["USDC", "USAT", "CELO", "SOL", "XLM"]
    : ["USDC", "USAT", "CELO"];

  const handleCopyCeloAddress = () => {
    if (!celoAddress) return;
    navigator.clipboard.writeText(celoAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1800);
  };

  return (
    <>
      <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-md z-40">
        {/* ─── LEFT: GREETING + NET WORTH ─── */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          )}
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-4 sm:gap-5">
              <div>
                <span className="text-[10px] text-muted font-medium uppercase tracking-wider block">
                  {t.header.welcome}
                </span>
                <p className="text-base font-bold text-foreground truncate max-w-[140px]">
                  {profileLoading ? (
                    <span className="animate-pulse bg-muted/10 rounded w-20 h-5 block mt-0.5"></span>
                  ) : (
                    firstName
                  )}
                </p>
              </div>

              <div className="h-6 w-[1px] bg-border-subtle"></div>

              {/* Financial Summary: Clean Net Worth with Popover Detail */}
              <div className="relative">
                <button
                  onClick={() => setIsFinanceDetailOpen(!isFinanceDetailOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-all text-left group cursor-pointer"
                  title="Ver desglose de patrimonio y cambiar moneda de visualización"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {t.header.totalNetWorth}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {activeCurrency === "USAT" ? "USA₮" : activeCurrency}
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-foreground">
                      {balanceLoading || profileLoading ? (
                        <span className="animate-pulse bg-muted/10 rounded w-16 h-4 block mt-0.5"></span>
                      ) : (
                        getFormattedVal(tripleNetWorth)
                      )}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted group-hover:text-foreground transition-transform ${
                      isFinanceDetailOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Popover Desglose Financiero */}
                {isFinanceDetailOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFinanceDetailOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-80 glass-card p-4 rounded-2xl shadow-2xl border border-border-subtle z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="pb-3 border-b border-border-subtle mb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted uppercase tracking-wider">
                            Moneda de Visualización
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {testnetRailsEnabled ? "Multiriel" : "Celo Mainnet"}
                          </span>
                        </div>

                        {/* Fila 1: Dólar Digital y Celo */}
                        <div className="flex items-center gap-1 p-0.5 bg-foreground/5 rounded-lg border border-border-subtle">
                          {primaryRowCurrencies.map((c) => (
                            <button
                              key={c}
                              onClick={() => setActiveCurrency(c)}
                              className={`flex-1 py-1 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                activeCurrency === c
                                  ? "bg-emerald-500 text-slate-950"
                                  : "text-muted hover:text-foreground"
                              }`}
                            >
                              {c === "USAT" ? "USA₮" : c}
                            </button>
                          ))}
                        </div>

                        {/* Fila 2: Monedas Locales LatAm (wFIAT / FX) */}
                        <div className="flex items-center gap-1 p-0.5 bg-foreground/5 rounded-lg border border-border-subtle">
                          {(
                            ["ARS", "BRL", "COP", "MXN", "PEN", "CLP"] as SupportedCurrency[]
                          ).map((c) => (
                            <button
                              key={c}
                              onClick={() => setActiveCurrency(c)}
                              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                activeCurrency === c
                                  ? "bg-accent-teal text-background"
                                  : "text-muted hover:text-foreground"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Disponible en Billetera:</span>
                          <span className="font-mono font-bold text-foreground">
                            {getFormattedVal(tripleLiquid)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">En Garantía / Rendimiento:</span>
                          <span className="font-mono font-bold text-foreground">
                            {getFormattedVal(tripleStake)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-emerald-400 font-bold">
                              Rendimiento Activo:
                            </span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">
                            +{activeApy}% APY
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-sm text-muted font-medium tracking-widest uppercase">
                {t.header.controlPanel}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-7 h-7 bg-accent-teal/15 rounded-lg border border-accent-teal/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                  <ReWorkIcon className="w-4 h-4" theme="cyan" glow />
                </div>
                <p className="text-xl font-black tracking-tight font-mono">
                  re<span className="text-accent-teal">work</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: CLEAN FINTECH ACTIONS + WALLET PILL ─── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isLoggedIn && (
            <>
              {/* 🧭 Tour Jurado */}
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("rework:start-tour"))
                }
                className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border-subtle text-muted hover:text-foreground text-xs font-semibold transition-all group cursor-pointer"
                title="Tour Interactivo de 90s para Jurados y Evaluadores"
                data-tour="tour-launcher-btn"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
                <span className="hidden xl:inline">Tour Jurado</span>
              </button>

              {/* 📲 Enviar / Cobrar QR */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border-subtle text-foreground text-xs font-semibold transition-all cursor-pointer"
                title="Enviar o cobrar dinero mediante código QR en Celo Mainnet"
              >
                <QrCode className="w-3.5 h-3.5 text-accent-teal" />
                <span className="hidden sm:inline">Enviar / Cobrar</span>
              </button>

              {/* 🏦 Ingresar / Retirar (Ripio Ramp) */}
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                title="Ingresar o retirar moneda local (CBU/PIX/SPEI ↔ wARS/wBRL/USDC vía Ripio)"
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Ingresar / Retirar</span>
              </button>

              {/* 🌱 WALLET PILL (Pure Celo Mainnet by default; Multirail if Labs flag is on) */}
              <div className="relative" data-tour="header-operations">
                <button
                  type="button"
                  onClick={async () => {
                    if (!celoConnected && !isMobile) {
                      setIsWalletPopoverOpen((prev) => !prev);
                    } else {
                      setIsWalletPopoverOpen((prev) => !prev);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    celoConnected
                      ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-foreground/5 hover:bg-foreground/10 border-border-subtle text-muted hover:text-foreground"
                  }`}
                  title={
                    celoConnected
                      ? `Celo Mainnet (42220): ${celoAddress}`
                      : "Ver estado de billetera Celo Mainnet"
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      celoConnected
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="font-sans font-bold text-foreground hidden sm:inline">
                    🌱 Celo
                  </span>
                  <span className="text-[11px] font-mono">
                    {celoConnected && celoFormattedAddress
                      ? celoFormattedAddress
                      : "Mainnet"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-muted transition-transform ${
                      isWalletPopoverOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isWalletPopoverOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsWalletPopoverOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 glass-card p-4 rounded-2xl shadow-2xl border border-border-subtle z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header of Wallet Card */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-400">
                            🌱 Celo Mainnet · 42220
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {attributionTag}
                        </span>
                      </div>

                      {/* Address + Wallet Provider */}
                      {celoConnected && celoAddress ? (
                        <div className="p-2.5 rounded-xl bg-foreground/5 border border-border-subtle mb-3 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted block truncate">
                              {celoWalletName || "Billetera Celo Activa"}
                            </span>
                            <span className="text-xs font-mono font-bold text-foreground">
                              {celoAddress.slice(0, 10)}...{celoAddress.slice(-8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={handleCopyCeloAddress}
                              className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted hover:text-foreground transition-colors cursor-pointer"
                              title="Copiar dirección 0x..."
                            >
                              {copiedAddr ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={`https://celoscan.io/address/${celoAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-foreground/10 text-emerald-400 hover:text-emerald-300 transition-colors"
                              title="Ver en Celoscan Mainnet"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await connectCelo();
                            } catch {}
                          }}
                          className="w-full py-2.5 mb-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Conectar MetaMask / MiniPay
                        </button>
                      )}

                      {/* Real Celo Mainnet Balances */}
                      <div className="space-y-1.5 text-xs font-mono pb-3 border-b border-border-subtle">
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-sans">USDC (Nativo Circle):</span>
                          <span className="font-bold text-foreground">
                            {celoBalances.USDC?.numeric.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-sans">USA₮ (Tether x402):</span>
                          <span className="font-bold text-emerald-300">
                            {celoBalances.USAT?.numeric.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-sans">wARS (Peso Digital):</span>
                          <span className="font-bold text-cyan-300">
                            {celoBalances.wARS?.numeric.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-sans">wBRL (Real Digital):</span>
                          <span className="font-bold text-amber-300">
                            {celoBalances.wBRL?.numeric.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-sans">CELO (Gas):</span>
                          <span className="font-bold text-emerald-400">
                            {celoBalances.CELO?.numeric.toFixed(3) || "0.000"}
                          </span>
                        </div>
                      </div>

                      {/* Optional Testnet Rails (Hidden unless Labs flag is ON) */}
                      {testnetRailsEnabled && (
                        <div className="py-2.5 border-b border-border-subtle space-y-2">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                            🧪 Rieles en Testeo (Labs Activo)
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => !solConnected && connectSolana("auto")}
                              className="text-purple-300 hover:underline font-mono"
                            >
                              ⚡ Solana Devnet
                            </button>
                            <span className="font-mono font-bold text-[#14F195]">
                              {solUsdcBalance.toFixed(2)} USDC
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => !connected && connect()}
                              className="text-accent-teal hover:underline font-mono"
                            >
                              🚀 Stellar Testnet
                            </button>
                            <span className="font-mono font-bold text-accent-teal">
                              {(usdcBalance || 0).toFixed(2)} USDC
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Direct Smart Shortcuts */}
                      <div className="pt-3 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCeloAgentHubOpen(true);
                            setIsWalletPopoverOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-left transition-all cursor-pointer"
                        >
                          <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-300">
                              Celo Agent Hub (ERC-8004 · x402)
                            </p>
                            <p className="text-[10px] text-muted truncate">
                              Identidad IA, Textile FX, @celo/buy y USA₮
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsRentalEscrowOpen(true);
                            setIsWalletPopoverOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-left transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-200">
                              Garantía Alquiler 50/50
                            </p>
                            <p className="text-[10px] text-muted truncate">
                              Custodia en Celo con rendimiento compartido
                            </p>
                          </div>
                        </button>

                        {testnetRailsEnabled && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsSolanaEscrowOpen(true);
                              setIsWalletPopoverOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-foreground/5 text-left transition-all cursor-pointer"
                          >
                            <Lock className="w-4 h-4 text-purple-300 shrink-0" />
                            <span className="text-xs font-semibold text-purple-200">
                              Escrow Experimental (Solana Devnet)
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 🔔 Notifications */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-border-subtle text-muted hover:text-foreground transition-colors relative cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex w-2.5 h-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-red-500 border-2 border-deep-navy"></span>
                  </span>
                )}
              </button>
            </>
          )}

          <ConnectButton />
        </div>
      </header>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <QRPaymentsModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <BankTransferModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

      {testnetRailsEnabled && (
        <SolanaEscrowModal
          isOpen={isSolanaEscrowOpen}
          onClose={() => setIsSolanaEscrowOpen(false)}
        />
      )}

      <CeloAgentHubModal
        isOpen={isCeloAgentHubOpen}
        onClose={() => setIsCeloAgentHubOpen(false)}
        onOpenRentalEscrow={() => setIsRentalEscrowOpen(true)}
      />

      <SmartRentalEscrowModal
        isOpen={isRentalEscrowOpen}
        onClose={() => setIsRentalEscrowOpen(false)}
      />
    </>
  );
}
