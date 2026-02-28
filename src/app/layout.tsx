import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TWProvider } from "@/components/TWProvider";
import { FreighterProvider } from "@/hooks/useFreighter";
import { ProfileProvider } from "@/hooks/useProfile";

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
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-deep-navy text-white antialiased min-h-screen selection:bg-accent-teal/30 custom-scrollbar`}>
        <FreighterProvider>
          <ProfileProvider>
            <TWProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 ml-64 overflow-y-auto bg-deep-navy custom-scrollbar">
                  <Header />
                  <div className="p-8">
                    {children}
                  </div>
                </main>
              </div>
            </TWProvider>
          </ProfileProvider>
        </FreighterProvider>
      </body>
    </html>
  );
}
