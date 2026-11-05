"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Fingerprint, Key, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { usePrivy } from "@privy-io/react-auth";
import { useTestnetRails } from "@/lib/feature-flags";

export default function AuthGateway() {
  const router = useRouter();
  const { t, language, setLanguage } = useSettings();
  const testnetRailsEnabled = useTestnetRails();
  const { connected, connect, address } = useWallet();
  const {
    connected: solConnected,
    address: solAddress,
    connectSolana,
    walletName: solWalletName,
  } = useSolanaWallet();
  const {
    connected: celoConnected,
    address: celoAddress,
    connectCelo,
    walletName: celoWalletName,
  } = useCeloWallet();
  const { profile } = useProfile();
  const { login, authenticated, ready } = usePrivy();
  const [step, setStep] = useState<"SELECT" | "CREATING_AURA">("SELECT");
  const [walletTab, setWalletTab] = useState<"celo" | "solana" | "stellar">("celo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (ready && (authenticated || celoConnected || profile) && step === "SELECT") {
      router.push("/workspaces");
    }
  }, [ready, authenticated, celoConnected, profile, step, router]);

  const handlePrivyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      login();
    } catch (err: any) {
      console.error("Error with Privy Login:", err);
      setError(err?.message || "Error al iniciar sesión.");
      setLoading(false);
    }
  };

  const handleConnectCelo = async () => {
    setLoading(true);
    setError(null);

    try {
      const addr = await connectCelo();
      if (!addr) {
        throw new Error("No se pudo obtener la dirección de Celo Mainnet.");
      }
      setStep("CREATING_AURA");
      setLoading(false);

      setTimeout(() => {
        router.push("/workspaces");
      }, 1800);
    } catch (err: any) {
      console.error("Error conectando Celo:", err);
      setError(err?.message || "Error al conectar la wallet en Celo Mainnet.");
      setLoading(false);
    }
  };

  const handleConnectSolana = async () => {
    setLoading(true);
    setError(null);

    try {
      const addr = await connectSolana("auto");
      if (!addr) {
        throw new Error("No se pudo obtener la dirección de Solana.");
      }
      setStep("CREATING_AURA");
      setLoading(false);

      setTimeout(() => {
        router.push("/workspaces");
      }, 2000);
    } catch (err: any) {
      console.error("Error conectando Solana:", err);
      setError(err?.message || "Error al conectar la wallet de Solana.");
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const addr = await connect();
      if (!addr) {
        throw new Error("No se pudo obtener la dirección de la wallet.");
      }
      setStep("CREATING_AURA");
      setLoading(false);

      setTimeout(() => {
        router.push("/workspaces");
      }, 2000);
    } catch (err: any) {
      console.error("Error conectando wallet:", err);
      setError(err?.message || "Error al conectar la wallet. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full p-6 flex items-center justify-between z-10 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors group min-w-[140px]">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">{t.authPage.back}</span>
        </Link>
        <div className="flex items-center gap-3 shrink-0 min-w-[160px] justify-end">
          <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground shrink-0"
            title={language === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {language === "es" ? "ES" : "EN"}
          </button>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            🌱 Celo Mainnet · 42220
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo / Context */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-accent-teal/20 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <Fingerprint className="w-8 h-8 text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {step === "SELECT" ? t.authPage.title : t.authPage.titleCreating}
          </h1>
          <p className="text-muted text-sm">
            {step === "SELECT"
              ? language === "es"
                ? "Ingresá con tu correo o conectá tu wallet para operar en Celo Mainnet."
                : "Sign in with Google/Email or connect your Celo Mainnet wallet."
              : t.authPage.subtitleCreating}
          </p>
        </div>

        {/* Dynamic Card */}
        <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>

          {step === "SELECT" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 animate-in fade-in duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Privy Login Button (Google/Email -> Celo Mainnet Embedded Wallet) */}
              <button
                onClick={handlePrivyLogin}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-accent-teal/30 bg-accent-teal/10 hover:bg-accent-teal/20 transition-all group relative overflow-hidden disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,242,255,0.4)] shrink-0">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-accent-teal">
                      {language === "es" ? "Continuar con Google o Email" : "Continue with Google or Email"}
                    </p>
                    <p className="text-xs text-accent-teal/80">
                      {language === "es"
                        ? "Billetera automática en Celo Mainnet sin extensiones"
                        : "Automatic Celo Mainnet embedded wallet"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-accent-teal group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Wallet Section */}
              <div>
                <div className="relative flex items-center py-2 mb-3">
                  <div className="flex-grow border-t border-border-subtle"></div>
                  <span className="flex-shrink-0 mx-4 text-muted text-xs font-medium">
                    {language === "es" ? "o conectá tu wallet Web3" : "or connect your Web3 wallet"}
                  </span>
                  <div className="flex-grow border-t border-border-subtle"></div>
                </div>

                {/* Only show experimental Testnet/Devnet rail switcher if Labs Flag is enabled */}
                {testnetRailsEnabled && (
                  <div className="grid grid-cols-3 p-1 bg-foreground/5 rounded-2xl border border-border-subtle mb-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setWalletTab("celo")}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        walletTab === "celo"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      <span className="text-sm">🌱</span>
                      <span>Celo</span>
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Main</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletTab("solana")}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        walletTab === "solana"
                          ? "bg-purple-600/30 text-white border border-purple-500/50 shadow-sm"
                          : "text-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      <span className="text-sm">⚡</span>
                      <span>Solana</span>
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30">Labs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletTab("stellar")}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        walletTab === "stellar"
                          ? "bg-accent-teal/20 text-accent-teal border border-accent-teal/40 shadow-sm"
                          : "text-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      <span className="text-sm">🚀</span>
                      <span>Stellar</span>
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-accent-teal/10 text-accent-teal border border-accent-teal/30">Labs</span>
                    </button>
                  </div>
                )}

                {/* Celo Mainnet Primary Card */}
                {(!testnetRailsEnabled || walletTab === "celo") && (
                  <button
                    onClick={handleConnectCelo}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group disabled:opacity-50 animate-in fade-in duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                        <div className="w-full h-full bg-[#0d1624] rounded-full flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white">
                            {celoConnected ? "Celo Mainnet Conectada" : "Conectar Wallet Web3 (Celo Mainnet)"}
                          </p>
                        </div>
                        <p className="text-xs text-emerald-300/80">
                          {celoConnected
                            ? `${celoWalletName || "Celo"}: ${celoAddress?.slice(0, 6)}...${celoAddress?.slice(-4)}`
                            : "MetaMask, MiniPay, Rabby o Valora (Chain 42220)"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-emerald-300 transition-transform relative z-10 shrink-0 ${loading ? "" : "group-hover:translate-x-1"}`} />
                  </button>
                )}

                {/* Hidden Labs Tabs (only when testnetRailsEnabled === true) */}
                {testnetRailsEnabled && walletTab === "solana" && (
                  <button
                    onClick={handleConnectSolana}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all group disabled:opacity-50 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-full p-0.5 flex items-center justify-center shrink-0">
                        <div className="w-full h-full bg-[#0d1624] rounded-full flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-[#14F195]" />
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-white">
                          {solConnected ? "Solana Conectada" : "Conectar Wallet Solana (Labs)"}
                        </p>
                        <p className="text-xs text-purple-300/80">
                          {solConnected
                            ? `${solWalletName}: ${solAddress?.slice(0, 6)}...${solAddress?.slice(-4)}`
                            : "Phantom, Solflare, Backpack"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-300" />
                  </button>
                )}

                {testnetRailsEnabled && walletTab === "stellar" && (
                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-foreground/5 hover:bg-foreground/10 transition-colors group disabled:opacity-50 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center border border-border-subtle shrink-0">
                        <Wallet className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">
                          {connected ? "Wallet Conectada" : "Conectar Wallet Stellar (Labs)"}
                        </p>
                        <p className="text-xs text-muted">
                          {connected
                            ? `${address?.slice(0, 8)}...${address?.slice(-6)}`
                            : "Freighter, xBull, Lobstr"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </button>
                )}

                <p className="text-[11px] text-muted text-center mt-3 leading-relaxed">
                  🌱 <strong>Operación Real en Celo Mainnet:</strong> Soporte nativo para dólares digitales (<strong>USDC</strong>, <strong>USA₮ x402</strong>) y monedas locales 1:1 de América Latina (<strong>wARS</strong>, <strong>wBRL</strong>, <strong>wCOP</strong>, <strong>wMXN</strong>).
                </p>
              </div>
            </div>
          )}

          {step === "CREATING_AURA" && (
            <div className="py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-foreground/10 border-2 border-emerald-400/50 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(16,185,129,0.3)] z-10 relative">
                  🌱
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-[spin_3s_linear_infinite]">
                  <div className="w-4 h-4 rounded-full bg-emerald-400 absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted flex items-center gap-2">
                    <Key className="w-4 h-4" /> Conexión Celo Mainnet (42220)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> Sincronizando Espacio de Trabajo
                  </span>
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-8">
          {language === "es"
            ? "Al continuar aceptás los"
            : "By continuing you agree to the"}{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            {language === "es" ? "Términos de Servicio" : "Terms of Service"}
          </Link>{" "}
          {language === "es" ? "y la" : "and"}{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            {language === "es" ? "Política de Privacidad" : "Privacy Policy"}
          </Link>{" "}
          {language === "es" ? "de ReWork." : "of ReWork."}
        </p>
      </div>
    </div>
  );
}
