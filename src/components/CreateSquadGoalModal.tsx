import { useState } from "react";
import { X, Target, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";

interface CreateSquadGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateSquadGoalModal({ isOpen, onClose, onCreated }: CreateSquadGoalModalProps) {
    const { address: publicKey } = useFreighter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!publicKey) {
            alert("Debes conectar tu billetera para proponer una misión.");
            return;
        }

        if (!title.trim() || !description.trim() || !amount || Number(amount) <= 0) {
            alert("Por favor, completá todos los campos correctamente.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("squad_goals").insert({
                title,
                description,
                amount: Number(amount),
                status: "proposal",
                creator_id: publicKey
            });

            if (error) throw error;

            alert("Propuesta de misión enviada al Squad.");
            onCreated();
            onClose();
        } catch (error: any) {
            console.error("Error creating proposal:", error);
            alert(`Error al crear propuesta: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0d1624] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent-teal/10 flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-accent-teal" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Proponer Nueva Misión</h2>
                    <p className="text-sm text-slate-400">
                        Proponé un objetivo para el equipo. Si el 70% del Squad lo aprueba, la misión será fondeada en USDC o XLM.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Título de la Misión</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#050c14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                            placeholder="Ej: Migración de base de datos..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#050c14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors resize-none h-24"
                            placeholder="Detallá los criterios de éxito y requerimientos..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Recompensa Total Estimada (USDC)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#050c14] border border-white/10 rounded-xl pl-8 pr-16 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="0.00"
                                step="0.01"
                                min="1"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029" className="w-4 h-4 opacity-80" alt="USDC" />
                                <span className="text-xs font-bold text-white/80">USDC</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-accent-teal text-[#050c14] hover:bg-accent-teal/90 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Creando...
                                </>
                            ) : (
                                "Crear Propuesta"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
