"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import {
    isConnected,
    isAllowed,
    setAllowed,
    getAddress,
    signTransaction,
    getNetworkDetails,
} from "@stellar/freighter-api";

interface FreighterContextType {
    connected: boolean;
    address: string | null;
    network: string | null;
    loading: boolean;
    connect: () => Promise<string>;
    disconnect: () => void;
    sign: (xdr: string, networkPassphrase: string) => Promise<{ signedTxXdr: string; signerAddress: string; }>;
}

const FreighterContext = createContext<FreighterContextType | undefined>(undefined);

export function FreighterProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const freighterInstalled = await isConnected();
            if (!freighterInstalled) return;

            const allowed = await isAllowed();
            if (allowed) {
                const addressObj = await getAddress();
                const netObj = await getNetworkDetails();
                setConnected(true);
                setAddress(addressObj.address);
                setNetwork(netObj.network);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const connect = useCallback(async () => {
        const freighterInstalled = await isConnected();
        if (!freighterInstalled) {
            window.open("https://freighter.app", "_blank");
            throw new Error("Freighter extension not installed");
        }

        await setAllowed();
        const addressObj = await getAddress();
        const netObj = await getNetworkDetails();

        setConnected(true);
        setAddress(addressObj.address);
        setNetwork(netObj.network);

        return addressObj.address;
    }, []);

    const disconnect = useCallback(() => {
        setConnected(false);
        setAddress(null);
        setNetwork(null);
    }, []);

    const sign = useCallback(
        async (xdr: string, networkPassphrase: string) => {
            if (!connected) throw new Error("Wallet not connected");
            return signTransaction(xdr, { networkPassphrase });
        },
        [connected]
    );

    return (
        <FreighterContext.Provider value={{ connected, address, network, loading, connect, disconnect, sign }
        }>
            {children}
        </FreighterContext.Provider>
    );
}

export function useFreighter() {
    const context = useContext(FreighterContext);
    if (context === undefined) {
        throw new Error("useFreighter must be used within a FreighterProvider");
    }
    return context;
}
