"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bot, TrendingUp, CheckCircle2, ChevronRight, X, Lock, RefreshCw, Zap, Globe, ExternalLink, ArrowRight } from "lucide-react";
import { useStaking, StakePosition } from "@/hooks/useStaking";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export interface DeFiPool {
  id: string;
  chain: 'solana' | 'stellar';
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  risk: "Bajo" | "Medio" | "Moderado";
  assetPair: string;
  description: string;
  badge?: string;
  explorerUrl?: string;
}

// Backward compatibility type alias
export type StellarPool = DeFiPool;

export const SOLANA_POOLS_BASE: DeFiPool[] = [
  {
    id: "sol-pool-1",
    chain: "solana",
    name: "Marinade Liquid Staking (mSOL)",
    protocol: "Marinade DAO on Solana",
    apy: 7.4,
    tvl: "$ 380M TVL",
    risk: "Bajo",
    assetPair: "SOL • mSOL",
    badge: "Solana Liquid Staking",
    description: "Staking líquido descentralizado para tesorerías de freelancers y squads. Mantiene disponibilidad inmediata para retiros operativos y pagos.",
    explorerUrl: "https://explorer.solana.com/address/MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD?cluster=devnet"
  },
  {
    id: "sol-pool-2",
    chain: "solana",
    name: "Kamino USDG / USDC Capital Vault",
    protocol: "Kamino Liquidity Vaults",
    apy: 18.2,
    tvl: "$ 124M TVL",
    risk: "Bajo",
    assetPair: "USDC • USDG",
    badge: "Kamino Vault",
    description: "Bóveda automatizada de alta eficiencia de capital para retención de fondos de proyectos y optimización de cobros de colaboradores.",
    explorerUrl: "https://explorer.solana.com/address/6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc?cluster=devnet"
  },
  {
    id: "sol-pool-3",
    chain: "solana",
    name: "Meteora Dynamic DLMM (SOL / USDC)",
    protocol: "Meteora Dynamic AMM",
    apy: 15.6,
    tvl: "$ 62M TVL",
    risk: "Medio",
    assetPair: "SOL • USDC",
    badge: "DLMM Dynamic",
    description: "Creador de mercado dinámico con comisiones adaptativas a la volatilidad. Ideal para maximizar retornos de tesorería comunitaria.",
    explorerUrl: "https://explorer.solana.com/address/LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo?cluster=devnet"
  },
  {
    id: "sol-pool-4",
    chain: "solana",
    name: "Raydium CLMM Concentrated Pool",
    protocol: "Raydium DEX",
    apy: 16.9,
    tvl: "$ 88M TVL",
    risk: "Moderado",
    assetPair: "SOL • USDC",
    badge: "CLMM Pool",
    description: "Pool concentrado de alta liquidez para swaps y liquidaciones de micropagos a colaboradores con comisiones mínimas.",
    explorerUrl: "https://explorer.solana.com/address/CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK?cluster=devnet"
  },
];

export const STELLAR_POOLS_BASE: DeFiPool[] = [
  {
    id: "pool-1",
    chain: "stellar",
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
    chain: "stellar",
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
    chain: "stellar",
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
    chain: "stellar",
    name: "Soroswap Smart Auto-Compounder",
    protocol: "Soroswap DEX",
    apy: 15.2,
    tvl: "$ 3.1M USDC",
    risk: "Moderado",
    assetPair: "Multi-Asset",
    description: "Contrato inteligente de Soroban que rebalancea automáticamente entre los pools de mayor rendimiento diario.",
  },
];

interface MultichainPoolsAgentProps {
  isOpen?: boolean;
  onClose?: () => void;
  compact?: boolean;
}

export function MultichainPoolsAgent({ isOpen, onClose, compact = false }: MultichainPoolsAgentProps) {
  const { stake, unstakePosition, stakedAmount, positions } = useStaking();
  const { usdcBalance, refresh } = useSharedBalances();
  const { connected: solConnected, usdcBalance: solUsdcBalance, connectSolana, refreshBalances: refreshSolanaBalances } = useSolanaWallet();
  const { addPoints } = useProfile();
  const { t, language } = useSettings();

  const [mounted, setMounted] = useState<boolean>(false);
  const [activeChainTab, setActiveChainTab] = useState<'solana' | 'stellar'>('solana');
  const [selectedPool, setSelectedPool] = useState<DeFiPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("50");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [unstakingId, setUnstakingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentPools = activeChainTab === 'solana' ? SOLANA_POOLS_BASE : STELLAR_POOLS_BASE;

  const handleOpenTransfer = (pool: DeFiPool) => {
    setSelectedPool(pool);
    setTransferSuccess(false);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedPool) return;
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) {
      toast.error(t.poolsAgent.errAmount || "Ingresa un monto válido mayor a 0");
      return;
    }

    setIsTransferring(true);
    try {
      if (selectedPool.chain === 'solana') {
        if (!solConnected) {
          try {
            await connectSolana();
          } catch {
            toast.error("Por favor conecta tu wallet de Solana (Phantom / Solflare).");
            setIsTransferring(false);
            return;
          }
        }
        await refreshSolanaBalances();
      }

      await stake(amount, 6, selectedPool.name, selectedPool.apy, selectedPool.chain);
      await addPoints(15, `Depósito en ${selectedPool.name}`);
      refresh();
      setTransferSuccess(true);
      toast.success(`¡Depósito asignado a ${selectedPool.name}! Rendimiento activado.`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error en la operación: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsTransferring(false);
      setTimeout(() => {
        setTransferSuccess(false);
        setSelectedPool(null);
      }, 1500);
    }
  };

  const handleUnstake = async (posId: string) => {
    setUnstakingId(posId);
    try {
      await unstakePosition(posId);
      refresh();
      toast.success("Fondos retirados del vault de rendimiento.");
    } catch (err: any) {
      toast.error("Error al retirar fondos.");
    } finally {
      setUnstakingId(null);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Agent banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-emerald-950/30 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full bg-[#0d1624] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#14F195]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                {language === 'es' ? "Bóvedas DeFi & Tesorería Multiriel" : "Multichain DeFi & Treasury Vaults"}
              </h3>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/30">
                {activeChainTab === 'solana' ? "Solana Devnet" : "Stellar Testnet"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'es'
                ? "Poné a rendir los fondos de tu Squad o adelantos de hitos mientras completás tus proyectos."
                : "Earn automated yield on your Squad treasury and milestone funds while completing deliverables."}
            </p>
          </div>
        </div>

        {/* Chain selector pills */}
        <div className="flex items-center gap-1 p-1 bg-[#090d16] rounded-xl border border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveChainTab('solana')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
              activeChainTab === 'solana'
                ? 'bg-gradient-to-r from-purple-500/30 to-emerald-500/30 text-[#14F195] border border-[#14F195]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#14F195]" />
            <span>Solana</span>
            <span className="text-[9px] bg-emerald-500/20 text-[#14F195] px-1 py-0.2 rounded font-mono">
              7-18%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChainTab('stellar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
              activeChainTab === 'stellar'
                ? 'bg-accent-teal text-background shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Stellar</span>
          </button>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentPools.map((pool) => {
          return (
            <div
              key={pool.id}
              className="p-5 rounded-2xl glass-card border border-border-subtle hover:border-[#14F195]/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                      {pool.protocol}
                    </span>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-accent-teal transition-colors flex items-center gap-1.5">
                      <span>{pool.name}</span>
                      {pool.explorerUrl && (
                        <a
                          href={pool.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-[#14F195] transition-colors"
                          title="Ver en Explorer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-400 block glow-green">
                      {pool.apy}% APY
                    </span>
                    <span className="text-[10px] text-muted">TVL: {pool.tvl}</span>
                  </div>
                </div>

                <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">{pool.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-foreground/5 border border-border-subtle text-foreground">
                    {pool.assetPair}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pool.risk === "Bajo"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : pool.risk === "Medio"
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-purple-400 bg-purple-400/10"
                    }`}
                  >
                    Riesgo {pool.risk}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenTransfer(pool)}
                  className="px-3 py-1.5 bg-accent-teal/10 hover:bg-accent-teal text-accent-teal hover:text-background font-bold text-xs rounded-xl border border-accent-teal/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'es' ? "Asignar Fondos" : "Allocate Funds"}</span>
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
              <span>{language === 'es' ? "Bóvedas Activas & Yield" : "Active Vaults & Yield"}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                {positions.length} {positions.length === 1 ? "posición" : "posiciones"}
              </span>
            </h4>
          </div>
          <div className="text-right flex items-center gap-2 sm:justify-end flex-wrap">
            <span className="text-xs text-muted">Capital en Yield:</span>
            <span className="text-xs font-mono font-black text-foreground">
              ${stakedAmount.toFixed(2)} USDC
            </span>
            <span className="text-[10px] text-muted font-mono">
              (≈ ${(stakedAmount * 1280).toLocaleString()} ARS • {(stakedAmount / 152.5).toFixed(3)} SOL)
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
                        {pos.chain === 'solana' ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-[#14F195] border border-[#14F195]/30">
                            ⚡ Solana
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal border border-accent-teal/30">
                            🌐 Stellar
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">
                          +{pos.apy}% APY
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted mt-1 font-mono">
                        <span>Capital: <strong className="text-foreground">${pos.amount.toFixed(2)} USDC</strong></span>
                        <span>•</span>
                        <span>ARS: <strong className="text-muted font-normal">${(pos.amount * 1280).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          Rendimiento: <strong className="text-emerald-300 font-bold">+{posYield.toFixed(4)} USDC</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => handleUnstake(pos.id)}
                      disabled={unstakingId === pos.id}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {unstakingId === pos.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Retirando...</span>
                        </>
                      ) : (
                        <span>Liberar Fondos</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border-subtle bg-foreground/[0.02] text-center text-xs text-muted">
            {language === 'es' ? "No tienes asignaciones activas en bóvedas de rendimiento." : "No active yield vault positions."}
          </div>
        )}
      </div>

      {/* Transfer Modal overlay */}
      {selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-card border border-border-subtle p-6 rounded-3xl bg-[#0d1624] shadow-2xl">
            <button
              onClick={() => setSelectedPool(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {transferSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">
                  {language === 'es' ? "¡Asignación Confirmada!" : "Deposit Confirmed!"}
                </h3>
                <p className="text-xs text-muted">
                  Se asignaron {stakeAmount} USDC al vault {selectedPool.name} al {selectedPool.apy}% APY anual.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-teal mb-1">
                  <Lock className="w-5 h-5 text-accent-teal" />
                  <h3 className="font-bold text-base">Asignar Fondos a Bóveda</h3>
                </div>
                <p className="text-xs text-slate-300">
                  {selectedPool.name} • {selectedPool.protocol}
                </p>

                {selectedPool.chain === 'solana' ? (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#14F195] shrink-0" />
                    <span>
                      Riel de Alta Velocidad Solana Devnet. Finalidad de ~400ms y gas patrocinado.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent-teal shrink-0" />
                    <span>Riel Stellar Testnet. Liquidación en Soroban.</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Monto a Asignar</span>
                    <span>
                      Disponible: {((usdcBalance || 0) + (solUsdcBalance || 0)).toFixed(2)} USDC
                    </span>
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
                  <span>Rendimiento Estimado:</span>
                  <span className="font-bold">+{selectedPool.apy}% Anual</span>
                </div>

                <button
                  onClick={handleConfirmTransfer}
                  disabled={isTransferring || parseFloat(stakeAmount) <= 0}
                  className="w-full py-3.5 bg-gradient-to-r from-accent-teal to-emerald-400 hover:opacity-95 text-black font-bold rounded-2xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isTransferring ? "Procesando..." : "Confirmar Asignación a Bóveda"}
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
            className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/15 border border-border-subtle transition-all z-20 cursor-pointer"
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

// Backward-compatible alias export so all existing imports of StellarPoolsAgent keep working!
export const StellarPoolsAgent = MultichainPoolsAgent;
