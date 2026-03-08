"use client";

import Link from "next/link";
import { ArrowRight, Building2, Users, Hexagon, ChevronRight, LogOut } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function WorkspacesHub() {
  const { language, setLanguage } = useSettings();
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden text-foreground">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between z-10 max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-teal/10 rounded-lg flex items-center justify-center border border-accent-teal/30">
                <svg className="w-5 h-5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">ReWork</span>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground"
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
                {language === 'es' ? 'ES' : 'EN'}
            </button>
            <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Desconectar
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center z-10 py-12">
        
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Tus Entornos <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-blue-500">ReWork</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl">
                Seleccioná el espacio de trabajo al que deseás acceder. Tu Identidad (AURA) y tu Wallet son globales en todos tus entornos.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Corporación / Empresa (Ruta principal actual) */}
            <Link href="/app" className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-accent-teal/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] block">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-accent-teal/30 transition-colors">
                        <Building2 className="w-7 h-7 text-foreground" />
                    </div>
                    <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                        Pro Environment
                    </span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-accent-teal transition-colors flex items-center justify-between">
                        Tech Rebel Corp
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </h2>
                    <p className="text-muted text-sm mb-6">
                        Entorno corporativo privado. Acceso al Marketplace interno de la empresa y misiones de Squad.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 140 Miembros</span>
                        <span className="flex items-center gap-1.5"><Hexagon className="w-4 h-4 text-accent-teal" /> 5 Squads</span>
                    </div>
                </div>
            </Link>

            {/* Comunidad / DAO (Placeholder / Teaser) */}
            <div className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] opacity-80 hover:opacity-100 cursor-pointer">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-purple-500/30 transition-colors">
                        <Users className="w-7 h-7 text-foreground" />
                    </div>
                     <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
                        Community DAO
                    </span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors flex items-center justify-between">
                        Red de Creadores Web3
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </h2>
                    <p className="text-muted text-sm mb-6">
                        Comunidad abierta. Participá en proyectos open-source y ganá recompensas (Bounties) de la tesorería.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1,200+ Miembros</span>
                        <span className="flex items-center gap-1.5">🟢 Abierto</span>
                    </div>
                </div>
            </div>

        </div>

        <div className="mt-12 text-center relative z-10">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-accent-teal transition-colors group">
                Explorar Nuevas Alianzas Publicas
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
}
