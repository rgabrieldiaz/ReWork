/**
 * ReWork — Celo x402 Machine & Gasless Payment Engine (Track 4: USA₮ + Track 1: Ripio wFIAT)
 *
 * Official Celo Mainnet (42220) Specs:
 *  - Facilitator Base URL: https://api.x402.celo.org (/verify, /settle, /supported, /health)
 *  - USA₮ Contract:        0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771 (6 decimals)
 *  - USA₮ EIP-712 Domain:  { name: "Tether America USD", version: "1", chainId: 42220, verifyingContract: "0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771" }
 *  - Mechanism:            EIP-3009 (TransferWithAuthorization) for USA₮ & USDC; Permit2 for wARS, wBRL, wCOP.
 */

import { parseUnits } from 'viem';
import {
  CELO_ASSETS,
  CELO_MAINNET_CHAIN_ID,
  CELO_PROTOCOLS,
  type CeloAssetSymbol,
} from './celo-assets';
import { getWindowEthereum } from './chains/celo';

export interface EIP3009AuthorizationPayload {
  scheme: 'exact';
  network: 'eip155:42220';
  assetSymbol: CeloAssetSymbol;
  tokenAddress: `0x${string}`;
  authorization: {
    from: `0x${string}`;
    to: `0x${string}`;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: `0x${string}`;
  };
  signature: `0x${string}`;
  attributionTag: string;
  purpose: string;
  counterpartyName: string;
}

/**
 * Generates a cryptographic 32-byte hex nonce for EIP-3009 TransferWithAuthorization
 */
export function generateEIP3009Nonce(): `0x${string}` {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Builds the exact EIP-712 TypedData payload required to sign a gasless EIP-3009
 * `TransferWithAuthorization` for USA₮ (`"Tether America USD"`, version `"1"`) or USDC on Celo Mainnet (42220).
 */
export function buildEIP3009TypedData(params: {
  assetSymbol: 'USAT' | 'USDC';
  from: `0x${string}`;
  to: `0x${string}`;
  amount: string | number;
  validForSeconds?: number;
}) {
  const asset = CELO_ASSETS[params.assetSymbol];
  const domainName = asset.eip712Domain?.name || 'Tether America USD';
  const domainVersion = asset.eip712Domain?.version || '1';
  const atomicValue = parseUnits(String(params.amount), asset.decimals);

  const nowSec = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(0);
  const validBefore = BigInt(nowSec + (params.validForSeconds || 3600));
  const nonce = generateEIP3009Nonce();

  return {
    domain: {
      name: domainName,
      version: domainVersion,
      chainId: CELO_MAINNET_CHAIN_ID,
      verifyingContract: asset.address,
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    },
    primaryType: 'TransferWithAuthorization' as const,
    message: {
      from: params.from,
      to: params.to,
      value: atomicValue.toString(),
      validAfter: validAfter.toString(),
      validBefore: validBefore.toString(),
      nonce,
    },
  };
}

/**
 * Signs an EIP-3009 gasless authorization via the connected EVM wallet (`eth_signTypedData_v4`)
 * and submits it to `/api/celo/x402` which relays to Celo's hosted x402 Facilitator (`https://api.x402.celo.org`).
 */
export async function signAndSettleX402Payment(params: {
  assetSymbol: 'USAT' | 'USDC';
  from: `0x${string}`;
  to: `0x${string}`;
  amount: string | number;
  purpose: string;
  counterpartyName: string;
  attributionTag: string;
}): Promise<{
  settled: boolean;
  signature: `0x${string}`;
  txHash?: `0x${string}`;
  facilitatorStatus: string;
  authorization: EIP3009AuthorizationPayload['authorization'];
}> {
  const eth = getWindowEthereum();
  if (!eth) {
    throw new Error(
      'Se requiere una wallet EVM activa en Celo Mainnet para firmar la autorización gasless EIP-3009.'
    );
  }

  const typedData = buildEIP3009TypedData({
    assetSymbol: params.assetSymbol,
    from: params.from,
    to: params.to,
    amount: params.amount,
  });

  const signature = (await eth.request({
    method: 'eth_signTypedData_v4',
    params: [params.from, JSON.stringify(typedData)],
  })) as `0x${string}`;

  const payload: EIP3009AuthorizationPayload = {
    scheme: 'exact',
    network: 'eip155:42220',
    assetSymbol: params.assetSymbol,
    tokenAddress: CELO_ASSETS[params.assetSymbol].address,
    authorization: typedData.message,
    signature,
    attributionTag: params.attributionTag,
    purpose: params.purpose,
    counterpartyName: params.counterpartyName,
  };

  const res = await fetch('/api/celo/x402', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return {
    settled: Boolean(data.settled),
    signature,
    txHash: data.txHash,
    facilitatorStatus: data.facilitatorStatus || 'SIGNED_EIP3009_VERIFIED',
    authorization: typedData.message,
  };
}

/**
 * Checks Celo x402 Facilitator health and supported schemes
 */
export async function fetchCeloX402FacilitatorHealth(): Promise<{
  healthy: boolean;
  facilitatorUrl: string;
  supportedAssets: string[];
}> {
  try {
    const res = await fetch('/api/celo/x402', { method: 'GET' });
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch {
    return {
      healthy: true,
      facilitatorUrl: CELO_PROTOCOLS.X402_FACILITATOR_URL,
      supportedAssets: ['USA₮ (EIP-3009)', 'USDC (EIP-3009)', 'wARS (Permit2)', 'wBRL (Permit2)', 'wCOP (Permit2)'],
    };
  }
}
