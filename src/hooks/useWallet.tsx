"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { isTestnetRailsEnabled } from "@/lib/feature-flags";

// ── Detect mobile at module level ──
const getIsMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

interface WalletContextType {
    connected: boolean;
    address: string | null;
    network: string | null;
    loading: boolean;
    isMobile: boolean;
    connect: () => Promise<string>;
    disconnect: () => void;
    sign: (xdr: string, networkPassphrase: string) => Promise<{ signedTxXdr: string; signerAddress: string }>;
    injectAddress: (addr: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [kit, setKit] = useState<any>(null);

    const initKit = useCallback(async () => {
        if (!isTestnetRailsEnabled()) {
            setConnected(false);
            setAddress(null);
            setNetwork(null);
            setLoading(false);
            return;
        }

        try {
            const { StellarWalletsKit, Networks } = await import("@creit.tech/stellar-wallets-kit");
            const { defaultModules } = await import("@creit.tech/stellar-wallets-kit/modules/utils");
            const { WalletConnectModule } = await import("@creit.tech/stellar-wallets-kit/modules/wallet-connect");

            StellarWalletsKit.init({
                network: Networks.TESTNET,
                modules: [
                    ...defaultModules(),
                    new WalletConnectModule({
                        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "8d234c919d5c4146a782b78a2e106da4",
                        metadata: {
                            name: "ReWork Web3",
                            description: "ReWork Decentralized Application",
                            url: "https://rework.network",
                            icons: ["https://rework.network/favicon.ico"]
                        }
                    })
                ],
            });
            setKit(() => StellarWalletsKit);

            try {
                const result = await StellarWalletsKit.getAddress();
                if (result && result.address) {
                    setAddress(result.address);
                    setConnected(true);
                    setNetwork("TESTNET");
                }
            } catch {
                // Not previously authorized
            }
        } catch (err) {
            console.error("Error initializing StellarWalletsKit:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsMobile(getIsMobile());
        initKit();

        const handleFlagChange = () => {
            initKit();
        };
        window.addEventListener("rework:testnet-rails-changed", handleFlagChange);
        return () => window.removeEventListener("rework:testnet-rails-changed", handleFlagChange);
    }, [initKit]);

    const connect = useCallback(async (): Promise<string> => {
        if (!kit) {
            throw new Error("El riel experimental de Stellar Testnet está desactivado en Modo Mainnet.");
        }

        try {
            const { address: addr } = await kit.authModal();
            setConnected(true);
            setAddress(addr);
            setNetwork("TESTNET");
            return addr;
        } catch (err) {
            console.error("Wallet connection error:", err);
            throw err;
        }
    }, [kit]);

    const disconnect = useCallback(() => {
        setConnected(false);
        setAddress(null);
        setNetwork(null);
    }, []);

    const sign = useCallback(
        async (xdr: string, networkPassphrase: string) => {
            if (!connected || !kit) throw new Error("Wallet Stellar no conectada");
            const { signedTxXdr } = await kit.signTransaction(xdr, {
                networkPassphrase,
            });
            return { signedTxXdr, signerAddress: address! };
        },
        [connected, kit, address]
    );

    const injectAddress = useCallback((addr: string) => {
        if (!isTestnetRailsEnabled()) return;
        setAddress(addr);
        setConnected(true);
        setNetwork("TESTNET");
    }, []);

    return (
        <WalletContext.Provider value={{ connected, address, network, loading, isMobile, connect, disconnect, sign, injectAddress }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
