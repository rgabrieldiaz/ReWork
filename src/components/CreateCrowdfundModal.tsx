import { useState, useRef, useEffect } from "react";
import { X, Loader2, Smile } from "lucide-react";
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
    const [durationDays, setDurationDays] = useState("30");
    const [image, setImage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [tagsInput, setTagsInput] = useState("");
    const [destinationAccount, setDestinationAccount] = useState(publicKey || "");
    const [loading, setLoading] = useState(false);
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

        if (!publicKey) {
            setError("Por favor, conecta tu billetera primero.");
            return;
        }

        if (!title || !goalAmount || !durationDays || !destinationAccount) {
            setError("Por favor, completa los campos requeridos.");
            return;
        }

        setLoading(true);

        try {
            // Calcular fecha límite
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + parseInt(durationDays));

            // Parsear tags
            const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");

            // Insertar en Supabase
            const { error: dbError } = await supabase.from("crowdfunds").insert([
                {
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
                }
            ]);

            if (dbError) throw new Error(dbError.message);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Create crowdfund error:", err);
            setError(err.message || "Error al crear la colecta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-border-subtle">
                    <h2 className="text-xl font-bold">Crear Nueva Colecta</h2>
                    <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted">Título de la Colecta *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                            placeholder="Ej. Servidor Anual"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors resize-none h-20"
                            placeholder="¿Para qué son los fondos?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">Meta (XLM) *</label>
                            <input
                                type="number"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                                className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="Ej. 5000"
                                required
                                min="1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">Duración (Días) *</label>
                            <input
                                type="number"
                                value={durationDays}
                                onChange={(e) => setDurationDays(e.target.value)}
                                className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="30"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted">Cuenta Destino *</label>
                        <input
                            type="text"
                            value={destinationAccount}
                            onChange={(e) => setDestinationAccount(e.target.value)}
                            className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors text-sm"
                            placeholder="G..."
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted">Tags (Separados por coma)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                            placeholder="Ej. Servidores, Comunidad"
                        />
                    </div>

                    <div className="space-y-1 relative">
                        <label className="text-sm font-medium text-muted">Imagen (URL o Emoji)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="flex-1 bg-card border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-teal transition-colors"
                                placeholder="💻 o https://..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="px-4 py-3 bg-card border border-border-subtle hover:bg-foreground/5 flex items-center justify-center rounded-xl transition-colors text-muted hover:text-foreground"
                            >
                                <Smile className="w-5 h-5 flex-shrink-0" />
                            </button>
                        </div>
                        {showEmojiPicker && (
                            <div className="absolute right-0 top-full mt-2 z-[60] shadow-2xl" ref={emojiPickerRef}>
                                <EmojiPicker
                                    theme={Theme.AUTO}
                                    onEmojiClick={(emojiData) => {
                                        setImage(emojiData.emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-muted hover:text-foreground transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title || !goalAmount || !destinationAccount}
                            className="bg-accent-teal hover:bg-accent-teal/80 text-black font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Crear Colecta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
