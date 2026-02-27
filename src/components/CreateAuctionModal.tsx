"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";

interface CreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateAuctionModal({ isOpen, onClose, onCreated }: CreateAuctionModalProps) {
    const { connected, address } = useFreighter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        image: "📦",
        basePrice: "",
        durationHours: "24",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connected || !address) {
            alert("Conecta tu billetera primero para publicar un artículo.");
            return;
        }

        setLoading(true);
        try {
            const basePriceNum = Number(formData.basePrice);
            const duration = Number(formData.durationHours);
            const endTime = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

            // Get current max id
            const { data: maxIdData } = await supabase.from('auctions').select('id').order('id', { ascending: false }).limit(1);
            const nextId = (maxIdData?.[0]?.id || 0) + 1;

            const { error } = await supabase.from("auctions").insert({
                id: nextId,
                title: formData.title,
                seller: address,
                image: formData.image,
                base_price: basePriceNum,
                current_bid: 0,
                bid_count: 0,
                status: 'active',
                end_time: endTime,
                is_direct_buy: false
            });

            if (error) throw error;

            onCreated();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert("Error creando la subasta: " + (err.message || "Desconocido"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gradient-to-r from-neutral-900 to-black">
                    <h2 className="text-xl font-bold tracking-tight">Crear Nueva Subasta</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Título del Producto</label>
                        <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#13ec5b]" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ej. Lentes VR Oculus Quest 3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Precio Inicial (XLM)</label>
                            <input required type="number" min="1" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#13ec5b]" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} placeholder="Ej. 1000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Duración (Horas)</label>
                            <input required type="number" min="1" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#13ec5b]" value={formData.durationHours} onChange={e => setFormData({ ...formData, durationHours: e.target.value })} placeholder="Ej. 48" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Imagen (URL o Emoji)</label>
                        <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#13ec5b]" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="Ej. 🥽 o https://..." />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold bg-[#13ec5b] text-black hover:bg-[#11cc4e] rounded-xl transition-all shadow-[0_0_15px_rgba(19,236,91,0.15)] disabled:opacity-50">
                            {loading ? "Publicando..." : "Publicar Subasta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
