"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { address as toSolanaAddress, lamports } from "@solana/kit";
import {
  solanaClient,
  SOLANA_USDC_MINT,
  formatSolanaAddress,
  getSolanaExplorerUrl,
} from "@/lib/solana";
import { toast } from "sonner";

declare global {
  interface Window {
    solana?: any;
    solflare?: any;
    phantom?: {
      solana?: any;
    };
  }
}

interface SolanaWalletContextType {
  connected: boolean;
  address: string | null;
  formattedAddress: string;
  walletName: string | null;
  solBalance: number;
  usdcBalance: number;
  loading: boolean;
  isPhantomInstalled: boolean;
  isSolflareInstalled: boolean;
  connectSolana: (provider?: "phantom" | "solflare" | "auto") => Promise<string>;
  disconnectSolana: () => void;
  refreshBalances: () => Promise<void>;
  requestAirdrop: () => Promise<string | null>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(
  undefined
);

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [isSolflareInstalled, setIsSolflareInstalled] = useState(false);

  // Check available extensions on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasPhantom = !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom);
      const hasSolflare = !!window.solflare?.isSolflare;
      setIsPhantomInstalled(hasPhantom);
      setIsSolflareInstalled(hasSolflare);

      // Restore session if available
      const savedAddr = localStorage.getItem("rework_solana_address");
      const savedWallet = localStorage.getItem("rework_solana_wallet");
      if (savedAddr) {
        setAddress(savedAddr);
        setWalletName(savedWallet || "Solana Wallet");
        setConnected(true);
        fetchBalancesForAddress(savedAddr);
      }
    }
  }, []);

  const fetchBalancesForAddress = async (addrStr: string) => {
    try {
      const solAddr = toSolanaAddress(addrStr);

      // 1. SOL Balance
      const balanceRes = await solanaClient.rpc.getBalance(solAddr).send();
      if (balanceRes && typeof balanceRes.value === "bigint") {
        setSolBalance(Number(balanceRes.value) / 1e9);
      }

      // 2. USDC SPL Token Balance
      const usdcMintAddr = toSolanaAddress(SOLANA_USDC_MINT);
      const tokenAccounts = await solanaClient.rpc
        .getTokenAccountsByOwner(
          solAddr,
          { mint: usdcMintAddr },
          { encoding: "jsonParsed" }
        )
        .send();

      if (tokenAccounts && Array.isArray(tokenAccounts.value) && tokenAccounts.value.length > 0) {
        let total = 0;
        for (const item of tokenAccounts.value) {
          const parsed = (item.account.data as any)?.parsed?.info?.tokenAmount;
          if (parsed?.uiAmount) {
            total += parsed.uiAmount;
          }
        }
        setUsdcBalance(total);
      } else {
        setUsdcBalance(0);
      }
    } catch (err) {
      console.warn("Could not query Solana live balances:", err);
    }
  };

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    await fetchBalancesForAddress(address);
    setLoading(false);
  }, [address]);

  const connectSolana = useCallback(
    async (provider: "phantom" | "solflare" | "auto" = "auto"): Promise<string> => {
      setLoading(true);

      try {
        let selectedProvider: any = null;
        let detectedName = "Solana Wallet";

        if (typeof window === "undefined") {
          throw new Error("Window is not available");
        }

        const phantomObj = window.phantom?.solana || window.solana;
        const solflareObj = window.solflare;

        if (provider === "phantom" || (provider === "auto" && phantomObj?.isPhantom)) {
          if (!phantomObj?.isPhantom) {
            window.open("https://phantom.app/", "_blank");
            throw new Error("Phantom no está instalada. Redirigiendo a phantom.app...");
          }
          selectedProvider = phantomObj;
          detectedName = "Phantom";
        } else if (provider === "solflare" || (provider === "auto" && solflareObj?.isSolflare)) {
          if (!solflareObj?.isSolflare) {
            window.open("https://solflare.com/", "_blank");
            throw new Error("Solflare no está instalada. Redirigiendo a solflare.com...");
          }
          selectedProvider = solflareObj;
          detectedName = "Solflare";
        } else if (phantomObj) {
          selectedProvider = phantomObj;
          detectedName = "Phantom";
        } else {
          // Fallback demo address on Devnet for testing without extension
          const demoDevnetAddress = "83astBRguLMdt2h5U1Tpdq5LMfZynAdgSt2KaDfBesnx";
          setAddress(demoDevnetAddress);
          setWalletName("Solana Devnet Wallet");
          setConnected(true);
          localStorage.setItem("rework_solana_address", demoDevnetAddress);
          localStorage.setItem("rework_solana_wallet", "Solana Devnet Wallet");
          await fetchBalancesForAddress(demoDevnetAddress);
          toast.success("Conectado con cuenta de prueba en Solana Devnet");
          setLoading(false);
          return demoDevnetAddress;
        }

        // Request connection from the wallet
        const resp = await selectedProvider.connect();
        const publicKeyStr = resp.publicKey ? resp.publicKey.toString() : selectedProvider.publicKey.toString();

        setAddress(publicKeyStr);
        setWalletName(detectedName);
        setConnected(true);
        localStorage.setItem("rework_solana_address", publicKeyStr);
        localStorage.setItem("rework_solana_wallet", detectedName);

        toast.success(`Conectado a ${detectedName} en Solana Devnet!`, {
          description: formatSolanaAddress(publicKeyStr, 6),
        });

        await fetchBalancesForAddress(publicKeyStr);
        setLoading(false);
        return publicKeyStr;
      } catch (err: any) {
        console.error("Solana connection failed:", err);
        setLoading(false);
        const msg = err?.message || "Error al conectar con la wallet de Solana";
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const disconnectSolana = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        const phantomObj = window.phantom?.solana || window.solana;
        if (phantomObj?.disconnect) phantomObj.disconnect();
        if (window.solflare?.disconnect) window.solflare.disconnect();
        localStorage.removeItem("rework_solana_address");
        localStorage.removeItem("rework_solana_wallet");
      }
    } catch (e) {
      console.warn("Disconnect error:", e);
    }
    setConnected(false);
    setAddress(null);
    setWalletName(null);
    setSolBalance(0);
    setUsdcBalance(0);
    toast.info("Wallet de Solana desconectada");
  }, []);

  const requestAirdrop = useCallback(async (): Promise<string | null> => {
    if (!address) {
      toast.error("Debes conectar tu wallet de Solana primero");
      return null;
    }

    try {
      toast.loading("Solicitando 1 SOL en Devnet...", { id: "solana-airdrop" });
      const solAddr = toSolanaAddress(address);
      const airdropLamports = lamports(BigInt(1_000_000_000)); // 1 SOL

      const signature = await solanaClient.rpc
        .requestAirdrop(solAddr, airdropLamports, { commitment: "confirmed" })
        .send();

      toast.success("¡Airdrop de 1 SOL recibido en Devnet!", {
        id: "solana-airdrop",
        description: `Tx: ${formatSolanaAddress(signature.toString(), 6)}`,
        action: {
          label: "Ver en Explorer",
          onClick: () =>
            window.open(getSolanaExplorerUrl("tx", signature.toString()), "_blank"),
        },
      });

      await fetchBalancesForAddress(address);
      return signature.toString();
    } catch (err: any) {
      console.error("Airdrop error:", err);
      toast.error("Error en airdrop de devnet", {
        id: "solana-airdrop",
        description: "El faucet público puede tener rate limit temporal.",
      });
      return null;
    }
  }, [address]);

  return (
    <SolanaWalletContext.Provider
      value={{
        connected,
        address,
        formattedAddress: address ? formatSolanaAddress(address, 4) : "",
        walletName,
        solBalance,
        usdcBalance,
        loading,
        isPhantomInstalled,
        isSolflareInstalled,
        connectSolana,
        disconnectSolana,
        refreshBalances,
        requestAirdrop,
      }}
    >
      {children}
    </SolanaWalletContext.Provider>
  );
}

export function useSolanaWallet() {
  const ctx = useContext(SolanaWalletContext);
  if (!ctx) {
    throw new Error("useSolanaWallet must be used within a SolanaWalletProvider");
  }
  return ctx;
}
