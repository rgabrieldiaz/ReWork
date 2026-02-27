import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ConnectButton } from "@/components/ConnectButton";
import { TWProvider } from "@/components/TWProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <TWProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 overflow-y-auto bg-black">
              <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-10">
                <h2 className="text-xl font-medium tracking-tight">Panel de Control</h2>
                <ConnectButton />
              </header>
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </TWProvider>
      </body>
    </html>
  );
}
