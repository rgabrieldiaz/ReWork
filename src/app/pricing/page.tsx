"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Award, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";
import { useSettings } from "@/hooks/useSettings";
import { useSubscription } from "@/hooks/useSubscription";

export default function PlanesPage() {
  const { language } = useSettings();
  const router = useRouter();
  const { plan, isPro, isJuror, openUpgradeModal, activateJurorPass, setPlanForTesting } =
    useSubscription();

  const handleActivateJurorAndEnter = async () => {
    await activateJurorPass("pricing_page");
    router.push("/workspaces");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold text-accent-teal uppercase tracking-wider mb-2 block">
            {language === "es" ? "Infraestructura y Planes" : "Infrastructure & Pricing"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {language === "es"
              ? "Escalabilidad transparente para equipos y DAOs"
              : "Transparent scalability for teams and DAOs"}
          </h1>
          <p className="text-sm md:text-base text-muted max-w-2xl mx-auto leading-relaxed">
            {language === "es"
              ? "Comenzá gratis con tu espacio personal o desbloqueá workspaces ilimitados y 50% de descuento en comisiones de custodia con USDC o Pesos (ARS)."
              : "Start free with your personal workspace or unlock unlimited workspaces and 50% escrow fee discounts."}
          </p>
        </div>

        {/* ── 3 TARJETAS DE PLANES EN PRODUCCIÓN ── */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1: Gratis */}
          <div className="glass-card p-7 rounded-xl border border-border-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-foreground">Inicial (Free)</h3>
                {plan === "free" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/10 text-foreground">
                    Plan Actual
                  </span>
                )}
              </div>
              <p className="text-muted text-xs mb-6">
                Para profesionales independientes y freelancers que operan con garantías on-chain.
              </p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl font-bold font-mono text-foreground">$0</span>
                <span className="text-xs text-muted font-mono">USDC / mes</span>
              </div>

              <ul className="space-y-3.5 mb-8 text-xs text-muted">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>1 Workspace propio incluido</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Hasta 3 Misiones Squad simultáneas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Comisión estándar de Escrow (0.50%)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Billetera Celo Mainnet, Web3 y Social Login con Google</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Rampa en Pesos (ARS) y cobros con QR</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                href="/workspaces"
                className="block w-full text-center py-2.5 rounded-lg border border-border-subtle text-xs font-semibold hover:bg-foreground/5 transition-colors"
              >
                {plan === "free" ? "Ir a mi Espacio Gratuito" : "Continuar al Portal"}
              </Link>
              {plan !== "free" && (
                <button
                  type="button"
                  onClick={() => setPlanForTesting("free")}
                  className="block w-full text-center py-1.5 text-[11px] font-mono text-muted hover:text-foreground cursor-pointer"
                >
                  Cambiar a modo Usuario Free para probar límites
                </button>
              )}
            </div>
          </div>

          {/* Plan 2: Pro ($49 USDC/mes) */}
          <div className="glass-card p-7 rounded-xl border-2 border-accent-teal relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">Pro B2B</h3>
                  <span className="text-[10px] font-mono font-semibold text-slate-950 bg-accent-teal px-2 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                {plan === "pro" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-teal/15 text-accent-teal border border-accent-teal/30">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-muted text-xs mb-6">
                Para agencias, estudios de software y equipos que gestionan múltiples proyectos.
              </p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl font-bold font-mono text-foreground">$49</span>
                <span className="text-xs font-mono text-accent-teal">USDC / mes</span>
                <span className="text-[11px] font-mono text-muted">(o $58.800 ARS)</span>
              </div>

              <ul className="space-y-3.5 mb-8 text-xs text-foreground">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>
                    <strong>Workspaces ilimitados</strong> (públicos o privados)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>
                    <strong>Misiones y Squads ilimitados</strong> por entorno
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>
                    <strong>50% de descuento en Escrow</strong> (solo 0.25% de fee)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>
                    <strong>Bóvedas DeFi en vivo</strong> (rendimientos Aave V3 en Celo Mainnet)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>
                    <strong>Branding propio</strong> y ocultación de Red Global
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openUpgradeModal()}
              className="w-full py-2.5 rounded-lg bg-accent-teal hover:bg-accent-teal/90 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {plan === "pro"
                  ? "Ver Suscripción Activa"
                  : "Suscribirse con USDC o ARS →"}
              </span>
            </button>
          </div>

          {/* Plan 3: Enterprise / DAOs */}
          <div className="glass-card p-7 rounded-xl border border-border-subtle flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise & DAOs</h3>
              <p className="text-muted text-xs mb-6">
                Para organizaciones descentralizadas, cámaras empresariales y ecosistemas masivos.
              </p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl font-bold font-mono text-foreground">Custom</span>
              </div>

              <ul className="space-y-3.5 mb-8 text-xs text-muted">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Contratos inteligentes de custodia a medida</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Alianzas B2B y tesorerías multifirma dedicadas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Agentes autónomos ERC-8004 y x402 dedicados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Soporte técnico e integración SLA 24/7</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() =>
                openUpgradeModal(
                  "Para despliegues Enterprise o DAOs podés contactarnos para configurar bóvedas dedicadas."
                )
              }
              className="block w-full text-center py-2.5 rounded-lg border border-border-subtle text-xs font-semibold hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              Solicitar Despliegue Dedicado
            </button>
          </div>
        </div>

        {/* Nota discreta para auditorías y demos */}
        <div className="mt-12 text-center text-xs text-muted">
          <span>¿Realizás una auditoría institucional o evaluación técnica? </span>
          <button
            type="button"
            onClick={handleActivateJurorAndEnter}
            className="text-accent-teal hover:underline font-medium cursor-pointer"
          >
            Explorar entorno con acceso demo completo →
          </button>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
