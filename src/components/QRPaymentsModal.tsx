"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import {
  X,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  ShieldCheck,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { getTripleValues, SupportedCurrency } from "@/lib/currency";
import { CELO_ASSETS, type CeloAssetSymbol } from "@/lib/celo-assets";
import { toast } from "sonner";

interface QRPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "receive" | "pay";
}

export function QRPaymentsModal({
  isOpen,
  onClose,
  defaultTab = "receive",
}: QRPaymentsModalProps) {
  const { address } = useWallet();
  const {
    connected: celoConnected,
    address: celoAddress,
    balances: celoBalances,
    connectCelo,
    sendCeloAsset,
    attributionTag,
  } = useCeloWallet();
  const { usdcBalance, xlmBalance, refresh } = useSharedBalances();
  const { t, language } = useSettings();

  const [mounted, setMounted] = useState<boolean>(false);
  const [qrChain, setQrChain] = useState<"celo" | "stellar">("celo");
  const [activeTab, setActiveTab] = useState<"receive" | "pay">(defaultTab);
  const [currency, setCurrency] = useState<SupportedCurrency>("wARS");
  const [amount, setAmount] = useState<string>("12000");
  const [concept, setConcept] = useState<string>("Pago de servicio ReWork");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Pay tab state
  const [recipient, setRecipient] = useState<string>(
    "0x465e642387d3d73a57CDc1368fFA53A800bA5D47"
  );
  const [payAmount, setPayAmount] = useState<string>("15");
  const [payCurrency, setPayCurrency] = useState<SupportedCurrency>("USAT");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || activeTab !== "receive") return;

    const numericAmount = parseFloat(amount) || 0;
    const triple = getTripleValues(numericAmount, currency);

    const destination =
      qrChain === "celo"
        ? celoAddress || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        : address ||
          "GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA";

    const paymentPayload =
      qrChain === "celo"
        ? JSON.stringify({
            protocol: "rework-celo-qr-v1",
            chainId: 42220,
            recipient: destination,
            asset: currency in CELO_ASSETS ? currency : "wARS",
            tokenAddress:
              CELO_ASSETS[(currency as CeloAssetSymbol) || "wARS"]?.address ||
              CELO_ASSETS.wARS.address,
            amount: String(numericAmount),
            note: concept,
            attributionTag,
            timestamp: Date.now(),
          })
        : JSON.stringify({
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
      width: 260,
      margin: 2,
      color: {
        dark: qrChain === "celo" ? "#10b981" : "#00F2FE",
        light: "#0a0f1d",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [
    isOpen,
    activeTab,
    amount,
    currency,
    concept,
    address,
    celoAddress,
    qrChain,
    attributionTag,
  ]);

  if (!isOpen || !mounted) return null;

  const numericAmount = parseFloat(amount) || 0;
  const tripleReceive = getTripleValues(numericAmount, currency);

  const numericPay = parseFloat(payAmount) || 0;
  const triplePay = getTripleValues(numericPay, payCurrency);

  const activeAddress =
    qrChain === "celo"
      ? celoAddress || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      : address;

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    if (qrChain === "celo") {
      setRecipient("0x465e642387d3d73a57CDc1368fFA53A800bA5D47");
      setPayAmount("12000");
      setPayCurrency("wARS");
      toast.info("QR Celo Mainnet cargado (rework-celo-qr-v1 · 12,000 wARS)");
    } else {
      setRecipient("GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA");
      setPayAmount("15");
      setPayCurrency("USDC");
    }
  };

  const handleExecutePayment = async () => {
    if (!recipient) {
      toast.error(t.qrModal.errDestination);
      return;
    }
    setIsProcessing(true);

    if (qrChain === "celo") {
      try {
        if (!celoConnected) {
          await connectCelo();
        }
        const celoSym: CeloAssetSymbol =
          payCurrency in CELO_ASSETS
            ? (payCurrency as CeloAssetSymbol)
            : "USAT";
        const receipt = await sendCeloAsset({
          symbol: celoSym,
          recipient: recipient as `0x${string}`,
          amount: payAmount,
        });
        toast.success(
          `¡Pago QR Celo ejecutado con tag ERC-8021 (${attributionTag})! Hash: ${receipt.hash.slice(
            0,
            10
          )}...`
        );
        setPaySuccess(true);
        setTimeout(() => {
          setPaySuccess(false);
          onClose();
        }, 2500);
      } catch (err: any) {
        toast.error(err?.message || "Error al firmar pago QR en Celo Mainnet");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

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

  const currencyChoices: SupportedCurrency[] =
    qrChain === "celo"
      ? ["wARS", "USAT", "wBRL", "USDC", "USDT", "CELO"]
      : ["ARS", "USDC", "XLM"];

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg border border-border-subtle p-5 sm:p-6 rounded-3xl shadow-2xl bg-[#0d1624] text-foreground max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal flex-shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {t.qrModal.title}
              </h2>
              <p className="text-[11px] text-muted hidden sm:block">
                Cobros y Pagos QR en Celo Mainnet (wFIAT / USA₮) & Stellar
                (SEP-0007)
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

        {/* Network Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 flex-shrink-0">
          <button
            onClick={() => {
              setQrChain("celo");
              setCurrency("wARS");
              setPayCurrency("USAT");
              setRecipient("0x465e642387d3d73a57CDc1368fFA53A800bA5D47");
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              qrChain === "celo"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌱 Celo Mainnet (wFIAT / USA₮)
          </button>
          <button
            onClick={() => {
              setQrChain("stellar");
              setCurrency("ARS");
              setPayCurrency("USDC");
              setRecipient(
                "GDWVAT3G6VUCW325JDN47S7YKILQGIMHXDBUBSFTY4EAOMCA2PO6LWNA"
              );
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              qrChain === "stellar"
                ? "bg-accent-teal text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌐 Stellar (SEP-0007)
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-4 flex-1">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-foreground/5 rounded-2xl border border-border-subtle">
            <button
              onClick={() => setActiveTab("receive")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "receive"
                  ? "bg-accent-teal text-background shadow-lg shadow-accent-teal/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              {t.qrModal.tabReceive}
            </button>
            <button
              onClick={() => setActiveTab("pay")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "pay"
                  ? "bg-accent-teal text-background shadow-lg shadow-accent-teal/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              {t.qrModal.tabPay}
            </button>
          </div>

          {/* TAB 1: COBRAR CON QR */}
          {activeTab === "receive" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-semibold text-muted">
                  <span>{t.qrModal.receiveAmountLabel}</span>
                  <div className="flex flex-wrap gap-1 bg-foreground/10 p-1 rounded-lg">
                    {currencyChoices.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          currency === curr
                            ? "bg-accent-teal text-background shadow-sm"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {curr === "USAT" ? "USA₮" : curr}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-accent-teal">
                    {currency === "USAT" ? "USA₮" : currency}
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
                    <span className="text-muted block text-[10px]">
                      wARS / ARS
                    </span>
                    <span className="font-bold text-foreground">
                      {tripleReceive.formatted.ars}
                    </span>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-foreground/5">
                    <span className="text-muted block text-[10px]">
                      USA₮ / USDC
                    </span>
                    <span className="font-bold text-accent-teal">
                      {tripleReceive.formatted.usdc}
                    </span>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-foreground/5">
                    <span className="text-muted block text-[10px]">
                      {qrChain === "celo" ? "CELO" : "XLM"}
                    </span>
                    <span className="font-bold text-emerald-400">
                      {qrChain === "celo"
                        ? tripleReceive.formatted.celo
                        : tripleReceive.formatted.xlm}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Display */}
              <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-2xl border border-border-subtle">
                {qrDataUrl ? (
                  <div className="p-3 bg-slate-950 rounded-2xl border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-muted">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                )}
                <p className="text-[11px] text-muted text-center mt-2">
                  {qrChain === "celo"
                    ? `Payload rework-celo-qr-v1 · Chain ID 42220 · Tag: ${attributionTag}`
                    : t.qrModal.scanInstruction}
                </p>
              </div>

              {/* Address copy */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-border-subtle">
                <div className="truncate mr-3">
                  <span className="text-[10px] uppercase font-bold text-muted block">
                    {t.qrModal.yourAddressLabel}
                  </span>
                  <span className="text-xs font-mono text-foreground truncate block">
                    {activeAddress || t.qrModal.walletNotConnected}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal text-xs font-bold rounded-lg border border-accent-teal/20 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? t.qrModal.copiedBtn : t.qrModal.copyBtn}
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
                  <h3 className="text-xl font-bold text-foreground">
                    {t.qrModal.paySuccessTitle}
                  </h3>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    {t.qrModal.paySuccessDesc}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted">
                        {t.qrModal.payScannerTitle}
                      </span>
                      <button
                        onClick={handleSimulateScan}
                        className="text-xs text-accent-teal font-bold hover:underline"
                      >
                        {t.qrModal.loadExampleBtn}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={
                        qrChain === "celo"
                          ? "0x... (Wallet Celo Mainnet)"
                          : t.qrModal.destinationPlaceholder
                      }
                      className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-semibold text-muted">
                      <span>{t.qrModal.payAmountLabel}</span>
                      <div className="flex flex-wrap gap-1 bg-foreground/10 p-1 rounded-lg">
                        {currencyChoices.map((curr) => (
                          <button
                            key={curr}
                            onClick={() => setPayCurrency(curr)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                              payCurrency === curr
                                ? "bg-accent-teal text-background shadow-sm"
                                : "text-muted hover:text-foreground"
                            }`}
                          >
                            {curr === "USAT" ? "USA₮" : curr}
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
                      <span className="text-lg font-bold font-mono text-accent-teal">
                        {payCurrency === "USAT" ? "USA₮" : payCurrency}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-muted pt-2 border-t border-border-subtle">
                      <span>
                        {t.qrModal.equivArs} {triplePay.formatted.ars}
                      </span>
                      <span>
                        {t.qrModal.equivUsdc} {triplePay.formatted.usdc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent-teal/5 border border-accent-teal/20 text-xs">
                    <span className="text-muted flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-accent-teal" />{" "}
                      {t.qrModal.availableBalance}
                    </span>
                    <span className="font-mono font-bold text-accent-teal">
                      {qrChain === "celo"
                        ? `${celoBalances.USAT?.numeric.toFixed(2) || "0.00"} USA₮ • ${
                            celoBalances.wARS?.numeric.toLocaleString() || "0"
                          } wARS`
                        : `${usdcBalance?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          }) || "0.00"} USDC • ${
                            xlmBalance?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            }) || "0.00"
                          } XLM`}
                    </span>
                  </div>

                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessing || !recipient || numericPay <= 0}
                    className="w-full py-4 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-accent-teal/20 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {t.qrModal.processingPay}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        {qrChain === "celo"
                          ? `Pagar ${payAmount} ${
                              payCurrency === "USAT" ? "USA₮" : payCurrency
                            } en Celo (+ Tag ERC-8021)`
                          : t.qrModal.confirmPayBtn
                              .replace("{amount}", payAmount)
                              .replace("{curr}", payCurrency)}
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
            {t.qrModal.closeBtn}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
