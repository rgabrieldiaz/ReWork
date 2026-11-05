"use client";

import { useWallet } from "@/hooks/useWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function ConnectButton() {
    const { connected: stellarConnected } = useWallet();
    const { connected: celoConnected } = useCeloWallet();
    const { connected: solConnected } = useSolanaWallet();
    const { authenticated } = usePrivy();
    const router = useRouter();

    if (authenticated || celoConnected || solConnected || stellarConnected) {
        return (
            <button
                onClick={() => router.push('/logout')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-border-subtle text-muted hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
                title="Cerrar sesión / Desconectar"
            >
                <LogOut className="w-4 h-4" />
            </button>
        );
    }

    return null;
}
