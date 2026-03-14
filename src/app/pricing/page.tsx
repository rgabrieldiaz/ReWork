"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";
import { translations } from "@/lib/translations";

export default function PlanesPage() {
  const { language } = useSettings();
  const t = translations[language].planesPage;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      {/* Background Orbs */}
      <PublicBackground />

      <PublicHeader />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-accent-teal tracking-widest uppercase mb-2 block">{t.badge}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.title}</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Gratuito */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative hover:border-accent-teal/30 transition-colors">
             <h3 className="text-2xl font-bold mb-2">{t.p1Title}</h3>
             <p className="text-muted text-sm mb-6 h-10">{t.p1Desc}</p>
             <div className="text-4xl font-bold mb-8">{t.p1Price} <span className="text-lg text-muted font-normal">/mes</span></div>
             <ul className="space-y-4 mb-8">
                {t.p1Bullets.map((bullet: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted">
                    <Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> {bullet}
                  </li>
                ))}
             </ul>
             <Link href="/auth" className="block w-full text-center py-3 rounded-xl border border-border-subtle font-bold hover:bg-foreground/5 transition-colors">
                {t.ctaFree}
             </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 rounded-3xl border border-accent-teal/50 relative shadow-[0_0_40px_rgba(0,242,255,0.1)] -translate-y-4">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-teal to-transparent opacity-50"></div>
             <span className="absolute top-4 right-4 text-[10px] font-bold text-black bg-accent-teal px-2 py-1 rounded-full uppercase tracking-wider">{t.popular}</span>
             <h3 className="text-2xl font-bold mb-2">{t.p2Title}</h3>
             <p className="text-muted text-sm mb-6 h-10">{t.p2Desc}</p>
             <div className="text-4xl font-bold mb-8">{t.p2Price} <span className="text-lg text-muted font-normal">{language === 'es' ? '/mes' : '/month'}</span></div>
             <ul className="space-y-4 mb-8">
                {t.p2Bullets.map((bullet: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> {bullet}
                  </li>
                ))}
             </ul>
             <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-accent-teal text-black font-bold hover:bg-accent-teal/90 transition-colors shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                {t.ctaPro}
             </Link>
          </div>

          {/* Enterprise */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative hover:border-purple-500/30 transition-colors">
             <h3 className="text-2xl font-bold mb-2">{t.p3Title}</h3>
             <p className="text-muted text-sm mb-6 h-10">{t.p3Desc}</p>
             <div className="text-4xl font-bold mb-8">{t.p3Price}</div>
             <ul className="space-y-4 mb-8">
                {t.p3Bullets.map((bullet: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted">
                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0" /> {bullet}
                  </li>
                ))}
             </ul>
             <a href="mailto:soporte@rework.com" className="block w-full text-center py-3 rounded-xl border border-border-subtle font-bold hover:bg-foreground/5 transition-colors">
                {t.ctaEnterprise}
             </a>
          </div>

        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
