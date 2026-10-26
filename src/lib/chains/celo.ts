/**
 * ReWork — Celo Mainnet (42220) Client, ERC-8021 Attribution Tag Injector & ERC-8004 Agent Identity
 */

import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  http,
  parseAbi,
  parseUnits,
  type EIP1193Provider,
  type PublicClient,
} from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import {
  toDataSuffix,
  verifyTx,
  withAttribution,
  type DecodedSuffix,
} from '@celo/attribution-tags';
import {
  CELO_ASSETS,
  CELO_ASSET_LIST,
  CELO_MAINNET_CHAIN_ID,
  CELO_PROTOCOLS,
  CELO_SEPOLIA_CHAIN_ID,
  type CeloAssetSymbol,
} from '../celo-assets';

const STORAGE_TAG_KEY = 'rework_celo_attribution_tag';
const STORAGE_AGENT_ID_KEY = 'rework_celo_erc8004_agent_id';

export const CELO_RPC_URL =
  process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org';

/**
 * Returns the active ERC-8021 Attribution Tag assigned by Loops House.
 * Can be configured via NEXT_PUBLIC_CELO_ATTRIBUTION_TAG or updated at runtime in UI settings.
 */
export function getCeloAttributionTag(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_TAG_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  }
  return (
    process.env.NEXT_PUBLIC_CELO_ATTRIBUTION_TAG?.trim() || 'rework_celo_latam'
  );
}

export function setCeloAttributionTag(tag: string): void {
  if (typeof window !== 'undefined' && tag.trim().length > 0) {
    window.localStorage.setItem(STORAGE_TAG_KEY, tag.trim());
  }
}

/**
 * Returns the ERC-8021 hex suffix (including the 0x8021...8021 marker) for the active tag.
 */
export function getCeloAttributionSuffix(customTag?: string): `0x${string}` {
  const tag = customTag?.trim() || getCeloAttributionTag();
  return toDataSuffix(['rework', tag]) as `0x${string}`;
}

/**
 * Appends the official ERC-8021 Attribution Tag suffix to any transaction calldata.
 * Used as a safety guarantee even when sending raw EIP-1193 transactions.
 */
export function appendCeloAttributionData(
  calldata: `0x${string}` = '0x',
  customTag?: string
): `0x${string}` {
  const suffix = getCeloAttributionSuffix(customTag);
  const rawSuffix = suffix.slice(2);
  if (calldata.toLowerCase().endsWith(rawSuffix.toLowerCase())) {
    return calldata;
  }
  const cleanCalldata = calldata === '0x' ? '0x' : calldata;
  return `${cleanCalldata}${rawSuffix}` as `0x${string}`;
}

export interface CeloEthereumProvider {
  isMetaMask?: boolean;
  isMiniPay?: boolean;
  isValora?: boolean;
  isRabby?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

export function getWindowEthereum(): CeloEthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ethereum?: CeloEthereumProvider }).ethereum;
}

/**
 * Singleton PublicClient for Celo Mainnet (42220) or Celo Sepolia (11142220)
 */
let mainnetClient: any = null;
let sepoliaClient: any = null;

export function getCeloPublicClient(
  chainId: number = CELO_MAINNET_CHAIN_ID
) {
  if (chainId === CELO_SEPOLIA_CHAIN_ID) {
    if (!sepoliaClient) {
      sepoliaClient = createPublicClient({
        chain: celoSepolia,
        transport: http('https://forno.celo-sepolia.celo-testnet.org'),
      });
    }
    return sepoliaClient as ReturnType<typeof createPublicClient>;
  }
  if (!mainnetClient) {
    mainnetClient = createPublicClient({
      chain: celo,
      transport: http(CELO_RPC_URL),
    });
  }
  return mainnetClient as ReturnType<typeof createPublicClient>;
}

/**
 * Creates a viem WalletClient from an EIP-1193 provider (Privy embedded wallet, MetaMask, MiniPay, Rabby)
 * automatically extended with `@celo/attribution-tags` so every transaction is ERC-8021 tagged.
 */
export function createAttributedCeloWalletClient(
  provider: EIP1193Provider,
  account: `0x${string}`,
  customTag?: string
) {
  const tag = customTag?.trim() || getCeloAttributionTag();
  return createWalletClient({
    account,
    chain: celo,
    transport: custom(provider),
  }).extend(withAttribution(['rework', tag]));
}

/**
 * Verifies on-chain that a Celo Mainnet transaction hash carries the ERC-8021 attribution suffix.
 */
export async function verifyCeloTransactionTag(
  hash: `0x${string}`
): Promise<{
  verified: boolean;
  codes: string[];
  details: DecodedSuffix | null;
}> {
  try {
    const client = getCeloPublicClient(CELO_MAINNET_CHAIN_ID);
    const decoded = await verifyTx({
      client: client as unknown as Parameters<typeof verifyTx>[0]['client'],
      hash,
    });
    if (!decoded) {
      return { verified: false, codes: [], details: null };
    }
    return {
      verified: decoded.codes.length > 0,
      codes: decoded.codes,
      details: decoded,
    };
  } catch (err) {
    console.warn('[Celo ERC-8021] Failed to verify tx tag:', err);
    return { verified: false, codes: [], details: null };
  }
}

export interface CeloTokenBalance {
  symbol: CeloAssetSymbol;
  displaySymbol: string;
  name: string;
  flag: string;
  rawBalance: bigint;
  formatted: string;
  numeric: number;
  usdValue: number;
  address: `0x${string}`;
  decimals: number;
}

/**
 * Reads all Celo Mainnet balances (CELO + USA₮ + USDC + USD₮ + 6 Ripio wFIAT + cNGN + IDRX)
 */
export async function fetchAllCeloBalances(
  address: `0x${string}`
): Promise<{
  balances: Record<CeloAssetSymbol, CeloTokenBalance>;
  totalUsdValue: number;
}> {
  const client = getCeloPublicClient(CELO_MAINNET_CHAIN_ID);

  const results = await Promise.allSettled(
    CELO_ASSET_LIST.map(async (asset) => {
      let raw: bigint = BigInt(0);
      if (asset.isNative) {
        raw = await client.getBalance({ address });
      } else {
        raw = await client.readContract({
          address: asset.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        });
      }
      const formatted = formatUnits(raw, asset.decimals);
      const numeric = parseFloat(formatted) || 0;
      const usdValue = numeric * asset.referenceUsdRate;
      return {
        symbol: asset.symbol,
        displaySymbol: asset.displaySymbol,
        name: asset.name,
        flag: asset.flag,
        rawBalance: raw,
        formatted,
        numeric,
        usdValue,
        address: asset.address,
        decimals: asset.decimals,
      } satisfies CeloTokenBalance;
    })
  );

  const balances = {} as Record<CeloAssetSymbol, CeloTokenBalance>;
  let totalUsdValue = 0;

  CELO_ASSET_LIST.forEach((asset, idx) => {
    const res = results[idx];
    if (res.status === 'fulfilled') {
      balances[asset.symbol] = res.value;
      totalUsdValue += res.value.usdValue;
    } else {
      balances[asset.symbol] = {
        symbol: asset.symbol,
        displaySymbol: asset.displaySymbol,
        name: asset.name,
        flag: asset.flag,
        rawBalance: BigInt(0),
        formatted: '0',
        numeric: 0,
        usdValue: 0,
        address: asset.address,
        decimals: asset.decimals,
      };
    }
  });

  return { balances, totalUsdValue };
}

/**
 * Builds ERC-20 transfer calldata with ERC-8021 Attribution Tag appended
 */
export function buildAttributedErc20TransferCalldata(params: {
  recipient: `0x${string}`;
  amount: string | number;
  decimals: number;
  customTag?: string;
}): `0x${string}` {
  const parsedAmount = parseUnits(String(params.amount), params.decimals);
  const baseData = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [params.recipient, parsedAmount],
  });
  return appendCeloAttributionData(baseData, params.customTag);
}

/**
 * ERC-8004 On-Chain Agent Identity Registry (`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`)
 * Checks if an address holds an ERC-8004 Agent Identity NFT on Celo Mainnet
 */
const ERC8004_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function register() external returns (uint256 agentId)',
  'function register(string agentURI) external returns (uint256 agentId)',
]);

export interface ERC8004AgentStatus {
  registered: boolean;
  agentCount: number;
  agentIdLabel: string;
  registryAddress: `0x${string}`;
  explorerUrl: string;
}

export async function checkERC8004AgentIdentity(
  address: `0x${string}`
): Promise<ERC8004AgentStatus> {
  const savedAgentId =
    (typeof window !== 'undefined' &&
      window.localStorage.getItem(STORAGE_AGENT_ID_KEY)) ||
    process.env.NEXT_PUBLIC_CELO_ERC8004_AGENT_ID ||
    '';

  try {
    const client = getCeloPublicClient(CELO_MAINNET_CHAIN_ID);
    const count = await client.readContract({
      address: CELO_PROTOCOLS.ERC8004_REGISTRY,
      abi: ERC8004_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    const numericCount = Number(count);
    return {
      registered: numericCount > 0 || Boolean(savedAgentId),
      agentCount: numericCount,
      agentIdLabel:
        savedAgentId ||
        (numericCount > 0 ? `ERC-8004 Verified (${numericCount})` : 'Unregistered'),
      registryAddress: CELO_PROTOCOLS.ERC8004_REGISTRY,
      explorerUrl: `${CELO_PROTOCOLS.ERC8004_EXPLORER}/address/${address}`,
    };
  } catch {
    return {
      registered: Boolean(savedAgentId),
      agentCount: savedAgentId ? 1 : 0,
      agentIdLabel: savedAgentId || 'Pending Check',
      registryAddress: CELO_PROTOCOLS.ERC8004_REGISTRY,
      explorerUrl: `${CELO_PROTOCOLS.ERC8004_EXPLORER}/address/${address}`,
    };
  }
}

/**
 * Builds calldata to register an ERC-8004 Agent Identity directly on Celo Mainnet
 * with the team's ERC-8021 attribution suffix included!
 */
export function buildERC8004RegisterCalldata(agentMetadataUri?: string): {
  to: `0x${string}`;
  data: `0x${string}`;
} {
  const uri =
    agentMetadataUri ||
    'ipfs://bafkreihreworkceloagent8004metadata2026';
  const baseData = encodeFunctionData({
    abi: ERC8004_ABI,
    functionName: 'register',
    args: [uri],
  });
  return {
    to: CELO_PROTOCOLS.ERC8004_REGISTRY,
    data: appendCeloAttributionData(baseData),
  };
}

export { CELO_ASSETS };
