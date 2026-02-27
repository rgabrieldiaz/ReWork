"use client";

import { useState, useEffect, useCallback } from "react";
import {
    isConnected,
    isAllowed,
    setAllowed,
    getAddress,
    signTransaction,
    getNetworkDetails,
} from "@stellar/freighter-api";

export function useFreighter() {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);

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

    return { connected, address, network, connect, disconnect, sign };
}
