/**
 * ReWork - Solana Infrastructure & Constants
 * Track: Superteam Argentina @ Crypto World's Fair (Colosseum Hackathon)
 * Standard: @solana/kit v8+ with plugins, Devnet USDC SPL Token
 */

import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";

// ── Cluster & RPC Configuration ──────────────────────────────────────────────
export const SOLANA_CLUSTER = "devnet";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Official Circle USDC SPL Token Mint on Solana Devnet
export const SOLANA_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// Decimals for USDC on Solana (standard SPL 6 decimals)
export const SOLANA_USDC_DECIMALS = 6;

// ── Client Creation (@solana/kit v8+ with plugins & v1 transactions) ──────────
export const solanaClient = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(
    solanaRpc({
      rpcUrl: SOLANA_RPC_URL,
      transactionConfig: { version: 1 },
    })
  );

export type AppSolanaClient = typeof solanaClient;

// ── Helpers & Formatting ─────────────────────────────────────────────────────

/**
 * Builds Solana Explorer link for transactions or accounts on devnet
 */
export function getSolanaExplorerUrl(
  type: "tx" | "address",
  id: string,
  cluster: string = SOLANA_CLUSTER
): string {
  const query = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/${type}/${id}${query}`;
}

/**
 * Truncates a base58 Solana public key for UI presentation
 */
export function formatSolanaAddress(addr: string, chars: number = 4): string {
  if (!addr) return "";
  if (addr.length <= chars * 2) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

/**
 * Converts human readable USDC amount to SPL raw integer units (6 decimals)
 */
export function usdcToRawUnits(amount: number | string): bigint {
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(parsed) || parsed < 0) return BigInt(0);
  return BigInt(Math.round(parsed * 10 ** SOLANA_USDC_DECIMALS));
}

/**
 * Converts raw SPL integer units to human readable USDC formatted string
 */
export function rawUnitsToUsdc(raw: bigint | number): string {
  const num = typeof raw === "bigint" ? Number(raw) : raw;
  return (num / 10 ** SOLANA_USDC_DECIMALS).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
