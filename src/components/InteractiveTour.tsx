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
  ShieldCheck, 
  Compass, 
  Target, 
  Layers
} from "lucide-react";

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
}

interface InteractiveTourProps {
  onOpenOperations?: () => void;
  onOpenRentalEscrow?: () => void;
  onOpenSwap?: () => void;
  onOpenSquadGoals?: () => void;
  onActivateJuror?: () => void;
}

const STORAGE_DONT_SHOW_AGAIN = "rework_hide_welcome_tour";

const PRODUCT_TOUR_STEPS: TourStep[] = [
  {
    id: "step-operations",
    selector: '[data-tour="header-operations"]',
    title: "1. Billetera y Centro Financiero",
    tag: "Control de Fondos",
    tagColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description:
      "Tu centro de operaciones para consultar balances en dólares y monedas locales, gestionar transferencias y operar con tu cuenta habitual de Google o billetera digital.",
    bullets: [
      "Saldos unificados en tiempo real en dólares y moneda local",
      "Transferencias ágiles y depósitos directos",
      "Conexión simple y segura con tu cuenta de Google",
    ],
    actionLabel: "Abrir Billetera y Operaciones",
    actionId: "operations",
  },
  {
    id: "step-rental-escrow",
    selector: '[data-tour="rental-escrow-card"]',
    title: "2. Garantías de Alquiler 50/50",
    tag: "Depósitos Remunerados",
    tagColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description:
      "Depósitos en custodia inteligente donde el dinero no queda ocioso: el capital bloqueado genera rendimiento automático en protocolos auditados y se reparte 50% para el inquilino y 50% para el propietario.",
    bullets: [
      "Rendimiento en dólares generado durante la vigencia del contrato",
      "Devolución ágil y automatizada al finalizar el acuerdo",
      "Resolución imparcial de reclamos con arbitraje inteligente",
    ],
    actionLabel: "Ver Contrato de Garantía",
    actionId: "rental-escrow",
  },
  {
    id: "step-treasury-swap",
    selector: '[data-tour="treasury-swap-panel"]',
    title: "3. Tesorería y Cambio de Moneda",
    tag: "Rampa Local LatAm",
    tagColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    description:
      "Convertí entre monedas locales de Latinoamérica (pesos argentinos, reales, pesos colombianos, mexicanos) y dólares al tipo de cambio de mercado, sin demoras bancarias.",
    bullets: [
      "Depósito y retiro por transferencia bancaria local (CBU, PIX, SPEI)",
      "Cotizaciones transparentes sin cargos ocultos",
      "Cobros y pagos inmediatos mediante código QR",
    ],
    actionLabel: "Ver Tasas y Cambio de Moneda",
    actionId: "treasury-swap",
  },
  {
    id: "step-squad-missions",
    selector: '[data-tour="squad-missions-card"]',
    title: "4. Acuerdos y Entregas por Hitos",
    tag: "Protección de Pagos",
    tagColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    description:
      "Coordiná misiones de trabajo y contrata talento con seguridad total. Los fondos quedan custodiados desde el inicio y se liberan únicamente al aprobar los entregables acordados.",
    bullets: [
      "Garantía total contra impagos para colaboradores y agencias",
      "Liberación ordenada por etapas de avance aprobadas",
      "Historial de reputación profesional verificable",
    ],
    actionLabel: "Ver Tablero de Acuerdos",
    actionId: "squad-missions",
  },
];

export function InteractiveTour({
  onOpenOperations,
  onOpenRentalEscrow,
  onOpenSwap,
  onOpenSquadGoals,
  onActivateJuror,
}: InteractiveTourProps) {
  const TOUR_STEPS = PRODUCT_TOUR_STEPS;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Auto-prompt on entry if user hasn't explicitly checked "Don't show again"
    const hideWelcome = localStorage.getItem(STORAGE_DONT_SHOW_AGAIN) === "true";
    if (!hideWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomePrompt(true);
      }, 700);
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
      const rect = el.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!isVisible) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

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
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_DONT_SHOW_AGAIN, "true");
    } else {
      localStorage.removeItem(STORAGE_DONT_SHOW_AGAIN);
    }
  };

  const dismissWelcomePrompt = (permanent = false) => {
    setShowWelcomePrompt(false);
    if (permanent || dontShowAgain) {
      localStorage.setItem(STORAGE_DONT_SHOW_AGAIN, "true");
    }
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

    let top = highlightRect.bottom + margin;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(16, highlightRect.top - popoverHeight - margin);
    }

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
      {/* ────────────────── BANNER FLOTANTE DE BIENVENIDA (DISCRETO Y AMIGABLE) ────────────────── */}
      {showWelcomePrompt && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] glass-card p-4 rounded-2xl border border-accent-teal/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center text-accent-teal shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent-teal">
                  Guía de Inicio Rápido
                </span>
                <button
                  onClick={() => dismissWelcomePrompt(false)}
                  className="text-muted hover:text-foreground p-0.5 rounded transition-colors cursor-pointer"
                  title="Cerrar sugerencia"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                ¿Primera vez en ReWork?
              </p>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Descubrí en un recorrido interactivo de 60 segundos cómo gestionar contratos con rendimiento, tesorería en moneda local y acuerdos de equipo.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={startTourFromPrompt}
                  className="px-3 py-1.5 rounded-lg bg-accent-teal hover:bg-accent-teal/90 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Iniciar Recorrido</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => dismissWelcomePrompt(false)}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                >
                  Omitir
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border-subtle/50">
                <label className="flex items-center gap-2 text-[11px] text-muted hover:text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDontShowAgain(checked);
                      if (checked) {
                        localStorage.setItem(STORAGE_DONT_SHOW_AGAIN, "true");
                      } else {
                        localStorage.removeItem(STORAGE_DONT_SHOW_AGAIN);
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-border-subtle text-accent-teal focus:ring-accent-teal/20"
                  />
                  <span>No volver a mostrar al iniciar</span>
                </label>
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
                    title="Cerrar recorrido (Esc)"
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

                  {/* Bullets clave */}
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
                </div>
              </div>

              {/* Botón de Acción Directa & Controles de Navegación */}
              <div className="mt-4 pt-3 border-t border-border-subtle/80 space-y-3">
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

                {/* Opción para no volver a mostrar */}
                <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-muted hover:text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDontShowAgain(checked);
                        if (checked) {
                          localStorage.setItem(STORAGE_DONT_SHOW_AGAIN, "true");
                        } else {
                          localStorage.removeItem(STORAGE_DONT_SHOW_AGAIN);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-border-subtle text-accent-teal focus:ring-accent-teal/20"
                    />
                    <span>No volver a mostrar al iniciar</span>
                  </label>
                  <button
                    onClick={closeTour}
                    className="text-[11px] text-muted hover:text-foreground cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
