"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export function ConnectButton() {
    const { connected, address, connect, disconnect } = useFreighter();

    useEffect(() => {
        if (connected && address) {
            // Registrar usuario en Supabase si no existe
            supabase
                .from("users")
                .upsert(
                    { wallet_address: address, updated_at: new Date().toISOString() },
                    { onConflict: "wallet_address" }
                )
                .then(({ error }) => {
                    if (error) console.error("Error saving user to Supabase", error);
                });
        }
    }, [connected, address]);

    if (connected && address) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono font-bold text-accent-teal bg-accent-teal/10 px-4 py-2 rounded-full border border-accent-teal/20 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                    {address.slice(0, 4)}...{address.slice(-4)}
                </span>
                <button
                    onClick={disconnect}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-glass-white border border-border-glass text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors"
                    title="Desconectar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-6 py-2.5 bg-accent-teal text-deep-navy font-bold rounded-full hover:bg-white transition-colors glow-teal text-sm tracking-wide uppercase"
        >
            Conectar Billetera
        </button>
    );
}
