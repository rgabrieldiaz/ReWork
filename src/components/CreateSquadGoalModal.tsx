"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Smile, ShieldCheck, Target, Image as ImageIcon } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { useSettings } from "@/hooks/useSettings";

interface CreateSquadGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateSquadGoalModal({ isOpen, onClose, onCreated }: CreateSquadGoalModalProps) {
    const { t } = useSettings();
    const { address: publicKey } = useFreighter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<"USDC" | "XLM">("USDC");
    const [durationDays, setDurationDays] = useState<number>(7);
    const [image, setImage] = useState("🎯");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [tagsInput, setTagsInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isUrl = image.startsWith("http");
    const endTime = useMemo(() => {
        const date = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString();
    }, [durationDays]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!publicKey) {
            setError(t.createSquadGoal?.connectWallet || "Conecta tu billetera.");
            return;
        }

        if (!title.trim() || !description.trim() || !amount || Number(amount) <= 0) {
            setError(t.createSquadGoal?.fillFields || "Completa los campos requeridos.");
            return;
        }

        setIsSubmitting(true);

        try {
            const deadline = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
            const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");

            const insertData: any = {
                title,
                description,
                amount: Number(amount),
                status: "proposal",
                creator_id: publicKey
            };

            // Attempt to insert additional fields if the DB schema supports them
            insertData.currency = currency;
            insertData.deadline = deadline.toISOString();
            insertData.tags = tags;
            insertData.image = image || "🎯";

            const { error: dbError } = await supabase.from("squad_goals").insert(insertData);

            if (dbError) throw new Error(dbError.message);

            onCreated();
            onClose();
        } catch (err: any) {
            console.error("Error creating proposal:", err);
            // Fallback for schema mismatches
            if (err.message?.includes("currency") || err.message?.includes("deadline") || err.message?.includes("image") || err.message?.includes("tags")) {
                try {
                    const { error: retryError } = await supabase.from("squad_goals").insert({
                        title,
                        description,
                        amount: Number(amount),
                        status: "proposal",
                        creator_id: publicKey
                    });
                    if (retryError) throw new Error(retryError.message);
                    onCreated();
                    onClose();
                    return;
                } catch (retryErr: any) {
                    setError(retryErr.message || "Error al crear propuesta.");
                }
            } else {
                setError(err.message || "Error al crear propuesta.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-border-subtle rounded-3xl w-full max-w-5xl md:max-h-[95vh] overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)] flex flex-col md:flex-row shadow-accent-teal/10 custom-scrollbar overflow-y-auto">

                {/* Left Column: Preview & Image Selection */}
                <div className="w-full md:w-[45%] md:border-r border-border-subtle bg-card/30 p-6 flex flex-col gap-5 relative">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight mb-1 text-white">Previsualización</h3>
                        <p className="text-sm text-muted">Así se verá tu propuesta de misión.</p>
                    </div>

                    <div className="aspect-square w-full bg-neutral-900/50 border border-border-subtle rounded-3xl flex flex-col overflow-hidden shadow-inner relative group isolate">
                        <div className="absolute inset-0 bg-accent-teal/5 rounded-3xl -z-10 group-hover:bg-accent-teal/10 transition-colors duration-500" />

                        <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                            {isUrl ? (
                                <img src={image} alt="Preview" className="w-[80%] h-[80%] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 shadow-2xl" onError={() => setImage("🎯")} />
                            ) : (
                                <span className="text-[100px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110">{image}</span>
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5 pt-12">
                            <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-foreground/5 rounded-full text-white/90">
                                {amount || "0"} {currency}
                            </span>
                            <h4 className="font-bold text-lg text-white leading-tight line-clamp-1 mb-1">{title || "Nombre de la Misión"}</h4>
                            <p className="text-xs text-muted/80 line-clamp-1 mb-4">{description || "Descripción del objetivo del squad..."}</p>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-medium text-muted">
                                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 0 / N Firmas</span>
                                    <span className="text-accent-teal font-mono">0%</span>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-teal w-[5%] rounded-full opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <label className="block text-sm font-bold text-foreground">Aura / Emoji</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                                className="w-full bg-card/50 border border-border-subtle rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="Elige un emoji representativo..."
                            />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted hover:text-accent-teal transition-colors"
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full mb-2 left-0 z-50">
                                    <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)}></div>
                                    <div className="relative z-50 shadow-2xl rounded-xl overflow-hidden border border-border-subtle" ref={emojiPickerRef}>
                                        <EmojiPicker
                                            theme={Theme.DARK}
                                            onEmojiClick={(emojiData) => {
                                                setImage(emojiData.emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trustless Work Info Box */}
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start isolate relative overflow-hidden mt-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent -z-10" />
                        <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-100">Contrato Escrow Inteligente</h4>
                            <p className="text-xs text-blue-200/70 mt-1 mb-2 leading-relaxed">
                                Al aprobarse, <strong>Trustless Work</strong> distribuirá el pago automáticamente entre los miembros del equipo usando la lógica Multi-Release.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-blue-400 bg-blue-500/10 inline-flex px-2 py-1 rounded-md border border-blue-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Fee estimado de red: ~0.00001 XLM
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Data Inputs */}
                <div className="w-full md:w-[55%] p-6 flex flex-col relative bg-gradient-to-br from-card/30 to-black overflow-y-auto pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                                Proponer Misión
                            </h2>
                            <p className="text-sm text-muted mt-1">Liderá una nueva iniciativa para el Squad.</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-card/50 hover:bg-white/10 border border-border-subtle text-muted hover:text-white transition-all hover:rotate-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Título de la Misión <span className="text-accent-teal">*</span></label>
                            <input
                                required
                                type="text"
                                maxLength={60}
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-medium placeholder:text-muted/60"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej. Lanzar nueva landing page..."
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Descripción y Entregables <span className="text-accent-teal">*</span></label>
                            <textarea
                                required
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-muted/60 min-h-[100px] resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Explica detalladamente qué debe lograr el equipo..."
                            />
                        </div>

                        {/* Reward & Currency */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">
                                Recompensa Total <span className="text-accent-teal">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4">
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold transition-colors group-focus-within:text-accent-teal">$</span>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl pl-10 pr-5 py-4 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-mono placeholder:text-muted/50"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex bg-neutral-900/50 border border-border-subtle rounded-2xl p-1.5 relative">
                                    <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-neutral-800 rounded-xl transition-all duration-300 ease-out shadow-sm border border-white/5" style={{ left: currency === 'USDC' ? '6px' : 'calc(50% + 0px)' }} />
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USDC')}
                                        className={`flex-1 relative z-10 font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors ${currency === 'USDC' ? 'text-white' : 'text-muted hover:text-white'}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-400">U</div>
                                        USDC
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('XLM')}
                                        className={`flex-1 relative z-10 font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors ${currency === 'XLM' ? 'text-white' : 'text-muted hover:text-white'}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-neutral-100/10 border border-neutral-400/50 flex items-center justify-center text-[10px] text-neutral-300">X</div>
                                        XLM
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Duration Group for Voting */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-bold text-foreground">Tiempo de Votación <span className="text-accent-teal">*</span></label>
                                <span className="text-[11px] text-muted/80 font-medium bg-neutral-900/50 px-2 py-1 rounded-md border border-border-subtle flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                                    Vence: {endTime}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[1, 3, 7, 14, 31].map(days => (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => setDurationDays(days)}
                                        className={`flex-1 min-w-[60px] py-3.5 px-2 rounded-xl text-sm font-bold transition-all border ${durationDays === days ? 'bg-accent-teal/15 border-accent-teal text-white shadow-[0_0_15px_rgba(0,242,255,0.1)] ring-1 ring-accent-teal/30' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border hover:bg-neutral-800'}`}
                                    >
                                        {days}d
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Etiquetas (Opcional)</label>
                            <input
                                type="text"
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-muted/60"
                                value={tagsInput}
                                onChange={e => setTagsInput(e.target.value)}
                                placeholder="Ej. Frontend, Urgente, B2B..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-auto flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-sm font-bold text-muted hover:text-white bg-neutral-900/50 hover:bg-neutral-800 border border-border-subtle rounded-2xl transition-all"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !title || !amount}
                                className="flex-[2] bg-accent-teal hover:bg-accent-teal/80 text-black font-black text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Publicar Propuesta
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
