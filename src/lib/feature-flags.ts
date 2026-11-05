"use client";

import { useState, useEffect } from "react";

const STORAGE_TESTNET_RAILS_KEY = "rework_enable_testnet_rails";
const EVENT_NAME = "rework:testnet-rails-changed";

export const ENV_TESTNET_RAILS_DEFAULT =
  process.env.NEXT_PUBLIC_ENABLE_TESTNET_RAILS === "true";

/**
 * Returns true ONLY if experimental Testnet/Devnet rails (Solana Devnet & Stellar Testnet)
 * are explicitly enabled via env var or developer labs toggle.
 * Defaults to FALSE in production so judges & real users experience 100% pure Celo Mainnet (42220).
 */
export function isTestnetRailsEnabled(): boolean {
  if (typeof window === "undefined") {
    return ENV_TESTNET_RAILS_DEFAULT;
  }
  const saved = window.localStorage.getItem(STORAGE_TESTNET_RAILS_KEY);
  if (saved === "true") return true;
  if (saved === "false") return false;
  return ENV_TESTNET_RAILS_DEFAULT;
}

export function setTestnetRailsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_TESTNET_RAILS_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enabled }));
}

export function useTestnetRails(): boolean {
  const [enabled, setEnabled] = useState<boolean>(ENV_TESTNET_RAILS_DEFAULT);

  useEffect(() => {
    setEnabled(isTestnetRailsEnabled());

    const handleChange = () => {
      setEnabled(isTestnetRailsEnabled());
    };
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return enabled;
}
