"use client";

import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { ConnectButton } from "@/components/ConnectButton";
import { Bell, Wallet, ExternalLink, ChevronDown } from "lucide-react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { connected, address, network, isMobile } = useWallet();
    const { profile, loading: profileLoading } = useProfile();
    const { authenticated } = usePrivy();
    const { t } = useSettings();
    const { xlmBalance, usdcBalance, loading: balanceLoading } = useSharedBalances();
    const { unreadCount } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const isLoggedIn = authenticated || connected;
    const firstName = profile?.first_name || t.profile.role;

    // Simulate Net Worth
    const xlmValue = (xlmBalance || 0) * 0.15;
    const auraValue = (profile?.points || 0) * 0.05;
    const usdcValue = usdcBalance || 0;
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
                {isLoggedIn ? (
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
                {isLoggedIn && (
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle shadow-sm drop-shadow-sm border-t-accent-teal/10">
                            <span className="text-xs text-muted font-bold tracking-wider uppercase">Mi AURA</span>
                            <div className="w-px h-5 bg-border-subtle"></div>
                            <span className="flex items-center text-accent-teal glow-teal">
                                <span className="text-lg font-black">{profile?.points || 0}</span>
                                <span className="text-xs font-bold ml-1 pt-0.5">PTS</span>
                            </span>
                        </div>

                        {/* Hover Wallet Display — desktop only, only when wallet connected */}
                        {connected && !isMobile && (
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-xl border border-border-subtle hover:border-accent-teal/30 hover:bg-foreground/10 transition-all min-w-[48px] justify-center">
                                    <Wallet className="w-5 h-5 text-accent-teal" />
                                    <ChevronDown className="w-3 h-3 text-muted group-hover:text-accent-teal transition-transform group-hover:rotate-180" />
                                </button>

                                <div className="absolute top-full right-0 mt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="glass-card p-4 shadow-2xl border border-border-subtle overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-teal/5 rounded-bl-full -mr-8 -mt-8"></div>
                                        
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 border-b border-border-subtle pb-2">Balances Wallet</p>
                                        
                                        <div className="space-y-3">
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
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border-subtle">
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/account/${address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between text-[10px] text-muted hover:text-accent-teal transition-colors font-bold uppercase tracking-tighter"
                                            >
                                                Ver en Explorer
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Network Indicator — only when wallet connected */}
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
        </header>
    );
}
