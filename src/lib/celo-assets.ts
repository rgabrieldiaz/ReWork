/**
 * ReWork — Celo Mainnet (Chain ID 42220) Verified Asset & Protocol Registry
 *
 * Covers all 4 Tracks of the "Agents on Open Rails" Hackathon (Celo × Loops House):
 *  - Track 1: Ripio wFIAT Local Stablecoins (wARS, wBRL, wMXN, wCOP, wPEN, wCLP) + Ripio Ramp/Bridge
 *  - Track 2: Textile FX Open Corridors (LimitOrderReactor, Permit2, USDC, USD₮, wARS, wBRL, cNGN, IDRX)
 *  - Track 3: Build with @celo/buy (https://gateway.usebuy.ai/v1/catalog)
 *  - Track 4: USA₮ (Tether America USD by Anchorage Digital Bank) with Celo x402 Facilitator (EIP-3009)
 */

export type CeloAssetSymbol =
  | 'CELO'
  | 'USAT'
  | 'USDC'
  | 'USDT'
  | 'wARS'
  | 'wBRL'
  | 'wMXN'
  | 'wCOP'
  | 'wPEN'
  | 'wCLP'
  | 'cNGN'
  | 'IDRX';

export type CeloAssetCategory = 'native' | 'usd_stable' | 'wfiat_latam' | 'fx_corridor';

export interface CeloAssetConfig {
  symbol: CeloAssetSymbol;
  displaySymbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  category: CeloAssetCategory;
  countryCode?: string;
  flag: string;
  isNative?: boolean;
  /** Supports gasless settlement via https://api.x402.celo.org */
  x402Mechanism?: 'eip3009' | 'permit2' | null;
  /** EIP-712 domain info for EIP-3009 TransferWithAuthorization */
  eip712Domain?: {
    name: string;
    version: string;
  };
  /** Optional Celo Fee Abstraction adapter (18 decimals) */
  feeAdapterAddress?: `0x${string}`;
  /** Approximate USD reference price for UI display & portfolio totals */
  referenceUsdRate: number;
  /** Whether supported directly in Textile FX RFQ corridors */
  textileCorridor: boolean;
  /** Whether supported directly in Ripio Ramp URL widget without KYB */
  ripioRampSupported?: boolean;
}

export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_SEPOLIA_CHAIN_ID = 11142220;

export const CELO_PROTOCOLS = {
  /** ERC-8004 On-Chain Agent Identity Registry on Celo Mainnet */
  ERC8004_REGISTRY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' as `0x${string}`,
  ERC8004_EXPLORER: 'https://www.8004scan.io',
  /** Ripio Bridge Deposit Contract on Celo Mainnet */
  RIPIO_BRIDGE_DEPOSIT: '0x465e642387d3d73a57CDc1368fFA53A800bA5D47' as `0x${string}`,
  RIPIO_RAMP_BASE_URL: 'https://ramp.ripio.com',
  RIPIO_BRIDGE_BASE_URL: 'https://bridge.ripio.com',
  /** Textile FX Open Corridors Contracts on Celo Mainnet */
  TEXTILE_LIMIT_ORDER_REACTOR: '0xa9AA0a64769cBed4d3B1Ceb4Df01CdE915C235b3' as `0x${string}`,
  TEXTILE_FEE_CONTROLLER_1BPS: '0x7b005466F905DD882A959888154587fA76cd3Ea7' as `0x${string}`,
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as `0x${string}`,
  TEXTILE_APP_URL: 'https://app.textile.money',
  /** Celo Hosted x402 Facilitator */
  X402_FACILITATOR_URL: 'https://api.x402.celo.org',
  X402_PORTAL_URL: 'https://x402.celo.org',
  /** @celo/buy Gateway */
  BUY_GATEWAY_CATALOG_URL: 'https://gateway.usebuy.ai/v1/catalog',
  BUY_SQD_GATEWAY_URL: 'https://gateway.usebuy.ai/sqd',
  /** Self ZK Proof-of-Human + Google Cloud Web3 USA₮ Faucet */
  GOOGLE_USAT_FAUCET_URL: 'https://cloud.google.com/application/web3/faucet/celo/mainnet',
  SELF_PROTOCOL_DOCS_URL: 'https://docs.self.xyz/',
} as const;

export const CELO_ASSETS: Record<CeloAssetSymbol, CeloAssetConfig> = {
  USAT: {
    symbol: 'USAT',
    displaySymbol: 'USA₮',
    name: 'Tether America USD (US-Regulated · GENIUS Act)',
    address: '0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771',
    decimals: 6,
    category: 'usd_stable',
    countryCode: 'US',
    flag: '🇺🇸',
    x402Mechanism: 'eip3009',
    eip712Domain: {
      name: 'Tether America USD',
      version: '1',
    },
    feeAdapterAddress: '0x0357EE22278c922e1D36cFe6b899269b161880C4',
    referenceUsdRate: 1.0,
    textileCorridor: false,
  },
  USDC: {
    symbol: 'USDC',
    displaySymbol: 'USDC',
    name: 'USD Coin (Circle Native)',
    address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    decimals: 6,
    category: 'usd_stable',
    countryCode: 'US',
    flag: '💵',
    x402Mechanism: 'eip3009',
    eip712Domain: {
      name: 'USD Coin',
      version: '2',
    },
    feeAdapterAddress: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
    referenceUsdRate: 1.0,
    textileCorridor: true,
  },
  USDT: {
    symbol: 'USDT',
    displaySymbol: 'USD₮',
    name: 'Tether USD (Celo Native)',
    address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    decimals: 6,
    category: 'usd_stable',
    countryCode: 'US',
    flag: '🟢',
    x402Mechanism: 'permit2',
    feeAdapterAddress: '0x0E2A3e05bc9A16F5292A6170456A710cb89C6f72',
    referenceUsdRate: 1.0,
    textileCorridor: true,
  },
  wARS: {
    symbol: 'wARS',
    displaySymbol: 'wARS',
    name: 'Ripio Wrapped Peso Argentino',
    address: '0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'AR',
    flag: '🇦🇷',
    x402Mechanism: 'permit2',
    referenceUsdRate: 1 / 1200, // ~1,200 ARS per USD
    textileCorridor: true,
    ripioRampSupported: true,
  },
  wBRL: {
    symbol: 'wBRL',
    displaySymbol: 'wBRL',
    name: 'Ripio Wrapped Real Brasileño',
    address: '0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'BR',
    flag: '🇧🇷',
    x402Mechanism: 'permit2',
    referenceUsdRate: 1 / 5.75, // ~5.75 BRL per USD
    textileCorridor: true,
    ripioRampSupported: false,
  },
  wMXN: {
    symbol: 'wMXN',
    displaySymbol: 'wMXN',
    name: 'Ripio Wrapped Peso Mexicano',
    address: '0x337e7456b420bd3481e7fa61fa9850343d610d34',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'MX',
    flag: '🇲🇽',
    x402Mechanism: null,
    referenceUsdRate: 1 / 20.1, // ~20.1 MXN per USD
    textileCorridor: false,
    ripioRampSupported: false,
  },
  wCOP: {
    symbol: 'wCOP',
    displaySymbol: 'wCOP',
    name: 'Ripio Wrapped Peso Colombiano',
    address: '0x8a1d45e102e886510e891d2ec656a708991e2d76',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'CO',
    flag: '🇨🇴',
    x402Mechanism: 'permit2',
    referenceUsdRate: 1 / 4250, // ~4,250 COP per USD
    textileCorridor: false,
    ripioRampSupported: false,
  },
  wPEN: {
    symbol: 'wPEN',
    displaySymbol: 'wPEN',
    name: 'Ripio Wrapped Sol Peruano',
    address: '0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'PE',
    flag: '🇵🇪',
    x402Mechanism: null,
    referenceUsdRate: 1 / 3.75, // ~3.75 PEN per USD
    textileCorridor: false,
    ripioRampSupported: false,
  },
  wCLP: {
    symbol: 'wCLP',
    displaySymbol: 'wCLP',
    name: 'Ripio Wrapped Peso Chileno',
    address: '0x61D450a098b6a7f69fC4b98CE68198fe59768651',
    decimals: 18,
    category: 'wfiat_latam',
    countryCode: 'CL',
    flag: '🇨🇱',
    x402Mechanism: null,
    referenceUsdRate: 1 / 960, // ~960 CLP per USD
    textileCorridor: false,
    ripioRampSupported: false,
  },
  CELO: {
    symbol: 'CELO',
    displaySymbol: 'CELO',
    name: 'Celo Native Token',
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    decimals: 18,
    category: 'native',
    flag: '🌱',
    isNative: true,
    x402Mechanism: null,
    referenceUsdRate: 0.68,
    textileCorridor: false,
  },
  cNGN: {
    symbol: 'cNGN',
    displaySymbol: 'cNGN',
    name: 'Compliant Nigerian Naira (Textile Corridor)',
    address: '0xF6829D7393dAe24509eb1E52eE8e572e2E271a4f',
    decimals: 6,
    category: 'fx_corridor',
    countryCode: 'NG',
    flag: '🇳🇬',
    x402Mechanism: null,
    referenceUsdRate: 1 / 1600,
    textileCorridor: true,
  },
  IDRX: {
    symbol: 'IDRX',
    displaySymbol: 'IDRX',
    name: 'Indonesian Rupiah Stablecoin (Textile Corridor)',
    address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
    decimals: 2,
    category: 'fx_corridor',
    countryCode: 'ID',
    flag: '🇮🇩',
    x402Mechanism: null,
    referenceUsdRate: 1 / 15800,
    textileCorridor: true,
  },
};

export const CELO_ASSET_LIST: CeloAssetConfig[] = Object.values(CELO_ASSETS);

export const CELO_WFIAT_ASSETS: CeloAssetConfig[] = CELO_ASSET_LIST.filter(
  (a) => a.category === 'wfiat_latam'
);

export const CELO_USD_STABLE_ASSETS: CeloAssetConfig[] = CELO_ASSET_LIST.filter(
  (a) => a.category === 'usd_stable'
);

export const CELO_TEXTILE_ASSETS: CeloAssetConfig[] = CELO_ASSET_LIST.filter(
  (a) => a.textileCorridor
);

/**
 * Helper to build official Ripio Ramp On-Ramp or Off-Ramp URLs for Celo Mainnet (42220)
 */
export function buildRipioRampUrl(params: {
  mode: 'onramp' | 'offramp';
  country?: string;
  token?: string;
  amount?: number | string;
  address?: string;
}): string {
  const basePath =
    params.mode === 'offramp'
      ? `${CELO_PROTOCOLS.RIPIO_RAMP_BASE_URL}/offramp`
      : CELO_PROTOCOLS.RIPIO_RAMP_BASE_URL;

  const search = new URLSearchParams({
    country: (params.country || 'AR').toUpperCase(),
    chain: String(CELO_MAINNET_CHAIN_ID),
    token: (params.token || 'WARS').toUpperCase(),
  });

  if (params.amount !== undefined && String(params.amount).trim() !== '') {
    search.set('amount', String(params.amount));
  }
  if (params.address && params.address.startsWith('0x')) {
    search.set('address', params.address);
  }

  return `${basePath}/?${search.toString()}`;
}

/**
 * Helper to format Celoscan URLs
 */
export function getCeloscanUrl(
  type: 'tx' | 'address' | 'token',
  value: string,
  chainId: number = CELO_MAINNET_CHAIN_ID
): string {
  const base =
    chainId === CELO_SEPOLIA_CHAIN_ID
      ? 'https://celo-sepolia.blockscout.com'
      : 'https://celoscan.io';
  return `${base}/${type}/${value}`;
}
