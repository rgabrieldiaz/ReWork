"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

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

    useEffect(() => {
        setIsMobile(getIsMobile());

        // Only initialize SWK on desktop
        if (!getIsMobile()) {
            initKit();
        } else {
            setLoading(false);
        }
    }, []);

    const initKit = async () => {
        try {
            const { StellarWalletsKit, Networks } = await import("@creit.tech/stellar-wallets-kit");
            const { defaultModules } = await import("@creit.tech/stellar-wallets-kit/modules/utils");
            const { FREIGHTER_ID } = await import("@creit.tech/stellar-wallets-kit/modules/freighter");
            
            StellarWalletsKit.init({
                network: Networks.TESTNET,
                selectedWalletId: FREIGHTER_ID,
                modules: defaultModules(),
            });
            setKit(() => StellarWalletsKit);

            // Attempt to restore session silently
            try {
                const result = await StellarWalletsKit.getAddress();
                if (result && result.address) {
                    setAddress(result.address);
                    setConnected(true);
                    setNetwork("TESTNET");
                }
            } catch (e) {
                // Not previously authorized or locked, ignore silently
            }
        } catch (err) {
            console.error("Error initializing StellarWalletsKit:", err);
        } finally {
            setLoading(false);
        }
    };

    const connect = useCallback(async (): Promise<string> => {
        if (isMobile) {
            throw new Error("Wallet connection is not available on mobile devices.");
        }
        if (!kit) {
            throw new Error("Wallet kit not initialized. Please try again.");
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
    }, [kit, isMobile]);

    const disconnect = useCallback(() => {
        setConnected(false);
        setAddress(null);
        setNetwork(null);
    }, []);

    const sign = useCallback(
        async (xdr: string, networkPassphrase: string) => {
            if (!connected || !kit) throw new Error("Wallet not connected");
            const { signedTxXdr } = await kit.signTransaction(xdr, {
                networkPassphrase,
            });
            return { signedTxXdr, signerAddress: address! };
        },
        [connected, kit, address]
    );

    const injectAddress = useCallback((addr: string) => {
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
