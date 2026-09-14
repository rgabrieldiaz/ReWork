"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

export function PrivyWrapper({ children }: { children: ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!appId) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full p-6 bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl space-y-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl font-bold">
                        ⚙️
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Configuración Requerida</h2>
                    <p className="text-sm text-slate-400">
                        No se ha detectado la variable de entorno <code className="text-teal-300 bg-slate-800 px-2 py-1 rounded text-xs">NEXT_PUBLIC_PRIVY_APP_ID</code>.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Para habilitar la autenticación, agrega esta variable en tu panel de Vercel (<strong className="text-slate-200">Project Settings &gt; Environment Variables</strong>) o en tu archivo <code className="text-teal-300">.env.local</code>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
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
