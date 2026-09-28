"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bot, TrendingUp, CheckCircle2, ChevronRight, X, Lock, RefreshCw } from "lucide-react";
import { useStaking } from "@/hooks/useStaking";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export interface StellarPool {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  risk: "Bajo" | "Medio" | "Moderado";
  assetPair: string;
  description: string;
}

const STELLAR_POOLS_BASE: StellarPool[] = [
  {
    id: "pool-1",
    name: "Stellar AMM Nativo (USDC / XLM)",
    protocol: "Stellar Core Protocol 20+",
    apy: 12.8,
    tvl: "$ 4.8M USDC",
    risk: "Bajo",
    assetPair: "USDC • XLM",
    description: "Pool de liquidez descentralizado en el libro de órdenes nativo de Stellar con comisiones automáticas.",
  },
  {
    id: "pool-2",
    name: "RWA Real-World Yield Vault",
    protocol: "Franklin Templeton / Ondo on Stellar",
    apy: 8.5,
    tvl: "$ 18.2M USDC",
    risk: "Bajo",
    assetPair: "USDC • T-Bills",
    description: "Rendimiento respaldado por Bonos del Tesoro de EE.UU. tokenizados sobre Stellar. Máxima seguridad institucional.",
  },
  {
    id: "pool-3",
    name: "Pool Pesos Argentinos (ARST / USDC)",
    protocol: "Anclap Stellar Gateway",
    apy: 19.5,
    tvl: "$ 1.2M USD",
    risk: "Medio",
    assetPair: "ARST • USDC",
    description: "Liquidez cambiaria local para el corredor Argentina-Global. Alto volumen transaccional y comisiones elevadas.",
  },
  {
    id: "pool-4",
    name: "Soroswap Smart Auto-Compounder",
    protocol: "Soroswap DEX",
    apy: 15.2,
    tvl: "$ 3.1M USDC",
    risk: "Moderado",
    assetPair: "Multi-Asset",
    description: "Contrato inteligente de Soroban que rebalancea automáticamente entre los pools de mayor rendimiento diario.",
  },
];

interface StellarPoolsAgentProps {
  isOpen?: boolean;
  onClose?: () => void;
  compact?: boolean;
}

export function StellarPoolsAgent({ isOpen, onClose, compact = false }: StellarPoolsAgentProps) {
  const { stake, unstakePosition, stakedAmount, positions } = useStaking();
  const { usdcBalance, refresh } = useSharedBalances();
  const { t, language } = useSettings();

  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<StellarPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("50");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [unstakingId, setUnstakingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPoolLocalized = (basePool: StellarPool) => {
    if (basePool.id === "pool-1") {
      return {
        ...basePool,
        name: language === "en" ? "Stellar Native AMM (USDC / XLM)" : "Stellar AMM Nativo (USDC / XLM)",
        description: t.poolsAgent.pool1Desc,
        riskLabel: t.poolsAgent.riskLow,
        riskType: "low" as const,
      };
    }
    if (basePool.id === "pool-2") {
      return {
        ...basePool,
        name: "RWA Real-World Yield Vault",
        description: t.poolsAgent.pool2Desc,
        riskLabel: t.poolsAgent.riskLow,
        riskType: "low" as const,
      };
    }
    if (basePool.id === "pool-3") {
      return {
        ...basePool,
        name: language === "en" ? "Argentine Pesos Pool (ARST / USDC)" : "Pool Pesos Argentinos (ARST / USDC)",
        description: t.poolsAgent.pool3Desc,
        riskLabel: t.poolsAgent.riskMedium,
        riskType: "medium" as const,
      };
    }
    return {
      ...basePool,
      name: "Soroswap Smart Auto-Compounder",
      description: t.poolsAgent.pool4Desc,
      riskLabel: t.poolsAgent.riskModerate,
      riskType: "moderate" as const,
    };
  };

  const handleOpenTransfer = (pool: StellarPool) => {
    setSelectedPool(pool);
    setTransferSuccess(false);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedPool) return;
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) {
      toast.error(t.poolsAgent.errAmount);
      return;
    }

    const localizedPool = getPoolLocalized(selectedPool);

    setIsTransferring(true);
    setTimeout(async () => {
      await stake(amount, 6, localizedPool.name, selectedPool.apy);
      setIsTransferring(false);
      setTransferSuccess(true);
      refresh();
      setTimeout(() => {
        setTransferSuccess(false);
        setSelectedPool(null);
      }, 1500);
    }, 1200);
  };

  const handleUnstake = async (posId: string) => {
    setUnstakingId(posId);
    setTimeout(async () => {
      await unstakePosition(posId);
      setUnstakingId(null);
      refresh();
    }, 800);
  };

  const selectedLocalized = selectedPool ? getPoolLocalized(selectedPool) : null;

  const content = (
    <div className="space-y-6">
      {/* Agent banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-teal/15 via-indigo-500/10 to-transparent border border-accent-teal/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-teal/20 text-accent-teal flex items-center justify-center border border-accent-teal/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{t.poolsAgent.title}</h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                {t.poolsAgent.badge}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t.poolsAgent.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Pools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STELLAR_POOLS_BASE.map((basePool) => {
          const pool = getPoolLocalized(basePool);
          return (
            <div
              key={pool.id}
              className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-accent-teal/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                      {pool.protocol}
                    </span>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-accent-teal transition-colors">
                      {pool.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-400 block glow-green">
                      {pool.apy}% APY
                    </span>
                    <span className="text-[10px] text-muted">TVL: {pool.tvl}</span>
                  </div>
                </div>

                <p className="text-xs text-muted line-clamp-2 mb-4">{pool.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-foreground/5 border border-border-subtle text-foreground">
                    {pool.assetPair}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pool.riskType === "low"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : pool.riskType === "medium"
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-purple-400 bg-purple-400/10"
                    }`}
                  >
                    {t.poolsAgent.riskLabel} {pool.riskLabel}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenTransfer(basePool)}
                  className="px-3 py-1.5 bg-accent-teal/10 hover:bg-accent-teal text-accent-teal hover:text-background font-bold text-xs rounded-xl border border-accent-teal/30 transition-all flex items-center gap-1"
                >
                  {t.poolsAgent.moveLiquidityBtn}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Positions in Pools & Farming */}
      <div className="pt-4 border-t border-border-subtle/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>{t.poolsAgent.activeFarmingTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                {positions.length} {positions.length === 1 ? t.poolsAgent.depositSingle : t.poolsAgent.depositPlural}
              </span>
            </h4>
          </div>
          <div className="text-right flex items-center gap-2 sm:justify-end">
            <span className="text-xs text-muted">{t.poolsAgent.totalInYield}</span>
            <span className="text-xs font-mono font-black text-foreground">
              ${stakedAmount.toFixed(2)} USDC
            </span>
            <span className="text-[10px] text-muted font-mono">
              (≈ ${(stakedAmount * 1280).toLocaleString()} ARS)
            </span>
          </div>
        </div>

        {positions.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {positions.map((pos) => {
              const diffMs = Math.max(0, Date.now() - new Date(pos.startDate).getTime());
              const posYield = (pos.amount * (pos.apy / 100) * (diffMs / (365 * 24 * 3600 * 1000))) + 0.012;
              return (
                <div
                  key={pos.id}
                  className="p-3.5 rounded-2xl bg-foreground/[0.04] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-foreground">{pos.poolName}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">
                          +{pos.apy}% APY
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted mt-1 font-mono">
                        <span>{t.poolsAgent.capital} <strong className="text-foreground">${pos.amount.toFixed(2)} USDC</strong></span>
                        <span>•</span>
                        <span>ARS: <strong className="text-muted font-normal">${(pos.amount * 1280).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {t.poolsAgent.yieldLabel} <strong className="text-emerald-300 font-bold">+{posYield.toFixed(4)} USDC</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => handleUnstake(pos.id)}
                      disabled={unstakingId === pos.id}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {unstakingId === pos.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.poolsAgent.unstaking}</span>
                        </>
                      ) : (
                        <span>{t.poolsAgent.unstakeFunds}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border-subtle bg-foreground/[0.02] text-center text-xs text-muted">
            {t.poolsAgent.noPositions}
          </div>
        )}
      </div>

      {/* Transfer Modal overlay */}
      {selectedPool && selectedLocalized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-card border border-border-subtle p-6 rounded-3xl bg-card shadow-2xl">
            <button
              onClick={() => setSelectedPool(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {transferSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">{t.poolsAgent.successTitle}</h3>
                <p className="text-xs text-muted">
                  {t.poolsAgent.successDesc
                    .replace("{amount}", stakeAmount)
                    .replace("{apy}", selectedPool.apy.toString())
                    .replace("{name}", selectedLocalized.name)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-teal mb-1">
                  <Lock className="w-5 h-5" />
                  <h3 className="font-bold text-base">{t.poolsAgent.modalTitle.replace("{name}", selectedLocalized.name)}</h3>
                </div>
                <p className="text-xs text-muted">
                  {t.poolsAgent.modalSubtitle}
                </p>

                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{t.poolsAgent.amountLabel}</span>
                    <span>{t.poolsAgent.available} {usdcBalance?.toFixed(2) || "0.00"} USDC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none text-foreground"
                    />
                    <span className="font-mono font-bold text-accent-teal">USDC</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center text-emerald-400 font-mono">
                  <span>{t.poolsAgent.projectedYield}</span>
                  <span className="font-bold">+{selectedPool.apy}% {t.poolsAgent.annual}</span>
                </div>

                <button
                  onClick={handleConfirmTransfer}
                  disabled={isTransferring || parseFloat(stakeAmount) <= 0}
                  className="w-full py-3.5 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isTransferring ? t.poolsAgent.approving : t.poolsAgent.confirmDeposit}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  if (isOpen !== undefined) {
    if (!isOpen || !mounted) return null;
    return createPortal(
      <div 
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar"
      >
        <div className="relative w-full max-w-3xl border border-border-subtle p-6 rounded-3xl bg-[#0d1624] text-foreground shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/15 border border-border-subtle transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return content;
}
