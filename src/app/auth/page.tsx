"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Mail, Fingerprint, Key, ChevronRight, CheckCircle2 } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useSettings } from "@/hooks/useSettings";

export default function AuthGateway() {
  const router = useRouter();
  const { connected, connect, address } = useFreighter();
  const { language, setLanguage } = useSettings();
  const [step, setStep] = useState<"SELECT" | "CREATING_AURA">("SELECT");
  const [loading, setLoading] = useState(false);

  // Mock flow for connecting Web3
  const handleConnectWallet = async () => {
    setLoading(true);
    // Simular el tiempo de conexión o usar la conexión real si no está conectada
    if (!connected) {
        await connect();
    }
    
    // Si se conectó exitosamente, procedemos al paso de creación visual
    setTimeout(() => {
      setStep("CREATING_AURA");
      setLoading(false);
      
      // Simular final de onboarding y redirigir a /app
      setTimeout(() => {
         router.push("/app");
      }, 3500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-teal/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation */}
      <div className="absolute top-0 w-full p-6 flex items-center justify-between z-10 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Volver a ReWork</span>
        </Link>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground"
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
                {language === 'es' ? 'ES' : 'EN'}
            </button>
            <span className="text-xs font-mono text-muted bg-foreground/5 px-3 py-1 rounded-full border border-border-subtle backdrop-blur-md">
                Stellar Network V2
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
                {step === "SELECT" ? "The Bridge" : "Creando tu AURA"}
            </h1>
            <p className="text-muted">
                {step === "SELECT" ? "Elegí tu método para acceder a ReWork" : "Asegurando tu identidad soberana..."}
            </p>
        </div>

        {/* Dynamic Card */}
        <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-2xl relative overflow-hidden">
            {/* Shimmer effect at the top border */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent"></div>

            {step === "SELECT" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={() => router.push("/app")}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-foreground/5 hover:bg-foreground/10 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                {/* Simple Google "G" representation */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Continuar con Google</p>
                                <p className="text-xs text-muted">Acceso rápido Web2</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground transition-colors" />
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border-subtle"></div>
                        <span className="flex-shrink-0 mx-4 text-muted text-xs font-medium">Recomendado</span>
                        <div className="flex-grow border-t border-border-subtle"></div>
                    </div>

                    <button 
                        onClick={handleConnectWallet}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-accent-teal/30 bg-accent-teal/10 hover:bg-accent-teal/20 transition-all group relative overflow-hidden disabled:opacity-50"
                    >
                        {loading && (
                            <div className="absolute inset-0 w-full h-full bg-accent-teal/10 animate-pulse"></div>
                        )}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm text-accent-teal">{loading ? "Conectando..." : "Conectar Wallet (Web3)"}</p>
                                <p className="text-xs text-accent-teal/70">Identidad inmutable y pagos</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-accent-teal transition-transform relative z-10 ${loading ? '' : 'group-hover:translate-x-1'}`} />
                    </button>
                </div>
            )}

            {step === "CREATING_AURA" && (
                <div className="py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 text-center">
                    
                    <div className="relative mb-8">
                        {/* Aura Avatar Placeholder */}
                        <div className="w-24 h-24 rounded-full bg-foreground/10 border-2 border-accent-teal/50 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(0,242,255,0.3)] z-10 relative">
                            👤
                        </div>
                        {/* Orbiting element */}
                        <div className="absolute top-0 left-0 w-full h-full animate-[spin_3s_linear_infinite]">
                            <div className="w-4 h-4 rounded-full bg-accent-teal absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(0,242,255,1)]"></div>
                        </div>
                    </div>

                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted flex items-center gap-2"><Key className="w-4 h-4" /> Generando Llave Stellar</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Vinculando Reputación (AURA)</span>
                            <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-xs font-mono text-accent-teal/80 bg-accent-teal/10 px-4 py-2 rounded-lg border border-accent-teal/20 w-full text-center truncate">
                        {address ? address : "Gxxxxxxxxxxxxxxxxxxxxx..."}
                    </div>
                </div>
            )}

        </div>

      </div>

    </div>
  );
}
