"use client";

import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useStaking } from "@/hooks/useStaking";
import { ConnectButton } from "@/components/ConnectButton";
import { Bell, Wallet, ExternalLink, ChevronDown, QrCode, Landmark, TrendingUp, Lock } from "lucide-react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { QRPaymentsModal } from "@/components/QRPaymentsModal";
import { BankTransferModal } from "@/components/BankTransferModal";
import { SolanaEscrowModal } from "@/components/SolanaEscrowModal";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { getTripleValues, SupportedCurrency, formatCurrency, DEFAULT_RATES } from "@/lib/currency";
import { ReWorkIcon } from "@/components/ReWorkLogo";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { connected, address, network, isMobile } = useWallet();
    const { profile, loading: profileLoading } = useProfile();
    const { authenticated } = usePrivy();
    const { t, language } = useSettings();
    const { xlmBalance, usdcBalance, loading: balanceLoading } = useSharedBalances();
    const { stakedAmount, activeApy, accruedYield, activeCurrency, setActiveCurrency } = useStaking();
    const { unreadCount } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isSolanaEscrowOpen, setIsSolanaEscrowOpen] = useState(false);

    const {
        connected: solConnected,
        address: solAddress,
        formattedAddress: solFormattedAddress,
        walletName: solWalletName,
        usdcBalance: solUsdcBalance,
        solBalance,
    } = useSolanaWallet();

    const isLoggedIn = authenticated || connected || solConnected;
    const firstName = profile?.first_name || t.profile.role;

    // Simulate Net Worth & Liquidity across rails (Stellar + Solana + Fiat)
    const xlmValue = (xlmBalance || 0) * (DEFAULT_RATES.XLM_TO_USDC || 0.28);
    const solValue = (solBalance || 0) * (DEFAULT_RATES.SOL_TO_USDC || 152.5);
    const solUsdcVal = solUsdcBalance || 0;
    const auraValue = (profile?.points || 0) * 0.05;
    const usdcValue = (usdcBalance || 0) + solUsdcVal;
    const totalLiquidUsdc = xlmValue + solValue + usdcValue;
    const totalNetWorthUsdc = totalLiquidUsdc + stakedAmount + auraValue;

    const tripleLiquid = getTripleValues(totalLiquidUsdc, "USDC");
    const tripleStake = getTripleValues(stakedAmount, "USDC");
    const tripleNetWorth = getTripleValues(totalNetWorthUsdc, "USDC");

    return (
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-muted hover:text-foreground transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                )}
                {isLoggedIn ? (
                    <div className="flex items-center gap-4 sm:gap-6 hidden sm:flex">
                        <div>
                            <h1 className="text-xs text-muted font-medium uppercase tracking-widest">{t.header.welcome}</h1>
                            <p className="text-lg font-bold">
                                {profileLoading ? <span className="animate-pulse bg-muted/10 rounded w-20 h-5 block mt-1"></span> : firstName}
                            </p>
                        </div>
                        <div className="h-8 w-[1px] bg-border-glass"></div>
                        
                        {/* Financial Group: Patrimonio + Líquido + Stake & Rendimiento */}
                        <div className="flex items-center gap-4">
                            {/* Patrimonio Total */}
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-xs text-muted font-medium uppercase tracking-widest">{t.header.totalNetWorth}</h1>
                                    <span className="text-[9px] font-mono font-bold text-accent-teal bg-accent-teal/10 px-1 py-0.2 rounded border border-accent-teal/20">
                                        {activeCurrency}
                                    </span>
                                </div>
                                <p className="text-lg font-bold font-mono">
                                    {balanceLoading || profileLoading ? (
                                        <span className="animate-pulse bg-muted/10 rounded w-16 h-5 block mt-1"></span>
                                    ) : (
                                        tripleNetWorth.formatted[activeCurrency.toLowerCase() as 'usdc' | 'ars' | 'xlm' | 'sol']
                                    )}
                                </p>
                            </div>

                            {/* Separador */}
                            <div className="h-6 w-[1px] bg-border-subtle hidden xl:block"></div>

                            {/* Líquido Disponible */}
                            <div className="hidden xl:flex flex-col">
                                <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                                    {language === 'es' ? "Líquido" : "Liquid"}
                                </span>
                                <span className="font-mono text-sm font-bold text-foreground">
                                    {balanceLoading ? "..." : tripleLiquid.formatted[activeCurrency.toLowerCase() as 'usdc' | 'ars' | 'xlm' | 'sol']}
                                </span>
                            </div>

                            {/* Separador */}
                            <div className="h-6 w-[1px] bg-border-subtle hidden md:block"></div>

                            {/* En Stake */}
                            <div className="hidden md:flex flex-col">
                                <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                                    {language === 'es' ? "En Stake" : "Staked"}
                                </span>
                                <span className="font-mono text-sm font-bold text-foreground">
                                    {tripleStake.formatted[activeCurrency.toLowerCase() as 'usdc' | 'ars' | 'xlm' | 'sol']}
                                </span>
                            </div>

                            {/* Rendimiento Acumulado en Vivo (Ganancia Devengada) */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-sm shadow-emerald-500/5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/90">
                                            {language === 'es' ? "Rendimiento Vivo" : "Live Yield"}
                                        </span>
                                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-400/20 px-1 py-0.2 rounded flex items-center gap-0.5">
                                            <TrendingUp className="w-2.5 h-2.5" />
                                            +{activeApy}% APY
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs font-black text-emerald-300 glow-green">
                                        {activeCurrency === "ARS"
                                            ? formatCurrency(accruedYield * DEFAULT_RATES.USDC_TO_ARS, "ARS")
                                            : activeCurrency === "XLM"
                                            ? formatCurrency(accruedYield / DEFAULT_RATES.XLM_TO_USDC, "XLM")
                                            : activeCurrency === "SOL"
                                            ? formatCurrency(accruedYield / DEFAULT_RATES.SOL_TO_USDC, "SOL")
                                            : `+${accruedYield.toFixed(4)} USDC`}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div>
                        <h1 className="text-sm text-muted font-medium tracking-widest uppercase">{t.header.controlPanel}</h1>
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

            <div className="flex items-center gap-4 sm:gap-6">
                {isLoggedIn && (
                    <div className="flex items-center gap-3">
                        {/* Currency Quick Toggle */}
                        <div className="hidden sm:flex items-center gap-1 p-1 bg-foreground/5 rounded-xl border border-border-subtle">
                            {(["USDC", "ARS", "XLM", "SOL"] as SupportedCurrency[]).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCurrency(c)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                                        activeCurrency === c
                                            ? "bg-accent-teal text-background shadow-sm"
                                            : "text-muted hover:text-foreground"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* Botón QR */}
                        <button
                            onClick={() => setIsQrModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-bold transition-all shadow-sm"
                            title={language === 'es' ? "Cobros y Pagos con QR" : "QR Payments & Collections"}
                        >
                            <QrCode className="w-3.5 h-3.5 text-purple-400" />
                            <span className="hidden lg:inline">QR</span>
                        </button>

                        {/* Botón Retiro Banco ARS */}
                        <button
                            onClick={() => setIsBankModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                            title={language === 'es' ? "Retiro en Pesos a Banco" : "Bank Withdrawal in ARS"}
                        >
                            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden lg:inline">{language === 'es' ? "Banco ARS" : "ARS Bank"}</span>
                        </button>

                        {/* Botón Custodia Escrow Multichain */}
                        <button
                            onClick={() => setIsSolanaEscrowOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-accent-teal/10 to-emerald-500/10 hover:from-purple-500/20 hover:to-accent-teal/20 border border-accent-teal/30 text-accent-teal hover:text-white text-xs font-bold transition-all shadow-sm"
                            title={language === 'es' ? "Custodia Escrow Multichain (Solana o Stellar)" : "Multichain Escrow Vault (Solana or Stellar)"}
                        >
                            <Lock className="w-3.5 h-3.5 text-accent-teal" />
                            <span className="hidden lg:inline">{language === 'es' ? "Custodia Escrow" : "Escrow Vault"}</span>
                        </button>

                        {/* Mi AURA */}
                        <div className="hidden xl:flex items-center gap-3 px-4 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle shadow-sm drop-shadow-sm border-t-accent-teal/10">
                            <span className="text-xs text-muted font-bold tracking-wider uppercase">{language === 'es' ? "Mi AURA" : "My AURA"}</span>
                            <div className="w-px h-5 bg-border-subtle"></div>
                            <span className="flex items-center text-accent-teal glow-teal">
                                <span className="text-lg font-black">{profile?.points || 0}</span>
                                <span className="text-xs font-bold ml-1 pt-0.5">PTS</span>
                            </span>
                        </div>

                        {/* Hover Wallet Display */}
                        {connected && !isMobile && (
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle hover:border-accent-teal/30 hover:bg-foreground/10 transition-all min-w-[48px] justify-center">
                                    <Wallet className="w-5 h-5 text-accent-teal" />
                                    <ChevronDown className="w-3 h-3 text-muted group-hover:text-accent-teal transition-transform group-hover:rotate-180" />
                                </button>

                                <div className="absolute top-full right-0 mt-2 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="glass-card p-4 shadow-2xl border border-border-subtle overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-teal/5 rounded-bl-full -mr-8 -mt-8"></div>
                                        
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 border-b border-border-subtle pb-2">{language === 'es' ? "Balances Multi-Moneda" : "Multi-Currency Balances"}</p>
                                        
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">USDC</span>
                                                </div>
                                                <span className="font-mono text-sm font-bold">
                                                    {balanceLoading ? (
                                                        <span className="animate-pulse bg-muted/10 rounded w-12 h-3 block"></span>
                                                    ) : usdcBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">XLM</span>
                                                </div>
                                                <span className="font-mono text-sm font-bold">
                                                    {balanceLoading ? (
                                                        <span className="animate-pulse bg-muted/10 rounded w-12 h-3 block"></span>
                                                    ) : xlmBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{language === 'es' ? "ARS Equivalente" : "ARS Equivalent"}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-muted">
                                                    {tripleLiquid.formatted.ars}
                                                </span>
                                            </div>

                                            {/* Solana Devnet Balances */}
                                            <div className="pt-2 border-t border-border-subtle">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400">
                                                        Solana Devnet
                                                    </span>
                                                    <span className="text-[9px] font-mono text-slate-400">
                                                        {solConnected ? solWalletName || "Conectado" : "No conectada"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-[#14F195]"></div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">USDC (SPL)</span>
                                                    </div>
                                                    <span className="font-mono text-sm font-bold text-[#14F195]">
                                                        {solUsdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                {solBalance > 0 && (
                                                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                                                        <span>SOL:</span>
                                                        <span>{solBalance.toFixed(3)} SOL</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-1.5">
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

                        {/* Network Indicator */}
                        {connected && (
                            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${network === 'TESTNET'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : network === 'PUBLIC'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-500/10 text-muted border-slate-500/20'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${network === 'TESTNET' ? 'bg-indigo-400 animate-pulse'
                                    : network === 'PUBLIC' ? 'bg-emerald-400'
                                        : 'bg-slate-400'
                                    }`}></span>
                                {network === 'PUBLIC' ? t.header.mainnet : network || t.header.offline}
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-4">
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
        </header>
    );
}
