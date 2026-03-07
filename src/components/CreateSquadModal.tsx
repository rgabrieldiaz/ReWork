"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Smile, Shield, UsersRound } from "lucide-react";
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
                specialty: `${image} ${specialty}`, // store emoji in specialty
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
                            {(t.colaboradores?.squads as any)?.preview || "Vista Previa del Squad"}
                        </h3>

                        {/* Squad Card Preview */}
                        <div className="bg-card rounded-2xl border border-border-subtle overflow-hidden hover:border-accent-teal/30 transition-all flex flex-col shadow-lg">
                            <div className="p-6 flex-1 flex flex-col relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-foreground mb-1 break-words">
                                            {image} {name || "Nombre del Squad"}
                                        </h3>
                                        <span className="inline-block px-2.5 py-1 bg-accent-teal/10 text-accent-teal text-xs font-semibold rounded-md border border-accent-teal/20 mt-1 max-w-full truncate">
                                            {specialty || "Especialidad"}
                                        </span>
                                    </div>
                                    <div className="bg-neutral-800/50 p-2 rounded-xl border border-border-subtle shrink-0">
                                        <Shield className="w-5 h-5 text-accent-teal opacity-80" />
                                    </div>
                                </div>

                                <p className="text-sm text-muted mb-6 flex-1 break-words min-h-[4rem]">
                                    {description || "Agrega una descripción para contarle a la empresa el propósito y la cultura del equipo..."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
                                    <div className="flex items-center">
                                        <div className="flex -space-x-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-card bg-accent-teal flex items-center justify-center overflow-hidden z-20">
                                                <span className="text-[10px] font-bold text-black border-accent-teal">TÚ</span>
                                            </div>
                                        </div>
                                        <span className="ml-3 text-xs text-muted font-medium">1 {(t.colaboradores?.squads as any)?.members || "Miembros"}</span>
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
                                <p className="text-xs text-muted">Aparecerás automáticamente como líder del Escuadrón ("Leader") y podrás invitar a otros compañeros.</p>
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
                            {(t.colaboradores?.squads as any)?.create || "Crear Nuevo Squad"}
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
                                <label className="text-sm font-semibold text-foreground">Propósito del Squad</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-neutral-900 border border-border-subtle rounded-xl p-4 text-foreground focus:outline-none focus:border-accent-teal transition-colors resize-none"
                                    placeholder="Describe la cultura, el objetivo a largo plazo o las reglas para sumarse a este escuadrón..."
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
                                            Creando Squad...
                                        </>
                                    ) : (
                                        "Crear Squad"
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
