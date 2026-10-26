/**
 * ReWork — Real-Time Celo Yield Discovery via DeFiLlama Yields API
 * Endpoint: https://yields.llama.fi/pools (Filtered by chain === "Celo")
 */

export type PoolRiskLevel = 'Bajo' | 'Medio' | 'Alto';

export interface CeloDeFiLlamaPool {
  poolId: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  riskLevel: PoolRiskLevel;
  riskReason: string;
  url: string;
  underlyingTokens: string[];
}

interface CacheEntry {
  timestamp: number;
  pools: CeloDeFiLlamaPool[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let memoryCache: CacheEntry | null = null;

const PROJECT_URLS: Record<string, string> = {
  'uniswap-v3': 'https://app.uniswap.org/explore/pools/celo',
  'aave-v3': 'https://app.aave.com/?marketName=proto_celo_v3',
  'ubeswap': 'https://app.ubeswap.org/#/earn',
  'mento': 'https://app.mento.org',
  'curve-dex': 'https://curve.fi/#/celo/pools',
  'beefy': 'https://app.beefy.com',
  'ichi': 'https://app.ichi.org',
  'steer-protocol': 'https://app.steer.finance',
};

function computeRiskLevel(raw: any): {
  level: PoolRiskLevel;
  reason: string;
} {
  const tvl = Number(raw.tvlUsd || 0);
  const apy = Number(raw.apy || 0);
  const isStable = Boolean(raw.stablecoin);
  const ilRisk = String(raw.ilRisk || 'no').toLowerCase();

  if (isStable && tvl >= 250_000 && apy <= 25 && ilRisk === 'no') {
    return {
      level: 'Bajo',
      reason: 'Pool stablecoin con alta liquidez (TVL > $250k) y sin riesgo de Impermanent Loss.',
    };
  }
  if (tvl >= 50_000 && apy <= 60) {
    return {
      level: 'Medio',
      reason: isStable
        ? 'Pool estable con liquidez moderada en Celo Mainnet.'
        : 'Exposición a variación de precio de activos (IL moderado).',
    };
  }
  return {
    level: 'Alto',
    reason:
      apy > 60
        ? 'APY elevado impulsado por incentivos volátiles; requiere monitoreo activo.'
        : 'TVL concentrado o par volátil.',
  };
}

/**
 * Fetches live Celo Mainnet yield pools directly from DeFiLlama (`https://yields.llama.fi/pools`).
 */
export async function fetchCeloYieldPools(options?: {
  forceRefresh?: boolean;
  minTvlUsd?: number;
}): Promise<{
  pools: CeloDeFiLlamaPool[];
  fetchedAt: string;
  source: 'defillama_live' | 'cache';
}> {
  const minTvl = options?.minTvlUsd ?? 10_000;

  if (
    !options?.forceRefresh &&
    memoryCache &&
    Date.now() - memoryCache.timestamp < CACHE_TTL_MS
  ) {
    return {
      pools: memoryCache.pools.filter((p) => p.tvlUsd >= minTvl),
      fetchedAt: new Date(memoryCache.timestamp).toISOString(),
      source: 'cache',
    };
  }

  const response = await fetch('https://yields.llama.fi/pools', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `DeFiLlama API respondió con estado HTTP ${response.status}`
    );
  }

  const json = await response.json();
  const rawList: any[] = Array.isArray(json?.data) ? json.data : [];

  const celoPools: CeloDeFiLlamaPool[] = rawList
    .filter(
      (item) =>
        String(item.chain || '').toLowerCase() === 'celo' &&
        Number(item.tvlUsd || 0) >= 1_000 &&
        Number(item.apy || 0) > 0 &&
        Number(item.apy || 0) < 500
    )
    .map((item) => {
      const risk = computeRiskLevel(item);
      const projectSlug = String(item.project || 'celo-defi').toLowerCase();
      return {
        poolId: String(item.pool),
        project: projectSlug,
        symbol: String(item.symbol || 'CELO'),
        tvlUsd: Number(item.tvlUsd || 0),
        apy: Number(item.apy || 0),
        apyBase: Number(item.apyBase || 0),
        apyReward: Number(item.apyReward || 0),
        stablecoin: Boolean(item.stablecoin),
        ilRisk: String(item.ilRisk || 'no'),
        exposure: String(item.exposure || 'single'),
        riskLevel: risk.level,
        riskReason: risk.reason,
        url:
          PROJECT_URLS[projectSlug] ||
          `https://defillama.com/yields/pool/${item.pool}`,
        underlyingTokens: Array.isArray(item.underlyingTokens)
          ? item.underlyingTokens
          : [],
      };
    })
    .sort((a, b) => b.tvlUsd - a.tvlUsd);

  memoryCache = {
    timestamp: Date.now(),
    pools: celoPools,
  };

  return {
    pools: celoPools.filter((p) => p.tvlUsd >= minTvl),
    fetchedAt: new Date().toISOString(),
    source: 'defillama_live',
  };
}
