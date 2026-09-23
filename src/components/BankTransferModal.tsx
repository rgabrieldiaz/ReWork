"use client";

import React, { useState } from "react";
import { X, Landmark, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useSharedBalances } from "@/hooks/useSharedBalances";
import { formatCurrency, convertCurrency, DEFAULT_RATES } from "@/lib/currency";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankTransferModal({ isOpen, onClose }: BankTransferModalProps) {
  const { usdcBalance, refresh } = useSharedBalances();

  const [usdcAmount, setUsdcAmount] = useState<string>("50");
  const [cbuAlias, setCbuAlias] = useState<string>("rework.crypto.ars");
  const [accountHolder, setAccountHolder] = useState<string>("Gabriel Diaz");
  const [cuit, setCuit] = useState<string>("20-35891234-9");
  const [bankName, setBankName] = useState<string>("Mercado Pago / Banco Galicia");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const numericUsdc = parseFloat(usdcAmount) || 0;
  const pesosReceiving = numericUsdc * DEFAULT_RATES.USDC_TO_ARS;

  const handleTransfer = () => {
    if (numericUsdc <= 0) {
      alert("Por favor ingresa un monto mayor a 0.");
      return;
    }
    if (!cbuAlias.trim()) {
      alert("Por favor ingresa un CBU, CVU o Alias válido.");
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
        date: new Date().toLocaleString("es-AR"),
      });
      refresh();
    }, 2000);
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card border border-border-subtle p-6 rounded-3xl shadow-2xl bg-card">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Retiro a Cuenta Bancaria (ARS)</h2>
            <p className="text-xs text-muted">Convertí tus activos de ReWork a Pesos Argentinos en tu banco</p>
          </div>
        </div>

        {successReceipt ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">¡Transferencia Bancaria Procesada!</h3>
              <p className="text-xs text-muted">
                Los pesos están en camino a tu cuenta mediante liquidación Transferencias 3.0.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span className="text-muted">Comprobante</span>
                <span className="font-bold text-foreground">{successReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Monto debitado</span>
                <span className="font-bold text-accent-teal">{successReceipt.usdcAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Pesos acreditados</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(successReceipt.pesosReceiving, "ARS")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tipo de Cambio</span>
                <span>1 USDC = $ {successReceipt.rate} ARS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Destinatario</span>
                <span className="text-foreground">{successReceipt.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">CBU / CVU / Alias</span>
                <span className="text-foreground">{successReceipt.cbuAlias}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-accent-teal text-background font-bold rounded-2xl hover:bg-accent-teal/90 transition-all text-xs uppercase tracking-wider"
            >
              Cerrar y Volver a ReWork
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount input */}
            <div className="p-4 rounded-2xl bg-foreground/5 border border-border-subtle space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-muted">
                <span>Monto a Transferir (USDC)</span>
                <span>Saldo disponible: {usdcBalance?.toFixed(2) || "0.00"} USDC</span>
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
                <span className="text-muted">Recibes en tu banco:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(pesosReceiving, "ARS")}
                </span>
              </div>
            </div>

            {/* Bank details input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">CBU, CVU o Alias</label>
                <input
                  type="text"
                  value={cbuAlias}
                  onChange={(e) => setCbuAlias(e.target.value)}
                  placeholder="Ej: mi.alias.mp o 00000031000..."
                  className="w-full bg-background border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-accent-teal text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Titular de la Cuenta</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs outline-none focus:border-accent-teal text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">CUIT / CUIL</label>
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
                <span>Cotización Dólar Cripto:</span>
                <span className="font-bold text-foreground">1 USDC = $ {DEFAULT_RATES.USDC_TO_ARS} ARS</span>
              </div>
              <div className="flex justify-between">
                <span>Comisión de transferencia:</span>
                <span className="font-bold text-emerald-400">Gratis (Bonificada)</span>
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
                  Liquidando pesos con el banco...
                </>
              ) : (
                <>
                  <Landmark className="w-5 h-5" />
                  Transferir {formatCurrency(pesosReceiving, "ARS")} a Cuenta Bancaria
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
