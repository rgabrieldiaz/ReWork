"use client";

import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ConnectButton() {
    const { connected, address, isMobile } = useWallet();
    const { profile } = useProfile();
    const { authenticated, user: privyUser } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (connected && address) {
            // Register/update user in Supabase when wallet connects
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

    // Show user info (Privy email or wallet address)
    if (authenticated || connected) {
        const displayName = profile?.first_name
            || privyUser?.google?.name
            || privyUser?.email?.address?.split('@')[0]
            || (address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "User");

        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono font-bold text-accent-teal bg-accent-teal/10 px-4 py-2 rounded-full border border-accent-teal/20 shadow-[0_0_10px_rgba(0,242,255,0.1)] truncate max-w-[180px]">
                    {displayName}
                </span>
                <button
                    onClick={() => router.push('/logout')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-border-subtle text-muted hover:text-red-400 hover:border-red-400/50 transition-colors"
                    title="Desconectar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                </button>
            </div>
        );
    }

    return null; // No button shown when not authenticated (auth page handles login)
}
