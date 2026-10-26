import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TWProvider } from "@/components/TWProvider";
import { WalletProvider } from "@/hooks/useWallet";
import { ProfileProvider } from "@/hooks/useProfile";
import { SettingsProvider } from "@/hooks/useSettings";
import { MainLayout } from "@/components/MainLayout";
import { BalanceProvider } from "@/hooks/useSharedBalances";
import { StakingProvider } from "@/hooks/useStaking";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { UpgradePlanModal } from "@/components/UpgradePlanModal";
import { Toaster } from "sonner";
import { PrivyWrapper } from "@/components/PrivyWrapper";
import { SolanaProvider } from "@/components/SolanaProvider";
import { SolanaWalletProvider } from "@/hooks/useSolanaWallet";
import { CeloWalletProvider } from "@/hooks/useCeloWallet";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rework.network"),
  title: "ReWork — El Valor de la Confianza Garantizado por el Código",
  description: "Plataforma Multichain (Celo Mainnet · Solana · Stellar) de Custodia Inteligente, Agentes Autónomos ERC-8004, wFIAT LatAm, USA₮ x402 y Pagos QR.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ReWork — El Valor de la Confianza Garantizado por el Código",
    description: "Agentes en Celo Mainnet · wFIAT Ripio · USA₮ x402 · Textile FX · Solana · Stellar",
    url: "https://rework.network",
    siteName: "ReWork",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReWork — Multichain Operating System",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReWork — El Valor de la Confianza Garantizado por el Código",
    description: "Agentes en Celo Mainnet · wFIAT Ripio · USA₮ x402 · Textile FX · Solana · Stellar",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${jetbrains.variable} font-sans bg-background text-foreground antialiased min-h-screen selection:bg-accent-teal/20 custom-scrollbar`} suppressHydrationWarning>
        <SettingsProvider>
          <PrivyWrapper>
            <SolanaProvider>
              <SolanaWalletProvider>
                <CeloWalletProvider>
                  <WalletProvider>
                    <ProfileProvider>
                      <BalanceProvider>
                        <StakingProvider>
                          <WorkspaceProvider>
                            <SubscriptionProvider>
                              <TWProvider>
                                <MainLayout>
                                  {children}
                                </MainLayout>
                                <UpgradePlanModal />
                              </TWProvider>
                            </SubscriptionProvider>
                          </WorkspaceProvider>
                        </StakingProvider>
                      </BalanceProvider>
                    </ProfileProvider>
                  </WalletProvider>
                </CeloWalletProvider>
              </SolanaWalletProvider>
            </SolanaProvider>
          </PrivyWrapper>
        </SettingsProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: "bg-background border border-border-subtle text-foreground font-sans",
          }}
        />
      </body>
    </html>
  );
}
