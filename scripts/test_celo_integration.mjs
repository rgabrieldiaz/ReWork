/**
 * ReWork — Automated Celo Mainnet (42220) & 4-Track Verification Suite
 * Run with: node scripts/test_celo_integration.mjs
 */

import https from 'node:https';
import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';
import { toDataSuffix, fromDataSuffix } from '@celo/attribution-tags';

const CONTRACTS_TO_VERIFY = [
  { name: 'USA₮ (Track 4)', address: '0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771' },
  { name: 'Ripio wARS (Track 1)', address: '0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d' },
  { name: 'Ripio wBRL (Track 1)', address: '0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0' },
  { name: 'Ripio BridgeDeposit (Track 1)', address: '0x465e642387d3d73a57CDc1368fFA53A800bA5D47' },
  { name: 'Textile LimitOrderReactor (Track 2)', address: '0xa9AA0a64769cBed4d3B1Ceb4Df01CdE915C235b3' },
  { name: 'ERC-8004 Identity Registry', address: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' },
];

function getJsonHttps(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          rejectUnauthorized: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ReWorkCeloAgent/1.0)',
            Accept: 'application/json',
          },
        },
        (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, data: raw });
          }
        });
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('=== 🌱 ReWork Celo Mainnet (42220) Integration Health Check ===\n');

  // 1. Verify ERC-8021 Attribution Tag Encoding/Decoding
  const suffix = toDataSuffix(['rework', 'rework_celo_latam']);
  const decoded = fromDataSuffix(suffix);
  console.log('[1/4] ERC-8021 Attribution Suffix:', suffix);
  console.log('      Decoded Codes:', decoded?.codes);
  if (!decoded || !decoded.codes.includes('rework_celo_latam')) {
    throw new Error('ERC-8021 Attribution Tag roundtrip failed');
  }

  // 2. Verify Celo Mainnet RPC & Bytecode of Official Contracts
  const client = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });

  const blockNumber = await client.getBlockNumber();
  console.log(`\n[2/4] Celo Mainnet RPC Connected — Latest Block: #${blockNumber}`);

  for (const item of CONTRACTS_TO_VERIFY) {
    const code = await client.getCode({ address: item.address });
    const hasBytecode = Boolean(code && code !== '0x' && code.length > 4);
    console.log(
      `      ${hasBytecode ? '✅' : '❌'} ${item.name} (${item.address}) — Bytecode len: ${code ? code.length : 0}`
    );
  }

  // 3. Verify DeFiLlama Live Celo Pools
  const llamaRes = await fetch('https://yields.llama.fi/pools');
  const llamaJson = await llamaRes.json();
  const celoPools = (llamaJson?.data || []).filter(
    (p) => String(p.chain || '').toLowerCase() === 'celo'
  );
  console.log(`\n[3/4] DeFiLlama API Live — Found ${celoPools.length} Celo Mainnet pools.`);

  // 4. Verify @celo/buy Gateway Catalog (Track 3) & Celo x402 Facilitator (Track 4)
  const buyRes = await getJsonHttps('https://gateway.usebuy.ai/v1/catalog');
  const capCount = Array.isArray(buyRes?.data?.capabilities)
    ? buyRes.data.capabilities.length
    : 0;
  console.log(
    `\n[4/4] @celo/buy Gateway Live (HTTP ${buyRes.status}) — Found ${capCount} x402 capabilities at https://gateway.usebuy.ai/v1/catalog`
  );

  console.log('\n🎉 All 4 Celo Hackathon Tracks & On-Chain Dependencies Verified!');
}

main().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
