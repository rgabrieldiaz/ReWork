"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  X,
  Lock,
  RefreshCw,
  Zap,
  Globe,
  ExternalLink,
  Sprout,
  Filter,
} from "lucide-react";
import { useStaking } from "@/hooks/useStaking";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { fetchCeloYieldPools, type CeloDeFiLlamaPool } from "@/lib/defillama";
import { toast } from "sonner";

export interface DeFiPool {
  id: string;
  chain: "solana" | "stellar" | "celo";
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  risk: "Bajo" | "Medio" | "Moderado" | "Alto";
  assetPair: string;
  description: string;
  badge?: string;
  explorerUrl?: string;
}

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
    description:
      "Staking líquido descentralizado para tesorerías de freelancers y squads. Mantiene disponibilidad inmediata para retiros operativos y pagos.",
    explorerUrl:
      "https://explorer.solana.com/address/MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD?cluster=devnet",
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
    description:
      "Bóveda automatizada de alta eficiencia de capital para retención de fondos de proyectos y optimización de cobros de colaboradores.",
    explorerUrl:
      "https://explorer.solana.com/address/6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc?cluster=devnet",
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
    description:
      "Creador de mercado dinámico con comisiones adaptativas a la volatilidad. Ideal para maximizar retornos de tesorería comunitaria.",
    explorerUrl:
      "https://explorer.solana.com/address/LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo?cluster=devnet",
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
    description:
      "Pool concentrado de alta liquidez para swaps y liquidaciones de micropagos a colaboradores con comisiones mínimas.",
    explorerUrl:
      "https://explorer.solana.com/address/CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK?cluster=devnet",
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
    description:
      "Pool de liquidez descentralizado en el libro de órdenes nativo de Stellar con comisiones automáticas.",
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
    description:
      "Rendimiento respaldado por Bonos del Tesoro de EE.UU. tokenizados sobre Stellar. Máxima seguridad institucional.",
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
    description:
      "Liquidez cambiaria local para el corredor Argentina-Global. Alto volumen transaccional y comisiones elevadas.",
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
    description:
      "Contrato inteligente de Soroban que rebalancea automáticamente entre los pools de mayor rendimiento diario.",
  },
];

interface MultichainPoolsAgentProps {
  isOpen?: boolean;
  onClose?: () => void;
  compact?: boolean;
}

export function MultichainPoolsAgent({
  isOpen,
  onClose,
  compact = false,
}: MultichainPoolsAgentProps) {
  const { stake, unstakePosition, stakedAmount, positions } = useStaking();
  const { usdcBalance, refresh } = useSharedBalances();
  const {
    connected: solConnected,
    usdcBalance: solUsdcBalance,
    connectSolana,
    refreshBalances: refreshSolanaBalances,
  } = useSolanaWallet();
  const { totalUsdValue: celoTotalUsd } = useCeloWallet();
  const { addPoints } = useProfile();
  const { t, language } = useSettings();

  const [mounted, setMounted] = useState<boolean>(false);
  const [activeChainTab, setActiveChainTab] = useState<
    "celo" | "solana" | "stellar"
  >("celo");
  const [selectedPool, setSelectedPool] = useState<DeFiPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("50");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [unstakingId, setUnstakingId] = useState<string | null>(null);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState<boolean>(false);

  // DeFiLlama Live Celo Pools state
  const [celoLlamaPools, setCeloLlamaPools] = useState<CeloDeFiLlamaPool[]>([]);
  const [loadingLlama, setLoadingLlama] = useState<boolean>(false);
  const [llamaFetchedAt, setLlamaFetchedAt] = useState<string>("");
  const [celoSortBy, setCeloSortBy] = useState<"tvl" | "apy">("tvl");
  const [celoFilterStableOnly, setCeloFilterStableOnly] =
    useState<boolean>(false);

  const loadLiveCeloPools = async (force = false) => {
    setLoadingLlama(true);
    try {
      const res = await fetchCeloYieldPools({
        forceRefresh: force,
        minTvlUsd: 5_000,
      });
      setCeloLlamaPools(res.pools);
      setLlamaFetchedAt(res.fetchedAt);
    } catch (err) {
      console.warn("[DeFiLlama Celo] Error loading live pools:", err);
    } finally {
      setLoadingLlama(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadLiveCeloPools(false);
  }, []);

  const mappedCeloPools: DeFiPool[] = celoLlamaPools
    .filter((p) => (celoFilterStableOnly ? p.stablecoin : true))
    .sort((a, b) => (celoSortBy === "apy" ? b.apy - a.apy : b.tvlUsd - a.tvlUsd))
    .slice(0, 8)
    .map((p) => ({
      id: p.poolId,
      chain: "celo",
      name: `${p.project.toUpperCase()} (${p.symbol})`,
      protocol: `${p.project} on Celo Mainnet · DeFiLlama Live`,
      apy: Number(p.apy.toFixed(2)),
      tvl: `$ ${(p.tvlUsd / 1000).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}K USD`,
      risk: p.riskLevel,
      assetPair: p.symbol,
      description: p.riskReason,
      explorerUrl: p.url,
    }));

  const currentPools =
    activeChainTab === "celo"
      ? mappedCeloPools
      : activeChainTab === "solana"
      ? SOLANA_POOLS_BASE
      : STELLAR_POOLS_BASE;

  const handleOpenTransfer = (pool: DeFiPool) => {
    setSelectedPool(pool);
    setTransferSuccess(false);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedPool) return;
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) {
      toast.error(
        t.poolsAgent.errAmount || "Ingresa un monto válido mayor a 0"
      );
      return;
    }

    setIsTransferring(true);
    try {
      if (selectedPool.chain === "solana") {
        if (!solConnected) {
          try {
            await connectSolana();
          } catch {
            toast.error(
              "Por favor conecta tu wallet de Solana (Phantom / Solflare)."
            );
            setIsTransferring(false);
            return;
          }
        }
        await refreshSolanaBalances();
      }

      await stake(
        amount,
        6,
        selectedPool.name,
        selectedPool.apy,
        selectedPool.chain
      );
      await addPoints(15, `Depósito en ${selectedPool.name}`);
      refresh();
      setTransferSuccess(true);
      toast.success(
        `¡Depósito asignado a ${selectedPool.name}! Rendimiento activado.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        `Error en la operación: ${err.message || "Error desconocido"}`
      );
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
    } catch {
      toast.error("Error al retirar fondos.");
    } finally {
      setUnstakingId(null);
    }
  };

  const transferModalOverlay = selectedPool && (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md border border-border-subtle p-6 rounded-xl bg-card shadow-2xl">
        <button
          onClick={() => setSelectedPool(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {transferSuccess ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-accent-teal/15 text-accent-teal flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {language === "es" ? "Asignación Confirmada" : "Deposit Confirmed"}
            </h3>
            <p className="text-xs text-muted">
              Se asignaron {stakeAmount} USD a {selectedPool.name} ({selectedPool.apy}% APY).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <Lock className="w-4 h-4 text-accent-teal" />
              <h3 className="font-semibold text-base">Asignar Fondos a Bóveda</h3>
            </div>
            <p className="text-xs text-muted">
              {selectedPool.name} • {selectedPool.protocol}
            </p>

            <div className="p-3 rounded-lg bg-foreground/[0.03] border border-border-subtle text-xs text-muted flex items-center gap-2">
              {selectedPool.chain === "celo" ? (
                <>
                  <Sprout className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Celo Mainnet (42220) · Pool verificado vía DeFiLlama</span>
                </>
              ) : selectedPool.chain === "solana" ? (
                <>
                  <Zap className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Solana Devnet · Liquidación de alta velocidad (~400ms)</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-accent-teal shrink-0" />
                  <span>Stellar Testnet · Liquidación en Soroban</span>
                </>
              )}
            </div>

            <div className="p-4 rounded-xl bg-background border border-border-subtle space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Monto a asignar</span>
                <span className="font-mono">
                  Disp: {((usdcBalance || 0) + (solUsdcBalance || 0) + (celoTotalUsd || 0)).toFixed(2)} USD
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
                <span className="font-mono text-xs font-bold text-muted">USD</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-accent-teal/10 border border-accent-teal/20 text-xs flex justify-between items-center text-accent-teal font-mono">
              <span>Rendimiento estimado</span>
              <span className="font-bold">+{selectedPool.apy}% APY</span>
            </div>

            <button
              onClick={handleConfirmTransfer}
              disabled={isTransferring || parseFloat(stakeAmount) <= 0}
              className="w-full py-2.5 bg-accent-teal hover:bg-accent-teal/90 text-slate-950 font-semibold rounded-lg text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isTransferring ? "Procesando..." : "Confirmar Asignación"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const content = (
    <div className="space-y-5 min-w-0">
      {/* Header & Chain Selector */}
      <div className="p-4 rounded-xl bg-foreground/[0.02] border border-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-accent-teal" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">
                {language === "es" ? "Rendimientos DeFi" : "DeFi Yield Vaults"}
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-foreground/5 text-muted border border-border-subtle">
                {activeChainTab === "celo"
                  ? "Celo Mainnet"
                  : activeChainTab === "solana"
                  ? "Solana Devnet"
                  : "Stellar"}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 truncate">
              Bóvedas de liquidez verificadas para tesorerías y fondos en garantía.
            </p>
          </div>
        </div>

        {/* Chain selector pills */}
        <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveChainTab("celo")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeChainTab === "celo"
                ? "bg-accent-teal text-slate-950 font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Celo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChainTab("solana")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeChainTab === "solana"
                ? "bg-accent-teal text-slate-950 font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Solana</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChainTab("stellar")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeChainTab === "stellar"
                ? "bg-accent-teal text-slate-950 font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Stellar</span>
          </button>
        </div>
      </div>

      {/* Celo DeFiLlama Controls Bar */}
      {activeChainTab === "celo" && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-foreground/[0.02] border border-border-subtle text-xs">
          <span className="text-muted flex items-center gap-1.5 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-accent-teal" />
            <span>DeFiLlama Live ({celoLlamaPools.length} pools activos en Celo)</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCeloFilterStableOnly(!celoFilterStableOnly)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] border transition-colors ${
                celoFilterStableOnly
                  ? "bg-accent-teal/15 border-accent-teal/40 text-accent-teal"
                  : "bg-background border-border-subtle text-muted hover:text-foreground"
              }`}
            >
              Solo Stables
            </button>
            <select
              value={celoSortBy}
              onChange={(e) => setCeloSortBy(e.target.value as "tvl" | "apy")}
              className="px-2.5 py-1 rounded-md bg-background border border-border-subtle text-[11px] text-foreground font-mono outline-none"
            >
              <option value="tvl">Mayor TVL</option>
              <option value="apy">Mayor APY</option>
            </select>
            <button
              onClick={() => loadLiveCeloPools(true)}
              disabled={loadingLlama}
              className="p-1.5 rounded-md bg-background border border-border-subtle text-muted hover:text-foreground"
              title="Actualizar desde DeFiLlama"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLlama ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Pools Grid */}
      {activeChainTab === "celo" && loadingLlama && currentPools.length === 0 ? (
        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border-subtle text-center text-xs text-muted">
          Consultando pools en Celo Mainnet desde DeFiLlama...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {currentPools.map((pool) => (
            <div
              key={pool.id}
              className="p-4 rounded-xl bg-card border border-border-subtle hover:border-foreground/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-muted block truncate">
                      {pool.protocol}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="truncate">{pool.name}</span>
                      {pool.explorerUrl && (
                        <a
                          href={pool.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-accent-teal transition-colors shrink-0"
                          title="Ver en explorador"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold font-mono text-accent-teal block">
                      +{pool.apy}% APY
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      TVL {pool.tvl}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
                  {pool.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/5 border border-border-subtle text-foreground">
                    {pool.assetPair}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/5 text-muted">
                    Riesgo {pool.risk}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenTransfer(pool)}
                  className="px-3 py-1.5 bg-accent-teal/10 hover:bg-accent-teal text-accent-teal hover:text-slate-950 font-semibold text-xs rounded-lg border border-accent-teal/25 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === "es" ? "Asignar" : "Allocate"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Positions */}
      <div className="pt-4 border-t border-border-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-teal"></span>
            <h4 className="text-xs font-semibold text-foreground">
              {language === "es" ? "Bóvedas Activas" : "Active Vaults"} ({positions.length})
            </h4>
          </div>
          <div className="text-xs font-mono text-muted">
            Capital activo:{" "}
            <strong className="text-foreground">${stakedAmount.toFixed(2)} USD</strong>
          </div>
        </div>

        {positions.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {positions.map((pos) => {
              const diffMs = Math.max(0, Date.now() - new Date(pos.startDate).getTime());
              const posYield =
                pos.amount * (pos.apy / 100) * (diffMs / (365 * 24 * 3600 * 1000)) + 0.012;
              return (
                <div
                  key={pos.id}
                  className="p-3 rounded-xl bg-foreground/[0.02] border border-border-subtle flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-accent-teal/10 text-accent-teal flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {pos.poolName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-teal/10 text-accent-teal">
                          +{pos.apy}% APY
                        </span>
                      </div>
                      <div className="text-[11px] text-muted font-mono mt-0.5">
                        ${pos.amount.toFixed(2)} USD • Rendimiento:{" "}
                        <span className="text-accent-teal">+${posYield.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnstake(pos.id)}
                    disabled={unstakingId === pos.id}
                    className="px-2.5 py-1 bg-foreground/5 hover:bg-red-500/15 text-muted hover:text-red-300 border border-border-subtle rounded-lg text-xs font-medium transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {unstakingId === pos.id ? "Retirando..." : "Retirar"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border-subtle text-center text-xs text-muted">
            {language === "es"
              ? "Sin posiciones activas en bóvedas de rendimiento."
              : "No active yield vault positions."}
          </div>
        )}
      </div>

      {transferModalOverlay}
    </div>
  );

  if (compact) {
    const compactPools = currentPools.slice(0, 3);
    return (
      <div className="glass-card p-5 border border-border-subtle space-y-4 min-w-0 overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="w-4 h-4 text-accent-teal shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {language === "es" ? "Rendimientos DeFi" : "DeFi Yield"}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted shrink-0">
            {activeChainTab === "celo"
              ? `${celoLlamaPools.length || 8} pools`
              : `${currentPools.length} pools`}
          </span>
        </div>

        {/* Full-width 3-column Chain Tabs (Zero horizontal overflow) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-background rounded-lg border border-border-subtle w-full">
          <button
            type="button"
            onClick={() => setActiveChainTab("celo")}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all truncate ${
              activeChainTab === "celo"
                ? "bg-card text-foreground border border-border-subtle shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Sprout className="w-3 h-3 text-accent-teal shrink-0" />
            <span className="truncate">Celo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChainTab("solana")}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all truncate ${
              activeChainTab === "solana"
                ? "bg-card text-foreground border border-border-subtle shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Zap className="w-3 h-3 text-accent-teal shrink-0" />
            <span className="truncate">Solana</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChainTab("stellar")}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all truncate ${
              activeChainTab === "stellar"
                ? "bg-card text-foreground border border-border-subtle shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Globe className="w-3 h-3 text-accent-teal shrink-0" />
            <span className="truncate">Stellar</span>
          </button>
        </div>

        {/* Compact Celo Filter Row */}
        {activeChainTab === "celo" && (
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setCeloFilterStableOnly(!celoFilterStableOnly)}
              className={`px-2 py-1 rounded-md font-mono border transition-colors ${
                celoFilterStableOnly
                  ? "bg-accent-teal/15 border-accent-teal/40 text-accent-teal"
                  : "bg-background border-border-subtle text-muted hover:text-foreground"
              }`}
            >
              Solo Stables
            </button>
            <div className="flex items-center gap-1.5">
              <select
                value={celoSortBy}
                onChange={(e) => setCeloSortBy(e.target.value as "tvl" | "apy")}
                className="px-2 py-1 rounded-md bg-background border border-border-subtle text-[11px] text-foreground font-mono outline-none"
              >
                <option value="tvl">Mayor TVL</option>
                <option value="apy">Mayor APY</option>
              </select>
              <button
                type="button"
                onClick={() => loadLiveCeloPools(true)}
                disabled={loadingLlama}
                className="p-1 rounded-md bg-background border border-border-subtle text-muted hover:text-foreground"
                title="Actualizar pools"
              >
                <RefreshCw className={`w-3 h-3 ${loadingLlama ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        )}

        {/* Single-Column Compact Pool List (Top 3) */}
        <div className="space-y-2">
          {activeChainTab === "celo" && loadingLlama && compactPools.length === 0 ? (
            <div className="p-4 rounded-lg bg-background border border-border-subtle text-center text-xs text-muted">
              Cargando pools de Celo Mainnet...
            </div>
          ) : (
            compactPools.map((pool) => (
              <div
                key={pool.id}
                className="p-3 rounded-lg bg-background/70 border border-border-subtle hover:border-foreground/20 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {pool.name}
                    </p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-muted shrink-0">
                      {pool.assetPair}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted truncate mt-0.5">
                    TVL {pool.tvl} • Riesgo {pool.risk}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-accent-teal block">
                      +{pool.apy}%
                    </span>
                    <span className="text-[9px] font-mono text-muted uppercase">APY</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenTransfer(pool)}
                    className="px-2.5 py-1.5 rounded-md bg-accent-teal/10 hover:bg-accent-teal text-accent-teal hover:text-slate-950 border border-accent-teal/25 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    Asignar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compact Active Vaults Summary */}
        {positions.length > 0 && (
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted font-medium">
                Bóvedas activas ({positions.length})
              </span>
              <span className="font-mono font-semibold text-foreground">
                ${stakedAmount.toFixed(2)} USD
              </span>
            </div>
            <div className="space-y-1.5">
              {positions.slice(0, 2).map((pos) => (
                <div
                  key={pos.id}
                  className="px-2.5 py-2 rounded-lg bg-foreground/[0.02] border border-border-subtle flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 truncate">
                    <span className="font-medium text-foreground truncate">{pos.poolName}</span>
                    <span className="text-muted font-mono ml-1.5">${pos.amount.toFixed(0)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnstake(pos.id)}
                    disabled={unstakingId === pos.id}
                    className="text-[11px] font-mono text-muted hover:text-red-300 shrink-0 cursor-pointer"
                  >
                    {unstakingId === pos.id ? "..." : "Retirar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Button to expand all pools */}
        <button
          type="button"
          onClick={() => setIsExpandedModalOpen(true)}
          className="w-full py-2 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-border-subtle text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Explorar todas las bóvedas y métricas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {transferModalOverlay}

        {isExpandedModalOpen &&
          mounted &&
          createPortal(
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsExpandedModalOpen(false);
              }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto custom-scrollbar"
            >
              <div className="relative w-full max-w-3xl border border-border-subtle p-6 rounded-xl bg-card text-foreground shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
                <button
                  onClick={() => setIsExpandedModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground bg-foreground/5 border border-border-subtle transition-all z-20 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                {content}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  if (isOpen !== undefined) {
    if (!isOpen || !mounted) return null;
    return createPortal(
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto custom-scrollbar"
      >
        <div className="relative w-full max-w-3xl border border-border-subtle p-6 rounded-xl bg-card text-foreground shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground bg-foreground/5 border border-border-subtle transition-all z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return content;
}

export const StellarPoolsAgent = MultichainPoolsAgent;
