"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Landmark, CheckCircle2, RefreshCw } from "lucide-react";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, DEFAULT_RATES } from "@/lib/currency";
import { toast } from "sonner";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankTransferModal({ isOpen, onClose }: BankTransferModalProps) {
  const { usdcBalance, refresh } = useSharedBalances();
  const { t, language } = useSettings();

  const [mounted, setMounted] = useState<boolean>(false);
  const [usdcAmount, setUsdcAmount] = useState<string>("50");
  const [cbuAlias, setCbuAlias] = useState<string>("rework.crypto.ars");
  const [accountHolder, setAccountHolder] = useState<string>("Gabriel Diaz");
  const [cuit, setCuit] = useState<string>("20-35891234-9");
  const [bankName, setBankName] = useState<string>("Mercado Pago / Banco Galicia");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg border border-border-subtle p-5 sm:p-6 rounded-3xl shadow-2xl bg-[#0d1624] text-foreground max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Sticky Header with Title and Prominent Close Button */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal flex-shrink-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">{t.bankTransferModal.title}</h2>
              <p className="text-[11px] text-muted hidden sm:block">{t.bankTransferModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/15 border border-border-subtle transition-all flex items-center justify-center flex-shrink-0"
            title={t.bankTransferModal.closeTitle}
            aria-label={t.bankTransferModal.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-4 flex-1">

        {successReceipt ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{t.bankTransferModal.successTitle}</h3>
              <p className="text-xs text-muted">
                {t.bankTransferModal.successDesc}
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span className="text-muted">{t.bankTransferModal.receiptId}</span>
                <span className="font-bold text-foreground">{successReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.bankTransferModal.receiptDebited}</span>
                <span className="font-bold text-accent-teal">{successReceipt.usdcAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.bankTransferModal.receiptCredited}</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(successReceipt.pesosReceiving, "ARS")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.bankTransferModal.receiptExchangeRate}</span>
                <span>1 USDC = $ {successReceipt.rate} ARS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.bankTransferModal.receiptRecipient}</span>
                <span className="text-foreground">{successReceipt.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.bankTransferModal.receiptAccount}</span>
                <span className="text-foreground">{successReceipt.cbuAlias}</span>
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
            {/* Amount input */}
            <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-muted">
                <span>{t.bankTransferModal.amountLabel}</span>
                <span>{t.bankTransferModal.availableBalance} {usdcBalance?.toFixed(2) || "0.00"} USDC</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl font-bold font-mono outline-none border-none p-0 text-foreground"
                />
                <span className="text-lg font-bold font-mono text-accent-teal">USDC</span>
              </div>
              <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-xs">
                <span className="text-muted">{t.bankTransferModal.receivingInBank}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(pesosReceiving, "ARS")}
                </span>
              </div>
            </div>

            {/* Bank details input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">{t.bankTransferModal.cbuLabel}</label>
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
                  <label className="text-xs font-bold text-muted block mb-1">{t.bankTransferModal.holderLabel}</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder={t.bankTransferModal.holderPlaceholder}
                    className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs outline-none focus:border-accent-teal text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">{t.bankTransferModal.cuitLabel}</label>
                  <input
                    type="text"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    placeholder="20-xxxxxxxx-x"
                    className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Rate & fee info */}
            <div className="p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/20 text-[11px] text-muted space-y-1">
              <div className="flex justify-between">
                <span>{t.bankTransferModal.rateLabel}</span>
                <span className="font-bold text-foreground">1 USDC = $ {DEFAULT_RATES.USDC_TO_ARS} ARS</span>
              </div>
              <div className="flex justify-between">
                <span>{t.bankTransferModal.feeLabel}</span>
                <span className="font-bold text-emerald-400">{t.bankTransferModal.feeFree}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleTransfer}
              disabled={isProcessing || numericUsdc <= 0}
              className="w-full py-4 bg-accent-teal hover:bg-accent-teal/90 text-background font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-accent-teal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t.bankTransferModal.processing}
                </>
              ) : (
                <>
                  <Landmark className="w-5 h-5" />
                  {t.bankTransferModal.transferAction.replace("{amount}", formatCurrency(pesosReceiving, "ARS"))}
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
