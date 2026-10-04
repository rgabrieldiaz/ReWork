"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SupportedCurrency, convertCurrency, formatCurrency, getTripleValues } from "@/lib/currency";

export interface StakePosition {
  id: string;
  amount: number; // in USDC base
  currency: SupportedCurrency;
  apy: number; // e.g. 12.5%
  startDate: string;
  durationMonths: number;
  poolName: string;
  chain?: 'solana' | 'stellar';
}

interface StakingContextType {
  stakedAmount: number; // total USDC staked
  activeApy: number; // average APY %
  accruedYield: number; // total USDC earned yield
  activeCurrency: SupportedCurrency;
  setActiveCurrency: (curr: SupportedCurrency) => void;
  stake: (amount: number, durationMonths?: number, poolName?: string, apy?: number, chain?: 'solana' | 'stellar') => Promise<boolean>;
  unstake: (amount: number) => Promise<boolean>;
  unstakePosition: (positionId: string) => Promise<boolean>;
  positions: StakePosition[];
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

const DEFAULT_POSITIONS: StakePosition[] = [
  {
    id: "stake-pos-sol-1",
    amount: 150,
    currency: "USDC",
    apy: 18.2,
    chain: "solana",
    startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    durationMonths: 6,
    poolName: "Kamino USDG / USDC Capital Vault",
  },
  {
    id: "stake-pos-1",
    amount: 50,
    currency: "USDC",
    apy: 12.8,
    chain: "stellar",
    startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    durationMonths: 6,
    poolName: "Stellar AMM Nativo (USDC / XLM)",
  },
  {
    id: "stake-pos-2",
    amount: 25,
    currency: "USDC",
    apy: 8.5,
    chain: "stellar",
    startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    durationMonths: 12,
    poolName: "RWA Real-World Yield Vault",
  },
];

export function StakingProvider({ children }: { children: ReactNode }) {
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>("USDC");
  const [stakedAmount, setStakedAmount] = useState<number>(75);
  const [activeApy, setActiveApy] = useState<number>(12.8);
  const [accruedYield, setAccruedYield] = useState<number>(3.42);
  const [positions, setPositions] = useState<StakePosition[]>(DEFAULT_POSITIONS);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("rework_staked_amount");
    if (saved) {
      setStakedAmount(parseFloat(saved));
    }
    const savedYield = localStorage.getItem("rework_accrued_yield");
    if (savedYield) {
      setAccruedYield(parseFloat(savedYield));
    }
    const savedPositions = localStorage.getItem("rework_staked_positions");
    if (savedPositions) {
      try {
        const parsed = JSON.parse(savedPositions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPositions(parsed);
          const totalFromPos = parsed.reduce((acc, p) => acc + (p.amount || 0), 0);
          setStakedAmount(totalFromPos);
        }
      } catch (e) {
        console.error("Error parsing saved positions", e);
      }
    }
  }, []);

  // Calculate weighted average APY from positions
  useEffect(() => {
    if (positions.length === 0) {
      setActiveApy(12.8);
      return;
    }
    const totalAmount = positions.reduce((acc, p) => acc + (p.amount || 0), 0);
    if (totalAmount <= 0) {
      setActiveApy(12.8);
      return;
    }
    const weighted = positions.reduce((acc, p) => acc + (p.amount * (p.apy || 12.8)), 0) / totalAmount;
    setActiveApy(Number(weighted.toFixed(1)));
  }, [positions]);

  // Real-time ticking yield generator (simulates live DeFi interest stream)
  useEffect(() => {
    if (stakedAmount <= 0) return;

    const interval = setInterval(() => {
      // Yield accrued per second: (Principal * (APY / 100)) / (365 * 24 * 3600)
      const yieldPerSec = (stakedAmount * (activeApy / 100)) / 31536000;
      setAccruedYield((prev) => {
        const next = prev + yieldPerSec;
        localStorage.setItem("rework_accrued_yield", next.toFixed(6));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stakedAmount, activeApy]);

  const stake = async (
    amount: number,
    durationMonths: number = 3,
    poolName: string = "Solana Yield Vault",
    poolApy: number = 18.2,
    chain: 'solana' | 'stellar' = 'solana'
  ) => {
    if (amount <= 0) return false;
    const newTotal = stakedAmount + amount;
    setStakedAmount(newTotal);
    localStorage.setItem("rework_staked_amount", newTotal.toString());

    const newPos: StakePosition = {
      id: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount,
      currency: "USDC",
      apy: poolApy || activeApy,
      startDate: new Date().toISOString(),
      durationMonths,
      poolName,
      chain,
    };
    const updatedPositions = [newPos, ...positions];
    setPositions(updatedPositions);
    localStorage.setItem("rework_staked_positions", JSON.stringify(updatedPositions));
    return true;
  };

  const unstake = async (amount: number) => {
    if (amount <= 0 || amount > stakedAmount) return false;
    const newTotal = Math.max(0, stakedAmount - amount);
    setStakedAmount(newTotal);
    localStorage.setItem("rework_staked_amount", newTotal.toString());
    return true;
  };

  const unstakePosition = async (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return false;

    const newPositions = positions.filter((p) => p.id !== positionId);
    const newTotal = Math.max(0, stakedAmount - pos.amount);
    setPositions(newPositions);
    setStakedAmount(newTotal);
    localStorage.setItem("rework_staked_amount", newTotal.toString());
    localStorage.setItem("rework_staked_positions", JSON.stringify(newPositions));
    return true;
  };

  return (
    <StakingContext.Provider
      value={{
        stakedAmount,
        activeApy,
        accruedYield,
        activeCurrency,
        setActiveCurrency,
        stake,
        unstake,
        unstakePosition,
        positions,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}

export function useStaking() {
  const ctx = useContext(StakingContext);
  if (!ctx) {
    throw new Error("useStaking must be used within a StakingProvider");
  }
  return ctx;
}
