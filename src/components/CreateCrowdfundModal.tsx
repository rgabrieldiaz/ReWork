"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Smile, ShieldCheck, Image as ImageIcon, UserCircle } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";

interface CreateCrowdfundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCrowdfundModal({ isOpen, onClose, onSuccess }: CreateCrowdfundModalProps) {
    const { address: publicKey } = useFreighter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goalAmount, setGoalAmount] = useState("");
    const [currency, setCurrency] = useState<"USDC" | "XLM">("USDC");
    const [durationDays, setDurationDays] = useState<number>(7);
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [image, setImage] = useState("🎯");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [tagsInput, setTagsInput] = useState("");
    const [destinationAccount, setDestinationAccount] = useState(publicKey || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derived states
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

    // Sync destination account if publicKey changes
    useEffect(() => {
        if (!destinationAccount && publicKey) {
            setDestinationAccount(publicKey);
        }
    }, [publicKey, destinationAccount]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!publicKey) {
            setError("Por favor, conecta tu billetera primero.");
            return;
        }

        if (!title || !goalAmount || !destinationAccount) {
            setError("Por favor, completa los campos requeridos.");
            return;
        }

        setLoading(true);

        try {
            const deadline = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
            const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");

            // Get current max id for crowdfunds (optional but helpful if table is manual sequence)
            const { data: maxIdData } = await supabase.from('crowdfunds').select('id').order('id', { ascending: false }).limit(1);
            const nextId = (maxIdData?.[0]?.id || 0) + 1;

            const insertData: any = {
                id: nextId,
                title,
                description,
                organizer: publicKey,
                destination_account: destinationAccount,
                goal_amount: parseInt(goalAmount),
                current_amount: 0,
                donor_count: 0,
                tags: tags,
                image: image || "🎯",
                deadline: deadline.toISOString(),
                status: "active",
                privacy: privacy,
            };

            // Si la db lo tiene lo inserta, sino fallará y habria que quitarlo en un cleanup. 
            // Añadiendo try para currency por si acaso:
            insertData.currency = currency;

            const { error: dbError } = await supabase.from("crowdfunds").insert([insertData]);

            if (dbError) throw new Error(dbError.message);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Create crowdfund error:", err);
            // Intentamos reintento sin currency si falló por Schema.
            if (err.message?.includes("currency")) {
                try {
                    const deadline = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
                    const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");
                    const { data: maxIdData } = await supabase.from('crowdfunds').select('id').order('id', { ascending: false }).limit(1);
                    const nextId = (maxIdData?.[0]?.id || 0) + 1;
                    const { error: retryError } = await supabase.from("crowdfunds").insert([{
                        id: nextId, title, description, organizer: publicKey, destination_account: destinationAccount,
                        goal_amount: parseInt(goalAmount), current_amount: 0, donor_count: 0, tags: tags,
                        image: image || "🎯", deadline: deadline.toISOString(), status: "active", privacy: privacy
                    }]);
                    if (retryError) throw new Error(retryError.message);
                    onSuccess();
                    onClose();
                    return;
                } catch (retryErr: any) {
                    setError(retryErr.message || "Error al crear la colecta.");
                }
            } else {
                setError(err.message || "Error al crear la colecta.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-border-subtle rounded-3xl w-full max-w-5xl md:max-h-[95vh] overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)] flex flex-col md:flex-row shadow-accent-teal/10 custom-scrollbar overflow-y-auto">

                {/* Left Column: Preview & Image Selection */}
                <div className="w-full md:w-[45%] md:border-r border-border-subtle bg-card/30 p-6 flex flex-col gap-5 relative">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight mb-1 text-white">Previsualización</h3>
                        <p className="text-sm text-muted">Así se verá tu colecta en el listado.</p>
                    </div>

                    <div className="aspect-square w-full bg-neutral-900/50 border border-border-subtle rounded-3xl flex flex-col overflow-hidden shadow-inner relative group isolate">
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-accent-teal/5 rounded-3xl -z-10 group-hover:bg-accent-teal/10 transition-colors duration-500" />

                        <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                            {isUrl ? (
                                <img src={image} alt="Preview" className="w-[80%] h-[80%] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 shadow-2xl" onError={() => setImage("🎯")} />
                            ) : (
                                <span className="text-[100px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110">{image}</span>
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5 pt-12">
                            <h4 className="font-bold text-lg text-white leading-tight line-clamp-1 mb-1">{title || "Nombre de la Colecta"}</h4>
                            <p className="text-xs text-muted/80 line-clamp-1 mb-4">{description || "Descripción corta del objetivo..."}</p>

                            {/* Progress Bar Preview */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-medium text-muted">
                                    <span>Recaudado: 0 {currency}</span>
                                    <span>Meta: {goalAmount || "0"} {currency}</span>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-teal w-[5%] rounded-full opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <label className="block text-sm font-bold text-foreground">Imagen o Emoji</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                                className="w-full bg-card/50 border border-border-subtle rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="Pega una URL o elige un emoji..."
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
                                Al publicar, se creará un Smart Escrow no custodial en <strong>Trustless Work</strong>.
                                <br />
                                Los aportes estarán seguros y el creador podrá liquidarlos según las reglas del contrato.
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
                                Crear Nueva Colecta
                            </h2>
                            <p className="text-sm text-muted mt-1">Lanza tu campaña de recaudación segura.</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-card/50 hover:bg-white/10 border border-border-subtle text-muted hover:text-white transition-all hover:rotate-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form id="create-crowdfund-form" onSubmit={handleSubmit} className="space-y-6 flex-1">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Privacy Selector */}
                        <div className="bg-neutral-900/50 border border-border-subtle rounded-2xl p-1.5 flex relative">
                            <div
                                className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-neutral-800 rounded-xl transition-all duration-300 ease-out shadow-sm border border-white/5"
                                style={{ left: privacy === 'public' ? '6px' : 'calc(50% + 0px)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`flex-1 relative z-10 font-bold text-[13px] sm:text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors ${privacy === 'public' ? 'text-white' : 'text-muted hover:text-white'}`}
                            >
                                Pública (Toda la empresa)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`flex-1 relative z-10 font-bold text-[13px] sm:text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors ${privacy === 'private' ? 'text-white' : 'text-muted hover:text-white'}`}
                            >
                                Privada (Solo mi Equipo)
                            </button>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Título de la Colecta <span className="text-accent-teal">*</span></label>
                            <input
                                required
                                type="text"
                                maxLength={60}
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-medium placeholder:text-muted/60"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej. Servidor Anual, Torneo LAN..."
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Descripción</label>
                            <textarea
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-muted/60 min-h-[100px] resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Explica brevemente para qué son los fondos..."
                            />
                        </div>

                        {/* Goal & Currency */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">
                                Meta de Recaudación <span className="text-accent-teal">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4">
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold transition-colors group-focus-within:text-accent-teal">$</span>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl pl-10 pr-5 py-4 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-mono placeholder:text-muted/50"
                                        value={goalAmount}
                                        onChange={e => setGoalAmount(e.target.value)}
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

                        {/* Duration Group */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-bold text-foreground">Duración en Días <span className="text-accent-teal">*</span></label>
                                <span className="text-[11px] text-muted/80 font-medium bg-neutral-900/50 px-2 py-1 rounded-md border border-border-subtle flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                                    Finaliza: {endTime}
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

                        {/* Destination Account */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Cuenta Destino (Billetera Stellar) <span className="text-accent-teal">*</span></label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl pl-5 pr-32 py-4 text-sm focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-mono placeholder:text-muted/60"
                                    value={destinationAccount}
                                    onChange={e => setDestinationAccount(e.target.value)}
                                    placeholder="GCABC...XYZ"
                                />
                                <button
                                    type="button"
                                    onClick={() => publicKey && setDestinationAccount(publicKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal border border-accent-teal/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                    <UserCircle className="w-3.5 h-3.5" />
                                    Usar mi wallet
                                </button>
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
                                placeholder="Ej. Equipo, Sorprendelo, Despedida..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-auto flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-sm font-bold text-muted hover:text-white bg-neutral-900/50 hover:bg-neutral-800 border border-border-subtle rounded-2xl transition-all"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !title || !goalAmount || !destinationAccount}
                                className="flex-[2] bg-accent-teal hover:bg-accent-teal/80 text-black font-black text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Crear Colecta
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
