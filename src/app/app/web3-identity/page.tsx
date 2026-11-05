"use client";

import { useState } from "react";
import {
    Shield,
    Copy,
    ExternalLink,
    CheckCircle,
    Award,
    Activity,
    Fingerprint,
    Wallet,
    Star,
    Zap,
    Link2,
    Bot,
    ShieldCheck,
    FlaskConical,
    ChevronDown,
} from "lucide-react";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { usePrivy } from "@privy-io/react-auth";
import { useTestnetRails, setTestnetRailsEnabled } from "@/lib/feature-flags";
import { CeloAgentHubModal } from "@/components/CeloAgentHubModal";
import { SmartRentalEscrowModal } from "@/components/SmartRentalEscrowModal";
import { toast } from "sonner";

export default function Web3IdentityPage() {
    const {
        connected: celoConnected,
        address: celoAddress,
        walletName: celoWalletName,
        balances: celoBalances,
        attributionTag,
        erc8004Status,
        registerERC8004Agent,
        connectCelo,
    } = useCeloWallet();
    const { connected: stellarConnected, address: stellarAddress } = useWallet();
    const { connected: solConnected, address: solAddress } = useSolanaWallet();
    const { authenticated, login: privyLogin } = usePrivy();
    const { profile } = useProfile();
    const { language } = useSettings();
    const testnetRailsEnabled = useTestnetRails();

    const [copied, setCopied] = useState(false);
    const [registeringAgent, setRegisteringAgent] = useState(false);
    const [isAgentHubOpen, setIsAgentHubOpen] = useState(false);
    const [isRentalEscrowOpen, setIsRentalEscrowOpen] = useState(false);
    const [showDevLabs, setShowDevLabs] = useState(false);

    const primaryAddress =
        celoAddress ||
        (profile?.wallet_address?.startsWith("0x") ? profile.wallet_address : null) ||
        (testnetRailsEnabled ? stellarAddress || solAddress : null);

    const isIdentityReady = Boolean(primaryAddress || authenticated || celoConnected);

    const copyAddress = () => {
        if (!primaryAddress) return;
        navigator.clipboard.writeText(primaryAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegisterAgent = async () => {
        setRegisteringAgent(true);
        try {
            await registerERC8004Agent();
            toast.success("Agente ERC-8004 registrado en Celo Mainnet");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error registrando identidad ERC-8004";
            toast.error(msg);
        } finally {
            setRegisteringAgent(false);
        }
    };

    const badges = [
        {
            icon: Bot,
            label: erc8004Status?.registered
                ? `ERC-8004 ${erc8004Status.agentIdLabel || "Verificado"}`
                : "ERC-8004 Ready",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/25",
        },
        {
            icon: Zap,
            label: `Tag: ${attributionTag}`,
            color: "text-amber-300",
            bg: "bg-amber-500/10 border-amber-500/25",
        },
        {
            icon: Shield,
            label: language === "es" ? "Identidad Celo Mainnet" : "Celo Mainnet Identity",
            color: "text-accent-teal",
            bg: "bg-accent-teal/10 border-accent-teal/20",
        },
        {
            icon: Star,
            label: "x402 Gasless Enabled",
            color: "text-cyan-300",
            bg: "bg-cyan-500/10 border-cyan-500/25",
        },
    ];

    const mainnetLinks = [
        {
            label: "Celoscan Mainnet Explorer (Tu Cuenta)",
            url: primaryAddress?.startsWith("0x")
                ? `https://celoscan.io/address/${primaryAddress}`
                : "https://celoscan.io",
        },
        {
            label: "ERC-8004 Identity Registry (Celo Mainnet)",
            url: "https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        },
        {
            label: "Documentación Celo Agents & Attribution (ERC-8021)",
            url: "https://docs.celo.org",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-emerald-400" />
                        </span>
                        {language === "es" ? "Agente IA e Identidad On-Chain" : "AI Agent & On-Chain Identity"}
                    </h1>
                    <p className="text-muted mt-1 text-sm">
                        {language === "es"
                            ? "Tu billetera embebida o externa en Celo Mainnet (42220), registro de agente ERC-8004 y reputación verificable."
                            : "Your embedded or external wallet on Celo Mainnet (42220), ERC-8004 agent registry, and verifiable reputation."}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsAgentHubOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                        <Bot className="w-4 h-4" />
                        Abrir Celo Agent Hub (4 Tracks)
                    </button>
                </div>
            </div>

            {!isIdentityReady ? (
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center border border-border-subtle rounded-2xl bg-card/50 border-dashed space-y-4">
                    <Wallet className="w-12 h-12 text-emerald-400/70" />
                    <div>
                        <p className="font-bold text-foreground mb-1">
                            {language === "es"
                                ? "Activá tu Identidad en Celo Mainnet"
                                : "Activate your Celo Mainnet Identity"}
                        </p>
                        <p className="text-sm text-muted max-w-md">
                            {language === "es"
                                ? "Iniciá sesión con Google (crea una wallet embebida en Celo Mainnet automáticamente) o conectá MetaMask / MiniPay."
                                : "Sign in with Google (auto-creates an embedded Celo Mainnet wallet) or connect MetaMask / MiniPay."}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => privyLogin()}
                            className="px-4 py-2.5 rounded-xl bg-accent-teal text-slate-950 font-bold text-xs cursor-pointer"
                        >
                            Iniciar con Google / Email
                        </button>
                        <button
                            type="button"
                            onClick={() => connectCelo().catch(() => {})}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-bold text-xs cursor-pointer"
                        >
                            Conectar MetaMask / MiniPay
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: DID + ERC-8004 Agent Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Primary Identity Card */}
                        <div className="bg-card rounded-2xl border border-emerald-500/25 p-6 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.06)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
                            <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                    <Fingerprint className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-foreground">
                                                {profile?.first_name
                                                    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                                                    : "Usuario ReWork"}
                                            </h2>
                                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        </div>
                                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                            🌱 Celo Mainnet · 42220
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted mb-3">
                                        {celoWalletName || "Privy Embedded Wallet (Celo Mainnet)"} · Atribución ERC-8021 activa
                                    </p>

                                    <div className="flex items-center gap-2 bg-background/70 border border-border-subtle rounded-xl px-3 py-2.5">
                                        <span className="font-mono text-xs sm:text-sm text-emerald-300 truncate flex-1">
                                            {primaryAddress || "Generando dirección 0x en Celo Mainnet..."}
                                        </span>
                                        {primaryAddress && (
                                            <button
                                                onClick={copyAddress}
                                                className="shrink-0 text-muted hover:text-emerald-400 transition-colors cursor-pointer"
                                                title="Copiar dirección 0x..."
                                            >
                                                {copied ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ERC-8004 Autonomous Agent Registration & Capabilities */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <Bot className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm sm:text-base">
                                            Identidad de Agente Autónomo (ERC-8004)
                                        </h3>
                                        <p className="text-xs text-muted">
                                            Permite operar garantías 50/50 con árbitro IA (@celo/buy) y pagos x402 sin gas en USA₮.
                                        </p>
                                    </div>
                                </div>

                                {erc8004Status?.registered ? (
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                                        ✓ Agente Registrado {erc8004Status.agentIdLabel || "Activo"}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleRegisterAgent}
                                        disabled={registeringAgent}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {registeringAgent ? "Firmando en Celo..." : "Registrar Agente ERC-8004"}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAgentHubOpen(true)}
                                    className="p-3.5 rounded-xl bg-background/60 hover:bg-foreground/[0.04] border border-border-subtle text-left transition-all cursor-pointer flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-foreground group-hover:text-emerald-300 transition-colors">
                                            Consola Celo Agent Hub
                                        </p>
                                        <p className="text-[11px] text-muted mt-0.5">
                                            Ripio wFIAT · Textile FX · @celo/buy · USA₮ x402
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-emerald-400 shrink-0" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsRentalEscrowOpen(true)}
                                    className="p-3.5 rounded-xl bg-background/60 hover:bg-foreground/[0.04] border border-border-subtle text-left transition-all cursor-pointer flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                                            Garantía de Alquiler 50/50
                                        </p>
                                        <p className="text-[11px] text-muted mt-0.5">
                                            Custodia con rendimiento DeFiLlama y árbitro IA
                                        </p>
                                    </div>
                                    <ShieldCheck className="w-4 h-4 text-muted group-hover:text-amber-300 shrink-0" />
                                </button>
                            </div>
                        </div>

                        {/* Verifiable Credentials */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-accent-teal" />
                                <h3 className="font-semibold text-foreground">
                                    {language === "es" ? "Credenciales Verificables" : "Verifiable Credentials"}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {badges.map((badge, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${badge.bg}`}>
                                        <badge.icon className={`w-5 h-5 ${badge.color} flex-shrink-0`} />
                                        <span className={`text-xs font-mono font-bold ${badge.color} truncate`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* On-chain Explorer Links */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Link2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-semibold text-foreground">
                                    {language === "es" ? "Verificación en Celo Mainnet" : "Celo Mainnet Verification"}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {mainnetLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:border-emerald-500/35 hover:bg-emerald-500/5 transition-all group"
                                    >
                                        <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                                            {link.label}
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-muted group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Balances & Reputation */}
                    <div className="space-y-6">
                        {/* Celo Mainnet Balances */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-semibold text-foreground">Saldos Celo Mainnet</h3>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">42220</span>
                            </div>
                            <div className="space-y-2.5 text-sm">
                                {[
                                    { sym: "USDC", label: "Circle USDC", val: celoBalances.USDC?.numeric.toFixed(2) || "0.00", color: "text-foreground" },
                                    { sym: "USA₮", label: "Tether USA₮ (x402)", val: celoBalances.USAT?.numeric.toFixed(2) || "0.00", color: "text-emerald-300" },
                                    { sym: "wARS", label: "Peso Digital (Ripio)", val: celoBalances.wARS?.numeric.toLocaleString() || "0", color: "text-cyan-300" },
                                    { sym: "wBRL", label: "Real Digital (Ripio)", val: celoBalances.wBRL?.numeric.toLocaleString() || "0", color: "text-amber-300" },
                                    { sym: "CELO", label: "CELO Nativo", val: celoBalances.CELO?.numeric.toFixed(3) || "0.000", color: "text-emerald-400" },
                                ].map((tok) => (
                                    <div
                                        key={tok.sym}
                                        className="flex justify-between items-center p-2.5 bg-background/50 rounded-xl border border-border-subtle"
                                    >
                                        <div>
                                            <span className="font-mono font-bold text-xs text-foreground block">
                                                {tok.sym}
                                            </span>
                                            <span className="text-[11px] text-muted">{tok.label}</span>
                                        </div>
                                        <span className={`font-mono font-bold ${tok.color}`}>{tok.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reputation Score */}
                        <div className="bg-card rounded-2xl border border-border-subtle p-6">
                            <h3 className="font-semibold text-foreground mb-4">
                                {language === "es" ? "Reputación ReWork" : "ReWork Reputation"}
                            </h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-3">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.9"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.05)"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.9"
                                            fill="none"
                                            stroke="var(--accent-teal)"
                                            strokeWidth="2.5"
                                            strokeDasharray={`${Math.min(100, (profile?.points || 500) / 10)} 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold font-mono text-foreground">
                                            {profile?.points || 500}
                                        </span>
                                        <span className="text-[9px] text-muted uppercase tracking-wide">pts</span>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                    {(profile?.points || 500) >= 500
                                        ? "Miembro Verificado"
                                        : "Colaborador Activo"}
                                </p>
                                <p className="text-xs text-muted text-center mt-1">
                                    Puntaje acumulado por contratos y acuerdos cumplidos
                                </p>
                            </div>
                        </div>

                        {/* Non-custodial note */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-emerald-300 mb-1">
                                    Custodia 100% Soberana
                                </p>
                                <p className="text-xs text-muted leading-relaxed">
                                    Si ingresaste con Google/Email, Privy protege tu clave en enclave seguro sobre Celo Mainnet sin extensiones. También podés operar con MetaMask o MiniPay.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🧪 Discrete Developer / Multichain Labs Toggle (Preserves Solana Devnet & Stellar Testnet out of sight) */}
            <div className="pt-6 border-t border-border-subtle/50">
                <button
                    type="button"
                    onClick={() => setShowDevLabs((prev) => !prev)}
                    className="flex items-center gap-2 text-xs font-mono text-muted/70 hover:text-muted transition-colors cursor-pointer"
                >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Opciones Avanzadas de Laboratorio (Multichain Testnets)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDevLabs ? "rotate-180" : ""}`} />
                </button>

                {showDevLabs && (
                    <div className="mt-3 p-4 rounded-2xl bg-card/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-foreground">
                                Mostrar rieles experimentales en fase de testeo (Solana Devnet & Stellar Testnet)
                            </p>
                            <p className="text-[11px] text-muted max-w-2xl">
                                Por defecto se mantienen ocultos para garantizar que usuarios y jurados operen exclusivamente sobre <strong>Celo Mainnet (42220)</strong> sin errores de red. Activalo únicamente para pruebas técnicas internas.
                            </p>
                            {testnetRailsEnabled && (
                                <p className="text-[11px] font-mono text-amber-400 pt-1">
                                    Estado actual: Labs Activo · Solana ({solConnected ? "Conectada" : "Inactiva"}) · Stellar ({stellarConnected ? "Conectada" : "Inactiva"})
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const next = !testnetRailsEnabled;
                                setTestnetRailsEnabled(next);
                                toast.success(
                                    next
                                        ? "Modo Multichain Labs activado (Solana Devnet + Stellar Testnet visibles)"
                                        : "Modo Producción activado: 100% Celo Mainnet puro"
                                );
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border shrink-0 transition-all cursor-pointer ${
                                testnetRailsEnabled
                                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                    : "bg-foreground/5 border-border-subtle text-muted hover:text-foreground"
                            }`}
                        >
                            {testnetRailsEnabled ? "Desactivar Testnets (Volver a Mainnet Puro)" : "Habilitar Testnets (Labs)"}
                        </button>
                    </div>
                )}
            </div>

            <CeloAgentHubModal
                isOpen={isAgentHubOpen}
                onClose={() => setIsAgentHubOpen(false)}
                onOpenRentalEscrow={() => setIsRentalEscrowOpen(true)}
            />
            <SmartRentalEscrowModal
                isOpen={isRentalEscrowOpen}
                onClose={() => setIsRentalEscrowOpen(false)}
            />
        </div>
    );
}
