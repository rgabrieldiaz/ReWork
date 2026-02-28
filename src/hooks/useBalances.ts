import { useState, useEffect } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';

export function useBalances(address: string | null) {
    const [xlmBalance, setXlmBalance] = useState<number | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            if (!address) {
                setXlmBalance(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Pointing to testnet by default for ReWork development
                // You can swap to 'https://horizon.stellar.org' for mainnet
                const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

                const account = await server.loadAccount(address);

                // Find the native (XLM) balance
                const nativeBalance = account.balances.find(b => b.asset_type === 'native');

                // Find USDC balance (looking by asset_code since testnet issuers can vary, but typically we'd match exact issuer)
                const usdcBalanceAsset = account.balances.find(b => 'asset_code' in b && b.asset_code === 'USDC');

                if (isMounted) {
                    if (nativeBalance) setXlmBalance(parseFloat(nativeBalance.balance));
                    if (usdcBalanceAsset) setUsdcBalance(parseFloat(usdcBalanceAsset.balance));
                    else setUsdcBalance(0); // If no trustline or 0 balance
                }
            } catch (err) {
                const error = err as { response?: { status?: number } };
                if (error?.response?.status === 404) {
                    // Account not funded on the network yet
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
    }, [address]);

    return { xlmBalance, usdcBalance, loading, error };
}
