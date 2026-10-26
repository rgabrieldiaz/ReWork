"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import {
  CELO_ASSETS,
  CELO_MAINNET_CHAIN_ID,
  getCeloscanUrl,
  type CeloAssetSymbol,
} from "@/lib/celo-assets";
import {
  appendCeloAttributionData,
  buildAttributedErc20TransferCalldata,
  buildERC8004RegisterCalldata,
  checkERC8004AgentIdentity,
  fetchAllCeloBalances,
  getCeloAttributionSuffix,
  getCeloAttributionTag,
  getCeloPublicClient,
  getWindowEthereum,
  setCeloAttributionTag,
  verifyCeloTransactionTag,
  type CeloTokenBalance,
  type ERC8004AgentStatus,
} from "@/lib/chains/celo";

export interface CeloTxReceiptInfo {
  hash: `0x${string}`;
  explorerUrl: string;
  attributionTag: string;
  attributionSuffix: `0x${string}`;
  isOnChain: boolean;
}

interface CeloWalletContextType {
  connected: boolean;
  address: `0x${string}` | null;
  formattedAddress: string;
  walletName: string | null;
  chainId: number;
  isOnCeloMainnet: boolean;
  loading: boolean;
  balances: Record<CeloAssetSymbol, CeloTokenBalance>;
  totalUsdValue: number;
  selectedAsset: CeloAssetSymbol;
  setSelectedAsset: (symbol: CeloAssetSymbol) => void;
  attributionTag: string;
  attributionSuffix: `0x${string}`;
  updateAttributionTag: (tag: string) => void;
  erc8004Status: ERC8004AgentStatus | null;
  connectCelo: () => Promise<`0x${string}`>;
  disconnectCelo: () => void;
  ensureCeloMainnet: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;
  sendCeloAsset: (params: {
    symbol: CeloAssetSymbol;
    recipient: `0x${string}`;
    amount: string | number;
  }) => Promise<CeloTxReceiptInfo>;
  sendAttributedTransaction: (params: {
    to: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
    description?: string;
  }) => Promise<CeloTxReceiptInfo>;
  registerERC8004Agent: (customUri?: string) => Promise<CeloTxReceiptInfo>;
}

const DEFAULT_BALANCES = Object.keys(CELO_ASSETS).reduce((acc, key) => {
  const sym = key as CeloAssetSymbol;
  const cfg = CELO_ASSETS[sym];
  acc[sym] = {
    symbol: sym,
    displaySymbol: cfg.displaySymbol,
    name: cfg.name,
    flag: cfg.flag,
    rawBalance: BigInt(0),
    formatted: "0",
    numeric: 0,
    usdValue: 0,
    address: cfg.address,
    decimals: cfg.decimals,
  };
  return acc;
}, {} as Record<CeloAssetSymbol, CeloTokenBalance>);

const CeloWalletContext = createContext<CeloWalletContextType | undefined>(
  undefined
);

export function formatCeloAddress(addr: string | null | undefined): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function CeloWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(CELO_MAINNET_CHAIN_ID);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] =
    useState<Record<CeloAssetSymbol, CeloTokenBalance>>(DEFAULT_BALANCES);
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<CeloAssetSymbol>("wARS");
  const [attributionTag, setAttributionTagState] = useState<string>(
    "rework_celo_latam"
  );
  const [erc8004Status, setErc8004Status] = useState<ERC8004AgentStatus | null>(
    null
  );

  const loadAddressData = useCallback(async (addr: `0x${string}`) => {
    try {
      const [{ balances: fetched, totalUsdValue: total }, agentStatus] =
        await Promise.all([
          fetchAllCeloBalances(addr),
          checkERC8004AgentIdentity(addr),
        ]);
      setBalances(fetched);
      setTotalUsdValue(total);
      setErc8004Status(agentStatus);
    } catch (err) {
      console.warn("[useCeloWallet] Error fetching Celo data:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAttributionTagState(getCeloAttributionTag());

    const savedAddr = localStorage.getItem("rework_celo_address");
    const savedWallet = localStorage.getItem("rework_celo_wallet");
    if (savedAddr && savedAddr.startsWith("0x")) {
      const typedAddr = savedAddr as `0x${string}`;
      setAddress(typedAddr);
      setWalletName(savedWallet || "Celo EVM Wallet");
      setConnected(true);
      loadAddressData(typedAddr);
    }

    const eth = getWindowEthereum();
    if (eth) {
      eth
        .request({ method: "eth_chainId" })
        .then((hexId: string) => {
          if (hexId) setChainId(parseInt(hexId, 16));
        })
        .catch(() => {});

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0 && accounts[0].startsWith("0x")) {
          const nextAddr = accounts[0] as `0x${string}`;
          setAddress(nextAddr);
          setConnected(true);
          localStorage.setItem("rework_celo_address", nextAddr);
          loadAddressData(nextAddr);
        } else {
          setConnected(false);
          setAddress(null);
          localStorage.removeItem("rework_celo_address");
        }
      };

      const handleChainChanged = (hexChainId: string) => {
        setChainId(parseInt(hexChainId, 16));
      };

      eth.on?.("accountsChanged", handleAccountsChanged);
      eth.on?.("chainChanged", handleChainChanged);

      return () => {
        eth.removeListener?.("accountsChanged", handleAccountsChanged);
        eth.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [loadAddressData]);

  const updateAttributionTag = useCallback((tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    setCeloAttributionTag(clean);
    setAttributionTagState(clean);
    toast.success(`ERC-8021 Attribution Tag actualizado: ${clean}`);
  }, []);

  const ensureCeloMainnet = useCallback(async (): Promise<boolean> => {
    const eth = getWindowEthereum();
    if (!eth) return false;
    const targetHex = `0x${CELO_MAINNET_CHAIN_ID.toString(16)}`; // 0xa4ec (42220)
    try {
      const currentHex = await eth.request({
        method: "eth_chainId",
      });
      if (parseInt(currentHex, 16) === CELO_MAINNET_CHAIN_ID) {
        setChainId(CELO_MAINNET_CHAIN_ID);
        return true;
      }
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
      setChainId(CELO_MAINNET_CHAIN_ID);
      return true;
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetHex,
                chainName: "Celo Mainnet",
                nativeCurrency: {
                  name: "CELO",
                  symbol: "CELO",
                  decimals: 18,
                },
                rpcUrls: ["https://forno.celo.org"],
                blockExplorerUrls: ["https://celoscan.io"],
              },
            ],
          });
          setChainId(CELO_MAINNET_CHAIN_ID);
          return true;
        } catch (addErr) {
          console.error("[useCeloWallet] Failed to add Celo Mainnet:", addErr);
          return false;
        }
      }
      return false;
    }
  }, []);

  const connectCelo = useCallback(async (): Promise<`0x${string}`> => {
    setLoading(true);
    try {
      const eth = getWindowEthereum();
      if (eth) {
        const accounts: string[] = await eth.request({
          method: "eth_requestAccounts",
        });
        if (!accounts || accounts.length === 0) {
          throw new Error("No se seleccionó ninguna cuenta EVM.");
        }
        await ensureCeloMainnet();
        const addr = accounts[0] as `0x${string}`;
        const detectedName = eth.isMiniPay
          ? "MiniPay (Celo)"
          : eth.isValora
          ? "Valora"
          : eth.isRabby
          ? "Rabby Wallet"
          : eth.isMetaMask
          ? "MetaMask (Celo Mainnet)"
          : "Celo EVM Wallet";

        setAddress(addr);
        setWalletName(detectedName);
        setConnected(true);
        localStorage.setItem("rework_celo_address", addr);
        localStorage.setItem("rework_celo_wallet", detectedName);
        await loadAddressData(addr);
        toast.success(
          `Conectado a Celo Mainnet (42220): ${formatCeloAddress(addr)}`
        );
        return addr;
      } else {
        throw new Error(
          "No se detectó una wallet EVM (MetaMask, MiniPay, Rabby o Valora) en el navegador."
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al conectar wallet Celo");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ensureCeloMainnet, loadAddressData]);

  const disconnectCelo = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setWalletName(null);
    setBalances(DEFAULT_BALANCES);
    setTotalUsdValue(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rework_celo_address");
      localStorage.removeItem("rework_celo_wallet");
    }
    toast.info("Wallet Celo desconectada");
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    await loadAddressData(address);
  }, [address, loadAddressData]);

  const sendAttributedTransaction = useCallback(
    async (params: {
      to: `0x${string}`;
      data?: `0x${string}`;
      value?: bigint;
      description?: string;
    }): Promise<CeloTxReceiptInfo> => {
      if (!address) {
        throw new Error("Conectá tu wallet en Celo Mainnet primero.");
      }
      const eth = getWindowEthereum();
      if (!eth) {
        throw new Error(
          "Se requiere una wallet EVM activa (MetaMask/Rabby/MiniPay) para firmar en Celo Mainnet."
        );
      }

      const switched = await ensureCeloMainnet();
      if (!switched) {
        throw new Error(
          "Por favor cambiá tu red a Celo Mainnet (Chain ID 42220)."
        );
      }

      const activeTag = getCeloAttributionTag();
      const activeSuffix = getCeloAttributionSuffix(activeTag);
      const taggedData = appendCeloAttributionData(
        params.data || "0x",
        activeTag
      );

      const txParams: Record<string, string> = {
        from: address,
        to: params.to,
        data: taggedData,
      };
      if (params.value && params.value > BigInt(0)) {
        txParams.value = `0x${params.value.toString(16)}`;
      }

      const hash = (await eth.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })) as `0x${string}`;

      const client = getCeloPublicClient(CELO_MAINNET_CHAIN_ID);
      await client.waitForTransactionReceipt({ hash });

      await verifyCeloTransactionTag(hash);
      await loadAddressData(address);

      return {
        hash,
        explorerUrl: getCeloscanUrl("tx", hash, CELO_MAINNET_CHAIN_ID),
        attributionTag: activeTag,
        attributionSuffix: activeSuffix,
        isOnChain: true,
      };
    },
    [address, ensureCeloMainnet, loadAddressData]
  );

  const sendCeloAsset = useCallback(
    async (params: {
      symbol: CeloAssetSymbol;
      recipient: `0x${string}`;
      amount: string | number;
    }): Promise<CeloTxReceiptInfo> => {
      const asset = CELO_ASSETS[params.symbol];
      if (!asset) {
        throw new Error(`Activo no soportado en Celo: ${params.symbol}`);
      }

      if (asset.isNative) {
        const valueWei = parseUnits(String(params.amount), asset.decimals);
        return sendAttributedTransaction({
          to: params.recipient,
          data: "0x",
          value: valueWei,
          description: `Transferencia de ${params.amount} CELO`,
        });
      }

      const calldata = buildAttributedErc20TransferCalldata({
        recipient: params.recipient,
        amount: params.amount,
        decimals: asset.decimals,
      });

      return sendAttributedTransaction({
        to: asset.address,
        data: calldata,
        description: `Transferencia de ${params.amount} ${asset.displaySymbol}`,
      });
    },
    [sendAttributedTransaction]
  );

  const registerERC8004Agent = useCallback(
    async (customUri?: string): Promise<CeloTxReceiptInfo> => {
      const { to, data } = buildERC8004RegisterCalldata(customUri);
      const receipt = await sendAttributedTransaction({
        to,
        data,
        description: "Registro de Identidad de Agente ERC-8004 en Celo Mainnet",
      });
      if (address) {
        const updated = await checkERC8004AgentIdentity(address);
        setErc8004Status(updated);
      }
      return receipt;
    },
    [address, sendAttributedTransaction]
  );

  const attributionSuffix = getCeloAttributionSuffix(attributionTag);

  return (
    <CeloWalletContext.Provider
      value={{
        connected,
        address,
        formattedAddress: formatCeloAddress(address),
        walletName,
        chainId,
        isOnCeloMainnet: chainId === CELO_MAINNET_CHAIN_ID,
        loading,
        balances,
        totalUsdValue,
        selectedAsset,
        setSelectedAsset,
        attributionTag,
        attributionSuffix,
        updateAttributionTag,
        erc8004Status,
        connectCelo,
        disconnectCelo,
        ensureCeloMainnet,
        refreshBalances,
        sendCeloAsset,
        sendAttributedTransaction,
        registerERC8004Agent,
      }}
    >
      {children}
    </CeloWalletContext.Provider>
  );
}

export function useCeloWallet() {
  const context = useContext(CeloWalletContext);
  if (!context) {
    throw new Error("useCeloWallet must be used within a CeloWalletProvider");
  }
  return context;
}
