"use client";

import React, { ReactNode } from "react";
import { ClientProvider } from "@solana/react";
import { solanaClient } from "@/lib/solana";

export function SolanaProvider({ children }: { children: ReactNode }) {
  return <ClientProvider client={solanaClient}>{children}</ClientProvider>;
}
