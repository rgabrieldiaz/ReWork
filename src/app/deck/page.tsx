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
  Star,
  Landmark
} from "lucide-react";
import { ReWorkIcon, ReWorkLogo } from "@/components/ReWorkLogo";
import { deckTranslations, DeckLanguage } from "./deckTranslations";

export default function PresentationDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState<DeckLanguage>("en");
  const totalSlides = 12;

  const t = deckTranslations[language];
  const slidesData = t.slidesData;

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

  return (
    <div className="min-h-screen bg-[#050c14] text-slate-100 font-sans selection:bg-[#00f2ff]/30 selection:text-[#00f2ff] flex flex-col justify-between overflow-x-clip">
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
      <header className="no-print sticky top-0 z-50 bg-[#050c14]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.3)]">
              <ReWorkIcon className="w-5 h-5" theme="cyan" glow />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white flex items-center gap-2 font-mono">
                re<span className="text-[#00f2ff]">work</span>{" "}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
                  {t.nav.scaleTrack}
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">{t.nav.sub}</p>
            </div>
          </div>

          {/* Slide Selector & Counter */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title={t.nav.prev}
            >
              <ChevronLeft className="w-4 h-4 text-[#00f2ff]" />
            </button>
            <div className="font-mono text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300">
              <span className="text-[#00f2ff] font-bold">{String(currentSlide + 1).padStart(2, "0")}</span> /{" "}
              {String(totalSlides).padStart(2, "0")}
            </div>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title={t.nav.next}
            >
              <ChevronRight className="w-4 h-4 text-[#00f2ff]" />
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono text-xs">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                  language === "en"
                    ? "bg-[#00f2ff]/20 text-[#00f2ff] font-bold shadow-[0_0_8px_rgba(0,242,255,0.3)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="English (Default)"
              >
                <Globe className="w-3 h-3" />
                <span>EN</span>
              </button>
              <button
                onClick={() => setLanguage("es")}
                className={`px-2 py-1 rounded transition-all ${
                  language === "es"
                    ? "bg-[#00f2ff]/20 text-[#00f2ff] font-bold shadow-[0_0_8px_rgba(0,242,255,0.3)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Español"
              >
                ES
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#050c14] font-mono text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
              title={t.nav.downloadPdfTitle}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.downloadPdf}</span>
              <span className="sm:hidden">{t.nav.downloadPdfShort}</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 text-slate-300 hover:text-white transition-all hidden sm:block"
              title={t.nav.fullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <Link
              href="/app"
              className="text-xs font-mono text-slate-400 hover:text-[#00f2ff] transition-all flex items-center gap-1"
            >
              <span>{t.nav.viewApp}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Progress Bar (Screen Only) */}
        <div className="w-full h-1 bg-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-[#00f2ff] via-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_10px_#00f2ff]"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>
      </header>

      {/* SCREEN VIEW: Active Slide Presenter */}
      <main className="no-print flex-1 flex items-center justify-center p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="w-full bg-[#0d1624]/90 border border-white/10 rounded-3xl p-6 sm:p-12 backdrop-blur-xl shadow-2xl relative min-h-[580px] flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Content Dynamic Renderer */}
          <SlideRenderer slideIndex={currentSlide} language={language} />

          {/* Slide Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>{t.nav.footerLeft}</span>
            <span className="text-[#00f2ff]/80">{slidesData[currentSlide].title}</span>
            <span>
              {t.nav.slidePrefix} {currentSlide + 1} {t.nav.of} {totalSlides}
            </span>
          </div>
        </div>
      </main>

      {/* Thumbnails Navigation Strip (Screen Only) */}
      <footer className="no-print sticky bottom-0 z-50 bg-[#050c14]/90 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 overflow-x-auto justify-start md:justify-center custom-scrollbar shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {slidesData.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left truncate max-w-[150px] shrink-0 ${
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
            <SlideRenderer slideIndex={idx} language={language} />
            <div className="mt-auto pt-6 border-t border-white/10 flex justify-between text-xs font-mono text-slate-400">
              <span>ReWork — Argentina Builder Challenge 2026 (Scale Track)</span>
              <span>
                {t.nav.slidePrefix} {idx + 1} {t.nav.of} {totalSlides}
              </span>
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
function SlideRenderer({ slideIndex, language }: { slideIndex: number; language: DeckLanguage }) {
  const t = deckTranslations[language];

  switch (slideIndex) {
    // ---------------------------------------------------------
    // SLIDE 1: PORTADA / COVER
    // ---------------------------------------------------------
    case 0: {
      const s = t.slide0;
      return (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{s.badge}</span>
          </div>

          <div className="mb-6 flex justify-center">
            <ReWorkLogo className="h-16 sm:h-20 w-auto" theme="cyan" glow />
          </div>

          <p className="text-xl sm:text-2xl font-light text-slate-300 italic mb-4 max-w-2xl">
            {s.quote}
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-10 leading-relaxed font-sans">
            {s.description}
          </p>

          {/* 4 Stellar Building Blocks Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <ShieldCheck className="w-5 h-5 text-[#00f2ff] mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">{s.badge1Title}</p>
              <p className="text-[11px] text-slate-400">{s.badge1Sub}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <QrCode className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">{s.badge2Title}</p>
              <p className="text-[11px] text-slate-400">{s.badge2Sub}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">{s.badge3Title}</p>
              <p className="text-[11px] text-slate-400">{s.badge3Sub}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold">{s.badge4Title}</p>
              <p className="text-[11px] text-slate-400">{s.badge4Sub}</p>
            </div>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 2: EL PROBLEMA / THE PROBLEM
    // ---------------------------------------------------------
    case 1: {
      const s = t.slide1;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-red-500 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-red-400">{s.tag}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            {s.lead}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card1Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card1Text}
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card2Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card2Text}
              </p>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card3Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card3Text}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{s.footerMarket}</span>
            <span className="text-[#00f2ff]">{s.footerFriction}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 3: LA SOLUCIÓN / THE SOLUTION
    // ---------------------------------------------------------
    case 2: {
      const s = t.slide2;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">{s.tag}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            {s.lead}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card1Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card1Text}
              </p>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card2Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card2Text}
              </p>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.card3Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.card3Text}
              </p>
            </div>
          </div>

          {/* Workflow Step Indicator */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-[#00f2ff]" /> {s.step1}</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-emerald-400" /> {s.step2}</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> {s.step3}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 4: MÓDULOS DEL PRODUCTO / CORE MODULES
    // ---------------------------------------------------------
    case 3: {
      const s = t.slide3;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">{s.tag}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{s.card1Title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card1Text}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{s.card2Title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card2Text}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{s.card3Title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card3Text}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{s.card4Title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card4Text}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{s.footerRoutes}</span>
            <span className="text-emerald-400">{s.footerStatus}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 5: 4 PRIMITIVAS STELLAR (DESEMPATE #1)
    // ---------------------------------------------------------
    case 4: {
      const s = t.slide4;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            {s.lead}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 1. Pagos Móviles SEP-0007 */}
            <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">{s.card1Badge}</span>
                  <h3 className="font-bold text-white text-sm">{s.card1Title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card1Text}
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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] font-bold">{s.card2Badge}</span>
                  <h3 className="font-bold text-white text-sm">{s.card2Title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card2Text}
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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{s.card3Badge}</span>
                  <h3 className="font-bold text-white text-sm">{s.card3Title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card3Text}
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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{s.card4Badge}</span>
                  <h3 className="font-bold text-white text-sm">{s.card4Title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.card4Text}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-xl flex items-center justify-between text-xs font-mono text-[#00f2ff]">
            <span>{s.footerStandards}</span>
            <span className="text-white bg-[#00f2ff]/20 px-2 py-0.5 rounded">{s.footerFunctional}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 6: PRODUCTO REAL / LIVE PRODUCT
    // ---------------------------------------------------------
    case 5: {
      const s = t.slide5;
      return (
        <div className="space-y-4">
          <div className="border-l-4 border-cyan-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
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
                    {s.desktopOverlay}
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-400 text-center">
                {s.desktopCaption}
              </p>
            </div>

            {/* Pristine Mobile Smartphone Mockup */}
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
                    <span className="font-bold text-white">{s.mobileHeader}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {s.mobileNetwork}
                    </span>
                  </div>

                  {/* Net Worth Card */}
                  <div className="p-3 bg-gradient-to-br from-[#00f2ff]/15 to-blue-600/10 border border-[#00f2ff]/30 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">{s.mobileNetWorth}</span>
                        <p className="text-lg font-black font-mono text-white">$ 1,250.00 <span className="text-xs text-[#00f2ff]">USDC</span></p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/20 px-1.5 py-0.5 rounded">
                        +12.8% APY
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-slate-300">
                      <span>{s.mobileLiquid}</span>
                      <span className="text-emerald-400 font-bold">{s.mobileStake}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-purple-500/15 border border-purple-500/30 rounded-xl text-center">
                      <QrCode className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-purple-200 block">{s.mobileQr}</span>
                      <span className="text-[8px] text-purple-400/80 font-mono">{s.mobileQrSub}</span>
                    </div>
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center">
                      <Landmark className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-emerald-200 block">{s.mobileBank}</span>
                      <span className="text-[8px] text-emerald-400/80 font-mono">{s.mobileBankSub}</span>
                    </div>
                  </div>

                  {/* Active Escrow Item */}
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="font-bold text-slate-200 truncate max-w-[130px]">{s.mobileEscrowTitle}</span>
                      <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1 rounded">{s.mobileEscrowBadge}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">{s.mobileEscrowSub}</p>
                    <div className="mt-1.5 flex justify-between items-center text-[9px] font-mono text-[#00f2ff]">
                      <span>{s.mobileEscrowCustody}</span>
                      <span className="font-bold">500.00 USDC</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
              </div>

              <p className="text-xs font-mono text-slate-400 text-center mt-2">
                {s.mobileCaption}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 7: ARQUITECTURA TÉCNICA (DESEMPATE #1)
    // ---------------------------------------------------------
    case 6: {
      const s = t.slide6;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Cpu className="w-6 h-6 text-[#00f2ff] mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{s.card1Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card1Text}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{s.card2Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card2Text}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Lock className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{s.card3Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card3Text}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Layers className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{s.card4Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card4Text}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-slate-300 flex justify-between items-center">
            <span>{s.footerStack}</span>
            <span className="text-[#00f2ff]">{s.footerVerified}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 8: MODELO DE NEGOCIO (CRITERIO 4)
    // ---------------------------------------------------------
    case 7: {
      const s = t.slide7;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl">
            {s.lead}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-[#00f2ff]">{s.card1Stat}</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">{s.card1Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card1Text}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">{s.card2Stat}</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">{s.card2Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card2Text}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">{s.card3Stat}</span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">{s.card3Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.card3Text}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{s.footerGoal}</span>
            <span className="text-amber-400">{s.footerRevenue}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 9: TRACCIÓN & VALIDACIÓN (CALIDAD DE CÓDIGO)
    // ---------------------------------------------------------
    case 8: {
      const s = t.slide8;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-[#00f2ff]">100%</span>
              <p className="text-xs font-bold text-white mt-1">{s.stat1Title}</p>
              <p className="text-[11px] text-slate-400">{s.stat1Sub}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">0</span>
              <p className="text-xs font-bold text-white mt-1">{s.stat2Title}</p>
              <p className="text-[11px] text-slate-400">{s.stat2Sub}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-purple-400">0</span>
              <p className="text-xs font-bold text-white mt-1">{s.stat3Title}</p>
              <p className="text-[11px] text-slate-400">{s.stat3Sub}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold text-amber-400">Edge</span>
              <p className="text-xs font-bold text-white mt-1">{s.stat4Title}</p>
              <p className="text-[11px] text-slate-400">{s.stat4Sub}</p>
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {s.boxTitle}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
              <li>{s.bullet1}</li>
              <li>{s.bullet2}</li>
              <li>{s.bullet3}</li>
              <li>{s.bullet4}</li>
            </ul>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 10: COMPARATIVA COMPETITIVA
    // ---------------------------------------------------------
    case 9: {
      const s = t.slide9;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-purple-400 pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-4 text-left font-normal">{s.colFeature}</th>
                  <th className="py-3 px-4 text-center font-normal">{s.colWeb2}</th>
                  <th className="py-3 px-4 text-center font-normal">{s.colBank}</th>
                  <th className="py-3 px-4 text-center font-bold text-[#00f2ff] bg-[#00f2ff]/5">{s.colReWork}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row1Label}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row1Web2}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row1Bank}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">{s.row1ReWork}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row2Label}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row2Web2}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row2Bank}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">{s.row2ReWork}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row3Label}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row3Web2}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row3Bank}</td>
                  <td className="py-3 px-4 text-center text-[#00f2ff] font-bold bg-[#00f2ff]/5">{s.row3ReWork}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row4Label}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row4Web2}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row4Bank}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">{s.row4ReWork}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row5Label}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row5Web2}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row5Bank}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">{s.row5ReWork}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">{s.row6Label}</td>
                  <td className="py-3 px-4 text-center text-red-400">{s.row6Web2}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{s.row6Bank}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#00f2ff]/5">{s.row6ReWork}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs font-mono text-purple-300">
            <span>{s.footerLeft}</span>
            <span className="text-[#00f2ff]">{s.footerRight}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 11: ROADMAP 90 DÍAS & INSTAWARDS
    // ---------------------------------------------------------
    case 10: {
      const s = t.slide10;
      return (
        <div className="space-y-6">
          <div className="border-l-4 border-[#00f2ff] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00f2ff]">
              {s.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-white/5 border border-[#00f2ff]/30 rounded-2xl relative">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] font-bold">
                {s.col1Badge}
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">{s.col1Title}</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {s.col1Items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {s.col2Badge}
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">{s.col2Title}</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {s.col2Items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                {s.col3Badge}
              </span>
              <h3 className="text-base font-bold text-white mt-3 mb-2">{s.col3Title}</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {s.col3Items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{s.footerDocs}</span>
            <span className="text-[#00f2ff]">{s.footerFormat}</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SLIDE 12: EQUIPO Y CIERRE / TEAM & CLOSING
    // ---------------------------------------------------------
    case 11: {
      const s = t.slide11;
      return (
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-2">
            <span>{s.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {s.heading}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4 text-left">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] flex items-center justify-center font-bold text-lg mb-3">
                GD
              </div>
              <h3 className="text-base font-bold text-white">Gabriel Díaz</h3>
              <p className="text-xs font-mono text-[#00f2ff] mb-2">{s.lead1Role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.lead1Bio}
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
                MU
              </div>
              <h3 className="text-base font-bold text-white">Marco Ungaro</h3>
              <p className="text-xs font-mono text-purple-400 mb-2">{s.lead2Role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.lead2Bio}
              </p>
            </div>
          </div>

          {/* Links & CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl bg-[#00f2ff] text-[#050c14] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.4)]"
            >
              <span>{s.ctaLive}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/rgabrieldiaz/ReWork"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-white hover:border-[#00f2ff]/50 transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-[#00f2ff]" />
              <span>{s.ctaCode}</span>
            </a>
          </div>

          <div className="pt-2 max-w-xl mx-auto">
            <p className="text-sm font-semibold text-[#00f2ff] font-mono">
              {s.closingQuote}
            </p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
