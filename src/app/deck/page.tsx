"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Zap,
  Globe,
  QrCode,
  Users,
  Coins,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  Lock,
  Wallet,
  Building2,
  Briefcase,
  AlertCircle,
  Smartphone,
  Star,
  Landmark
} from "lucide-react";
import { ReWorkIcon, ReWorkLogo } from "@/components/ReWorkLogo";

export default function PresentationDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 12;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "p" && (e.ctrlKey || e.metaKey)) {
        // let standard print execute
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides]);

  const slidesData = [
    { title: "Portada", subtitle: "ReWork — Confianza por Código" },
    { title: "El Problema", subtitle: "25% Validación del Problema" },
    { title: "La Solución", subtitle: "25% Foco de Producto" },
    { title: "Módulos Core", subtitle: "Workspaces, Red de Servicios y Misiones" },
    { title: "4 Primitivas Stellar", subtitle: "25% Ejecución Técnica (Desempate #1)" },
    { title: "Producto Real", subtitle: "UX, Métricas & Farming en Vivo" },
    { title: "Arquitectura", subtitle: "Stellar Building Blocks & Soroban" },
    { title: "Modelo de Negocio", subtitle: "25% Foco de Negocio" },
    { title: "Tracción & Calidad", subtitle: "0 Mocks, Tests & Deploy Activo" },
    { title: "Comparativa", subtitle: "Ventajas frente a Alternativas" },
    { title: "Roadmap 90 Días", subtitle: "Instawards & Pipeline SCF 7.0" },
    { title: "Equipo & Cierre", subtitle: "Builders y Contacto" }
  ];

  return (
    <div className="min-h-screen bg-[#050c14] text-slate-100 font-sans selection:bg-[#00f2ff]/30 selection:text-[#00f2ff] flex flex-col justify-between overflow-x-hidden">
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: 16in 9in landscape;
            margin: 0;
          }
          body {
            background-color: #050c14 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-deck-container {
            display: block !important;
          }
          .slide-page {
            page-break-after: always !important;
            break-after: page !important;
            height: 100vh !important;
            width: 100vw !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            padding: 3rem !important;
            box-sizing: border-box !important;
          }
        }
        @media screen {
          .print-deck-container {
            display: none;
          }
        }
      `}</style>

      {/* Top Header / Presentation Navigation (Screen Only) */}
      <header className="no-print sticky top-0 z-50 bg-[#050c14]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.3)]">
            <ReWorkIcon className="w-5 h-5" theme="cyan" glow />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white flex items-center gap-2 font-mono">
              re<span className="text-[#00f2ff]">work</span> <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">Scale Track</span>
            </span>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Argentina Builder Challenge (BAF × Stellar)</p>
          </div>
        </div>

        {/* Slide Selector & Counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-4 h-4 text-[#00f2ff]" />
          </button>
          <div className="font-mono text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300">
            <span className="text-[#00f2ff] font-bold">{String(currentSlide + 1).padStart(2, "0")}</span> / {String(totalSlides).padStart(2, "0")}
          </div>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Siguiente (→)"
          >
            <ChevronRight className="w-4 h-4 text-[#00f2ff]" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#050c14] font-mono text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
            title="Exportar toda la presentación a PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 text-slate-300 hover:text-white transition-all hidden sm:block"
            title="Pantalla Completa (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <Link
            href="/app"
            className="text-xs font-mono text-slate-400 hover:text-[#00f2ff] transition-all flex items-center gap-1"
          >
            <span>Ver App</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Progress Bar (Screen Only) */}
      <div className="no-print w-full h-1 bg-white/5 relative">
        <div
          className="h-full bg-gradient-to-r from-[#00f2ff] via-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_10px_#00f2ff]"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* SCREEN VIEW: Active Slide Presenter */}
      <main className="no-print flex-1 flex items-center justify-center p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="w-full bg-[#0d1624]/90 border border-white/10 rounded-3xl p-6 sm:p-12 backdrop-blur-xl shadow-2xl relative min-h-[580px] flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Content Dynamic Renderer */}
          <SlideRenderer slideIndex={currentSlide} />

          {/* Slide Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>ReWork Protocol · Stellar × BAF Argentina Builder Challenge 2026</span>
            <span className="text-[#00f2ff]/80">{slidesData[currentSlide].title}</span>
            <span>Diapositiva {currentSlide + 1} de {totalSlides}</span>
          </div>
        </div>
      </main>

      {/* Thumbnails Navigation Strip (Screen Only) */}
      <footer className="no-print bg-[#050c14]/95 border-t border-white/10 px-6 py-3 hidden md:flex items-center gap-2 overflow-x-auto justify-center">
        {slidesData.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left truncate max-w-[150px] ${
              currentSlide === idx
                ? "bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/50 shadow-[0_0_8px_rgba(0,242,255,0.3)]"
                : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <span className="text-[10px] text-slate-500 mr-1.5">{String(idx + 1).padStart(2, "0")}</span>
            {slide.title}
          </button>
        ))}
      </footer>

      {/* PRINT-ONLY VIEW: All 12 Slides rendered continuously for PDF generator */}
      <div className="print-deck-container">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className="slide-page bg-[#050c14] text-white p-12">
            <SlideRenderer slideIndex={idx} />
            <div className="mt-auto pt-6 border-t border-white/10 flex justify-between text-xs font-mono text-slate-400">
              <span>ReWork — Argentina Builder Challenge 2026 (Scale Track)</span>
              <span>Diapositiva {idx + 1} de {totalSlides}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Slide Content Renderer for Screen & PDF
// -------------------------------------------------------------
function SlideRenderer({ slideIndex }: { slideIndex: number }) {
  switch (slideIndex) {
    // ---------------------------------------------------------
    // SLIDE 1: PORTADA
    // ---------------------------------------------------------
    case 0:
      return (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Argentina Builder Challenge · Stellar × BAF · Track Scale</span>
          </div>

          <div className="mb-6 flex justify-center">
            <ReWorkLogo className="h-16 sm:h-20 w-auto" theme="cyan" glow />
          </div>

          <p className="text-xl sm:text-2xl font-light text-slate-300 italic mb-4 max-w-2xl">
            &ldquo;El valor de la confianza garantizado por el código.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-10 leading-relaxed font-sans">
            Plataforma descentralizada de Workspaces B2B, Custodia Inteligente en Soroban y Reputación Soberana para empresas, agencias y DAOs en América Latina.
          </p>

          {/* 4 Stellar Building Blocks Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <ShieldCheck className="w-5 h-5 text-[#00f2ff] mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Soroban Smart Escrow</p>
              <p className="text-[11px] text-slate-400">Trustless Work V1/V2</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <QrCode className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Pagos QR SEP-0007</p>
              <p className="text-[11px] text-slate-400">Deep-linking USDC/ARS</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">DeFi Yield &amp; Swaps</p>
              <p className="text-[11px] text-slate-400">Stellar AMM Protocol 20+</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">AURA CV On-Chain</p>
              <p className="text-[11px] text-slate-400">Reputación Soberana</p>
            </div>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 2: EL PROBLEMA
    // ---------------------------------------------------------
    case 1:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-red-500 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-red-400">01 / Criterio 1 (25%): Validación del Problema</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              La Desconfianza Cuesta Millones al Trabajo Digital en LATAM
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            En América Latina, más de 45 millones de profesionales y empresas enfrentan fricciones que destruyen acuerdos. Cuando no hay confianza técnica verificable, surgen tres problemas críticos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Incertidumbre e Impagos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                El cliente teme pagar por adelantado y no recibir el trabajo; el profesional teme entregar y no cobrar. Más del <strong className="text-red-300">30%</strong> de freelancers sufren demoras de +45 días o impagos totales por falta de garantías.
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Comisiones Abusivas (10-20%)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Plataformas Web2 tradicionales (Upwork, Fiverr) cobran hasta 20% solo por actuar como intermediarios de la desconfianza, sumado a demoras bancarias de 7 días y cepos cambiarios.
              </p>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Reputación Secuestrada</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Feudalismo digital: la reputación construida con años de trabajo queda enjaulada en servidores privados. Si la plataforma cambia términos o cierra la cuenta, el profesional pierde todo.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Mercado Objetivo: +45M de trabajadores remotos</span>
            <span className="text-[#00f2ff]">Fricción transaccional estimada: &gt; USD $2.4B anuales</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 3: LA SOLUCIÓN
    // ---------------------------------------------------------
    case 2:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">02 / Criterio 2 (25%): Foco de Producto</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ReWork: El Valor de la Confianza Garantizado por el Código
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            Reemplazamos la arbitrariedad humana y las comisiones predatorias por código inmutable en Stellar: contratos inteligentes que aseguran los fondos y reglas claras para ambas partes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custodia No-Custodial</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Smart Escrow en Soroban (Trustless Work). El cliente bloquea el 100% de los fondos en USDC al inicio. Los fondos se liberan por hitos verificados. Cero riesgo de impago ni estafas.
              </p>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Liquidaciones en Segundos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Basado en Stellar: transferencias con finalidad en 3 a 5 segundos y comisiones de centavos de dólar. Sin esperas bancarias internacionales de 7 días.
              </p>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Identidad Soberana (AURA)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cada hito y misión completada acumula reputación profesional inmutable on-chain ligada a la clave pública de Stellar del usuario, portable a cualquier ecosistema.
              </p>
            </div>
          </div>

          {/* Workflow Step Indicator */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-[#00f2ff]" /> 1. Depósito USDC en Soroban</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-emerald-400" /> 2. Cumplimiento de Hito</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 3. Liberación Automática + Puntos AURA</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 4: MÓDULOS DEL PRODUCTO
    // ---------------------------------------------------------
    case 3:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">03 / Foco de Producto: Ecosistema de Soluciones</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Una Suite Integral para Empresas, Freelancers y DAOs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Multi-Tenant Workspaces</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Espacios de trabajo independientes (`/app/[slug]`) con control de acceso basado en roles (Superadmin, Admin, Member, Guest) protegidos por Row-Level Security en Postgres.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Red de Servicios &amp; Marketplace</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Oferta abierta de servicios entre todos los usuarios del ecosistema ReWork sin intermediarios, con subastas y contratos de custodia obligatorios en Soroban.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Misiones de Equipo (Squad Goals)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Incentivos y bonos grupales por objetivos comunitarios. Los fondos se fondean en conjunto y se desembolsan por votación o validación del lead técnico.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Colectas &amp; Crowdfunding</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Financiamiento colectivo con transparencia absoluta en Stellar. Los aportantes auditan el progreso de cada hito antes de que los fondos sean liberados.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Rutas operativas: /app/global-network · /app/marketplace · /app/teams · /app/crowdfunding</span>
            <span className="text-emerald-400">100% Funcional en Testnet</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 5: 4 PRIMITIVAS STELLAR (DESEMPATE #1)
    // ---------------------------------------------------------
    case 4:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              04 / Criterio 3 (25%): Ejecución Técnica · Primer Criterio de Desempate
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Las 4 Implementaciones Oficiales de Stellar en ReWork
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            ReWork no es un fork ni una interfaz cosmética: aprovecha la pila completa de infraestructura nativa de Stellar para erradicar la desconfianza de punta a punta:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 1. Pagos Móviles SEP-0007 */}
            <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">01 · PAGOS</span>
                  <h3 className="font-bold text-white text-sm">QR Móvil &amp; Deep-Linking SEP-0007</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Generación de URIs estándar `web+stellar:pay` compatibles con Lobstr, Freighter y xBull. Liquidación en 3-5 segundos sin copiar claves públicas.
                </p>
              </div>
            </div>

            {/* 2. Smart Contracts en Soroban */}
            <div className="p-4 bg-white/5 border border-[#00f2ff]/30 rounded-2xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] font-bold">02 · SMART CONTRACTS</span>
                  <h3 className="font-bold text-white text-sm">Custodia No-Custodial en Soroban</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Integración robusta con Trustless Work (V1/V2). Fondos bloqueados en USDC y liberados únicamente por cumplimiento de hitos verificados.
                </p>
              </div>
            </div>

            {/* 3. DeFi Yield Farming & Swaps */}
            <div className="p-4 bg-white/5 border border-emerald-500/30 rounded-2xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">03 · DEFI &amp; YIELD</span>
                  <h3 className="font-bold text-white text-sm">Stellar AMM &amp; Horizon Path Swaps</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  La liquidez ociosa rinde hasta +12.8% APY en pools nativos con el Agente DeFi (`StellarPoolsAgent`), retiro en 1 clic y swaps directos sin slippage.
                </p>
              </div>
            </div>

            {/* 4. Identidad Soberana & Onboarding */}
            <div className="p-4 bg-white/5 border border-amber-500/30 rounded-2xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">04 · IDENTIDAD</span>
                  <h3 className="font-bold text-white text-sm">AURA CV On-Chain &amp; Onboarding Dual</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Reputación inmutable portable entre plataformas. Onboarding sin fricción: social login Web2 (Privy) o billetera nativa Web3 (Stellar Wallets Kit).
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-xl flex items-center justify-between text-xs font-mono text-[#00f2ff]">
            <span>Estándares: SEP-0007 · SEP-0024/0038 ready · Protocol 20+ Soroban · Horizon v28</span>
            <span className="text-white bg-[#00f2ff]/20 px-2 py-0.5 rounded">100% Funcional</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 6: PRODUCTO REAL / GALERÍA
    // ---------------------------------------------------------
    case 5:
      return (
        <div className="space-y-4">
          <div className="border-l-4 border-cyan-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
              05 / Criterio 2 (25%): Foco de Producto &amp; UX Real
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experiencia Web3 de Clase Mundial: 100% Funcional
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            {/* Desktop Real Screenshot */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 aspect-video flex items-center justify-center group">
                <Image
                  src="/deck/dashboard_clean.png"
                  alt="ReWork Desktop Platform"
                  width={720}
                  height={405}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050c14]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-mono text-[#00f2ff] bg-black/70 px-2 py-1 rounded border border-[#00f2ff]/30">
                    Contratos Soroban verificados + DEX Swaps + Red de Servicios
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-400 text-center">
                Dashboard Web3 Desktop: Sparklines en tiempo real, Red de Servicios, Escrow Soroban y Yield Farming
              </p>
            </div>

            {/* Pristine Mobile Smartphone Mockup (Pixel-Perfect, Vector, Zero Errors) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-[270px] bg-[#050c14] border-4 border-slate-700 rounded-[38px] p-3 shadow-2xl relative overflow-hidden ring-1 ring-white/20">
                {/* Dynamic Island / Speaker */}
                <div className="w-24 h-3.5 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 mr-2"></div>
                  <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
                </div>

                {/* Mobile Screen Container */}
                <div className="bg-[#0b121e] rounded-[24px] p-3 space-y-2.5 text-white border border-white/5">
                  {/* Top Status */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 font-mono">
                    <span className="font-bold text-white">ReWork Mobile</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Stellar Testnet
                    </span>
                  </div>

                  {/* Net Worth Card */}
                  <div className="p-3 bg-gradient-to-br from-[#00f2ff]/15 to-blue-600/10 border border-[#00f2ff]/30 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Patrimonio Total</span>
                        <p className="text-lg font-black font-mono text-white">$ 1,250.00 <span className="text-xs text-[#00f2ff]">USDC</span></p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/20 px-1.5 py-0.5 rounded">
                        +12.8% APY
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-slate-300">
                      <span>Líquido: $350.00</span>
                      <span className="text-emerald-400 font-bold">Stake Activo: $900.00</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-purple-500/15 border border-purple-500/30 rounded-xl text-center">
                      <QrCode className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-purple-200 block">Cobro QR</span>
                      <span className="text-[8px] text-purple-400/80 font-mono">SEP-0007</span>
                    </div>
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center">
                      <Landmark className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-emerald-200 block">Banco ARS</span>
                      <span className="text-[8px] text-emerald-400/80 font-mono">Rampa Directa</span>
                    </div>
                  </div>

                  {/* Active Escrow Item */}
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="font-bold text-slate-200 truncate max-w-[130px]">Smart Contract Escrow</span>
                      <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1 rounded">Activo</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">Auditoría Frontend — Hito 2 de 3</p>
                    <div className="mt-1.5 flex justify-between items-center text-[9px] font-mono text-[#00f2ff]">
                      <span>Custodia Soroban:</span>
                      <span className="font-bold">500.00 USDC</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
              </div>

              <p className="text-xs font-mono text-slate-400 text-center mt-2">
                Experiencia Mobile PWA con deep-linking, QR SEP-0007 y retiro en 1 clic
              </p>
            </div>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 7: ARQUITECTURA TÉCNICA (DESEMPATE #1)
    // ---------------------------------------------------------
    case 6:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              06 / Criterio 3 (25%): Ejecución Técnica · Arquitectura de Producción (Desempate #1)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Arquitectura de Grado Institucional en Stellar &amp; Soroban
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Cpu className="w-6 h-6 text-[#00f2ff] mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Soroban Smart Contracts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Custodia programática con Trustless Work (V1 en producción / V2 en testnet). Bloqueo y liberación condicional en USDC.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Stellar Wallets Kit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integración multi-billetera universal con Freighter, Lobstr, xBull y deep-linking móvil mediante el protocolo SEP-0007.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Lock className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Onboarding Híbrido</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Social login Web2 vía Privy con claves WebCrypto determinísticas para usuarios sin wallet previa, sin comprometer custodia.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Layers className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Supabase Postgres RLS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aislamiento multi-tenant estricto con Row Level Security. 0 mocks en base de datos verificado con suites de test en `scripts/`.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-slate-300 flex justify-between items-center">
            <span>Stack: Next.js 16 (Turbopack) · TypeScript 5 · Tailwind CSS v4 · Stellar SDK v14.5 · Soroban RPC</span>
            <span className="text-[#00f2ff]">100% Verificado en Testnet</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 8: MODELO DE NEGOCIO (CRITERIO 4)
    // ---------------------------------------------------------
    case 7:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
              07 / Criterio 4 (25%): Foco de Negocio · Monetización Sostenible
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              El Modelo Económico de la Confianza
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            ReWork alinea su modelo de ingresos con el éxito de sus usuarios: no cobra barreras de entrada ni penalizaciones, sino comisiones por valor aportado y servicios de alto valor:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-[#00f2ff]">1%</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Fee por Escrow Completado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comisión transparente del 1% retenida sólo ante la liberación exitosa de fondos mediante Soroban. 10x a 20x más económico que Upwork/Fiverr (10-20%).
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">SaaS B2B</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Workspaces Pro &amp; Enterprise</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Planes por suscripción para agencias y DAOs: tesorerías multi-firma, reportes de facturación/impuestos, roles de equipo y submisiones.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">0.25% + Yield</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Rampa Fiat &amp; Optimización DeFi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spread mínimo en conversión ARS/USDC con Anchors locales de Stellar (SEP-0024) y revenue share por optimización de rendimiento en AMM pools.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Objetivo Año 1: USD $1.5M procesados en escrows</span>
            <span className="text-amber-400">Ingresos proyectados protocolo: USD $45k - $60k</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 9: TRACCIÓN & VALIDACIÓN (CALIDAD DE CÓDIGO)
    // ---------------------------------------------------------
    case 8:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              08 / Ejecución Técnica &amp; Calidad: 0 Mocks, 100% Verificable
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              De la Hipótesis a la Realidad: 0 Código Simulado
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-[#00f2ff]">100%</span>
              <p className="text-xs font-bold text-white mt-1">Tests Pasando</p>
              <p className="text-[11px] text-slate-400">RLS, Escrow y RPC</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">0</span>
              <p className="text-xs font-bold text-white mt-1">Errores TypeScript</p>
              <p className="text-[11px] text-slate-400">npx tsc --noEmit limpio</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">0</span>
              <p className="text-xs font-bold text-white mt-1">Mocks / Fake Data</p>
              <p className="text-[11px] text-slate-400">Auditado forensemente</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-amber-400">Edge</span>
              <p className="text-xs font-bold text-white mt-1">Vercel Deploy Activo</p>
              <p className="text-[11px] text-slate-400">Producción continua</p>
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Suites de Verificación Continua Disponibles en el Repositorio
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
              <li>• `scripts/detect_fake_code.mjs` (Auditoría forense de integridad 100% real)</li>
              <li>• `scripts/test_services_health.mjs` (Horizon, Soroban RPC y Supabase)</li>
              <li>• `scripts/test_crud_rls.mjs` (Aislamiento multi-tenant en PostgreSQL)</li>
              <li>• `scripts/test_escrow_api.mjs` (Ciclo de vida de custodia Soroban)</li>
            </ul>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 10: COMPARATIVA COMPETITIVA
    // ---------------------------------------------------------
    case 9:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-purple-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400">
              09 / Criterio 2 &amp; 4: Ventajas Competitivas Defendibles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ¿Por qué ReWork Supera las Alternativas?
            </h2>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-4 text-left font-normal">Característica</th>
                  <th className="py-3 px-4 text-center font-normal">Plataformas Web2 (Upwork)</th>
                  <th className="py-3 px-4 text-center font-normal">Escrow Bancario Tradicional</th>
                  <th className="py-3 px-4 text-center font-bold text-[#00f2ff] bg-[#00f2ff]/5">ReWork sobre Stellar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Comisiones</td>
                  <td className="py-3 px-4 text-center text-red-400">10% a 20%</td>
                  <td className="py-3 px-4 text-center text-red-400">3% a 5% + fees SWIFT</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">~1% (Transparente)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Velocidad de Cobro</td>
                  <td className="py-3 px-4 text-center text-slate-400">7 a 14 días</td>
                  <td className="py-3 px-4 text-center text-slate-400">3 a 5 días hábiles</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">3 a 5 segundos</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Custodia de Fondos</td>
                  <td className="py-3 px-4 text-center text-slate-400">100% Centralizada</td>
                  <td className="py-3 px-4 text-center text-slate-400">Entidad Bancaria</td>
                  <td className="py-3 px-4 text-center text-[#00f2ff] font-bold bg-[#00f2ff]/5">Smart Contract Soroban</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Reputación</td>
                  <td className="py-3 px-4 text-center text-red-400">Atrapada en el sitio</td>
                  <td className="py-3 px-4 text-center text-slate-400">Inexistente</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">Soberana On-Chain (AURA CV)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Pagos Móviles QR</td>
                  <td className="py-3 px-4 text-center text-red-400">No</td>
                  <td className="py-3 px-4 text-center text-red-400">No</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">Nativo SEP-0007</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Yield en Liquidez Ociosa</td>
                  <td className="py-3 px-4 text-center text-red-400">0% (Retenido por la plataforma)</td>
                  <td className="py-3 px-4 text-center text-slate-400">0% a 1%</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">Hasta +12.8% APY (Stellar AMM)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs font-mono text-purple-300">
            <span>Costo 15x inferior · Liquidación en segundos · Control 100% no-custodial</span>
            <span className="text-[#00f2ff]">Vence a Web2 y a Finanzas Tradicionales</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 11: ROADMAP 90 DÍAS & INSTAWARDS
    // ---------------------------------------------------------
    case 10:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              10 / Funding Readiness · Instawards &amp; Pipeline SCF 7.0
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Roadmap a 90 Días: De Testnet a Escala con Stellar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-white/5 border border-[#00f2ff]/30 rounded-2xl relative">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] font-bold">
                Mes 1 · Instaward (USD $5.000)
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">Despliegue a Mainnet &amp; Auditoría</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Deploy de contratos de custodia en Mainnet.</li>
                <li>Auditoría formal con partner de SDF Audit Bank.</li>
                <li>Lanzamiento de los 2 pilotos iniciales (Agencia + DAO).</li>
                <li>Procesar primeros USD $10k en escrows.</li>
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                Mes 2 · SCF Tranche #1 (20%)
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">Rampa Fiat ARS &amp; App PWA</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Integración con Anchor local de pesos (ARS) SEP-0024.</li>
                <li>Lanzamiento de la Progressive Web App (PWA).</li>
                <li>Generador de comprobantes e impuestos automáticos.</li>
                <li>Alcanzar 10 workspaces activos.</li>
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                Mes 3 · SCF Tranche #2 &amp; #3 (70%)
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">SDK Público &amp; Expansión LATAM</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Publicación del SDK `@rework/escrow-kit`.</li>
                <li>Gobernanza multi-sig para tesorerías DAO.</li>
                <li>Meta on-chain: &gt; USD $150k procesados.</li>
                <li>1.000+ usuarios activos en Argentina y LATAM.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Documentos oficiales listos en docs/funding_readiness/</span>
            <span className="text-[#00f2ff]">Formato adaptado al SCF Handbook 7.0</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 12: EQUIPO Y CIERRE
    // ---------------------------------------------------------
    case 11:
      return (
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-2">
            <span>11 / Builders 100% Residentes en Argentina</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            El Valor de la Confianza Garantizado por el Código
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4 text-left">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] flex items-center justify-center font-bold text-lg mb-3">
                GD
              </div>
              <h3 className="text-base font-bold text-white">Gabriel Díaz</h3>
              <p className="text-xs font-mono text-[#00f2ff] mb-2">Tech Lead &amp; Fullstack Web3</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Arquitectura de contratos inteligentes en Soroban, integración de Stellar Wallets Kit, Next.js 16, Supabase RLS y optimización de bases de datos distribuidas. Residente en Argentina.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
                MU
              </div>
              <h3 className="text-base font-bold text-white">Marco Ungaro</h3>
              <p className="text-xs font-mono text-purple-400 mb-2">Product Lead &amp; Operations</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Diseño de producto centrado en el usuario, validación con empresas/DAOs y coordinación de pilotos y estrategias de adopción en LATAM. Residente en Argentina.
              </p>
            </div>
          </div>

          {/* Links & CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl bg-[#00f2ff] text-[#050c14] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.4)]"
            >
              <span>Explorar Plataforma en Vivo</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/rgabrieldiaz/ReWork"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-white hover:border-[#00f2ff]/50 transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-[#00f2ff]" />
              <span>Ver Código en GitHub</span>
            </a>
          </div>

          <div className="pt-2 max-w-xl mx-auto">
            <p className="text-sm font-semibold text-[#00f2ff] font-mono">
              &ldquo;En un mundo de intermediarios opacos, ReWork devuelve la soberanía al trabajo: el valor de la confianza garantizado por el código.&rdquo;
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
