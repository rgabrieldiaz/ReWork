"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Compass, 
  Target, 
  Award,
  Layers,
  Bot
} from "lucide-react";
import { useTestnetRails } from "@/lib/feature-flags";

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  tag: string;
  tagColor?: string;
  description: string;
  bullets: string[];
  actionLabel?: string;
  actionId?: string;
  evaluatorNote?: string;
}

interface InteractiveTourProps {
  onOpenOperations?: () => void;
  onOpenRentalEscrow?: () => void;
  onOpenSwap?: () => void;
  onOpenSquadGoals?: () => void;
  onActivateJuror?: () => void;
}

const STORAGE_TOUR_COMPLETED = "rework_juror_tour_completed_v1";
const STORAGE_TOUR_DISMISSED = "rework_juror_tour_dismissed_v1";

const CELO_MAINNET_TOUR_STEPS: TourStep[] = [
  {
    id: "step-operations",
    selector: '[data-tour="header-operations"]',
    title: "1. Billetera Celo Mainnet & Hub de Agentes",
    tag: "Celo Mainnet (42220) • ERC-8004 & ERC-8021",
    tagColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description:
      "Billetera embebida en Celo Mainnet (con Google/Email o MetaMask/MiniPay) con atribución on-chain ERC-8021 y acceso directo al Celo Agent Hub.",
    bullets: [
      "Identidad Agéntica ERC-8004 registrada en Celo Mainnet",
      "Pagos sin gas (EIP-3009 / x402) en USA₮ y USDC",
      "Garantía de Alquiler 50/50 (Yield Escrow + Árbitro IA @celo/buy)",
      "Saldos en tiempo real y verificación en Celoscan",
    ],
    actionLabel: "🌱 Abrir Billetera & Hub Celo Mainnet",
    actionId: "operations",
    evaluatorNote: "Inspeccioná la dirección 0x..., el tag ERC-8021 y abrí el Celo Agent Hub en 1 clic.",
  },
  {
    id: "step-rental-escrow",
    selector: '[data-tour="rental-escrow-card"]',
    title: "2. Garantía de Alquiler 50/50 (Yield Escrow)",
    tag: "Innovación Celo Mainnet • Aave V3 + @celo/buy",
    tagColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description:
      "Primer contrato de depósito de garantía donde el capital bloqueado genera rendimiento en bóvedas DeFi de Celo Mainnet y reparte los beneficios 50% inquilino / 50% propietario.",
    bullets: [
      "Liquidación y retorno automatizado en Celo Mainnet (42220)",
      "Soporte de monedas locales LatAm (wARS, wBRL, USA₮, USDC)",
      "Resolución de disputas asistida por IA vía @celo/buy (x402)",
    ],
    actionLabel: "🔍 Inspeccionar Contrato Demo 50/50",
    actionId: "rental-escrow",
    evaluatorNote: "Probá crear un acuerdo o ejecutar una inspección IA sobre el contrato activo.",
  },
  {
    id: "step-treasury-swap",
    selector: '[data-tour="treasury-swap-panel"]',
    title: "3. Tesorería Celo, Ripio wFIAT & Textile FX",
    tag: "6 Monedas LatAm • Celo Mainnet DeFi",
    tagColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    description:
      "Panel de tesorería con pools en vivo de DeFiLlama en Celo Mainnet, rampa Ripio wFIAT (wARS, wBRL, wMXN, wCOP) y corredor transfronterizo Textile FX.",
    bullets: [
      "Ingreso y retiro bancario local (CBU, PIX, SPEI ↔ wFIAT / USDC)",
      "Conversión FX instantánea para tesorerías de comunidades y agencias",
      "Cobros y pagos inmediatos con QR en Celo Mainnet",
    ],
    actionLabel: "💱 Abrir Rampa & Swap Celo",
    actionId: "treasury-swap",
    evaluatorNote: "Probá seleccionar cualquier moneda LatAm o inspeccionar los pools DeFi de Celo.",
  },
  {
    id: "step-squad-missions",
    selector: '[data-tour="squad-missions-card"]',
    title: "4. Acuerdos y Garantías por Hitos",
    tag: "Celo Mainnet • Liquidación x402 & Hitos",
    tagColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    description:
      "Acuerdos de trabajo y bounties colaborativos en Celo Mainnet donde los fondos en USDC, USA₮ o wFIAT se liberan al aprobar entregables verificados.",
    bullets: [
      "Custodia transparente con liberación por hitos",
      "Liquidación sin gas mediante autorizaciones EIP-3009 / x402",
      "Reputación verificable asociada a identidad ERC-8004",
    ],
    actionLabel: "🎯 Ver Acuerdos y Garantías",
    actionId: "squad-missions",
    evaluatorNote: "Revisá los hitos activos o publicá un acuerdo nuevo con tu cuenta de Google/Celo.",
  },
  {
    id: "step-juror-plan",
    selector: '[data-tour="juror-plan-badge"]',
    title: "5. Pase de Jurado & Modo Evaluación",
    tag: "Agents on Open Rails • 0% Protocol Fee",
    tagColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    description:
      "Desbloqueo completo e ilimitado para jurados y evaluadores: operá sin comisiones de protocolo (Fee 0%), con espacios y acuerdos ilimitados en Celo Mainnet.",
    bullets: [
      "Exención total de comisiones de plataforma (0% Fee)",
      "Acceso irrestricto a todos los módulos agénticos y financieros",
      "Activación instantánea en 1 clic durante tu evaluación",
    ],
    actionLabel: "⭐ Activar Pase de Jurado Ahora",
    actionId: "juror-plan",
    evaluatorNote: "Un solo clic para evaluar ReWork con permisos Pro completos.",
  },
];

const MULTICHAIN_TOUR_STEPS: TourStep[] = [
  {
    id: "step-operations",
    selector: '[data-tour="header-operations"]',
    title: "1. Menú Central de Operaciones Web3",
    tag: "Multiriel • Celo · Solana · Stellar",
    tagColor: "border-accent-teal/40 bg-accent-teal/10 text-accent-teal",
    description:
      "Acceso directo y unificado a todos los módulos operativos sin perderte en submenús. Diseñado para que evaluadores puedan auditar cada infraestructura en 1 clic.",
    bullets: [
      "Garantía de Alquiler 50/50 (Yield Escrow en Celo)",
      "Celo Agent Hub (ERC-8004, wFIAT, x402, Textile FX)",
      "Custodias Escrow por hitos en Solana y Stellar",
      "Cobros y pagos con QR estándar SEP-0007",
    ],
    actionLabel: "⚡ Desplegar Menú de Operaciones",
    actionId: "operations",
    evaluatorNote: "Punto de entrada principal para testear smart contracts y agentes autónomos.",
  },
  {
    id: "step-rental-escrow",
    selector: '[data-tour="rental-escrow-card"]',
    title: "2. Garantía de Alquiler 50/50 (Yield Escrow)",
    tag: "Innovación Celo Mainnet • Aave & Uniswap V3",
    tagColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description:
      "Primer contrato de depósito de garantía donde el capital bloqueado no queda ocioso: genera rendimiento en bovedas DeFi de Celo y reparte los beneficios 50% inquilino / 50% propietario.",
    bullets: [
      "Liquidación y retorno automatizado en Celo Mainnet (42220)",
      "Soporte de monedas locales LatAm (wARS, wBRL, USDC)",
      "Mitiga el costo de oportunidad en contratos de alquiler",
    ],
    actionLabel: "🔍 Inspeccionar Contrato Demo 50/50",
    actionId: "rental-escrow",
    evaluatorNote: "Probá crear un acuerdo o ver el desglose en tiempo real del contrato activo.",
  },
  {
    id: "step-treasury-swap",
    selector: '[data-tour="treasury-swap-panel"]',
    title: "3. Tesorería & Swap de Monedas LatAm",
    tag: "6 Monedas Locales + 4 Blockchains",
    tagColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    description:
      "Panel de tesorería y rampa con cotizaciones en tiempo real en ARS, BRL, COP, MXN, PEN y CLP sincronizadas con USDC, CELO, SOL y XLM.",
    bullets: [
      "Rutas de rampa de acceso rápido por país (Ripio / wFIAT)",
      "Conversión multiriel sin fricción para tesorerías descentralizadas",
      "Cobro instantáneo con QR multi-red",
    ],
    actionLabel: "💱 Abrir Rampa & Swap LatAm",
    actionId: "treasury-swap",
    evaluatorNote: "Probá seleccionar cualquier moneda LatAm para ver la cotización y rampa bancaria.",
  },
  {
    id: "step-squad-missions",
    selector: '[data-tour="squad-missions-card"]',
    title: "4. Misiones de Equipo & Escrow Colaborativo",
    tag: "Contratos Soroban & Solana • Hitos Verificados",
    tagColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    description:
      "Bounties y misiones colaborativas donde los fondos de la recompensa quedan custodiados en contratos multifirma y se liberan solo al validar entregables y código.",
    bullets: [
      "Custodia no permisionada con liberación por hitos",
      "Auditoría transparente de contribuyentes y entregables",
      "Reputación verificable en cadena",
    ],
    actionLabel: "🎯 Ver Tablero de Misiones",
    actionId: "squad-missions",
    evaluatorNote: "Revisá el hito activo del dashboard o navegá a la sección Squad Goals.",
  },
  {
    id: "step-juror-plan",
    selector: '[data-tour="juror-plan-badge"]',
    title: "5. Pase de Jurado & Modo Sandbox",
    tag: "Evaluación Hackathon • 0% Protocol Fee",
    tagColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    description:
      "Desbloqueo completo e ilimitado para jurados y evaluadores: opera sin comisiones de protocolo (Fee 0%), con workspaces ilimitados y sandbox de contratos.",
    bullets: [
      "Exención total de comisiones de plataforma",
      "Habilitación de herramientas de testing y simulación",
      "Persistencia de estado en sesión de evaluación",
    ],
    actionLabel: "⭐ Activar Pase de Jurado Ahora",
    actionId: "juror-plan",
    evaluatorNote: "Un solo clic para probar la plataforma con permisos completos de evaluador.",
  },
];

export function InteractiveTour({
  onOpenOperations,
  onOpenRentalEscrow,
  onOpenSwap,
  onOpenSquadGoals,
  onActivateJuror,
}: InteractiveTourProps) {
  const testnetRailsEnabled = useTestnetRails();
  const TOUR_STEPS = testnetRailsEnabled
    ? MULTICHAIN_TOUR_STEPS
    : CELO_MAINNET_TOUR_STEPS;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Auto-prompt on first visit if not seen
    const tourDone = localStorage.getItem(STORAGE_TOUR_COMPLETED);
    const tourDismissed = localStorage.getItem(STORAGE_TOUR_DISMISSED);
    if (!tourDone && !tourDismissed) {
      const timer = setTimeout(() => {
        setShowWelcomePrompt(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to global open event
  useEffect(() => {
    const handleStartTour = () => {
      setShowWelcomePrompt(false);
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("rework:start-tour", handleStartTour);
    return () => window.removeEventListener("rework:start-tour", handleStartTour);
  }, []);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Update target element coordinates
  const updateHighlightPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.selector) as HTMLElement | null;
    if (el) {
      // Scroll smoothly into view if offscreen
      const rect = el.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!isVisible) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Small delay for smooth scroll to finalize before reading rect
      setTimeout(() => {
        const updatedRect = el.getBoundingClientRect();
        setHighlightRect(updatedRect);
      }, 150);
    } else {
      setHighlightRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    updateHighlightPosition();

    const handleResizeOrScroll = () => {
      updateHighlightPosition();
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen, currentStepIndex, updateHighlightPosition]);

  // Keyboard navigation (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const closeTour = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_TOUR_COMPLETED, "true");
  };

  const dismissWelcomePrompt = () => {
    setShowWelcomePrompt(false);
    localStorage.setItem(STORAGE_TOUR_DISMISSED, "true");
  };

  const startTourFromPrompt = () => {
    setShowWelcomePrompt(false);
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  const goToNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      closeTour();
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleStepAction = () => {
    if (!currentStep.actionId) return;

    switch (currentStep.actionId) {
      case "operations":
        if (onOpenOperations) onOpenOperations();
        else window.dispatchEvent(new CustomEvent("rework:open-operations"));
        break;
      case "rental-escrow":
        if (onOpenRentalEscrow) onOpenRentalEscrow();
        break;
      case "treasury-swap":
        if (onOpenSwap) onOpenSwap();
        break;
      case "squad-missions":
        if (onOpenSquadGoals) onOpenSquadGoals();
        else window.location.href = "/app/squad-goals";
        break;
      case "juror-plan":
        if (onActivateJuror) onActivateJuror();
        break;
      default:
        break;
    }
  };

  // Compute Popover Position
  const popoverStyle = useMemo(() => {
    if (!highlightRect || typeof window === "undefined") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      return {
        bottom: "16px",
        left: "16px",
        right: "16px",
        maxHeight: "85vh",
      };
    }

    const popoverWidth = 420;
    const popoverHeight = 340;
    const margin = 14;

    // Prefer below the target, unless target is near bottom
    let top = highlightRect.bottom + margin;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(16, highlightRect.top - popoverHeight - margin);
    }

    // Horizontal centering relative to target, clamped to viewport
    let left = highlightRect.left + highlightRect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
    };
  }, [highlightRect]);

  if (!isMounted) return null;

  return (
    <>
      {/* ────────────────── MANIFEST SEMÁNTICO PARA AGENTES IA Y AUDITORES ────────────────── */}
      <script
        id="rework-juror-evaluator-manifest"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            {
              platform: testnetRailsEnabled
                ? "ReWork Multirail Workspace"
                : "ReWork — Agentic Financial Workspace on Celo Mainnet",
              evaluationContext:
                "Celo × Loops House — Agents on Open Rails Hackathon",
              chainId: 42220,
              version: "1.0.0-mainnet",
              description:
                "Espacio financiero agéntico en Celo Mainnet (42220) con identidad ERC-8004, atribución ERC-8021, pagos sin gas x402 en USA₮, rampa Ripio wFIAT, corredor Textile FX y garantía de alquiler 50/50 con rendimiento DeFi.",
              quickRoutes: {
                operations: '[data-tour="header-operations"]',
                rentalEscrow5050: '[data-tour="rental-escrow-card"]',
                treasuryLatamSwap: '[data-tour="treasury-swap-panel"]',
                squadMissions: '[data-tour="squad-missions-card"]',
                jurorSandboxPass: '[data-tour="juror-plan-badge"]',
              },
              supportedCurrencies: testnetRailsEnabled
                ? [
                    "USDC",
                    "USAT",
                    "CELO",
                    "SOL",
                    "XLM",
                    "wARS",
                    "wBRL",
                    "COP",
                    "MXN",
                    "PEN",
                    "CLP",
                  ]
                : [
                    "USDC",
                    "USAT",
                    "CELO",
                    "wARS",
                    "wBRL",
                    "wMXN",
                    "wCOP",
                    "PEN",
                    "CLP",
                  ],
              keyModules: [
                "Garantía de Alquiler 50/50 (Yield Escrow + @celo/buy)",
                "Celo Agent Hub (ERC-8004, ERC-8021, USA₮ x402, Textile FX)",
                "Ripio wFIAT & Tesorería DeFiLlama Celo Mainnet",
                "Acuerdos por Hitos con Liquidación x402",
                "Pase de Jurado 0% Fee",
              ],
            },
            null,
            2
          ),
        }}
      />

      {/* ────────────────── BANNER FLOTANTE DE BIENVENIDA (DISCRETO Y NO INVASIVO) ────────────────── */}
      {showWelcomePrompt && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] glass-card p-4 rounded-2xl border border-accent-teal/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center text-accent-teal shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent-teal">
                  Modo Evaluación Rápida
                </span>
                <button
                  onClick={dismissWelcomePrompt}
                  className="text-muted hover:text-foreground p-0.5 rounded transition-colors"
                  title="Cerrar sugerencia"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                ¿Evaluando ReWork para jurados?
              </p>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Hacé un recorrido interactivo de 90 segundos con acceso directo a contratos, swaps y el pase de evaluación.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={startTourFromPrompt}
                  className="px-3 py-1.5 rounded-lg bg-accent-teal hover:bg-accent-teal/90 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Iniciar Tour Guiado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={dismissWelcomePrompt}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                >
                  Omitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SPOTLIGHT Y POPOVER DEL TOUR EN PORTAL ────────────────── */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99990] overflow-hidden select-none pointer-events-auto"
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop oscuro translúcido */}
            <div
              className="fixed inset-0 bg-[#06080e]/75 backdrop-blur-[2px] transition-opacity duration-300"
              onClick={closeTour}
            />

            {/* Recorte iluminado (Spotlight Cutout) sobre el elemento activo */}
            {highlightRect && (
              <div
                style={{
                  position: "fixed",
                  top: Math.max(0, highlightRect.top - 6),
                  left: Math.max(0, highlightRect.left - 6),
                  width: highlightRect.width + 12,
                  height: highlightRect.height + 12,
                  borderRadius: "14px",
                  boxShadow:
                    "0 0 0 9999px rgba(6, 8, 14, 0.78), 0 0 24px rgba(0, 242, 255, 0.45)",
                  border: "2px solid rgba(0, 242, 255, 0.85)",
                  pointerEvents: "none",
                  zIndex: 99992,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            )}

            {/* Tarjeta flotante interactiva */}
            <div
              style={popoverStyle}
              className="fixed z-[99995] glass-card p-5 rounded-2xl shadow-2xl border border-accent-teal/40 bg-[#0c0e16]/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 overflow-y-auto custom-scrollbar flex flex-col justify-between"
              data-tour-step={currentStep.id}
            >
              {/* Header de la tarjeta */}
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                      Paso {currentStepIndex + 1} de {TOUR_STEPS.length}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentStep.tagColor}`}
                    >
                      {currentStep.tag}
                    </span>
                  </div>
                  <button
                    onClick={closeTour}
                    className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
                    title="Cerrar tour (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Título y descripción */}
                <div className="mt-3.5 space-y-2">
                  <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {currentStep.description}
                  </p>

                  {/* Bullets clave de especificación */}
                  <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border-subtle/70 space-y-1.5 my-3">
                    {currentStep.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-[11px] text-foreground/90 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Nota para jurados */}
                  {currentStep.evaluatorNote && (
                    <p className="text-[10px] font-mono text-accent-teal/80 bg-accent-teal/5 p-2 rounded-lg border border-accent-teal/15">
                      💡 <strong>Evaluación:</strong> {currentStep.evaluatorNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de Acción Directa & Controles de Navegación */}
              <div className="mt-4 pt-3.5 border-t border-border-subtle/80 space-y-3">
                {currentStep.actionLabel && (
                  <button
                    onClick={handleStepAction}
                    data-tour-action={currentStep.actionId}
                    className="w-full py-2.5 px-4 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{currentStep.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  {/* Dots de progreso interactivos */}
                  <div className="flex items-center gap-1.5">
                    {TOUR_STEPS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentStepIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentStepIndex
                            ? "w-6 bg-accent-teal"
                            : "w-2 bg-foreground/20 hover:bg-foreground/40"
                        }`}
                        title={`Ir al paso ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Botones de navegación Anterior / Siguiente */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrev}
                      disabled={currentStepIndex === 0}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        currentStepIndex === 0
                          ? "opacity-30 border-transparent cursor-not-allowed text-muted"
                          : "border-border-subtle text-foreground hover:bg-foreground/5 cursor-pointer"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="px-3.5 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 border border-border-subtle text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>
                        {currentStepIndex === TOUR_STEPS.length - 1
                          ? "Finalizar"
                          : "Siguiente"}
                      </span>
                      {currentStepIndex === TOUR_STEPS.length - 1 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
