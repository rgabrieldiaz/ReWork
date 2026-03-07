"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useBalances } from "@/hooks/useBalances";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { ConnectButton } from "@/components/ConnectButton";
import { Bell } from "lucide-react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useState } from "react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { connected, address, network } = useFreighter();
    const { profile, loading: profileLoading } = useProfile();
    const { t } = useSettings();
    const { xlmBalance, usdcBalance, loading: balanceLoading } = useBalances(address || null);
    const { unreadCount } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const firstName = profile?.first_name || t.profile.role;

    // Simulate Net Worth based on XLM, USDC, and Points
    const xlmValue = (xlmBalance || 0) * 0.15; // Assume 1 XLM = $0.15
    const auraValue = (profile?.points || 0) * 0.05; // Assume 1 AURA = $0.05
    const usdcValue = usdcBalance || 0; // 1 USDC = $1.00
    const totalNetWorth = (xlmValue + auraValue + usdcValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

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
                {connected ? (
                    // Authenticated Left Side
                    <div className="flex items-center gap-4 sm:gap-8 hidden sm:flex">
                        <div>
                            <h1 className="text-sm text-muted font-medium uppercase tracking-widest">{t.header.welcome}</h1>
                            <p className="text-xl font-bold">
                                {profileLoading ? <span className="animate-pulse bg-muted/10 rounded w-24 h-6 block mt-1"></span> : firstName}
                            </p>
                        </div>
                        <div className="h-8 w-[1px] bg-border-glass"></div>
                        <div>
                            <h1 className="text-sm text-muted font-medium uppercase tracking-widest">{t.header.totalNetWorth}</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold">
                                    {balanceLoading || profileLoading ? <span className="animate-pulse bg-muted/10 rounded w-20 h-6 block mt-1"></span> : `${totalNetWorth} USD`}
                                </p>
                                <span className="text-xs font-bold text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded flex items-center gap-1 border border-accent-teal/20">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"></path></svg>
                                    12.4%
                                </span>
                            </div>
                        </div>

                    </div>
                ) : (
                    // Unauthenticated Left Side
                    <div>
                        <h1 className="text-sm text-muted font-medium tracking-widest uppercase">{t.header.controlPanel}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 bg-accent-teal rounded-md flex items-center justify-center flex-shrink-0 dark:hidden">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path clipRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" fillRule="evenodd"></path></svg>
                            </div>
                            <p className="text-xl font-bold hidden dark:block">ReWork</p>
                            <p className="text-xl font-bold dark:hidden">Re<span className="text-accent-teal">Work</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {connected && (
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle shadow-sm drop-shadow-sm border-t-accent-teal/10">
                            <span className="text-xs text-muted font-bold tracking-wider uppercase">Mi AURA</span>
                            <div className="w-px h-5 bg-border-subtle"></div>
                            <span className="flex items-center text-accent-teal glow-teal">
                                <span className="text-lg font-black">{profile?.points || 0}</span>
                                <span className="text-xs font-bold ml-1 pt-0.5">PTS</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono mr-2 hidden sm:flex">
                            <div className="flex items-center gap-2 bg-muted/10 px-2 py-1 rounded-md border border-slate-700/50">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-muted">
                                    {balanceLoading ? (
                                        <span className="animate-pulse bg-slate-600 rounded w-8 h-3 inline-block"></span>
                                    ) : (
                                        <span className="text-foreground">{usdcBalance !== null ? usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
                                    )}
                                    <span className="text-emerald-400 font-bold ml-1">USDC</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/10 px-2 py-1 rounded-md border border-slate-700/50">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-muted">
                                    {balanceLoading ? (
                                        <span className="animate-pulse bg-slate-600 rounded w-8 h-3 inline-block"></span>
                                    ) : (
                                        <a
                                            href={`https://stellar.expert/explorer/testnet/account/${address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-indigo-400 transition-colors uppercase tracking-wider text-foreground"
                                            title="Ver transacciones en Stellar Expert"
                                        >
                                            {xlmBalance !== null ? xlmBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                                        </a>
                                    )}
                                    <span className="text-indigo-400 font-bold ml-1">XLM</span>
                                </span>
                            </div>
                        </div>
                        {/* Network Indicator */}
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

                    </div>
                )}
                <div className="flex items-center gap-4">
                    <ConnectButton />
                    {connected && (
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
        </header>
    );
}
