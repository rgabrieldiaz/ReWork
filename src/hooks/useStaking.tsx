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
}

interface StakingContextType {
  stakedAmount: number; // total USDC staked
  activeApy: number; // average APY %
  accruedYield: number; // total USDC earned yield
  activeCurrency: SupportedCurrency;
  setActiveCurrency: (curr: SupportedCurrency) => void;
  stake: (amount: number, durationMonths?: number, poolName?: string) => Promise<boolean>;
  unstake: (amount: number) => Promise<boolean>;
  positions: StakePosition[];
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

export function StakingProvider({ children }: { children: ReactNode }) {
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>("USDC");
  const [stakedAmount, setStakedAmount] = useState<number>(75); // initial demo stake
  const [activeApy] = useState<number>(12.8); // 12.8% APY
  const [accruedYield, setAccruedYield] = useState<number>(3.42);
  const [positions, setPositions] = useState<StakePosition[]>([
    {
      id: "stake-pos-1",
      amount: 75,
      currency: "USDC",
      apy: 12.8,
      startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      durationMonths: 6,
      poolName: "Stellar Liquidity Pool (USDC/XLM)",
    },
  ]);

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
  }, []);

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

  const stake = async (amount: number, durationMonths: number = 3, poolName: string = "Stellar Yield Vault") => {
    if (amount <= 0) return false;
    const newTotal = stakedAmount + amount;
    setStakedAmount(newTotal);
    localStorage.setItem("rework_staked_amount", newTotal.toString());

    const newPos: StakePosition = {
      id: `pos-${Date.now()}`,
      amount,
      currency: "USDC",
      apy: activeApy,
      startDate: new Date().toISOString(),
      durationMonths,
      poolName,
    };
    setPositions((prev) => [newPos, ...prev]);
    return true;
  };

  const unstake = async (amount: number) => {
    if (amount <= 0 || amount > stakedAmount) return false;
    const newTotal = Math.max(0, stakedAmount - amount);
    setStakedAmount(newTotal);
    localStorage.setItem("rework_staked_amount", newTotal.toString());
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
