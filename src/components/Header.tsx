"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useBalances } from "@/hooks/useBalances";
import { ConnectButton } from "@/components/ConnectButton";
import { Bell } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { connected, address, network } = useFreighter();
    const { profile, loading: profileLoading } = useProfile();
    const { xlmBalance, usdcBalance, loading: balanceLoading } = useBalances(address || null);

    const firstName = profile?.first_name || "Colaborador";

    // Simulate Net Worth based on XLM, USDC, and Points
    const xlmValue = (xlmBalance || 0) * 0.15; // Assume 1 XLM = $0.15
    const ptsValue = (profile?.points || 0) * 0.05; // Assume 1 PTS = $0.05
    const usdcValue = usdcBalance || 0; // 1 USDC = $1.00
    const totalNetWorth = (xlmValue + ptsValue + usdcValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-border-glass sticky top-0 bg-deep-navy/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                )}
                {connected ? (
                    // Authenticated Left Side
                    <div className="flex items-center gap-4 sm:gap-8 hidden sm:flex">
                        <div>
                            <h1 className="text-sm text-slate-400 font-medium uppercase tracking-widest">Bienvenido</h1>
                            <p className="text-xl font-bold">
                                {profileLoading ? <span className="animate-pulse bg-slate-800 rounded w-24 h-6 block mt-1"></span> : firstName}
                            </p>
                        </div>
                        <div className="h-8 w-[1px] bg-border-glass"></div>
                        <div>
                            <h1 className="text-sm text-slate-400 font-medium uppercase tracking-widest">Patrimonio Total</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold">
                                    {balanceLoading || profileLoading ? <span className="animate-pulse bg-slate-800 rounded w-20 h-6 block mt-1"></span> : `${totalNetWorth} USD`}
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
                        <h1 className="text-sm text-slate-400 font-medium tracking-widest uppercase">Panel de Control</h1>
                        <p className="text-xl font-bold">ReWork</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {connected && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-xs font-mono mr-4 hidden sm:flex">
                            <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                                <span className="w-2 h-2 rounded-full bg-accent-teal glow-teal"></span>
                                <span className="text-slate-400">{profile?.points || 0} <span className="text-white font-bold">PTS</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-400">
                                    {balanceLoading ? (
                                        <span className="animate-pulse bg-slate-600 rounded w-8 h-3 inline-block"></span>
                                    ) : (
                                        <span className="text-white">{usdcBalance !== null ? usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
                                    )}
                                    <span className="text-emerald-400 font-bold ml-1">USDC</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-slate-400">
                                    {balanceLoading ? (
                                        <span className="animate-pulse bg-slate-600 rounded w-8 h-3 inline-block"></span>
                                    ) : (
                                        <a
                                            href={`https://stellar.expert/explorer/testnet/account/${address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-indigo-400 transition-colors uppercase tracking-wider text-white"
                                            title="Ver transacciones en Stellar Expert"
                                        >
                                            {xlmBalance !== null ? xlmBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                                        </a>
                                    )}
                                    <span className="text-indigo-400 font-bold ml-1">XLM</span>
                                </span>
                            </div>
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-glass-white border border-border-glass text-slate-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            {/* Simulate notification dot for now */}
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-deep-navy"></span>
                        </button>

                        {/* Network Indicator */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${network === 'TESTNET'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : network === 'PUBLIC'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${network === 'TESTNET' ? 'bg-indigo-400 animate-pulse'
                                    : network === 'PUBLIC' ? 'bg-emerald-400'
                                        : 'bg-slate-400'
                                }`}></span>
                            {network === 'PUBLIC' ? 'MAINNET' : network || 'OFFLINE'}
                        </div>
                    </div>
                )}
                <ConnectButton />
            </div>
        </header>
    );
}
