"use client";

import React from "react";
import { Scale } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";
import { translations } from "@/lib/translations";

export default function TerminosDeUsoPage() {
  const { language } = useSettings();
  const t = translations[language].terminosPage;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <Scale className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.title}</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle">
            <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s1Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
              {t.s1Desc}
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s2Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
               {t.s2Desc}
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s3Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
               {t.s3Desc}
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s4Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
               {t.s4Desc}
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s5Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
               {t.s5Desc}
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">{t.s6Title}</h3>
            <p className="text-muted leading-relaxed mb-8">
               {t.s6Desc}
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
