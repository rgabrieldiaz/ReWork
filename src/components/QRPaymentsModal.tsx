"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { X, QrCode, ArrowDownLeft, ArrowUpRight, Copy, Check, ShieldCheck, Wallet, RefreshCw, Landmark } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { formatCurrency, convertCurrency, getTripleValues, SupportedCurrency } from "@/lib/currency";
import { toast } from "sonner";

interface QRPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "receive" | "pay";
}

export function QRPaymentsModal({ isOpen, onClose, defaultTab = "receive" }: QRPaymentsModalProps) {
  const { connected, address } = useWallet();
  const { usdcBalance, xlmBalance, refresh } = useSharedBalances();

  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"receive" | "pay">(defaultTab);
  const [currency, setCurrency] = useState<SupportedCurrency>("ARS");
  const [amount, setAmount] = useState<string>("5000");
  const [concept, setConcept] = useState<string>("Pago de servicio ReWork");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Pay tab state
  const [recipient, setRecipient] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("10");
  const [payCurrency, setPayCurrency] = useState<SupportedCurrency>("USDC");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Generate QR Code when amount, currency, or concept changes
  useEffect(() => {
    if (!isOpen || activeTab !== "receive") return;

    const numericAmount = parseFloat(amount) || 0;
    const triple = getTripleValues(numericAmount, currency);

    // Stellar payment URI format: web+stellar:pay?destination=...&amount=...&asset_code=...
    const destination = address || "GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA";
    const paymentPayload = JSON.stringify({
      protocol: "rework-qr-v1",
      destination,
      amount: triple.usdc.toFixed(2),
      currency: "USDC",
      originalAmount: numericAmount,
      originalCurrency: currency,
      concept,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(paymentPayload, {
      width: 280,
      margin: 2,
      color: {
        dark: "#00F2FE",
        light: "#0a0f1d",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [isOpen, activeTab, amount, currency, concept, address]);

  if (!isOpen || !mounted) return null;

  const numericAmount = parseFloat(amount) || 0;
  const tripleReceive = getTripleValues(numericAmount, currency);

  const numericPay = parseFloat(payAmount) || 0;
  const triplePay = getTripleValues(numericPay, payCurrency);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    // Demo scan simulation: prefill with Gabriel's wallet & demo amount
    setRecipient("GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA");
    setPayAmount("15");
    setPayCurrency("USDC");
  };

  const handleExecutePayment = async () => {
    if (!recipient) {
      toast.error("Por favor ingresa o escanea una dirección de destino válida.");
      return;
    }
    setIsProcessing(true);
    // Simulate Stellar network settlement (1.5s)
    setTimeout(() => {
      setIsProcessing(false);
      setPaySuccess(true);
      refresh();
      setTimeout(() => {
        setPaySuccess(false);
        onClose();
      }, 2500);
    }, 1500);
  };

  return createPortal(
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg border border-border-subtle p-5 sm:p-6 rounded-3xl shadow-2xl bg-[#0d1624] text-foreground max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Sticky Header with Title and Prominent Close Button */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal flex-shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Pagos & Cobros con QR</h2>
              <p className="text-[11px] text-muted hidden sm:block">Red de Pagos ReWork sobre Stellar • Liquidación Instantánea</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/15 border border-border-subtle transition-all flex items-center justify-center flex-shrink-0"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-4 flex-1">

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-foreground/5 rounded-2xl mb-6 border border-border-subtle">
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "receive"
                ? "bg-accent-teal text-background shadow-lg shadow-accent-teal/20"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Cobrar (Mi QR)
          </button>
          <button
            onClick={() => setActiveTab("pay")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pay"
                ? "bg-accent-teal text-background shadow-lg shadow-accent-teal/20"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Pagar / Lector
          </button>
        </div>

        {/* TAB 1: COBRAR CON QR */}
        {activeTab === "receive" && (
          <div className="space-y-4">
            {/* Amount & Currency */}
            <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-muted">
                <span>Monto a Cobrar</span>
                <div className="flex gap-1 bg-foreground/10 p-1 rounded-lg">
                  {(["ARS", "USDC", "XLM"] as SupportedCurrency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        currency === curr
                          ? "bg-accent-teal text-background shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-accent-teal">
                  {currency === "ARS" ? "$" : currency === "USDC" ? "USDC" : "XLM"}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none p-0 text-foreground"
                />
              </div>

              {/* Triple Currency Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-[11px] font-mono">
                <div className="text-center p-1.5 rounded-lg bg-foreground/5">
                  <span className="text-muted block text-[10px]">PESOS ARS</span>
                  <span className="font-bold text-foreground">{tripleReceive.formatted.ars}</span>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-foreground/5">
                  <span className="text-muted block text-[10px]">DÓLARES USDC</span>
                  <span className="font-bold text-accent-teal">{tripleReceive.formatted.usdc}</span>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-foreground/5">
                  <span className="text-muted block text-[10px]">STELLAR XLM</span>
                  <span className="font-bold text-indigo-400">{tripleReceive.formatted.xlm}</span>
                </div>
              </div>
            </div>

            {/* QR Display */}
            <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-2xl border border-border-subtle relative group">
              {qrDataUrl ? (
                <div className="p-3 bg-slate-950 rounded-2xl border-2 border-accent-teal/30 shadow-xl shadow-accent-teal/10">
                  <img src={qrDataUrl} alt="QR Code de Pago ReWork" className="w-52 h-52 rounded-xl" />
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-muted">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
              <p className="text-[11px] text-muted text-center mt-3">
                Escaneá este código desde cualquier billetera de ReWork o compatible con Stellar
              </p>
            </div>

            {/* Address copy */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-border-subtle">
              <div className="truncate mr-3">
                <span className="text-[10px] uppercase font-bold text-muted block">Tu Dirección Stellar</span>
                <span className="text-xs font-mono text-foreground truncate block">
                  {address || "Billetera no conectada"}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal text-xs font-bold rounded-lg border border-accent-teal/20 flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PAGAR / LECTOR */}
        {activeTab === "pay" && (
          <div className="space-y-4">
            {paySuccess ? (
              <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">¡Pago Enviado con Éxito!</h3>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  La transacción fue liquidada en la red Stellar en segundos con comisión de $0.00001 USD.
                </p>
              </div>
            ) : (
              <>
                {/* Scanner trigger simulation */}
                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted">Lector de QR</span>
                    <button
                      onClick={handleSimulateScan}
                      className="text-xs text-accent-teal font-bold hover:underline"
                    >
                      Cargar Ejemplo de QR
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Pegar dirección Stellar o escanear QR..."
                      className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                    />
                  </div>
                </div>

                {/* Amount to pay */}
                <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-muted">
                    <span>Monto a Pagar</span>
                    <div className="flex gap-1 bg-foreground/10 p-1 rounded-lg">
                      {(["USDC", "ARS", "XLM"] as SupportedCurrency[]).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => setPayCurrency(curr)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                            payCurrency === curr
                              ? "bg-accent-teal text-background shadow-sm"
                              : "text-muted hover:text-foreground"
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none p-0 text-foreground"
                    />
                    <span className="text-lg font-bold font-mono text-accent-teal">{payCurrency}</span>
                  </div>

                  {/* Equivalences */}
                  <div className="flex justify-between text-[11px] font-mono text-muted pt-2 border-t border-border-subtle">
                    <span>Equivalente en ARS: {triplePay.formatted.ars}</span>
                    <span>Equivalente en USDC: {triplePay.formatted.usdc}</span>
                  </div>
                </div>

                {/* Available Balance Indicator */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent-teal/5 border border-accent-teal/20 text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-accent-teal" /> Tu Saldo Disponible:
                  </span>
                  <span className="font-mono font-bold text-accent-teal">
                    {usdcBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"} USDC •{" "}
                    {xlmBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"} XLM
                  </span>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing || !recipient || numericPay <= 0}
                  className="w-full py-4 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-accent-teal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Procesando en Stellar Network...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Confirmar y Pagar {payAmount} {payCurrency}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
        </div>

        {/* Sticky Footer */}
        <div className="pt-3 mt-2 border-t border-border-subtle flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl border border-border-subtle text-muted hover:text-foreground hover:bg-foreground/5 text-xs font-bold transition-all text-center"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
