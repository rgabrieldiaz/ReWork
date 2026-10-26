"use client";

import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useStaking } from "@/hooks/useStaking";
import { ConnectButton } from "@/components/ConnectButton";
import {
  Bell,
  Wallet,
  ExternalLink,
  ChevronDown,
  QrCode,
  Landmark,
  TrendingUp,
  Lock,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { QRPaymentsModal } from "@/components/QRPaymentsModal";
import { BankTransferModal } from "@/components/BankTransferModal";
import { SolanaEscrowModal } from "@/components/SolanaEscrowModal";
import { CeloAgentHubModal } from "@/components/CeloAgentHubModal";
import { SmartRentalEscrowModal } from "@/components/SmartRentalEscrowModal";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import {
  getTripleValues,
  SupportedCurrency,
  formatCurrency,
  DEFAULT_RATES,
} from "@/lib/currency";
import { ReWorkIcon } from "@/components/ReWorkLogo";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { connected, address, network, isMobile } = useWallet();
  const { profile, loading: profileLoading } = useProfile();
  const { authenticated } = usePrivy();
  const { t, language } = useSettings();
  const { xlmBalance, usdcBalance, loading: balanceLoading } =
    useSharedBalances();
  const {
    stakedAmount,
    activeApy,
    accruedYield,
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
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isFinanceDetailOpen, setIsFinanceDetailOpen] = useState(false);

  const {
    connected: solConnected,
    address: solAddress,
    walletName: solWalletName,
    usdcBalance: solUsdcBalance,
    solBalance,
  } = useSolanaWallet();

  const {
    connected: celoConnected,
    address: celoAddress,
    walletName: celoWalletName,
    balances: celoBalances,
    totalUsdValue: celoTotalUsd,
    attributionTag,
  } = useCeloWallet();

  const isLoggedIn =
    authenticated || connected || solConnected || celoConnected;
  const firstName = profile?.first_name || t.profile.role;

  // Net Worth & Liquidity across all 3 rails (Celo Mainnet + Solana + Stellar)
  const xlmValue = (xlmBalance || 0) * (DEFAULT_RATES.XLM_TO_USDC || 0.28);
  const solValue = (solBalance || 0) * (DEFAULT_RATES.SOL_TO_USDC || 152.5);
  const solUsdcVal = solUsdcBalance || 0;
  const auraValue = (profile?.points || 0) * 0.05;
  const usdcValue = (usdcBalance || 0) + solUsdcVal + (celoTotalUsd || 0);
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

  return (
    <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-md z-40">
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
          <div className="flex items-center gap-4 sm:gap-6 hidden sm:flex">
            <div>
              <span className="text-[10px] text-muted font-medium uppercase tracking-wider block">
                {t.header.welcome}
              </span>
              <p className="text-base font-bold text-foreground">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-all text-left group"
                title="Ver desglose de patrimonio y rendimientos"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted uppercase tracking-wider">
                      {t.header.totalNetWorth}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-accent-teal bg-accent-teal/10 px-1 py-0.2 rounded border border-accent-teal/20">
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
                <ChevronDown className={`w-3.5 h-3.5 text-muted group-hover:text-foreground transition-transform ${isFinanceDetailOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Desglose Financiero */}
              {isFinanceDetailOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFinanceDetailOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-80 glass-card p-4 rounded-2xl shadow-2xl border border-border-subtle z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">
                        Desglose de Fondos
                      </span>
                      <div className="flex items-center gap-1 p-0.5 bg-foreground/5 rounded-lg border border-border-subtle">
                        {(["USDC", "wARS", "USAT", "CELO", "SOL", "XLM"] as SupportedCurrency[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => setActiveCurrency(c)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-all ${
                              activeCurrency === c
                                ? "bg-accent-teal text-background"
                                : "text-muted hover:text-foreground"
                            }`}
                          >
                            {c === "USAT" ? "USA₮" : c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Disponible (Líquido):</span>
                        <span className="font-mono font-bold text-foreground">
                          {getFormattedVal(tripleLiquid)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">En Custodia / Stake:</span>
                        <span className="font-mono font-bold text-foreground">
                          {getFormattedVal(tripleStake)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-emerald-400 font-bold">Rendimiento Activo:</span>
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

      <div className="flex items-center gap-3">
        {isLoggedIn && (
          <div className="flex items-center gap-2 relative">
            {/* ⚡ MENÚ UNIFICADO DE ACCIONES RÁPIDAS (Reemplaza los 5 botones sueltos) */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-teal/15 hover:bg-accent-teal/25 border border-accent-teal/40 text-accent-teal text-xs font-bold transition-all shadow-sm group"
                title="Acciones y Operaciones Web3"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Operaciones</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de Acciones Rápidas */}
              {isQuickActionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickActionsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 glass-card p-2 rounded-2xl shadow-2xl border border-border-subtle z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 py-2 border-b border-border-subtle/60">
                      Módulos y Operaciones
                    </p>

                    <div className="space-y-1 mt-1">
                      {/* Alquiler 50/50 */}
                      <button
                        onClick={() => {
                          setIsRentalEscrowOpen(true);
                          setIsQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                            Alquiler 50/50 (Yield Escrow)
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            Depósito de alquiler con reparto de rendimiento
                          </p>
                        </div>
                      </button>

                      {/* Celo Agent Hub */}
                      <button
                        onClick={() => {
                          setIsCeloAgentHubOpen(true);
                          setIsQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-emerald-300 transition-colors">
                            Celo Agent Hub (4 Tracks)
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            ERC-8004 · wFIAT · Textile FX · x402
                          </p>
                        </div>
                      </button>

                      {/* QR Payments */}
                      <button
                        onClick={() => {
                          setIsQrModalOpen(true);
                          setIsQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-purple-300 transition-colors">
                            Cobro y Pago con QR
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            Celo wFIAT · Solana · Stellar SEP-0007
                          </p>
                        </div>
                      </button>

                      {/* Ripio Ramp / ARS */}
                      <button
                        onClick={() => {
                          setIsBankModalOpen(true);
                          setIsQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-blue-300 transition-colors">
                            Ripio Ramp & Banco ARS
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            On/Off-ramp en moneda local y wFIAT
                          </p>
                        </div>
                      </button>

                      {/* Escrow Solana / Stellar */}
                      <button
                        onClick={() => {
                          setIsSolanaEscrowOpen(true);
                          setIsQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center text-accent-teal shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-accent-teal transition-colors">
                            Custodia Escrow Multiriel
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            Contratos de hitos en Solana y Stellar
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hover Wallet Display */}
            {!isMobile && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle hover:border-accent-teal/30 hover:bg-foreground/10 transition-all min-w-[48px] justify-center">
                  <Wallet className="w-5 h-5 text-accent-teal" />
                  <ChevronDown className="w-3 h-3 text-muted group-hover:text-accent-teal transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute top-full right-0 mt-2 w-72 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <div className="glass-card p-4 shadow-2xl border border-border-subtle overflow-hidden">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 border-b border-border-subtle pb-2">
                      Balances Multiriel (Celo · Solana · Stellar)
                    </p>

                    <div className="space-y-2.5">
                      {/* Celo Mainnet Section */}
                      <div className="pb-2 border-b border-border-subtle">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                            🌱 Celo Mainnet (42220)
                          </span>
                          <span className="text-[9px] font-mono text-amber-300">
                            Tag: {attributionTag}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300">🇺🇸 USA₮ (x402):</span>
                          <span className="font-bold text-emerald-300">
                            {celoBalances.USAT?.numeric.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono mt-1">
                          <span className="text-slate-300">🇦🇷 wARS (Ripio):</span>
                          <span className="font-bold text-cyan-300">
                            {celoBalances.wARS?.numeric.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>

                      {/* Stellar Section */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          USDC (Stellar)
                        </span>
                        <span className="font-mono text-sm font-bold">
                          {usdcBalance?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Solana Section */}
                      <div className="pt-2 border-t border-border-subtle">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400">
                            ⚡ Solana Devnet
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {solConnected
                              ? solWalletName || "Conectado"
                              : "No conectada"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            USDC (SPL)
                          </span>
                          <span className="font-mono text-sm font-bold text-[#14F195]">
                            {solUsdcBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-1.5">
                      {celoAddress && (
                        <a
                          href={`https://celoscan.io/address/${celoAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-bold uppercase tracking-tighter"
                        >
                          <span>Celoscan Mainnet Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {address && (
                        <a
                          href={`https://stellar.expert/explorer/testnet/account/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[10px] text-muted hover:text-accent-teal transition-colors font-bold uppercase tracking-tighter"
                        >
                          <span>Stellar Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {solConnected && solAddress && (
                        <a
                          href={`https://explorer.solana.com/address/${solAddress}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[10px] text-purple-300 hover:text-purple-200 transition-colors font-bold uppercase tracking-tighter"
                        >
                          <span>Solana Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <ConnectButton />
          {isLoggedIn && (
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-border-subtle text-muted hover:text-foreground transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex w-2.5 h-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-red-500 border-2 border-deep-navy"></span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>

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

      <SolanaEscrowModal
        isOpen={isSolanaEscrowOpen}
        onClose={() => setIsSolanaEscrowOpen(false)}
      />

      <CeloAgentHubModal
        isOpen={isCeloAgentHubOpen}
        onClose={() => setIsCeloAgentHubOpen(false)}
        onOpenRentalEscrow={() => setIsRentalEscrowOpen(true)}
      />

      <SmartRentalEscrowModal
        isOpen={isRentalEscrowOpen}
        onClose={() => setIsRentalEscrowOpen(false)}
      />
    </header>
  );
}
