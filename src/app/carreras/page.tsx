"use client";

import React from "react";
import { Briefcase, Building2, Globe, Coins } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";

export default function CarrerasPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden flex flex-col">
      <PublicBackground />
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-12 pb-24">
        <div className="text-center mb-16 mt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <Briefcase className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.carrerasPage.title}</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.carrerasPage.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="glass-card p-6 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
            <Building2 className="w-10 h-10 text-accent-teal mb-4" />
            <h3 className="text-lg font-bold mb-2">{t.carrerasPage.reason1Title}</h3>
            <p className="text-sm text-muted">{t.carrerasPage.reason1Desc}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
            <Globe className="w-10 h-10 text-accent-teal mb-4" />
            <h3 className="text-lg font-bold mb-2">{t.carrerasPage.reason2Title}</h3>
            <p className="text-sm text-muted">{t.carrerasPage.reason2Desc}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
            <Coins className="w-10 h-10 text-accent-teal mb-4" />
            <h3 className="text-lg font-bold mb-2">{t.carrerasPage.reason3Title}</h3>
            <p className="text-sm text-muted">{t.carrerasPage.reason3Desc}</p>
          </div>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl border border-border-subtle text-center">
          <h2 className="text-2xl font-bold mb-6">{t.carrerasPage.openPositions}</h2>
          <div className="p-8 border border-dashed border-border-subtle rounded-2xl bg-black/20">
            <p className="text-muted">{t.carrerasPage.noPositions}</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
