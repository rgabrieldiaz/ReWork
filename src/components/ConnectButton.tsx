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
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#13ec5b] bg-[#13ec5b]/10 px-4 py-2 rounded-full border border-[#13ec5b]/20">
                    {address.slice(0, 4)}...{address.slice(-4)}
                </span>
                <button
                    onClick={disconnect}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium px-2"
                >
                    Desconectar
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-6 py-2.5 bg-[#13ec5b] text-black font-semibold rounded-full hover:bg-[#11cc4e] transition-colors shadow-[0_0_15px_rgba(19,236,91,0.2)] hover:shadow-[0_0_20px_rgba(19,236,91,0.4)]"
        >
            Conectar Billetera
        </button>
    );
}
