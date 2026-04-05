"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBalances } from "@/hooks/useBalances";

interface BalanceContextType {
    xlmBalance: number | null;
    usdcBalance: number | null;
    loading: boolean;
    refresh: () => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
    const { address, network } = useWallet();
    const { xlmBalance, usdcBalance, loading, refresh } = useBalances(address || null, network);

    return (
        <BalanceContext.Provider value={{ xlmBalance, usdcBalance, loading, refresh }}>
            {children}
        </BalanceContext.Provider>
    );
}

export function useSharedBalances() {
    const ctx = useContext(BalanceContext);
    if (!ctx) throw new Error("useSharedBalances must be used within BalanceProvider");
    return ctx;
}
