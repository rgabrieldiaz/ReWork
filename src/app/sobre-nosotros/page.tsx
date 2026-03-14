"use client";

import React from "react";
import Link from "next/link";
import { UserCircle, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";
import { translations } from "@/lib/translations";

export default function SobreNosotrosPage() {
  const { language } = useSettings();
  const t = translations[language].sobreNosotrosPage;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <UserCircle className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.title}</h1>
          <p className="text-lg text-accent-teal max-w-2xl mx-auto leading-relaxed font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle">
            <p className="text-muted leading-relaxed mb-6">
              {t.content1}
            </p>
            <p className="text-muted leading-relaxed mb-6">
               {t.content2}
            </p>
            <p className="text-muted leading-relaxed">
              {t.content3}
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/auth" className="inline-flex items-center gap-2 bg-foreground text-background font-bold py-3 px-8 rounded-full hover:bg-muted transition-colors">
            {t.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
