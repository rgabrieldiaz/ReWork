"use client";

import React from "react";
import { Hammer, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";

export default function BlogPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden flex flex-col">
      <PublicBackground />
      <PublicHeader />

      <main className="flex-1 w-full pt-20 pb-24 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-teal/30 shadow-[0_0_40px_rgba(0,242,255,0.15)] relative">
            <Hammer className="w-10 h-10 text-accent-teal" />
            <Sparkles className="w-5 h-5 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {t.blogPage.title}
          </h1>
          
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-border-subtle mb-8 bg-card/40 backdrop-blur-xl">
            <p className="text-xl md:text-2xl text-muted leading-relaxed mb-6">
              {t.blogPage.subtitle}
            </p>
            <p className="text-base text-muted/70">
              {t.blogPage.actionText}
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
