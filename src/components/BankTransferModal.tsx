"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Landmark,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { formatCurrency, DEFAULT_RATES } from "@/lib/currency";
import {
  buildRipioRampUrl,
  CELO_ASSETS,
  CELO_PROTOCOLS,
  CELO_WFIAT_ASSETS,
  type CeloAssetSymbol,
} from "@/lib/celo-assets";
import { toast } from "sonner";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankTransferModal({ isOpen, onClose }: BankTransferModalProps) {
  const { usdcBalance, refresh } = useSharedBalances();
  const { t, language } = useSettings();
  const {
    connected: celoConnected,
    address: celoAddress,
    balances: celoBalances,
    connectCelo,
    sendCeloAsset,
    attributionTag,
  } = useCeloWallet();

  const [mounted, setMounted] = useState<boolean>(false);
  const [activeRail, setActiveRail] = useState<"celo_ripio" | "classic_ars">(
    "celo_ripio"
  );

  // Ripio Ramp & Bridge state (Track 1)
  const [ripioMode, setRipioMode] = useState<"onramp" | "offramp" | "bridge">(
    "onramp"
  );
  const [ripioToken, setRipioToken] = useState<CeloAssetSymbol>("wARS");
  const [ripioAmount, setRipioAmount] = useState<string>("50000");
  const [ripioCountry, setRipioCountry] = useState<string>("AR");
  const [isBridgingOnChain, setIsBridgingOnChain] = useState<boolean>(false);

  // Classic ARS Bank state
  const [usdcAmount, setUsdcAmount] = useState<string>("50");
  const [cbuAlias, setCbuAlias] = useState<string>("rework.crypto.ars");
  const [accountHolder, setAccountHolder] = useState<string>("Gabriel Diaz");
  const [cuit, setCuit] = useState<string>("20-35891234-9");
  const [bankName] = useState<string>("Mercado Pago / Banco Galicia");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const numericUsdc = parseFloat(usdcAmount) || 0;
  const pesosReceiving = numericUsdc * DEFAULT_RATES.USDC_TO_ARS;

  const targetAddress =
    celoAddress || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  const ripioUrl = buildRipioRampUrl({
    mode: ripioMode === "offramp" ? "offramp" : "onramp",
    country: ripioCountry,
    token: ripioToken,
    amount: ripioAmount,
    address: targetAddress,
  });

  const handleOpenRipioRamp = () => {
    window.open(ripioUrl, "_blank", "noopener,noreferrer");
    toast.success(
      `Abriendo Ripio ${
        ripioMode === "offramp" ? "Off-Ramp (Retiro a Banco)" : "On-Ramp (Carga Fiat)"
      } para ${ripioToken} en Celo Mainnet (42220)`
    );
  };

  const handleDepositToRipioBridge = async () => {
    if (!celoConnected) {
      await connectCelo();
      return;
    }
    setIsBridgingOnChain(true);
    try {
      const receipt = await sendCeloAsset({
        symbol: ripioToken,
        recipient: CELO_PROTOCOLS.RIPIO_BRIDGE_DEPOSIT,
        amount: ripioAmount,
      });
      toast.success(
        `¡Depósito enviado a Ripio BridgeDeposit (${CELO_PROTOCOLS.RIPIO_BRIDGE_DEPOSIT.slice(
          0,
          8
        )}...) con tag ERC-8021! Hash: ${receipt.hash.slice(0, 10)}...`
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al depositar en Ripio Bridge");
    } finally {
      setIsBridgingOnChain(false);
    }
  };

  const handleTransfer = () => {
    if (numericUsdc <= 0) {
      toast.error(t.bankTransferModal.errAmount);
      return;
    }
    if (!cbuAlias.trim()) {
      toast.error(t.bankTransferModal.errCbu);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setSuccessReceipt({
        id: `TX-BANK-${Math.floor(100000 + Math.random() * 900000)}`,
        cbuAlias,
        accountHolder,
        cuit,
        bankName,
        usdcAmount: numericUsdc,
        pesosReceiving,
        rate: DEFAULT_RATES.USDC_TO_ARS,
        date: new Date().toLocaleString(language === "en" ? "en-US" : "es-AR"),
      });
      refresh();
    }, 2000);
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl border border-border-subtle p-5 sm:p-6 rounded-3xl shadow-2xl bg-[#0d1624] text-foreground max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Rampa Bancaria LatAm & Ripio wFIAT
              </h2>
              <p className="text-[11px] text-muted hidden sm:block">
                On/Off-Ramp directo en Pesos/Reales sobre Celo Mainnet (42220) +
                Liquidación CBU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/15 border border-border-subtle transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rail Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-4 flex-shrink-0">
          <button
            onClick={() => setActiveRail("celo_ripio")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeRail === "celo_ripio"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌱 Ripio Ramp & Bridge (Celo)
          </button>
          <button
            onClick={() => setActiveRail("classic_ars")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeRail === "classic_ars"
                ? "bg-accent-teal text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌐 Liquidación CBU / Alias
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-4 flex-1">
          {activeRail === "celo_ripio" ? (
            <div className="space-y-4">
              {/* Sub-mode selector: On-Ramp / Off-Ramp / Bridge */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setRipioMode("onramp")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    ripioMode === "onramp"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Cargar wFIAT
                </button>
                <button
                  onClick={() => setRipioMode("offramp")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    ripioMode === "offramp"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Retirar a Banco
                </button>
                <button
                  onClick={() => setRipioMode("bridge")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    ripioMode === "bridge"
                      ? "bg-purple-500/20 border-purple-400 text-purple-200"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Ripio Bridge
                </button>
              </div>

              {/* Token + Amount */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Moneda Local wFIAT (Celo Mainnet · 42220)</span>
                  <span className="font-mono text-emerald-400">
                    Saldo:{" "}
                    {celoBalances[ripioToken]?.numeric.toLocaleString() || "0"}{" "}
                    {ripioToken}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={ripioToken}
                    onChange={(e) => {
                      const sym = e.target.value as CeloAssetSymbol;
                      setRipioToken(sym);
                      const country = CELO_ASSETS[sym]?.countryCode || "AR";
                      setRipioCountry(country);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                  >
                    {CELO_WFIAT_ASSETS.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.flag} {a.displaySymbol} — {a.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={ripioAmount}
                    onChange={(e) => setRipioAmount(e.target.value)}
                    placeholder="Monto en moneda local"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white"
                  />
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>Contrato ERC-20 Celo Mainnet:</span>
                    <a
                      href={`https://celoscan.io/token/${CELO_ASSETS[ripioToken].address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      {CELO_ASSETS[ripioToken].address.slice(0, 10)}...
                      {CELO_ASSETS[ripioToken].address.slice(-6)}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Destino / Origen:</span>
                    <span className="text-slate-200">
                      {targetAddress.slice(0, 8)}...{targetAddress.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tag de Atribución ERC-8021:</span>
                    <span className="text-amber-300">{attributionTag}</span>
                  </div>
                </div>
              </div>

              {ripioMode !== "bridge" ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-emerald-300">
                      ⚡ Integración Oficial Ripio Ramp (Sin KYB para el
                      Hackathon)
                    </p>
                    <p className="text-[11px] text-slate-400 break-all font-mono">
                      {ripioUrl}
                    </p>
                  </div>

                  <button
                    onClick={handleOpenRipioRamp}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {ripioMode === "onramp"
                      ? `Cargar ${ripioAmount} ${ripioToken} vía Ripio Ramp`
                      : `Retirar ${ripioAmount} ${ripioToken} a Cuenta Bancaria`}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-purple-300">
                      🌉 Ripio BridgeDeposit en Celo Mainnet
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Contrato BridgeDeposit:{" "}
                      {CELO_PROTOCOLS.RIPIO_BRIDGE_DEPOSIT}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={handleDepositToRipioBridge}
                      disabled={isBridgingOnChain}
                      className="py-3 px-4 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-4 h-4" />
                      {isBridgingOnChain
                        ? "Firmando en Celo..."
                        : `Depositar ${ripioToken} On-Chain (+ ERC-8021)`}
                    </button>
                    <a
                      href={CELO_PROTOCOLS.RIPIO_BRIDGE_BASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      Abrir bridge.ripio.com{" "}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : successReceipt ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {t.bankTransferModal.successTitle}
                </h3>
                <p className="text-xs text-muted">
                  {t.bankTransferModal.successDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">
                    {t.bankTransferModal.receiptId}
                  </span>
                  <span className="font-bold text-foreground">
                    {successReceipt.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">
                    {t.bankTransferModal.receiptDebited}
                  </span>
                  <span className="font-bold text-accent-teal">
                    {successReceipt.usdcAmount} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">
                    {t.bankTransferModal.receiptCredited}
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrency(successReceipt.pesosReceiving, "ARS")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-accent-teal text-background font-bold rounded-2xl hover:bg-accent-teal/90 transition-all text-xs uppercase tracking-wider"
              >
                {t.bankTransferModal.closeAndReturn}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-muted">
                  <span>{t.bankTransferModal.amountLabel}</span>
                  <span>
                    {t.bankTransferModal.availableBalance}{" "}
                    {usdcBalance?.toFixed(2) || "0.00"} USDC
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none p-0 text-foreground"
                  />
                  <span className="text-lg font-bold font-mono text-accent-teal">
                    USDC
                  </span>
                </div>
                <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-xs">
                  <span className="text-muted">
                    {t.bankTransferModal.receivingInBank}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(pesosReceiving, "ARS")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">
                    {t.bankTransferModal.cbuLabel}
                  </label>
                  <input
                    type="text"
                    value={cbuAlias}
                    onChange={(e) => setCbuAlias(e.target.value)}
                    placeholder={t.bankTransferModal.cbuPlaceholder}
                    className="w-full bg-background border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">
                      {t.bankTransferModal.holderLabel}
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs outline-none focus:border-accent-teal text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">
                      {t.bankTransferModal.cuitLabel}
                    </label>
                    <input
                      type="text"
                      value={cuit}
                      onChange={(e) => setCuit(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleTransfer}
                disabled={isProcessing || numericUsdc <= 0}
                className="w-full py-4 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-accent-teal/20 disabled:opacity-50 transition-all mt-4"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {t.bankTransferModal.processing}
                  </>
                ) : (
                  <>
                    <Landmark className="w-5 h-5" />
                    {t.bankTransferModal.transferAction.replace(
                      "{amount}",
                      formatCurrency(pesosReceiving, "ARS")
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="pt-3 mt-2 border-t border-border-subtle flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl border border-border-subtle text-muted hover:text-foreground hover:bg-foreground/5 text-xs font-bold transition-all text-center"
          >
            {t.bankTransferModal.closeBtn}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
