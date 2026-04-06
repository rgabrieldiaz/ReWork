"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Fingerprint, Key, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { usePrivy } from "@privy-io/react-auth";

export default function AuthGateway() {
  const router = useRouter();
  const { t, language, setLanguage } = useSettings();
  const { connected, connect, address, isMobile } = useWallet();
  const { profile, loading: profileLoading } = useProfile();
  const { login, authenticated, ready } = usePrivy();
  const [step, setStep] = useState<"SELECT" | "CREATING_AURA">("SELECT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (ready && (authenticated || profile) && step === "SELECT") {
      router.push("/workspaces");
    }
  }, [ready, authenticated, profile, step, router]);

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const addr = await connect();

      if (!addr) {
        throw new Error("No se pudo obtener la dirección de la wallet.");
      }

      setStep("CREATING_AURA");
      setLoading(false);

      setTimeout(() => {
        router.push("/workspaces");
      }, 3000);

    } catch (err: any) {
      console.error("Error conectando wallet:", err);
      if (err?.message?.toLowerCase().includes("user rejected") || err?.message?.toLowerCase().includes("denied")) {
        setError("Conexión rechazada. Aprobá la solicitud en tu wallet para continuar.");
      } else {
        setError(err?.message || "Error al conectar la wallet. Intentá de nuevo.");
      }
      setLoading(false);
    }
  };

  const handlePrivyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      login();
      // Privy handles the modal — redirect happens via the useEffect above
    } catch (err: any) {
      console.error("Error with Privy Login:", err);
      setError(err?.message || "Error al iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-teal/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full p-6 flex items-center justify-between z-10 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors group min-w-[140px]">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">{t.authPage.back}</span>
        </Link>
        <div className="flex items-center gap-3 shrink-0 min-w-[160px] justify-end">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground shrink-0"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            {language === 'es' ? 'ES' : 'EN'}
          </button>
          <span className="text-xs font-mono text-muted bg-foreground/5 px-3 py-1 rounded-full border border-border-subtle backdrop-blur-md whitespace-nowrap">
            {t.authPage.network}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Context */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-purple-500/20 border border-accent-teal/30 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,255,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <Fingerprint className="w-8 h-8 text-accent-teal relative z-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                {step === "SELECT" ? t.authPage.title : t.authPage.titleCreating}
            </h1>
            <p className="text-muted">
                {step === "SELECT" ? t.authPage.subtitle : t.authPage.subtitleCreating}
            </p>
        </div>

        {/* Dynamic Card */}
        <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-2xl relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent"></div>

            {step === "SELECT" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 animate-in fade-in duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Privy Login Button (Google/Email) — always visible */}
                    <button 
                        onClick={handlePrivyLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-accent-teal/30 bg-accent-teal/10 hover:bg-accent-teal/20 transition-all group relative overflow-hidden disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm text-accent-teal">{t.authPage.google}</p>
                                <p className="text-xs text-accent-teal/70">Google, Email & más</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-accent-teal group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Wallet Button */}
                    <>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border-subtle"></div>
                            <span className="flex-shrink-0 mx-4 text-muted text-xs font-medium">o conectá tu wallet</span>
                            <div className="flex-grow border-t border-border-subtle"></div>
                        </div>

                        <button 
                            onClick={handleConnectWallet}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-foreground/5 hover:bg-foreground/10 transition-colors group disabled:opacity-50"
                        >
                            {loading && (
                                <div className="absolute inset-0 w-full h-full bg-accent-teal/10 animate-pulse"></div>
                            )}
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center border border-border-subtle">
                                    <Wallet className="w-5 h-5 text-foreground" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">
                                        {loading ? "Abriendo wallet..." : connected ? "Wallet Conectada" : "Conectar Wallet Stellar"}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {connected ? `${address?.slice(0, 8)}...${address?.slice(-6)}` : "Freighter, xBull, Lobstr, Albedo..."}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-muted transition-transform relative z-10 ${loading ? '' : 'group-hover:translate-x-1'}`} />
                        </button>
                    </>
                </div>
            )}

            {step === "CREATING_AURA" && (
                <div className="py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 text-center">
                    
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-full bg-foreground/10 border-2 border-accent-teal/50 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(0,242,255,0.3)] z-10 relative">
                            👤
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full animate-[spin_3s_linear_infinite]">
                            <div className="w-4 h-4 rounded-full bg-accent-teal absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(0,242,255,1)]"></div>
                        </div>
                    </div>

                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted flex items-center gap-2"><Key className="w-4 h-4" /> {t.authPage.stepKey}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted flex items-center gap-2"><Fingerprint className="w-4 h-4" /> {t.authPage.stepAura}</span>
                            <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-xs font-mono text-accent-teal/80 bg-accent-teal/10 px-4 py-2 rounded-lg border border-accent-teal/20 w-full text-center truncate">
                        {address ? address : "Gxxxxxxxxxxxxxxxxxxxxx..."}
                    </div>

                    <p className="text-xs text-muted mt-4">{t.authPage.redirecting}</p>
                </div>
            )}

        </div>

      </div>

    </div>
  );
}
