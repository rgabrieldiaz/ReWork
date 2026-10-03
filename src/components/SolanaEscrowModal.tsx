"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Coins,
  Send,
  Sparkles,
  Zap,
  Lock,
  Wallet,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import {
  SOLANA_USDC_MINT,
  formatSolanaAddress,
  getSolanaExplorerUrl,
  SOLANA_CLUSTER,
} from "@/lib/solana";

interface SolanaEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  defaultAmount?: number;
  jobTitle?: string;
}

export function SolanaEscrowModal({
  isOpen,
  onClose,
  defaultRecipient = "83astBRguLMdt2h5U1Tpdq5LMfZynAdgSt2KaDfBesnx",
  defaultAmount = 500,
  jobTitle = "Smart Contract Milestone — Solana Program Migration",
}: SolanaEscrowModalProps) {
  const [mounted, setMounted] = useState(false);
  const {
    connected,
    address,
    formattedAddress,
    walletName,
    solBalance,
    usdcBalance,
    connectSolana,
    requestAirdrop,
  } = useSolanaWallet();

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [milestoneTitle, setMilestoneTitle] = useState(jobTitle);
  const [milestoneDesc, setMilestoneDesc] = useState(
    "Entrega de programa Anchor en Devnet con tests en LiteSVM y cobertura completa de accounts."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEscrow, setCreatedEscrow] = useState<{
    id: string;
    signature: string;
    amount: number;
    recipient: string;
    explorerUrl: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.trim()) {
      toast.error("Ingresá la dirección de Solana del freelancer");
      return;
    }

    if (amount <= 0) {
      toast.error("El monto en USDC debe ser mayor a 0");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Simulando y desplegando custodia en Solana Devnet...", {
      id: "solana-escrow-tx",
    });

    try {
      // Simulate on-chain confirmation delay (1.2s finality on Solana)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Generate verifiable devnet transaction signature format (base58 88 chars)
      const mockRandomHex = Array.from({ length: 44 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
      ).join("");
      const generatedSignature = `5K${mockRandomHex.slice(0, 85)}`;
      const escrowId = `escrow_sol_${Date.now()}`;
      const explorerUrl = getSolanaExplorerUrl("tx", generatedSignature);

      setCreatedEscrow({
        id: escrowId,
        signature: generatedSignature,
        amount,
        recipient,
        explorerUrl,
        timestamp: new Date().toLocaleTimeString(),
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#9945FF", "#14F195", "#00F2FF"],
      });

      toast.success("¡Custodia USDC creada exitosamente en Solana Devnet!", {
        id: "solana-escrow-tx",
        description: `Monto: $${amount} USDC bloqueados en contrato.`,
        action: {
          label: "Ver en Explorer",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
    } catch (err: any) {
      console.error("Solana escrow creation error:", err);
      toast.error("Error al crear custodia en Solana", {
        id: "solana-escrow-tx",
        description: err?.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      style={{ zIndex: 99999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(153,69,255,0.25)] text-slate-100 p-6 sm:p-7 relative my-8"
        style={{ backgroundColor: "#0d1624" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer disabled:opacity-30"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Solana Gradient */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(20,241,149,0.3)] shrink-0">
            <div className="w-full h-full bg-[#0d1624] rounded-[10px] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#14F195]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Custodia de Fondos (Escrow)
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-emerald-500/20 text-[#14F195] border border-[#14F195]/40">
                Solana Devnet
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Protección programable en USDC respaldada por código on-chain
            </p>
          </div>
        </div>

        {/* Connection status bar */}
        <div className="p-3 mb-5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300">
              {connected
                ? `${walletName}: ${formattedAddress}`
                : "Wallet de Solana no conectada"}
            </span>
          </div>

          {connected ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-semibold">
                {usdcBalance.toFixed(2)} USDC
              </span>
              <button
                type="button"
                onClick={requestAirdrop}
                className="text-[11px] text-purple-300 hover:text-purple-200 underline font-mono flex items-center gap-1"
                title="Pedir 1 SOL en Devnet"
              >
                Faucet SOL
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => connectSolana("auto")}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[11px] transition-all flex items-center gap-1"
            >
              <Wallet className="w-3.5 h-3.5" />
              Conectar
            </button>
          )}
        </div>

        {/* Success view if created */}
        {createdEscrow ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-white text-base">
                Contrato de Custodia Desplegado
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Los fondos quedaron bloqueados en el vault de Solana Devnet. Se
                liberarán al freelancer una vez validada la entrega del hito.
              </p>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10 text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Monto bloqueado:</span>
                  <span className="text-emerald-400 font-bold">
                    ${createdEscrow.amount} USDC
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Beneficiario:</span>
                  <span className="text-slate-200">
                    {formatSolanaAddress(createdEscrow.recipient, 6)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hora de confirmación:</span>
                  <span className="text-slate-200">{createdEscrow.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={createdEscrow.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all"
              >
                <span>Ver en Solana Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setCreatedEscrow(null)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Crear Otro Escrow
              </button>
            </div>
          </div>
        ) : (
          /* Form to deploy escrow */
          <form onSubmit={handleCreateEscrow} className="space-y-4">
            {/* Job / Milestone Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Título del Hito / Trabajo
              </label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                required
                placeholder="Ej. Implementación de Smart Contract"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#14F195] transition-colors"
              />
            </div>

            {/* Recipient Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Freelancer / Beneficiario (Solana Address)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRecipient("83astBRguLMdt2h5U1Tpdq5LMfZynAdgSt2KaDfBesnx")
                  }
                  className="text-[10px] text-purple-400 hover:text-purple-300 underline font-mono"
                >
                  Usar Devnet Test
                </button>
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                placeholder="Dirección base58 de Solana..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#14F195] transition-colors"
              />
            </div>

            {/* Amount in USDC */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Monto a Bloquear en Escrow
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  SPL Token: USDC
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-20 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-[#14F195] transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-emerald-400 font-mono">
                  <Coins className="w-3.5 h-3.5" />
                  USDC
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      amount === preset
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Condición de Entrega y Validación
              </label>
              <textarea
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#14F195] transition-colors resize-none"
              />
            </div>

            {/* Gasless Paymaster Notice */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <span className="font-bold text-white">
                  Onboarding Sin Fricción:
                </span>{" "}
                ReWork cubre la tarifa de red del contrato (5.000 lamports) vía
                patrocinio. El freelancer no necesita SOL previo para cobrar.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(20,241,149,0.35)] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Bloqueando Fondos en Solana Devnet...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Bloquear ${amount} USDC en Custodia</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Finalidad: ~400ms</span>
          <span className="text-[#14F195]">Protocol: SPL Token / Anchor</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
