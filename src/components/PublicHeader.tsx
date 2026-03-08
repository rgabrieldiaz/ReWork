"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function PublicHeader() {
  const { language, setLanguage } = useSettings();

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          {/* Isotipo */}
          <div className="w-10 h-10 bg-accent-teal/10 rounded-xl flex items-center justify-center border border-accent-teal/30 shadow-[0_0_15px_rgba(0,242,255,0.15)] hover:border-accent-teal transition-colors">
            <svg className="w-6 h-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">ReWork</span>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
        <Link href="/caracteristicas" className="hover:text-foreground transition-colors">Infraestructura</Link>
        <Link href="/sobre-nosotros" className="hover:text-foreground transition-colors">Soluciones</Link>
        <Link href="/planes" className="hover:text-foreground transition-colors">Planes</Link>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground"
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          {language === 'es' ? 'ES' : 'EN'}
        </button>
        <Link href="/auth" className="hidden sm:block text-sm font-medium text-muted hover:text-foreground transition-colors">
          Iniciar Sesión
        </Link>
        <Link 
          href="/auth" 
          className="group relative px-6 py-2.5 bg-accent-teal text-black rounded-lg font-bold text-sm overflow-hidden shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative flex items-center gap-2">
            Comenzar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>
    </nav>
  );
}
