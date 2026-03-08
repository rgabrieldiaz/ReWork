import { useState, useEffect, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';

export function useBalances(address: string | null) {
    const [xlmBalance, setXlmBalance] = useState<number | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            if (!address) {
                setXlmBalance(null);
                setUsdcBalance(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
                const account = await server.loadAccount(address);

                const nativeBalance = account.balances.find(b => b.asset_type === 'native');
                const usdcBalanceAsset = account.balances.find(b => 'asset_code' in b && b.asset_code === 'USDC');

                if (isMounted) {
                    if (nativeBalance) setXlmBalance(parseFloat(nativeBalance.balance));
                    if (usdcBalanceAsset) setUsdcBalance(parseFloat(usdcBalanceAsset.balance));
                    else setUsdcBalance(0);
                }
            } catch (err) {
                const error = err as { response?: { status?: number } };
                if (error?.response?.status === 404) {
                    if (isMounted) {
                        setXlmBalance(0);
                        setUsdcBalance(0);
                    }
                } else {
                    console.error("Error fetching Stellar balance:", err);
                    if (isMounted) setError("Failed to fetch balance");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchBalance();

        return () => {
            isMounted = false;
        };
    }, [address, refreshKey]);

    return { xlmBalance, usdcBalance, loading, error, refresh };
}
