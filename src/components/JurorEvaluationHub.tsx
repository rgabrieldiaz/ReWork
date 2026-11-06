"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  RotateCcw,
  CheckCircle2,
  X,
  Compass,
  Coins,
  SendHorizontal,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { getCeloscanUrl } from "@/lib/celo-assets";

export function JurorEvaluationHub() {
  const { plan, isJuror, isPro, activateJurorPass, setPlanForTesting, openUpgradeModal } =
    useSubscription();
  const { connected, address, formattedAddress, attributionTag, chainId } = useCeloWallet();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTrack, setActiveTrack] = useState<1 | 2 | 3 | 4>(1);

  // Auto-expand if URL has evaluator/juror flag
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const isUrlJuror =
        params.get("mode") === "juror" ||
        params.get("evaluator") === "true" ||
        params.get("juror") === "true" ||
        params.get("ref") === "celo";
      if (isUrlJuror) {
        setIsExpanded(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleStartTour = () => {
    window.dispatchEvent(new CustomEvent("rework:start-tour"));
  };

  const handleOpenBank = () => {
    window.dispatchEvent(new CustomEvent("rework:open-bank-modal"));
  };

  const handleOpenOperations = () => {
    window.dispatchEvent(new CustomEvent("rework:open-operations"));
  };

  const handleOpenRental = () => {
    window.dispatchEvent(new CustomEvent("rework:open-rental-escrow"));
  };

  const handleOpenAgentHubTab = (tab: "checklist" | "textile" | "usat_p2p" | "buy_catalog") => {
    window.dispatchEvent(new CustomEvent("rework:open-agent-hub", { detail: { tab } }));
  };

  // If dismissed by user, show a discreet floating pill at bottom-right so it can always be recovered
  if (isDismissed) {
    return (
      <button
        type="button"
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 right-4 z-40 px-3 py-2 rounded-full bg-slate-950/90 border border-accent-teal/40 text-accent-teal text-xs font-mono font-semibold shadow-2xl flex items-center gap-2 hover:bg-slate-900 transition-all cursor-pointer backdrop-blur-md"
        title="Volver a abrir el Hub de Evaluación para Jurados"
      >
        <Award className="w-3.5 h-3.5 text-accent-teal" />
        <span>Hub Jurado Celo Hackathon</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-slate-950/95 border-b border-accent-teal/25 text-slate-100 backdrop-blur-md sticky top-0 z-30 transition-all">
      {/* ── BARRA SUPERIOR COMPACTA (SIEMPRE VISIBLE) ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-teal/15 border border-accent-teal/30 text-accent-teal font-mono font-bold text-[11px]">
            <Award className="w-3.5 h-3.5" />
            <span>MODO JURADO · CELO MAINNET</span>
          </div>

          <span className="hidden sm:inline-block text-slate-400">|</span>

          <span className="text-slate-300 font-mono text-[11px] hidden md:inline">
            Red: <strong className="text-emerald-400">Celo (42220)</strong> • Tag:{" "}
            <code className="text-accent-teal font-bold">{attributionTag}</code>
          </span>

          <span className="hidden md:inline-block text-slate-400">|</span>

          {isJuror ? (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Pase Acreditado Activo (Fee 0% • Ilimitado)</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => activateJurorPass("evaluation_hub_banner")}
              className="text-[11px] font-semibold text-accent-teal hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Activar Pase de Jurado Gratis (Fee 0%)</span>
              <Sparkles className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para relanzar tour guiado */}
          <button
            type="button"
            onClick={handleStartTour}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Iniciar o relanzar el Tour Interactivo de Evaluación"
          >
            <RotateCcw className="w-3 h-3 text-accent-teal" />
            <span className="hidden sm:inline">Tour de Evaluación</span>
            <span className="sm:hidden">Tour</span>
          </button>

          {/* Toggle expandir / colapsar hub */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal border border-accent-teal/40 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Ocultar Guía de Tracks" : "Ver 4 Tracks Celo"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Botón minimizar */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimizar barra de jurado a botón flotante"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── ACORDEÓN EXPANDIBLE CON LOS 4 TRACKS DEL HACKATHON ── */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-900/95 px-4 sm:px-6 py-4 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1400px] mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Guía de Evaluación Rápida para Jurados</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Celo × Loops House Hackathon
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Probá en 1 clic cada una de las 4 integraciones oficiales en Celo Mainnet (Chain ID 42220):
                </p>
              </div>

              {/* Selector de Plan para Pruebas de Límites */}
              <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400 px-1 font-mono">Modo de prueba:</span>
                <button
                  type="button"
                  onClick={() => setPlanForTesting("free")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    plan === "free"
                      ? "bg-slate-700 text-slate-100 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Prueba el comportamiento con límites de usuario gratuito (1 workspace, 3 misiones)"
                >
                  Free (Límites)
                </button>
                <button
                  type="button"
                  onClick={() => setPlanForTesting("pro")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    plan === "pro"
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Prueba el plan Pro B2B"
                >
                  Pro
                </button>
                <button
                  type="button"
                  onClick={() => setPlanForTesting("juror")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    plan === "juror"
                      ? "bg-accent-teal text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Pase de jurado ilimitado con 0% de comisiones"
                >
                  Juror Pass
                </button>
              </div>
            </div>

            {/* ── PESTAÑAS O BOTONES DE LOS 4 TRACKS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* TRACK 1: Ripio LatAm wFIAT */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  activeTrack === 1
                    ? "bg-slate-800/90 border-emerald-500/50 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
                onClick={() => setActiveTrack(1)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">
                      Track 1: LatAm wFIAT
                    </span>
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">
                    Ripio wFIAT (6 Monedas)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Rampas bancarias directas para <strong>wARS, wBRL, wCOP, wMXN, wPEN y wCLP</strong> sin intermediación de dólar bancario.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBank();
                    }}
                    className="w-full py-1.5 px-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Abrir Rampa Ripio wFIAT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <a
                    href="https://celoscan.io/address/0x2A4C6F47b9D353982464736f1b1a7747714C8022"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1 text-center text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"
                  >
                    <span>Ver Contrato wARS Celoscan</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* TRACK 2: Textile FX */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  activeTrack === 2
                    ? "bg-slate-800/90 border-cyan-500/50 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
                onClick={() => setActiveTrack(2)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-semibold">
                      Track 2: Open Corridors
                    </span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">
                    Textile FX (Permit2 RFQ)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Cotizaciones instantáneas entre monedas LatAm y dólares digitales mediante órdenes firmadas off-chain EIP-712 sin slippage.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAgentHubTab("textile");
                    }}
                    className="w-full py-1.5 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Probar Cotización RFQ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <a
                    href="https://celoscan.io/address/0x465e642387d3d73a57CDc1368fFA53A800bA5D47"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1 text-center text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"
                  >
                    <span>Ver Router Textile Celoscan</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* TRACK 3: @celo/buy Autonomous Agents */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  activeTrack === 3
                    ? "bg-slate-800/90 border-purple-500/50 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
                onClick={() => setActiveTrack(3)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-semibold">
                      Track 3: Autonomous Agents
                    </span>
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">
                    Árbitro IA & Garantía 50/50
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Garantía con rendimiento en Aave V3 + agente árbitro <strong>@celo/buy</strong> que dictamina reclamos con micropagos x402.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRental();
                    }}
                    className="w-full py-1.5 px-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Inspeccionar Contrato 50/50</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAgentHubTab("buy_catalog");
                    }}
                    className="w-full py-1 text-center text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Catálogo SQD / AI Gateway</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* TRACK 4: USA₮ Gasless & Attribution */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  activeTrack === 4
                    ? "bg-slate-800/90 border-amber-500/50 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
                onClick={() => setActiveTrack(4)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                      Track 4: Gasless & Attribution
                    </span>
                    <SendHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">
                    USA₮ x402 & Tag rework26
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Transferencias sin gas (EIP-3009) y atribución on-chain ERC-8021 en cada transacción para el panel de evaluación.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAgentHubTab("usat_p2p");
                    }}
                    className="w-full py-1.5 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Probar Envío Sin Gas USA₮</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAgentHubTab("checklist");
                    }}
                    className="w-full py-1 text-center text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Verificar Atribución rework26</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
