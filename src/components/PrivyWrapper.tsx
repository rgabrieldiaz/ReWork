"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

export function PrivyWrapper({ children }: { children: ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                appearance: {
                    theme: "dark",
                    accentColor: "#00F2FF",
                    logo: undefined,
                },
                loginMethods: ["google", "email"],
                embeddedWallets: {
                    createOnLogin: "off"
                } as any
            }}
        >
            {children}
        </PrivyProvider>
    );
}
