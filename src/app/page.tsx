"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  CheckCircle2,
  Award,
  Sparkles,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function LandingPage() {
  const { t } = useSettings();
  const router = useRouter();
  const { plan, isJuror, openUpgradeModal, activateJurorPass } = useSubscription();

  const handleJurorEnter = async () => {
    await activateJurorPass("landing_hero");
    router.push("/workspaces");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      {/* Background Effects */}
      <PublicBackground />

      {/* Navigation */}
      <PublicHeader />

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="pt-16 pb-28 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            <Link
              href="/deck"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/30 hover:border-accent-teal transition-all group cursor-pointer"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
              </span>
              <span className="text-xs font-mono font-medium text-accent-teal group-hover:underline">
                {t.landing.hero.badge} • Ver Pitch Deck →
              </span>
            </Link>

            <button
              type="button"
              onClick={handleJurorEnter}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border-subtle text-xs font-mono text-foreground transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-accent-teal" />
              <span>
                {isJuror
                  ? "Pase de Jurado Activo • Entrar →"
                  : "¿Sos Jurado? Activar Pase Evaluador Gratis"}
              </span>
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl text-balance leading-[1.12]">
            {t.landing.hero.title1}
            <br />
            <span className="text-accent-teal">{t.landing.hero.title2}</span>
          </h1>

          <p className="text-base md:text-lg text-muted max-w-2xl text-balance mb-10 leading-relaxed">
            {t.landing.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
            <Link
              href="/auth"
              className="px-7 py-3.5 bg-accent-teal text-slate-950 rounded-xl font-semibold hover:bg-accent-teal/90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <span>{t.landing.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/deck"
              className="px-7 py-3.5 bg-card border border-border-subtle hover:border-foreground/20 text-foreground rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Ver Pitch Deck</span>
            </Link>
            <a
              href="#pricing"
              className="px-7 py-3.5 bg-foreground/[0.03] border border-border-subtle hover:border-foreground/20 rounded-xl font-semibold transition-all flex items-center justify-center text-muted hover:text-foreground text-sm"
            >
              <span>Ver Planes y Precios</span>
            </a>
          </div>
        </section>

        {/* Features / Tech Pillars */}
        <section id="features" className="py-20 px-6 border-y border-border-subtle bg-foreground/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-4xl font-bold mb-3">{t.landing.features.title}</h2>
              <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
                {t.landing.features.desc}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="glass-card p-7 rounded-xl border border-border-subtle hover:border-foreground/20 transition-colors">
                <div className="w-11 h-11 bg-accent-teal/10 rounded-lg flex items-center justify-center mb-5 border border-accent-teal/25">
                  <Lock className="w-5 h-5 text-accent-teal" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t.landing.features.f1Title}</h3>
                <p className="text-sm text-muted leading-relaxed">{t.landing.features.f1Desc}</p>
              </div>

              {/* Pillar 2 */}
              <div className="glass-card p-7 rounded-xl border border-border-subtle hover:border-foreground/20 transition-colors">
                <div className="w-11 h-11 bg-accent-teal/10 rounded-lg flex items-center justify-center mb-5 border border-accent-teal/25">
                  <ShieldCheck className="w-5 h-5 text-accent-teal" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t.landing.features.f2Title}</h3>
                <p className="text-sm text-muted leading-relaxed">{t.landing.features.f2Desc}</p>
              </div>

              {/* Pillar 3 */}
              <div className="glass-card p-7 rounded-xl border border-border-subtle hover:border-foreground/20 transition-colors">
                <div className="w-11 h-11 bg-accent-teal/10 rounded-lg flex items-center justify-center mb-5 border border-accent-teal/25">
                  <Zap className="w-5 h-5 text-accent-teal" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t.landing.features.f3Title}</h3>
                <p className="text-sm text-muted leading-relaxed">{t.landing.features.f3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions: Who is this for? */}
        <section id="solutions" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">{t.landing.solutions.title}</h2>
            <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
              {t.landing.solutions.desc}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Empresas */}
            <div className="glass-card p-8 border border-border-subtle rounded-xl">
              <Building2 className="w-8 h-8 text-accent-teal mb-5" />
              <h3 className="text-xl font-bold mb-3">{t.landing.solutions.s1Title}</h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">{t.landing.solutions.s1Desc}</p>
              <ul className="space-y-2.5">
                {t.landing.solutions.s1Bullets.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comunidades */}
            <div className="glass-card p-8 border border-border-subtle rounded-xl">
              <Users className="w-8 h-8 text-accent-teal mb-5" />
              <h3 className="text-xl font-bold mb-3">{t.landing.solutions.s2Title}</h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">{t.landing.solutions.s2Desc}</p>
              <ul className="space-y-2.5">
                {t.landing.solutions.s2Bullets.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 border-t border-border-subtle bg-foreground/[0.01]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">{t.landing.pricing.title}</h2>
            <p className="text-sm md:text-base text-muted max-w-2xl mx-auto mb-8">
              {t.landing.pricing.desc}
            </p>

            {/* Juror Pass Quick Banner */}
            <div className="max-w-3xl mx-auto mb-12 p-4 rounded-xl bg-card border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-accent-teal shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-foreground">
                    ¿Evaluando el proyecto para un Hackathon?
                  </span>{" "}
                  <span className="text-muted">
                    Activá el Pase de Jurado sin costo para desbloquear todas las funciones Pro.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleJurorEnter}
                className="px-3.5 py-2 rounded-lg bg-accent-teal/15 hover:bg-accent-teal hover:text-slate-950 border border-accent-teal/30 text-accent-teal text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
              >
                {isJuror ? "Pase Activo • Entrar →" : "Activar Pase de Jurado"}
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left items-stretch">
              {/* Plan 1: Free */}
              <div className="glass-card p-7 rounded-xl border border-border-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Inicial (Free)</h3>
                  <p className="text-2xl font-mono font-bold mb-4">$0 / mes</p>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p1.desc}</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex gap-2.5 text-xs text-muted">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>1 Workspace propio incluido</span>
                    </li>
                    <li className="flex gap-2.5 text-xs text-muted">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>Hasta 3 Misiones Squad activas</span>
                    </li>
                    <li className="flex gap-2.5 text-xs text-muted">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>Comisión estándar de Escrow (0.50%)</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/auth"
                  className="block w-full text-center py-2.5 rounded-lg border border-border-subtle hover:bg-foreground/5 transition-colors font-semibold text-xs"
                >
                  {t.landing.pricing.p1.cta}
                </Link>
              </div>

              {/* Plan 2: Pro ($49 USDC/mes) */}
              <div className="glass-card p-7 rounded-xl border-2 border-accent-teal relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold">Pro B2B</h3>
                    <span className="bg-accent-teal text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {t.landing.pricing.p2.badge}
                    </span>
                  </div>
                  <p className="text-2xl font-mono font-bold mb-4">
                    $49 USDC
                    <span className="text-xs text-muted font-sans"> / mes</span>
                  </p>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p2.desc}</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>Workspaces y Misiones ilimitados</span>
                    </li>
                    <li className="flex gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>50% de descuento en Escrow (0.25% fee)</span>
                    </li>
                    <li className="flex gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>Agente DeFi completo (Celo, Solana, Stellar)</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => openUpgradeModal()}
                  className="w-full py-2.5 rounded-lg bg-accent-teal text-slate-950 hover:bg-accent-teal/90 transition-colors font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan === "pro" ? "Plan Pro Activo" : "Activar Plan Pro ($49 USDC)"}</span>
                </button>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="glass-card p-7 rounded-xl border border-border-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">{t.landing.pricing.p3.title}</h3>
                  <p className="text-2xl font-mono font-bold mb-4">Custom</p>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p3.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {t.landing.pricing.p3.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-muted">
                        <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => openUpgradeModal()}
                  className="block w-full text-center py-2.5 rounded-lg border border-border-subtle hover:bg-foreground/5 transition-colors font-semibold text-xs cursor-pointer"
                >
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
