"use client";

import { useState } from "react";
import { Shield, Copy, ExternalLink, CheckCircle, Award, Activity, Globe, Fingerprint, Wallet, Star, Zap, Link2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useBalances } from "@/hooks/useBalances";
import { useSettings } from "@/hooks/useSettings";

function truncateAddress(addr: string) {
    if (!addr || addr.length < 20) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function Web3IdentityPage() {
    const { connected, address } = useWallet();
    const { profile } = useProfile();
    const { xlmBalance, usdcBalance } = useBalances(address || null);
    const { t } = useSettings();
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const badges = [
        { icon: Star, label: "Early Adopter", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
        { icon: Zap, label: "Fast Mover", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
        { icon: Shield, label: "Verified Member", color: "text-accent-teal", bg: "bg-accent-teal/10 border-accent-teal/20" },
    ];

    const trustlessLinks = [
        { label: "Stellar Explorer", url: address ? `https://stellar.expert/explorer/testnet/account/${address}` : "https://stellar.expert/explorer/testnet" },
        { label: "Documentación Trustless Work", url: "https://docs.trustlesswork.com/trustless-work/es" },
        { label: "Stellar Network Docs", url: "https://developers.stellar.org/" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-accent-teal" />
                        </span>
                        Red de Valores Web3
                    </h1>
                    <p className="text-muted mt-1 text-sm">Tu identidad soberana y reputación en la blockchain de Stellar.</p>
                </div>
                {connected && (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-accent-teal/10 border border-accent-teal/20 rounded-full text-xs font-bold text-accent-teal">
                        <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                        Wallet Conectada
                    </span>
                )}
            </div>

            {!connected ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted border border-border-subtle rounded-2xl bg-card/50 border-dashed">
                    <Wallet className="w-12 h-12 mb-4 text-neutral-600" />
                    <p className="font-semibold text-foreground/60 mb-1">Conecta tu wallet Stellar</p>
                    <p className="text-sm">Para ver tu identidad soberana en la red Stellar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: DID Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Identity Card */}
                        <div className="bg-card rounded-2xl border border-accent-teal/20 p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.05)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/5 blur-[80px] pointer-events-none" />
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-teal/30 to-blue-500/30 border border-accent-teal/20 flex items-center justify-center flex-shrink-0">
                                    <Fingerprint className="w-8 h-8 text-accent-teal" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold">
                                            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Identidad Anónima'}
                                        </h2>
                                        <CheckCircle className="w-5 h-5 text-accent-teal flex-shrink-0" />
                                    </div>
                                    <p className="text-xs text-muted mb-3">Decentralized Identifier (DID) · Stellar Testnet</p>
                                    <div className="flex items-center gap-2 bg-background/50 border border-border-subtle rounded-xl px-3 py-2">
                                        <span className="font-mono text-sm text-accent-teal truncate flex-1">{address}</span>
                                        <button
                                            onClick={copyAddress}
                                            className="shrink-0 text-muted hover:text-accent-teal transition-colors"
                                            title="Copiar dirección"
                                        >
                                            {copied ? <CheckCircle className="w-4 h-4 text-accent-teal" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-accent-teal" />
                                <h3 className="font-semibold text-foreground">Credenciales Verificables</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {badges.map((badge, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${badge.bg}`}>
                                        <badge.icon className={`w-5 h-5 ${badge.color} flex-shrink-0`} />
                                        <span className={`text-sm font-semibold ${badge.color}`}>{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* On-chain Links */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Link2 className="w-5 h-5 text-accent-teal" />
                                <h3 className="font-semibold text-foreground">Recursos On-Chain</h3>
                            </div>
                            <div className="space-y-2">
                                {trustlessLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-all group"
                                    >
                                        <span className="text-sm text-muted group-hover:text-foreground transition-colors">{link.label}</span>
                                        <ExternalLink className="w-4 h-4 text-muted group-hover:text-accent-teal transition-colors flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="space-y-6">
                        {/* Balances */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-accent-teal" />
                                <h3 className="font-semibold text-foreground">Saldos en Red</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border-subtle">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">XLM</span>
                                        <span className="text-sm text-muted">Stellar Lumens</span>
                                    </div>
                                    <span className="font-mono font-bold text-foreground">{xlmBalance?.toFixed(2) ?? '—'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border-subtle">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-accent-teal/20 text-accent-teal border border-accent-teal/30 flex items-center justify-center text-xs font-bold">USD</span>
                                        <span className="text-sm text-muted">USDC</span>
                                    </div>
                                    <span className="font-mono font-bold text-accent-teal">{usdcBalance?.toFixed(2) ?? '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reputation Score */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <h3 className="font-semibold text-foreground mb-4">Reputación ReWork</h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-3">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5"
                                            strokeDasharray={`${(profile?.points || 0) / 20} 100`}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold font-mono text-foreground">{profile?.points || 0}</span>
                                        <span className="text-[9px] text-muted uppercase tracking-wide">pts</span>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                    {(profile?.points || 0) >= 500 ? 'Colaborador Senior' : (profile?.points || 0) >= 100 ? 'Colaborador Activo' : 'Nuevo Miembro'}
                                </p>
                                <p className="text-xs text-muted text-center mt-1">Basado en actividad en la plataforma</p>
                            </div>
                        </div>

                        {/* DID verified badge */}
                        <div className="p-4 bg-accent-teal/5 border border-accent-teal/20 rounded-2xl flex items-start gap-3">
                            <Shield className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-accent-teal mb-1">Identidad Soberana</p>
                                <p className="text-xs text-muted leading-relaxed">Tu wallet Stellar actúa como identificador descentralizado. Nadie más controla tu identidad.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
