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
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { Toaster } from "sonner";
import { PrivyWrapper } from "@/components/PrivyWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "ReWork",
  description: "Stellar Incentives Dashboard",
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
                <WorkspaceProvider>
                  <TWProvider>
                    <MainLayout>
                      {children}
                    </MainLayout>
                  </TWProvider>
                </WorkspaceProvider>
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
