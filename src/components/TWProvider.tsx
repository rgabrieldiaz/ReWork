"use client";

import { TrustlessWorkConfig, mainNet } from "@trustless-work/escrow";

export function TWProvider({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_TW_API_KEY || "tw_demo_key";

    return (
        <TrustlessWorkConfig apiKey={apiKey} baseURL={mainNet}>
            {children}
        </TrustlessWorkConfig>
    );
}
