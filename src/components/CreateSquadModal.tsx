"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Smile, Shield, UsersRound, ArrowRight } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useSettings } from "@/hooks/useSettings";
import { useSquads } from "@/hooks/useSquads";

interface CreateSquadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateSquadModal({ isOpen, onClose, onCreated }: CreateSquadModalProps) {
    const { t } = useSettings();
    const { createSquad } = useSquads();

    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("🛡️");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        if (!name.trim() || !description.trim()) {
            setError((t.colaboradores?.squads as any)?.fillFields || "Completa los campos obligatorios.");
            return;
        }

        setIsSubmitting(true);

        try {
            await createSquad({
                name,
                description,
                specialty,
                emoji: image,
                is_open: true
            });
            onCreated();
        } catch (err: any) {
            console.error("Error creating squad:", err);
            setError(err.message || "Error creating squad");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-5xl rounded-3xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Column: Preview */}
                <div className="w-full md:w-5/12 bg-neutral-900/50 p-6 sm:p-8 flex flex-col justify-between border-r border-border-subtle relative overflow-y-auto hidden md:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/5 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-muted text-sm font-semibold uppercase tracking-wider mb-6">
                            {(t.colaboradores?.squads as any)?.preview || "Vista Previa del Equipo"}
                        </h3>
                        {/* Squad Card Preview */}
                        <div className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-accent-teal/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-accent-teal/30 transition-colors text-2xl">
                                    {image && image !== "🛡️" ? (
                                        <span>{image}</span>
                                    ) : (
                                        <Shield className="w-6 h-6 text-accent-teal/50" />
                                    )}
                                </div>
                                {specialty && (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2.5 py-1 bg-accent-teal/10 text-accent-teal text-[10px] font-bold uppercase rounded-md border border-accent-teal/20 tracking-wider">
                                            {specialty}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-accent-teal transition-colors flex items-center justify-between">
                                    {name || "Nombre del Equipo"}
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                </h2>
                                <p className="text-muted text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                                    {description || "Agrega una descripción para contarle a la empresa el propósito y la cultura del equipo..."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
                                    <div className="flex items-center">
                                        <div className="flex -space-x-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-card bg-accent-teal flex items-center justify-center overflow-hidden z-20 shadow-sm">
                                                <span className="text-[10px] font-bold text-black border-accent-teal">TÚ</span>
                                            </div>
                                        </div>
                                        <span className="ml-3 text-xs text-muted font-mono font-bold tracking-tight uppercase">1 {(t.colaboradores?.squads as any)?.members || "Miembros"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div className="bg-card border border-border-subtle rounded-xl p-4 flex gap-4 items-start shadow-sm">
                            <Shield className="w-6 h-6 text-accent-teal shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm mb-1">{(t.colaboradores?.squads as any)?.leaderRole || "Mando y Control"}</h4>
                                <p className="text-xs text-muted">Aparecerás automáticamente como líder del Equipo ("Leader") y podrás invitar a otros compañeros.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Inputs */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 overflow-y-auto relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="max-w-md mx-auto relative z-10">
                        <h2 className="text-2xl font-bold tracking-tight mb-2">
                            {(t.colaboradores?.squads as any)?.create || "Crear Nuevo Equipo"}
                        </h2>
                        <p className="text-muted mb-8 text-sm">Organiza misiones, comparte fondos y lidera iniciativas.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Icon and Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Nombre e Identidad</label>
                                <div className="flex gap-3">
                                    <div className="relative" ref={emojiPickerRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="h-12 w-16 bg-neutral-900 border border-border-subtle rounded-xl flex items-center justify-center text-xl hover:border-accent-teal/50 transition-colors focus:ring-2 focus:ring-accent-teal/20"
                                        >
                                            {image}
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute top-14 left-0 z-50 shadow-2xl border border-border-subtle rounded-xl overflow-hidden scale-90 origin-top-left">
                                                <EmojiPicker
                                                    theme={Theme.DARK}
                                                    onEmojiClick={(emojiData) => {
                                                        setImage(emojiData.emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 bg-neutral-900 border border-border-subtle rounded-xl pl-4 pr-4 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                                            placeholder="Ej: Backend Warriors"
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specialty / Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Etiqueta de Especialidad</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="w-full h-12 bg-neutral-900 border border-border-subtle rounded-xl px-4 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                                        placeholder="Ej: Rust/Soroban, Marketing..."
                                        maxLength={40}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Propósito del Equipo</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-neutral-900 border border-border-subtle rounded-xl p-4 text-foreground focus:outline-none focus:border-accent-teal transition-colors resize-none"
                                    placeholder="Describe la cultura, el objetivo a largo plazo o las reglas para sumarse a este equipo..."
                                    required
                                    maxLength={300}
                                />
                                <div className="flex justify-end text-xs text-muted">
                                    {description.length}/300
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                                    <X className="w-4 h-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Sticky submit button container on mobile, relative on desktop */}
                            <div className="pt-4 sticky bottom-0 bg-card/90 backdrop-blur-sm md:static md:bg-transparent pb-4 md:pb-0">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim() || !description.trim()}
                                    className="w-full bg-accent-teal hover:bg-accent-teal/90 disabled:opacity-50 disabled:hover:bg-accent-teal text-black font-bold h-14 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-accent-teal/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creando Equipo...
                                        </>
                                    ) : (
                                        "Crear Equipo"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
