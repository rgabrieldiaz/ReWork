"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Zap, Building2, Users, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function LandingPage() {
  const { t, language, setLanguage } = useSettings();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      
      {/* Background Effects */}
      <PublicBackground />

      {/* Navigation */}
      <PublicHeader />

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border-subtle mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
            </span>
            <span className="text-xs font-mono font-medium text-muted">{t.landing.hero.badge}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-4xl text-balance leading-[1.1]">
            {t.landing.hero.title1}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal via-cyan-400 to-blue-500">
              {t.landing.hero.title2}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-2xl text-balance mb-12">
            {t.landing.hero.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/auth" 
              className="px-8 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            >
              {t.landing.hero.ctaPrimary}
              <Zap className="w-5 h-5 text-accent-teal" />
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 glass-card border border-border-subtle hover:border-accent-teal/50 rounded-xl font-bold transition-all flex items-center justify-center hover:bg-foreground/5"
            >
              {t.landing.hero.ctaSecondary}
            </a>
          </div>
        </section>

        {/* Features / Tech Pillars */}
        <section id="features" className="py-24 px-6 border-y border-border-subtle bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.features.title}</h2>
              <p className="text-muted max-w-2xl mx-auto">{t.landing.features.desc}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-accent-teal/30 transition-colors group">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t.landing.features.f1Title}</h3>
                <p className="text-muted leading-relaxed">
                  {t.landing.features.f1Desc}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t.landing.features.f2Title}</h3>
                  <p className="text-muted leading-relaxed">
                    {t.landing.features.f2Desc}
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-emerald-500/30 transition-colors group">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t.landing.features.f3Title}</h3>
                <p className="text-muted leading-relaxed">
                  {t.landing.features.f3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions: Who is this for? */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.solutions.title}</h2>
              <p className="text-muted max-w-2xl mx-auto">{t.landing.solutions.desc}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Empresas */}
              <div className="glass-card p-10 border border-border-subtle rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                <Building2 className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{t.landing.solutions.s1Title}</h3>
                <p className="text-muted mb-8 leading-relaxed">
                  {t.landing.solutions.s1Desc}
                </p>
                <ul className="space-y-3 mb-8">
                  {t.landing.solutions.s1Bullets.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

               {/* Comunidades */}
               <div className="glass-card p-10 border border-border-subtle rounded-3xl relative overflow-hidden group">
                <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-accent-teal/10 blur-3xl rounded-full"></div>
                <Users className="w-10 h-10 text-accent-teal mb-6" />
                <h3 className="text-2xl font-bold mb-4">{t.landing.solutions.s2Title}</h3>
                <p className="text-muted mb-8 leading-relaxed">
                  {t.landing.solutions.s2Desc}
                </p>
                <ul className="space-y-3 mb-8">
                  {t.landing.solutions.s2Bullets.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 border-t border-border-subtle bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.pricing.title}</h2>
            <p className="text-muted max-w-2xl mx-auto mb-16">{t.landing.pricing.desc}</p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              
              <div className="glass-card p-8 rounded-3xl border border-border-subtle">
                <h3 className="text-xl font-bold mb-2">{t.landing.pricing.p1.title}</h3>
                <p className="text-2xl font-mono font-bold mb-6">{t.landing.pricing.p1.price}</p>
                <p className="text-sm text-muted mb-8">{t.landing.pricing.p1.desc}</p>
                <ul className="space-y-4 mb-8">
                  {t.landing.pricing.p1.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> {b}</li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center py-3 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-bold text-sm">
                  {t.landing.pricing.p1.cta}
                </Link>
              </div>

              <div className="glass-card p-8 rounded-3xl border-2 border-accent-teal relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-teal text-black text-xs font-bold px-3 py-1 rounded-full">
                  {t.landing.pricing.p2.badge}
                </div>
                <h3 className="text-xl font-bold mb-2">{t.landing.pricing.p2.title}</h3>
                <p className="text-2xl font-mono font-bold mb-6">{t.landing.pricing.p2.price}<span className="text-sm text-muted font-sans">{t.landing.pricing.monthDesc}</span></p>
                <p className="text-sm text-muted mb-8">{t.landing.pricing.p2.desc}</p>
                <ul className="space-y-4 mb-8">
                  {t.landing.pricing.p2.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> {b}</li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-accent-teal text-black hover:bg-accent-teal/90 transition-colors font-bold text-sm shadow-md">
                  {t.landing.pricing.p2.cta}
                </Link>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-border-subtle">
                <h3 className="text-xl font-bold mb-2">{t.landing.pricing.p3.title}</h3>
                <p className="text-2xl font-mono font-bold mb-6">{t.landing.pricing.p3.price}</p>
                <p className="text-sm text-muted mb-8">{t.landing.pricing.p3.desc}</p>
                <ul className="space-y-4 mb-8">
                  {t.landing.pricing.p3.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> {b}</li>
                  ))}
                </ul>
                <button className="block w-full text-center py-3 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-bold text-sm">
                  {t.landing.pricing.p3.cta}
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
