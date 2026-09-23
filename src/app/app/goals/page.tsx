"use client";

import React, { useState, useId } from "react";
import {
  Target,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Users,
  Landmark,
  Bot,
  QrCode,
  DollarSign,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Coins
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useStaking } from "@/hooks/useStaking";
import { formatCurrency, getTripleValues, SupportedCurrency, DEFAULT_RATES } from "@/lib/currency";
import { QRPaymentsModal } from "@/components/QRPaymentsModal";
import { BankTransferModal } from "@/components/BankTransferModal";
import { StellarPoolsAgent } from "@/components/StellarPoolsAgent";

export default function GoalsPage() {
  const { connected, address } = useWallet();
  const { usdcBalance, xlmBalance } = useSharedBalances();
  const { stakedAmount, activeApy, accruedYield, stake, positions } = useStaking();

  // Currency Toggle
  const [currency, setCurrency] = useState<SupportedCurrency>("USDC");

  // Simulator Inputs
  const [initialCapital, setInitialCapital] = useState<number>(500); // in USDC
  const [targetProfit, setTargetProfit] = useState<number>(200); // in USDC
  const [durationMonths, setDurationMonths] = useState<number>(12); // months
  const [selectedStrategyApy, setSelectedStrategyApy] = useState<number>(14.5); // % APY

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPoolsAgentOpen, setIsPoolsAgentOpen] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [newStakeAmount, setNewStakeAmount] = useState<string>("100");
  const [stakeSuccess, setStakeSuccess] = useState(false);

  // Transfer to User Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferAmount, setTransferAmount] = useState("25");
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Calculations for projection
  // Compound interest formula: A = P * (1 + r/12)^(n)
  const monthlyRate = selectedStrategyApy / 100 / 12;
  const projectedFinalCapital = initialCapital * Math.pow(1 + monthlyRate, durationMonths);
  const projectedProfit = Math.max(0, projectedFinalCapital - initialCapital);
  const goalProgressPercent = Math.min(100, Math.round((projectedProfit / (targetProfit || 1)) * 100));

  // Triple values for display
  const tripleInitial = getTripleValues(initialCapital, "USDC");
  const tripleTarget = getTripleValues(targetProfit, "USDC");
  const tripleProfit = getTripleValues(projectedProfit, "USDC");
  const tripleStaked = getTripleValues(stakedAmount, "USDC");
  const tripleYield = getTripleValues(accruedYield, "USDC");

  // Chart data points generator
  const pointsCount = 12;
  const chartPoints = Array.from({ length: pointsCount + 1 }).map((_, index) => {
    const month = (durationMonths / pointsCount) * index;
    const value = initialCapital * Math.pow(1 + monthlyRate, month);
    return {
      month: month.toFixed(1),
      value,
      profit: value - initialCapital,
    };
  });

  const maxVal = Math.max(projectedFinalCapital, initialCapital + targetProfit) * 1.05;
  const minVal = initialCapital * 0.95;
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;

  const pointsSvg = chartPoints
    .map((pt, i) => {
      const x = paddingX + (i / pointsCount) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - ((pt.value - minVal) / range) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const handleExecuteStake = async () => {
    const amt = parseFloat(newStakeAmount) || 0;
    if (amt <= 0) return;
    await stake(amt, durationMonths, "Stellar Yield Vault");
    setStakeSuccess(true);
    setTimeout(() => {
      setStakeSuccess(false);
      setIsStakeModalOpen(false);
    }, 1500);
  };

  const handleExecuteTransfer = () => {
    if (!transferTarget) {
      alert("Ingresa un usuario o dirección Stellar de destino.");
      return;
    }
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setIsTransferModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Banner & Currency Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-accent-teal/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-accent-teal/10 text-accent-teal border border-accent-teal/30">
              <Target className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold font-mono tracking-widest uppercase text-accent-teal">
              ReWork Financial Goals • Smart Yield Simulator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Crear Objetivo de Rendimiento
          </h1>
          <p className="text-sm text-muted max-w-xl mt-1">
            Diseñá tu meta patrimonial, proyectá el crecimiento compuesto de tus activos en Stellar y elegí cómo
            rentabilizarlos o transferirlos.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-border-subtle shrink-0">
          <span className="text-xs text-muted font-bold px-2">Moneda:</span>
          {(["USDC", "ARS", "XLM"] as SupportedCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                currency === c
                  ? "bg-accent-teal text-background shadow-md shadow-accent-teal/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs vs Interactive Simulator */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Goal Builder & Strategy */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-border-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-teal" /> Parámetros del Objetivo
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                {selectedStrategyApy}% APY Proyectado
              </span>
            </div>

            {/* Input 1: Capital Inicial */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <label>Capital a Invertir / Fondos</label>
                <span className="font-mono text-foreground font-bold">
                  {currency === "ARS"
                    ? formatCurrency(initialCapital * DEFAULT_RATES.USDC_TO_ARS, "ARS")
                    : currency === "XLM"
                    ? formatCurrency(initialCapital / DEFAULT_RATES.XLM_TO_USDC, "XLM")
                    : `${initialCapital} USDC`}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-foreground/5 rounded-2xl border border-border-subtle focus-within:border-accent-teal/50">
                <Coins className="w-5 h-5 text-accent-teal" />
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent text-lg font-bold font-mono outline-none border-none text-foreground"
                />
                <span className="text-xs font-mono font-bold text-muted">USDC Base</span>
              </div>
            </div>

            {/* Input 2: Meta de Ganancia Deseada */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <label>Meta de Ganancia Esperada</label>
                <span className="font-mono text-emerald-400 font-bold">
                  {currency === "ARS"
                    ? formatCurrency(targetProfit * DEFAULT_RATES.USDC_TO_ARS, "ARS")
                    : currency === "XLM"
                    ? formatCurrency(targetProfit / DEFAULT_RATES.XLM_TO_USDC, "XLM")
                    : `+${targetProfit} USDC`}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-foreground/5 rounded-2xl border border-border-subtle focus-within:border-emerald-400/50">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <input
                  type="number"
                  min="5"
                  step="25"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent text-lg font-bold font-mono outline-none border-none text-foreground"
                />
                <span className="text-xs font-mono font-bold text-muted">USDC Ganancia</span>
              </div>
            </div>

            {/* Input 3: Plazo / Tiempo */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <label className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-teal" /> Plazo de Inversión
                </label>
                <span className="font-mono font-bold text-accent-teal">{durationMonths} Meses</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-accent-teal"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted">
                <span>1 Mes</span>
                <span>12 Meses (1 Año)</span>
                <span>24 Meses</span>
                <span>36 Meses</span>
              </div>
            </div>

            {/* Strategy Preset Selector */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <label className="text-xs font-semibold text-muted block">Estrategia de Rendimiento en Stellar</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Conservador", apy: 8.5, label: "RWA T-Bills" },
                  { name: "Equilibrado", apy: 12.8, label: "AMM Nativo" },
                  { name: "Agresivo", apy: 19.5, label: "Pool ARST" },
                ].map((strat) => (
                  <button
                    key={strat.name}
                    onClick={() => setSelectedStrategyApy(strat.apy)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedStrategyApy === strat.apy
                        ? "bg-accent-teal/15 border-accent-teal text-foreground shadow-sm"
                        : "bg-foreground/5 border-border-subtle text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px] font-bold block">{strat.name}</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{strat.apy}%</span>
                    <span className="text-[9px] text-muted block truncate">{strat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Button to Start Stake */}
            <button
              onClick={() => {
                setNewStakeAmount(initialCapital.toString());
                setIsStakeModalOpen(true);
              }}
              className="w-full py-3.5 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-accent-teal/20 transition-all text-xs uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" /> Activar Objetivo en Stake Ahora
            </button>
          </div>

          {/* User's Active Stake & Live Real-Time Accrued Yield Box */}
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Tu Rendimiento Acumulado en Vivo
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted bg-foreground/5 px-2 py-0.5 rounded-full">
                Streaming por Segundo
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-muted block">Ganancia Devengada:</span>
                <div className="text-3xl font-black font-mono text-emerald-400 glow-green">
                  {currency === "ARS"
                    ? formatCurrency(accruedYield * DEFAULT_RATES.USDC_TO_ARS, "ARS")
                    : currency === "XLM"
                    ? formatCurrency(accruedYield / DEFAULT_RATES.XLM_TO_USDC, "XLM")
                    : `+${accruedYield.toFixed(4)} USDC`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted block">Capital en Stake:</span>
                <span className="text-base font-bold font-mono text-foreground">
                  {currency === "ARS"
                    ? formatCurrency(stakedAmount * DEFAULT_RATES.USDC_TO_ARS, "ARS")
                    : currency === "XLM"
                    ? formatCurrency(stakedAmount / DEFAULT_RATES.XLM_TO_USDC, "XLM")
                    : `${stakedAmount.toFixed(2)} USDC`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted">
              El interés compuesto genera pagos por bloque en Soroban. Puedes retirar tus rendimientos o
              reinvertirlos cuando gustes.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Simulation Chart & Action Panels */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Simulation Chart Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-accent-teal uppercase tracking-widest font-bold block">
                  Simulación de Proyección
                </span>
                <h3 className="text-xl font-bold text-foreground">Curva de Rendimiento en el Tiempo</h3>
              </div>

              {/* Progress towards Goal */}
              <div className="text-left sm:text-right">
                <span className="text-xs text-muted block">Cumplimiento del Objetivo:</span>
                <span
                  className={`text-lg font-black font-mono ${
                    goalProgressPercent >= 100 ? "text-emerald-400" : "text-accent-teal"
                  }`}
                >
                  {goalProgressPercent}% ({formatCurrency(projectedProfit, currency)})
                </span>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative w-full overflow-hidden bg-background/50 rounded-2xl border border-border-subtle p-4">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={svgWidth - paddingX}
                  y2={paddingY}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight / 2}
                  x2={svgWidth - paddingX}
                  y2={svgHeight / 2}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  stroke="rgba(255,255,255,0.15)"
                />

                {/* Flat Initial Capital Line (without yield) */}
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY - ((initialCapital - minVal) / range) * (svgHeight - paddingY * 2)}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY - ((initialCapital - minVal) / range) * (svgHeight - paddingY * 2)}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Area under curve */}
                <polygon
                  points={`${paddingX},${svgHeight - paddingY} ${pointsSvg} ${
                    svgWidth - paddingX
                  },${svgHeight - paddingY}`}
                  fill="url(#yieldGradient)"
                />

                {/* Main Yield Projection Curve */}
                <polyline fill="none" stroke="#00F2FE" strokeWidth="3" points={pointsSvg} strokeLinecap="round" />

                {/* End Point Indicator */}
                {chartPoints.length > 0 && (
                  <circle
                    cx={svgWidth - paddingX}
                    cy={
                      svgHeight -
                      paddingY -
                      ((projectedFinalCapital - minVal) / range) * (svgHeight - paddingY * 2)
                    }
                    r="5"
                    className="fill-accent-teal stroke-background stroke-2 animate-pulse"
                  />
                )}
              </svg>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-muted pt-3 border-t border-border-subtle mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-teal"></span>
                  Con ReWork Yield ({selectedStrategyApy}% APY)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-slate-500"></span>
                  Ahorro Tradicional (0% APY)
                </span>
                <span className="text-foreground font-bold">
                  Final: {formatCurrency(projectedFinalCapital, currency)}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown in 3 Currencies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-border-subtle">
                <span className="text-[10px] text-muted uppercase font-bold block mb-1">Pesos Argentinos (ARS)</span>
                <span className="text-base font-bold font-mono text-foreground block">
                  {tripleProfit.formatted.ars}
                </span>
                <span className="text-[10px] text-muted">Ganancia Proyectada</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-border-subtle">
                <span className="text-[10px] text-muted uppercase font-bold block mb-1">Dólares (USDC)</span>
                <span className="text-base font-bold font-mono text-accent-teal block">
                  {tripleProfit.formatted.usdc}
                </span>
                <span className="text-[10px] text-muted">Ganancia Proyectada</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-foreground/5 border border-border-subtle">
                <span className="text-[10px] text-muted uppercase font-bold block mb-1">Stellar (XLM)</span>
                <span className="text-base font-bold font-mono text-indigo-400 block">
                  {tripleProfit.formatted.xlm}
                </span>
                <span className="text-[10px] text-muted">Ganancia Proyectada</span>
              </div>
            </div>
          </div>

          {/* 4 Action Cards Requested by Partner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: 📈 Obtener Rendimiento Ahorro */}
            <div
              onClick={() => setIsPoolsAgentOpen(true)}
              className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 text-accent-teal flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-accent-teal transition-colors">
                  📈 Obtener Rendimiento & Ahorro
                </h4>
                <p className="text-xs text-muted mt-1">
                  Coloca tu liquidez en vaults y pools optimizados con APY en la red de Stellar.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-accent-teal mt-4">
                <span>Explorar Pools</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: 👥 Compartir / Transferir entre Usuarios */}
            <div
              onClick={() => setIsTransferModalOpen(true)}
              className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                  👥 Compartir & Transferir P2P
                </h4>
                <p className="text-xs text-muted mt-1">
                  Transfiere fondos al instante a cualquier miembro de ReWork sin comisiones.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 mt-4">
                <span>Transferir a Usuario</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: 💸 Transferir en Pesos al Banco */}
            <div
              onClick={() => setIsBankModalOpen(true)}
              className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  💸 Transferir en Pesos al Banco
                </h4>
                <p className="text-xs text-muted mt-1">
                  Retirá tus activos convertidos a Pesos Argentinos a cualquier CBU, CVU o Alias bancario.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mt-4">
                <span>Retirar a Banco (CBU/CVU)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: 🎯 Cobrar / Pagar con QR */}
            <div
              onClick={() => setIsQrModalOpen(true)}
              className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  🎯 Cobrar & Pagar con QR
                </h4>
                <p className="text-xs text-muted mt-1">
                  Generá un código QR para cobrar o usá el lector para abonar consumos o servicios.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-400 mt-4">
                <span>Abrir Pasarela QR</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <QRPaymentsModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <BankTransferModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
      <StellarPoolsAgent isOpen={isPoolsAgentOpen} onClose={() => setIsPoolsAgentOpen(false)} />

      {/* Internal Stake Modal */}
      {isStakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card border border-border-subtle p-6 rounded-3xl bg-card shadow-2xl">
            {stakeSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">¡Objetivo Activado en Stake!</h3>
                <p className="text-xs text-muted">
                  Tus {newStakeAmount} USDC están generando {selectedStrategyApy}% APY compuesto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-teal">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Bloquear en Stake ReWork</h3>
                </div>
                <p className="text-xs text-muted">
                  Bloquea fondos durante {durationMonths} meses para garantizar la tasa de {selectedStrategyApy}% APY.
                </p>

                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Monto a Bloquear</span>
                    <span>Disponible: {usdcBalance?.toFixed(2) || "0.00"} USDC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newStakeAmount}
                      onChange={(e) => setNewStakeAmount(e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none text-foreground"
                    />
                    <span className="font-mono font-bold text-accent-teal">USDC</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-accent-teal/10 border border-accent-teal/20 text-xs flex justify-between font-mono">
                  <span className="text-muted">Rendimiento estimado:</span>
                  <span className="text-emerald-400 font-bold">
                    +{((parseFloat(newStakeAmount) || 0) * (selectedStrategyApy / 100) * (durationMonths / 12)).toFixed(2)} USDC
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsStakeModalOpen(false)}
                    className="flex-1 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExecuteStake}
                    className="flex-1 py-3 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-xl text-xs uppercase tracking-wider"
                  >
                    Confirmar Stake
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Internal P2P Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card border border-border-subtle p-6 rounded-3xl bg-card shadow-2xl">
            {transferSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">¡Transferencia P2P Exitosa!</h3>
                <p className="text-xs text-muted">
                  Se enviaron {transferAmount} USDC a {transferTarget} sin comisiones.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Transferir a Miembro de ReWork</h3>
                </div>
                <p className="text-xs text-muted">
                  Envía fondos al instante usando el correo electrónico o la clave pública de Stellar.
                </p>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Destinatario (Email o Wallet)</label>
                  <input
                    type="text"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    placeholder="mail.de.celular.2017@gmail.com o GDWVAT..."
                    className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-indigo-400 text-foreground"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Monto a Enviar</span>
                    <span>Disponible: {usdcBalance?.toFixed(2) || "0.00"} USDC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none text-foreground"
                    />
                    <span className="font-mono font-bold text-indigo-400">USDC</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="flex-1 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExecuteTransfer}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                  >
                    Enviar Transferencia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
