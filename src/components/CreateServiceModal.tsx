"use client";

import React, { useState } from "react";
import { X, Globe, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useCeloWallet } from "@/hooks/useCeloWallet";
import { useTestnetRails } from "@/lib/feature-flags";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateServiceModal({ isOpen, onClose, onSuccess }: CreateServiceModalProps) {
  const { profile } = useProfile();
  const { address: stellarAddress } = useWallet();
  const { address: celoAddress } = useCeloWallet();
  const testnetRailsEnabled = useTestnetRails();
  const address = celoAddress || profile?.wallet_address || (testnetRailsEnabled ? stellarAddress : null) || profile?.id;
  const { activeWorkspace } = useWorkspace();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("desarrollo");
  const [rate, setRate] = useState("150");
  const [currency, setCurrency] = useState("USDC");
  const [pricingType, setPricingType] = useState<"fixed" | "hourly">("fixed");
  const [description, setDescription] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || Number(rate) <= 0) {
      toast.error("Por favor completá todos los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const creatorAddress = address || profile?.wallet_address || profile?.id;
      const fullDescription = `${description.trim()}${
        portfolioUrl ? `\n\n🔗 Portafolio / CV: ${portfolioUrl.trim()}` : ""
      }\n📌 Categoría: ${category.toUpperCase()} | Modalidad: ${
        pricingType === "fixed" ? "Hito Fijo" : "Por Hora"
      }`;

      const { error } = await supabase.from("squad_goals").insert([
        {
          title: `[Servicio] ${title.trim()}`,
          description: fullDescription,
          amount: Number(rate),
          currency: currency,
          is_global_bounty: true,
          status: "active",
          creator_id: creatorAddress,
          workspace_id: activeWorkspace?.id || null,
        },
      ]);

      if (error) throw error;

      toast.success("¡Tu servicio profesional ya está publicado en la Red Global ReWork!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error publishing service:", err);
      toast.error(err.message || "Error al publicar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-accent-teal/40 bg-[#0c0e16]/95 shadow-2xl p-6 sm:p-7 relative overflow-hidden max-h-[90vh] flex flex-col justify-between custom-scrollbar">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Ofrecer Servicio Profesional</h2>
                <p className="text-xs text-muted">Visible en la Red Global para todos los espacios</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form id="create-service-form" onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Título del Servicio <span className="text-accent-teal">*</span>
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Desarrollo Frontend, Auditoría Smart Contracts o Diseño UI/UX"
                className="w-full bg-foreground/[0.04] border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-teal"
              />
            </div>

            {/* Categoría y Modalidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-accent-teal cursor-pointer"
                >
                  <option value="desarrollo">Desarrollo & Smart Contracts</option>
                  <option value="diseno">Diseño UI/UX & Producto</option>
                  <option value="marketing">Marketing & Community</option>
                  <option value="legal">Legal & Compliance Web3</option>
                  <option value="consultoria">Consultoría Estratégica</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Modalidad de Cobro</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as "fixed" | "hourly")}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-accent-teal cursor-pointer"
                >
                  <option value="fixed">Tarifa por Hito / Entrega</option>
                  <option value="hourly">Tarifa por Hora</option>
                </select>
              </div>
            </div>

            {/* Tarifa y Moneda */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Honorarios de Referencia <span className="text-accent-teal">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  min="1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-foreground/[0.04] border border-border-subtle rounded-xl px-4 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-accent-teal"
                  placeholder="150"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-accent-teal cursor-pointer font-mono"
                >
                  <option value="USDC">USDC (Circle Celo Mainnet)</option>
                  <option value="USA₮">USA₮ (x402 Celo)</option>
                  <option value="CELO">CELO (Celo Mainnet)</option>
                  {testnetRailsEnabled && <option value="SOL">SOL (Solana Devnet)</option>}
                  {testnetRailsEnabled && <option value="XLM">XLM (Stellar Testnet)</option>}
                  <option value="wARS">wARS (Peso Digital)</option>
                  <option value="wBRL">wBRL (Real Digital)</option>
                  <option value="wCOP">wCOP (Peso Digital)</option>
                  <option value="wMXN">wMXN (Peso Digital)</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Descripción del Servicio y Entregables <span className="text-accent-teal">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explicá en detalle qué incluye tu servicio, tiempos de entrega y metodología de trabajo..."
                className="w-full bg-foreground/[0.04] border border-border-subtle rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-accent-teal resize-none"
              />
            </div>

            {/* Portafolio o Perfil */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Link de Portafolio / GitHub / LinkedIn (Opcional)
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/... o https://linkedin.com/in/..."
                className="w-full bg-foreground/[0.04] border border-border-subtle rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent-teal"
              />
            </div>

            {/* Badge de Aura */}
            <div className="p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-teal" />
                <span className="text-muted">Aura de Reputación vinculada:</span>
              </div>
              <span className="font-mono font-bold text-accent-teal">
                {profile?.points || 0} pts
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-service-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <span>Publicar Servicio Global</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
