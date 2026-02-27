"use client";

import { TrustlessWorkConfig, mainNet } from "@trustless-work/escrow";

export function TWProvider({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_TW_API_KEY;

    if (!apiKey) {
        console.warn("Missing NEXT_PUBLIC_TW_API_KEY environment variable. Trustless Work features will not work.");
        return <>{children}</>;
    }

    return (
        <TrustlessWorkConfig apiKey={apiKey} baseURL={mainNet}>
            {children}
        </TrustlessWorkConfig>
    );
}
