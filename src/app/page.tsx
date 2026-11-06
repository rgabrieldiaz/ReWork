"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  CheckCircle2,
  Award,
  Sparkles,
  Landmark,
  Bot,
  TrendingUp,
  Percent,
  Check,
  Scale,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function LandingPage() {
  const { t, language } = useSettings();
  const router = useRouter();
  const { plan, isJuror, openUpgradeModal, activateJurorPass } = useSubscription();

  // Interactive 50/50 Rental Escrow Simulator State
  const [depositAmount, setDepositAmount] = useState<number>(1200);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const apyRate = 0.114; // 11.4% APY en Aave V3 Celo

  const totalYield = (depositAmount * apyRate * durationMonths) / 12;
  const tenantShare = totalYield / 2;
  const landlordShare = totalYield / 2;
  const warsRate = 1200; // 1 USD ≈ 1,200 wARS

  const handleJurorEnter = async () => {
    await activateJurorPass("landing_hero");
    router.push("/workspaces");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      <PublicHeader />

      <main className="relative z-10 w-full">
        {/* ── HERO SECTION ── */}
        <section className="pt-14 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* Badges superiores */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>🌱 Celo Mainnet (42220) • Finanzas Agénticas LatAm</span>
            </span>

            <button
              type="button"
              onClick={handleJurorEnter}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-300 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isJuror
                  ? "Pase de Jurado Activo • Ir al Workspace →"
                  : "¿Sos Jurado? Activar Pase Evaluador Gratis"}
              </span>
            </button>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl text-balance leading-[1.14]">
            El espacio financiero para equipos y creadores,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal via-cyan-400 to-emerald-400">
              garantizado por agentes y código.
            </span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl text-balance mb-10 leading-relaxed">
            Depósitos de alquiler 50/50 con rendimiento DeFi en Celo, acuerdos de trabajo por hitos y transferencias inmediatas en monedas locales (wARS, wBRL, wCOP, wMXN) o dólares digitales sin costo de gas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-14">
            <Link
              href="/auth"
              className="px-7 py-3.5 bg-accent-teal text-slate-950 rounded-xl font-bold hover:bg-accent-teal/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent-teal/20 cursor-pointer"
            >
              <span>{t.landing.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleJurorEnter}
              className="px-6 py-3.5 bg-card border border-amber-500/40 hover:border-amber-500 text-amber-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Entrar en Modo Jurado (0% Fee)</span>
            </button>
            <a
              href="#pricing"
              className="px-6 py-3.5 bg-foreground/[0.03] border border-border-subtle hover:border-foreground/20 rounded-xl font-semibold transition-all flex items-center justify-center text-muted hover:text-foreground text-sm"
            >
              <span>Ver Planes</span>
            </a>
          </div>

          {/* ── SIMULADOR INTERACTIVO DE GARANTÍA 50/50 ── */}
          <div className="w-full max-w-4xl glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle text-left shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-teal/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border-subtle mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    Simulador: Garantía de Alquiler 50/50 (Yield Escrow)
                  </h3>
                  <p className="text-xs text-muted">
                    El capital en garantía no queda ocioso: genera rendimiento en bovedas DeFi de Celo Mainnet y reparte beneficios al 50%.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                +11.4% APY en Celo Mainnet
              </span>
            </div>

            {/* Selector de Montos y Plazos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-semibold text-muted block mb-2">
                  Monto del Depósito de Garantía (USD):
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted">$</span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(100, Number(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-background border border-border-subtle text-foreground font-mono font-bold text-base outline-none focus:border-accent-teal"
                    />
                  </div>
                  <span className="text-xs font-mono text-muted">USDC / USA₮</span>
                </div>

                <div className="flex gap-2">
                  {[600, 1200, 2500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        depositAmount === val
                          ? "bg-accent-teal/20 border-accent-teal text-accent-teal font-bold"
                          : "bg-foreground/5 border-border-subtle text-muted hover:text-foreground"
                      }`}
                    >
                      ${val} USD
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-2">
                  Plazo del Contrato de Locación:
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "6 meses", months: 6 },
                    { label: "12 meses (1 año)", months: 12 },
                    { label: "24 meses (2 años)", months: 24 },
                  ].map((p) => (
                    <button
                      key={p.months}
                      type="button"
                      onClick={() => setDurationMonths(p.months)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        durationMonths === p.months
                          ? "bg-accent-teal/20 border-accent-teal text-accent-teal font-bold"
                          : "bg-background border-border-subtle text-muted hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{p.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-muted">
                  Equivalente en moneda local:{" "}
                  <strong className="text-foreground font-mono">
                    ${(depositAmount * warsRate).toLocaleString("es-AR")} wARS
                  </strong>{" "}
                  (vía Ripio wFIAT en Celo).
                </p>
              </div>
            </div>

            {/* Resultados Divididos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-foreground/[0.03] border border-border-subtle mb-5">
              <div className="p-3 rounded-xl bg-background border border-border-subtle">
                <span className="text-[11px] text-muted block mb-1">Rendimiento Total Generado</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  +${totalYield.toFixed(2)} USD
                </span>
                <span className="text-[10px] font-mono text-muted block mt-0.5">
                  ≈ ${(totalYield * warsRate).toLocaleString("es-AR")} wARS
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-accent-teal/30">
                <span className="text-[11px] text-accent-teal font-semibold block mb-1">
                  Ganancia Inquilino (50%)
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  +${tenantShare.toFixed(2)} USD
                </span>
                <span className="text-[10px] font-mono text-muted block mt-0.5">
                  Descuento en retorno de depósito
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 font-semibold block mb-1">
                  Ganancia Propietario (50%)
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  +${landlordShare.toFixed(2)} USD
                </span>
                <span className="text-[10px] font-mono text-muted block mt-0.5">
                  Renta extra libre de riesgo
                </span>
              </div>
            </div>

            {/* Arbitraje IA y Botón */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-subtle text-xs">
              <div className="flex items-center gap-2 text-muted">
                <Scale className="w-4 h-4 text-accent-teal shrink-0" />
                <span>
                  Resolución de controversias automatizada con peritaje IA (<strong>@celo/buy</strong>).
                </span>
              </div>

              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 text-accent-teal font-semibold hover:underline"
              >
                <span>Probar Contrato en Celo Mainnet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── PILARES DE INFRAESTRUCTURA (4 TRACKS CELO) ── */}
        <section id="features" className="py-20 px-6 border-y border-border-subtle bg-foreground/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-mono font-semibold text-accent-teal uppercase tracking-wider mb-2 block">
                Infraestructura en Producción
              </span>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
                {t.landing.features.title}
              </h2>
              <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
                {t.landing.features.desc}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Pilar 1: Garantía 50/50 */}
              <div className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/25 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">
                    Garantía de Alquiler 50/50
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    Depósitos de garantía que rinden en bóvedas DeFi de Celo (Aave V3 / Uniswap V3) y dividen ganancias 50/50 entre inquilino y dueño.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle text-[11px] font-mono text-emerald-400">
                  Track 3 • Arbitraje @celo/buy
                </div>
              </div>

              {/* Pilar 2: wFIAT y Rampa Ripio */}
              <div className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-accent-teal/10 rounded-xl flex items-center justify-center mb-4 border border-accent-teal/25 text-accent-teal">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">
                    Monedas Locales & Rampa Ripio
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    Cobrá y pagá con QR o rampa en ARS, BRL, COP, MXN, PEN y CLP mediante wFIAT respaldado 1:1 en Celo Mainnet con CBU o PIX.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle text-[11px] font-mono text-accent-teal">
                  Track 1 • Ripio wFIAT & Ramp
                </div>
              </div>

              {/* Pilar 3: USA₮ Gasless x402 */}
              <div className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/25 text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">
                    Pagos Sin Gas en USA₮ (x402)
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    Micro-liquidaciones entre colaboradores y agencias sin tener que comprar gas ni lidiar con comisiones gracias a EIP-3009.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle text-[11px] font-mono text-cyan-400">
                  Track 4 • USA₮ x402 Facilitator
                </div>
              </div>

              {/* Pilar 4: Agentes ERC-8004 & Textile FX */}
              <div className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 border border-purple-500/25 text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">
                    Agentes ERC-8004 & Textile FX
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    Identidad agéntica on-chain (`0x8004...`), atribución ERC-8021 y swaps RFQ para rotar tesorerías con LimitOrderReactor.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle text-[11px] font-mono text-purple-400">
                  Track 2 • Textile Open Corridors
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOLUCIONES: ¿PARA QUIÉN ES REWORK? ── */}
        <section id="solutions" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono font-semibold text-accent-teal uppercase tracking-wider mb-2 block">
              Casos de Uso Reales
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
              {t.landing.solutions.title}
            </h2>
            <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
              {t.landing.solutions.desc}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Persona 1: Inquilinos y Propietarios */}
            <div className="glass-card p-8 border border-border-subtle rounded-2xl hover:border-accent-teal/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Inquilinos y Propietarios
              </h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Eliminá el costo de oportunidad de los depósitos de garantía. El capital genera intereses reales durante el contrato y el árbitro IA audita presupuestos y facturas en segundos si surge una controversia.
              </p>
              <ul className="space-y-3">
                {[
                  "Rendimiento 50/50 compartido en Celo DeFi",
                  "Resolución IA de controversias con @celo/buy",
                  "Depósitos y retiros directos en wARS o Dólares",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Persona 2: Freelancers, Agencias y Creadores */}
            <div className="glass-card p-8 border border-border-subtle rounded-2xl hover:border-accent-teal/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Freelancers, Agencias y Comunidades
              </h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Acordá proyectos con fondos asegurados en custodia no permisionada. Cobrá con QR o rampa bancaria en moneda local y liquidá en USA₮ sin pagar tarifas de red, acumulando reputación AURA verificable.
              </p>
              <ul className="space-y-3">
                {[
                  "Custodia por hitos con liberación al validar código",
                  "Cobros y pagos QR en Celo Mainnet",
                  "Identidad Agéntica ERC-8004 y liquidación x402",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── PLANES Y MODELO DE NEGOCIO ── */}
        <section id="pricing" className="py-20 px-6 border-t border-border-subtle bg-foreground/[0.01]">
          <div className="max-w-6xl mx-auto text-center">
            <span className="text-xs font-mono font-semibold text-accent-teal uppercase tracking-wider mb-2 block">
              Precios Transparentes
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
              {t.landing.pricing.title}
            </h2>
            <p className="text-sm md:text-base text-muted max-w-2xl mx-auto mb-10">
              {t.landing.pricing.desc}
            </p>

            {/* Juror Pass Quick Banner */}
            <div className="max-w-3xl mx-auto mb-12 p-5 rounded-2xl bg-card border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    ¿Sos Jurado o Evaluador de Hackathon?
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Activá el <strong>Pase de Jurado Acreditado</strong> en 1 clic para probar todas las funciones Pro, workspaces ilimitados y contratos al 0% de comisión sin tarjetas ni fondos reales.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleJurorEnter}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow"
              >
                {isJuror ? "Pase Activo • Ir a Workspaces →" : "Activar Pase de Jurado Gratis"}
              </button>
            </div>

            {/* 3 Tarjetas de Planes */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left items-stretch">
              {/* Plan 1: Free */}
              <div className="glass-card p-7 rounded-2xl border border-border-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Inicial (Free)</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-mono font-bold">$0</span>
                    <span className="text-xs text-muted">/ para siempre</span>
                  </div>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p1.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "1 Workspace propio incluido",
                      "Hasta 3 Misiones de equipo activas",
                      "Comisión estándar de Escrow (0.50%)",
                      "Cobro con QR y Rampa Ripio wFIAT",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-muted">
                        <Check className="w-4 h-4 text-accent-teal shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/auth"
                  className="block w-full text-center py-2.5 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-semibold text-xs cursor-pointer"
                >
                  {t.landing.pricing.p1.cta}
                </Link>
              </div>

              {/* Plan 2: Pro B2B */}
              <div className="glass-card p-7 rounded-2xl border-2 border-accent-teal relative flex flex-col justify-between shadow-xl shadow-accent-teal/5">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent-teal text-slate-950 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Recomendado
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 mt-1">
                    <h3 className="text-lg font-bold text-foreground">ReWork Pro B2B</h3>
                    {plan === "pro" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-teal/15 text-accent-teal">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-mono font-bold text-foreground">$49</span>
                    <span className="text-xs font-mono text-accent-teal">USDC / mes</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted mb-4">
                    (o $58.800 ARS vía CBU / Ripio)
                  </p>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p2.desc}</p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Workspaces y Misiones ilimitados",
                      "50% de descuento en Escrow (0.25% fee)",
                      "Garantías de Alquiler 50/50 ilimitadas",
                      "Agente DeFi Celo Mainnet completo",
                      "Liquidación x402 en USA₮ sin gas",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-foreground">
                        <Check className="w-4 h-4 text-accent-teal shrink-0" />
                        <span><strong>{item}</strong></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openUpgradeModal()}
                  className="w-full py-3 rounded-xl bg-accent-teal text-slate-950 hover:bg-accent-teal/90 transition-all font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-accent-teal/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan === "pro" ? "Plan Pro Activo" : "Activar Plan Pro ($49 USDC)"}</span>
                </button>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="glass-card p-7 rounded-2xl border border-border-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Enterprise & DAOs</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-mono font-bold">Custom</span>
                  </div>
                  <p className="text-xs text-muted mb-6">{t.landing.pricing.p3.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Contratos de custodia a medida",
                      "Alianzas y tesorerías multifirma",
                      "Agentes autónomos dedicados",
                      "Soporte SLA prioritario 24/7",
                    ].map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-muted">
                        <Check className="w-4 h-4 text-accent-teal shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openUpgradeModal(
                      "Para despliegues Enterprise o DAOs podés suscribirte al Plan Pro o solicitar acompañamiento dedicado."
                    )
                  }
                  className="block w-full text-center py-2.5 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-semibold text-xs cursor-pointer"
                >
                  {t.landing.pricing.p3.cta}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
