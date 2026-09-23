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
  Star
} from "lucide-react";

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
    { title: "El Problema", subtitle: "Fricciones en LATAM y Web2" },
    { title: "La Solución", subtitle: "Infraestructura Trustless en Stellar" },
    { title: "Módulos Core", subtitle: "Workspaces, Misiones y Marketplace" },
    { title: "Feature Estrella", subtitle: "Pagos QR SEP-0007 + Escrow" },
    { title: "Producto Real", subtitle: "Galería de Capturas en Vivo" },
    { title: "Arquitectura", subtitle: "Stellar Building Blocks & Soroban" },
    { title: "Modelo de Negocio", subtitle: "Monetización & Sostenibilidad" },
    { title: "Tracción & Tests", subtitle: "Validación y Suites de Prueba" },
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
          <div className="w-8 h-8 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center font-bold text-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.3)]">
            RW
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white flex items-center gap-2">
              ReWork <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">Scale Track</span>
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

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4">
            Re<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-cyan-400 to-blue-500">Work</span>
          </h1>

          <p className="text-xl sm:text-2xl font-light text-slate-300 italic mb-4 max-w-2xl">
            &ldquo;El valor de la confianza, garantizado por código.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-10 leading-relaxed font-sans">
            Plataforma descentralizada de Workspaces B2B, Custodia Inteligente en Soroban y Reputación Soberana para empresas, agencias y DAOs en América Latina.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <ShieldCheck className="w-5 h-5 text-[#00f2ff] mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Soroban Escrow</p>
              <p className="text-[11px] text-slate-400">Trustless Work V1/V2</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Stellar USDC</p>
              <p className="text-[11px] text-slate-400">Finalidad en 3-5 seg</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <QrCode className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Pagos QR SEP-0007</p>
              <p className="text-[11px] text-slate-400">Deep-linking móvil</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">Workspaces Multi-Tenant</p>
              <p className="text-[11px] text-slate-400">PostgreSQL RLS</p>
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
            <span className="font-mono text-xs uppercase tracking-widest text-red-400">01 / Validación del Problema</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              La Desconfianza Cuesta Millones al Trabajo Digital en LATAM
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            En América Latina, más de 45 millones de profesionales y agencias prestan servicios al mundo, enfrentando tres grandes fricciones estructurales:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Incertidumbre e Impagos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                El cliente teme pagar por adelantado y no recibir el trabajo; el profesional teme entregar y no cobrar. Más del <strong className="text-red-300">30%</strong> de freelancers reportan retrasos superiores a 45 días o impagos totales.
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Comisiones Abusivas (10-20%)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Plataformas Web2 tradicionales (Upwork, Fiverr) retienen del 10% al 20% del valor pactado, más costos de retiro bancario transfronterizo y brechas cambiarias locales.
              </p>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Reputación Secuestrada</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Feudalismo digital: el historial laboral no le pertenece al profesional. Si una cuenta es baneada o la plataforma cambia sus términos, se pierden años de reputación ganada.
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
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">02 / Foco de Producto</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ReWork: La Confianza Ejecutada en Contratos Inteligentes
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            ReWork transforma la relación contractual entre empresas, colaboradores y comunidades mediante infraestructura Web3 nativa de Stellar:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custodia No Custodial</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Smart Escrow en Soroban (Trustless Work). El cliente bloquea el 100% de los fondos en USDC al inicio. Los fondos se liberan por hitos verificados. Cero intermediarios arbitrarios.
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
            <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-[#00f2ff]" /> 1. Depósito en Escrow</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-emerald-400" /> 2. Cumplimiento de Hito</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 3. Validación y Liberación USDC</span>
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
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">03 / Producto en Acción</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Una Suite Integral para Empresas, Agencias y DAOs
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
                <h3 className="font-bold text-white text-base">Marketplace & Subastas Inversas</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Publicación de requerimientos, ofertas P2P y licitaciones donde cada servicio contratado queda respaldado obligatoriamente por un contrato de custodia en Soroban.
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
                <h3 className="font-bold text-white text-base">Colectas & Crowdfunding</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Financiamiento colectivo con transparencia absoluta en Stellar. Los aportantes auditan el progreso de cada hito antes de que los fondos sean liberados.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Rutas operativas: /app/marketplace · /app/squad-goals · /app/crowdfunding</span>
            <span className="text-emerald-400">100% Funcional en Testnet</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 5: FEATURE ESTRELLA (SCALE TRACK)
    // ---------------------------------------------------------
    case 4:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">04 / Entrega del Sprint (Track Scale)</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Feature Estrella: Pagos Móviles QR (SEP-0007) + Escrow
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            La innovación técnica desarrollada durante este sprint permite que cualquier cliente o empresa abone o fondee una custodia directamente desde su celular:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <QrCode className="w-8 h-8 text-[#00f2ff] mb-3" />
              <h3 className="text-base font-bold text-white mb-2">QR Estándar SEP-0007</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generación dinámica de URIs de pago de Stellar compatibles con cualquier billetera móvil del ecosistema (Lobstr, Freighter Mobile, xBull).
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Smartphone className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Deep-Linking en 1 Clic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esquema nativo `web+stellar:pay` que abre la app de billetera instalada en el dispositivo móvil y rellena la transacción sin copiar ni pegar claves públicas.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Simulador de Metas y Yield</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Módulo interactivo de metas de ahorro y simulación de rendimiento mediante pools de liquidez descentralizadas en el Stellar DEX.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-xl flex items-center justify-between text-xs font-mono text-[#00f2ff]">
            <span>Componentes nuevos: QRPaymentsModal.tsx · goals/page.tsx · StellarPoolsAgent.tsx</span>
            <span className="text-white bg-[#00f2ff]/20 px-2 py-0.5 rounded">Verificado con tsc</span>
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
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">05 / Ejecución Visual</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Diseño Diseñado para Usuarios Reales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-900 aspect-video flex items-center justify-center">
                <Image
                  src="/deck/dashboard_full.png"
                  alt="ReWork Dashboard"
                  width={640}
                  height={360}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-xs font-mono text-slate-400 text-center">Dashboard Integral de ReWork con métricas en tiempo real</p>
            </div>

            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-900 aspect-video flex items-center justify-center">
                <Image
                  src="/deck/mobile_view.webp"
                  alt="ReWork Mobile Responsive"
                  width={640}
                  height={360}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-xs font-mono text-slate-400 text-center">Experiencia 100% optimizada para dispositivos móviles</p>
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
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">06 / Ejecución Técnica (Criterio #1)</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Arquitectura Nativa en Stellar & Soroban
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Cpu className="w-6 h-6 text-[#00f2ff] mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Soroban Smart Contracts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contratos de custodia programática mediante Trustless Work SDK (V1 para producción / V2 en testnet).
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Stellar Wallets Kit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integración multi-billetera universal con Freighter, Lobstr, xBull y WalletConnect v2 para mobile.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Lock className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Onboarding Híbrido</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Login social Web2 vía Privy con generación de claves determinísticas WebCrypto para usuarios sin wallet.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Layers className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">Supabase Postgres RLS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seguridad multi-tenant estricta por filas (RLS) respaldada por suites de test automatizadas en `scripts/`.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-slate-300 flex justify-between items-center">
            <span>Stack: Next.js 16 (Turbopack) · TypeScript 5 · Tailwind CSS v4 · Stellar SDK v14.5</span>
            <span className="text-[#00f2ff]">Testnet & Mainnet Ready</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 8: MODELO DE NEGOCIO
    // ---------------------------------------------------------
    case 7:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400">07 / Foco de Negocio</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Monetización Sostenible y Escalable
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            ReWork alinea sus ingresos directamente con el volumen económico procesado y el éxito de sus usuarios:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-[#00f2ff]">1%</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Fee por Escrow Completado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comisión justa del 1% sobre los fondos liberados al contratista. 10 a 20 veces más económico que las plataformas tradicionales.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">SaaS B2B</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Workspaces Pro & Enterprise</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Planes mensuales para empresas y agencias que necesitan múltiples workspaces, reportes impositivos y auditoría contable.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">0.25%</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">Rampa Fiat & Yield Sharing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spread mínimo en la conversión de pesos argentinos (ARS) a USDC junto a Anchors locales regulados de Stellar.
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
    // SLIDE 9: TRACCIÓN & VALIDACIÓN
    // ---------------------------------------------------------
    case 8:
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">08 / Validación y Tracción</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              De la Hipótesis a la Ejecución Verificable
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
              <p className="text-[11px] text-slate-400">Compilación limpia</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">2</span>
              <p className="text-xs font-bold text-white mt-1">Organizaciones Piloto</p>
              <p className="text-[11px] text-slate-400">Agencia + DAO</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-amber-400">Vercel</span>
              <p className="text-xs font-bold text-white mt-1">Deploy Activo</p>
              <p className="text-[11px] text-slate-400">Producción en Edge</p>
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Suites de Automatización Disponibles en el Repositorio
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
              <li>• `scripts/test_services_health.mjs` (RPC &amp; APIs)</li>
              <li>• `scripts/test_crud_rls.mjs` (Políticas de datos)</li>
              <li>• `scripts/test_escrow_api.mjs` (Contratos de custodia)</li>
              <li>• `scripts/test_superadmin_access.mjs` (Seguridad)</li>
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
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400">09 / Ventajas Competitivas</span>
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
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">~1%</td>
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
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">Soberana On-Chain (AURA)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Pagos Móviles QR</td>
                  <td className="py-3 px-4 text-center text-red-400">No</td>
                  <td className="py-3 px-4 text-center text-red-400">No</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">Nativo SEP-0007</td>
                </tr>
              </tbody>
            </table>
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
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">10 / Funding Readiness (SCF 7.0)</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Roadmap a 90 Días: De Testnet a Escala
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
                <li>Auditoría mediante partner de SDF Audit Bank.</li>
                <li>Lanzamiento de los 2 pilotos iniciales.</li>
                <li>Procesar primeros USD $10k en escrows.</li>
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                Mes 2 · SCF Tranche #1 (20%)
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">Rampa Fiat &amp; App PWA</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Integración con Anchor local de pesos (ARS).</li>
                <li>Lanzamiento de la Progressive Web App (PWA).</li>
                <li>Generador de comprobantes e impuestos.</li>
                <li>Alcanzar 10 workspaces activos.</li>
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                Mes 3 · SCF Tranche #2 &amp; #3 (70%)
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">SDK Público &amp; Expansión</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Publicación del SDK `@rework/escrow-kit`.</li>
                <li>Gobernanza multi-sig para tesorerías DAO.</li>
                <li>Meta on-chain: &gt; USD $150k procesados.</li>
                <li>1.000+ usuarios activos en Argentina.</li>
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
            <span>Los Builders detrás de ReWork</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Construyendo con Impacto en Stellar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4 text-left">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] flex items-center justify-center font-bold text-lg mb-3">
                GD
              </div>
              <h3 className="text-base font-bold text-white">Gabriel Díaz</h3>
              <p className="text-xs font-mono text-[#00f2ff] mb-2">Tech Lead &amp; Fullstack Web3</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Arquitectura de contratos inteligentes en Soroban, integración de Stellar Wallets Kit, Next.js 16 y optimización de bases de datos distribuidas. Residente en Argentina.
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
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
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

          <p className="text-xs text-slate-500 font-mono mt-4">
            &ldquo;La confianza ya no necesita intermediarios; solo necesita buen código.&rdquo;
          </p>
        </div>
      );

    default:
      return null;
  }
}
