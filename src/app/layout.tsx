import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
import { Toaster } from "sonner";
import { PrivyWrapper } from "@/components/PrivyWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rework.network"),
  title: "ReWork — El Valor de la Confianza Garantizado por el Código",
  description: "Plataforma descentralizada de Workspaces B2B, Custodia Inteligente en Soroban y Pagos Móviles QR (SEP-0007) sobre Stellar.",
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
    description: "Workspaces Descentralizados · Escrow en Soroban · Pagos SEP-0007 · DeFi Stellar",
    url: "https://rework.network",
    siteName: "ReWork",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReWork — Stellar × BAF",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReWork — El Valor de la Confianza Garantizado por el Código",
    description: "Workspaces Descentralizados · Escrow en Soroban · Pagos SEP-0007 · DeFi Stellar",
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
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-background text-foreground antialiased min-h-screen selection:bg-accent-teal/30 custom-scrollbar`} suppressHydrationWarning>
        <SettingsProvider>
          <PrivyWrapper>
            <WalletProvider>
              <ProfileProvider>
                <BalanceProvider>
                  <StakingProvider>
                    <WorkspaceProvider>
                      <TWProvider>
                        <MainLayout>
                          {children}
                        </MainLayout>
                      </TWProvider>
                    </WorkspaceProvider>
                  </StakingProvider>
                </BalanceProvider>
              </ProfileProvider>
            </WalletProvider>
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
