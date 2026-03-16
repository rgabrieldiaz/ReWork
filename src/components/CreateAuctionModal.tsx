"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Image as ImageIcon, ShieldCheck, Smile, Lock, Globe, Users, ChevronDown, ChevronUp } from "lucide-react";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useWorkspace } from "@/hooks/useWorkspace";

interface CreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

interface Squad {
    id: string;
    name: string;
}

export function CreateAuctionModal({ isOpen, onClose, onCreated }: CreateAuctionModalProps) {
    const { connected, address } = useFreighter();
    const { addPoints } = useProfile();
    const { activeWorkspace } = useWorkspace();
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isEscrowExpanded, setIsEscrowExpanded] = useState(false);

    const [title, setTitle] = useState("");
    const [image, setImage] = useState("📦");
    const [basePrice, setBasePrice] = useState("");
    const [durationDays, setDurationDays] = useState<number>(1);
    const [currency, setCurrency] = useState<"USDC" | "XLM">("USDC");
    const [condition, setCondition] = useState<"nuevo" | "usado">("nuevo");
    const [isDirectBuy, setIsDirectBuy] = useState(false);
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [selectedSquadId, setSelectedSquadId] = useState<string>("");
    const [userSquads, setUserSquads] = useState<Squad[]>([]);

    // Emoji suggestion logic based on keywords
    useEffect(() => {
        if (!title) {
            setImage("📦");
            return;
        }

        // Only suggest if not a URL
        const isCurrentlyUrl = image.startsWith("http");
        if (isCurrentlyUrl) return;

        const lowerTitle = title.toLowerCase();
        const emojiMap: Record<string, string> = {
            'fiesta': '🥳', 'party': '🥳', 'cerveza': '🍺', 'beer': '🍺',
            'comida': '🍕', 'food': '🍕', 'asado': '🥩', 'bbq': '🥩',
            'viaje': '✈️', 'travel': '✈️', 'regalo': '🎁', 'gift': '🎁',
            'cumple': '🎂', 'birthday': '🎂', 'servidor': '🖥️', 'server': '🖥️',
            'gaming': '🎮', 'juego': '🎮', 'deporte': '⚽', 'sport': '⚽',
            'cafe': '☕', 'coffee': '☕', 'salud': '🏥', 'health': '🏥',
            'ayuda': '🆘', 'help': '🆘', 'fundacion': '🏢', 'donacion': '🤲',
            'proyecto': '🚀', 'project': '🚀', 'equipo': '👥', 'team': '👥',
            'musica': '🎸', 'music': '🎸', 'cine': '🍿', 'movie': '🍿',
            'laptop': '💻', 'computadora': '💻', 'monitor': '🖥️', 'teclado': '⌨️'
        };

        for (const [key, val] of Object.entries(emojiMap)) {
            if (lowerTitle.includes(key)) {
                setImage(val);
                break;
            }
        }
    }, [title]);

    // Fetch user squads when modal opens
    useEffect(() => {
        if (isOpen && address) {
            const fetchSquads = async () => {
                const { data: user } = await supabase
                    .from("users")
                    .select("id")
                    .eq("wallet_address", address)
                    .single();

                if (user) {
                    const { data: memberOf } = await supabase
                        .from("squad_members")
                        .select("squad_id, squads(id, name)")
                        .eq("user_id", user.id);

                    if (memberOf) {
                        const squads = memberOf.map(m => (m as any).squads as Squad);
                        setUserSquads(squads);
                        if (squads.length > 0) setSelectedSquadId(squads[0].id);
                    }
                }
            };
            fetchSquads();
        }
    }, [isOpen, address]);

    // Derived states
    const isUrl = image.startsWith("http");
    const endTime = useMemo(() => {
        if (isDirectBuy) return null;
        const date = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        return date.toLocaleString();
    }, [durationDays, isDirectBuy]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connected || !address) {
            alert("Conecta tu billetera primero para publicar un artículo.");
            return;
        }

        if (!title || !basePrice) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        if (privacy === "private" && !selectedSquadId) {
            alert("Por favor selecciona un equipo para la subasta privada.");
            return;
        }

        setLoading(true);
        try {
            const basePriceNum = Number(basePrice);
            const endTimeIso = isDirectBuy ? null : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

            const { error } = await supabase.from("auctions").insert({
                title: title,
                seller: address,
                image: image,
                base_price: basePriceNum,
                current_bid: 0,
                bid_count: 0,
                status: 'active',
                end_time: endTimeIso,
                is_direct_buy: isDirectBuy,
                currency: currency,
                condition: condition,
                workspace_id: activeWorkspace?.id,
                squad_id: privacy === "private" ? selectedSquadId : null
            });

            if (error) throw error;

            await addPoints(50, "Subasta publicada");
            onCreated();
            onClose();
        } catch (err: any) {
            console.error("Error al crear subasta:", err);
            
            // Supabase/Postgrest error details
            const errMsg = err?.message || "Error desconocido";
            const errDetails = err?.details ? ` (${err.details})` : "";
            const errHint = err?.hint ? ` Pista: ${err.hint}` : "";
            
            alert(`Error creando la subasta: ${errMsg}${errDetails}${errHint}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-border-subtle rounded-3xl w-full max-w-5xl md:max-h-[95vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row shadow-accent-teal/10">

                {/* Left Column: Preview & Image Selection */}
                <div className="w-full md:w-[45%] md:border-r border-border-subtle bg-card/30 p-6 flex flex-col gap-5 relative overflow-y-auto">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight mb-1 text-white">Previsualización</h3>
                        <p className="text-sm text-muted">Así se verá tu artículo en el mercado P2P.</p>
                    </div>

                    <div className={`aspect-square w-full bg-neutral-900/50 border ${isDirectBuy ? 'border-accent-teal/30' : 'border-purple-500/30'} rounded-3xl flex items-center justify-center overflow-hidden shadow-inner relative group isolate shrink-0`}>
                        {/* Decorative background glow */}
                        <div className={`absolute inset-0 ${isDirectBuy ? 'bg-accent-teal/5 group-hover:bg-accent-teal/10' : 'bg-purple-500/5 group-hover:bg-purple-500/10'} rounded-3xl -z-10 transition-colors duration-500`} />

                        {isUrl ? (
                            <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImage("📦")} />
                        ) : (
                            <span className="text-[120px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110">{image}</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-10 text-left">
                            <h4 className="font-bold text-lg text-white leading-tight line-clamp-1">{title || "Nombre del artículo"}</h4>
                            <div className="flex justify-between items-end mt-2">
                                <div className="flex flex-col">
                                    <span className={`${isDirectBuy ? 'text-accent-teal' : 'text-purple-400'} font-black text-xl tracking-tight`}>
                                        {basePrice ? `${basePrice} ${currency}` : (isDirectBuy ? "COMPRA DIRECTA" : "SUBASTA")}
                                    </span>
                                    {privacy === "private" && (
                                        <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-1">
                                            <Lock className="w-3 h-3" /> Solo Squad
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] text-white/90 uppercase font-black tracking-widest ${isDirectBuy ? 'bg-accent-teal/20 border-accent-teal/30' : 'bg-purple-500/20 border-purple-500/30'} px-2.5 py-1 rounded border backdrop-blur-md`}>{condition}</span>
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
                                    <div className="relative z-50 shadow-2xl rounded-xl overflow-hidden border border-border-subtle">
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
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-3 isolate relative overflow-hidden mt-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent -z-10" />
                        <button 
                            type="button"
                            onClick={() => setIsEscrowExpanded(!isEscrowExpanded)}
                            className="flex items-center justify-between w-full text-left group/escrow"
                        >
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                                <h4 className="text-sm font-bold text-blue-100">Contrato Escrow Inteligente</h4>
                            </div>
                            {isEscrowExpanded ? (
                                <ChevronUp className="w-4 h-4 text-blue-400/50 group-hover/escrow:text-blue-400 transition-colors" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-blue-400/50 group-hover/escrow:text-blue-400 transition-colors" />
                            )}
                        </button>
                        
                        {isEscrowExpanded && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs text-blue-200/70 mb-3 leading-relaxed">
                                    Al publicar, se creará un Escrow on-chain usando <strong>Trustless Work</strong>.
                                    <br />
                                    {isDirectBuy
                                        ? "El pago se libera apenas el comprador confirma."
                                        : "El pago se libera al finalizar el plazo de la subasta."}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-blue-400 bg-blue-500/10 inline-flex px-2 py-1 rounded-md border border-blue-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    Fee estimado de red: ~0.00001 XLM
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Data Inputs */}
                <div className="w-full md:w-[55%] p-6 flex flex-col relative bg-gradient-to-br from-card/30 to-black overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                                {isDirectBuy ? "Crear Venta Directa" : "Crear Nueva Subasta"}
                            </h2>
                            <p className="text-sm text-muted mt-1">Configura parámetros comerciales inteligentes.</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-card/50 hover:bg-white/10 border border-border-subtle text-muted hover:text-white transition-all hover:rotate-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Segmented Control for Mode */}
                    <div className="flex bg-neutral-900/50 border border-border-subtle rounded-2xl p-1.5 relative mb-6">
                        <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-neutral-800 rounded-xl transition-all duration-300 ease-out shadow-sm border border-white/5" style={{ left: isDirectBuy ? 'calc(50% + 0px)' : '6px' }} />
                        <button
                            type="button"
                            onClick={() => setIsDirectBuy(false)}
                            className={`flex-[0.5] relative z-10 font-bold text-sm rounded-xl py-2 flex items-center justify-center transition-colors ${!isDirectBuy ? 'text-white' : 'text-muted hover:text-white'}`}
                        >
                            Subasta 🔨
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDirectBuy(true)}
                            className={`flex-[0.5] relative z-10 font-bold text-sm rounded-xl py-2 flex items-center justify-center transition-colors ${isDirectBuy ? 'text-white' : 'text-muted hover:text-white'}`}
                        >
                            Compra Directa 🛍️
                        </button>
                    </div>

                    <form id="create-auction-form" onSubmit={handleSubmit} className="space-y-6 flex-1">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground">Título de la Publicación <span className="text-accent-teal">*</span></label>
                            <input
                                required
                                type="text"
                                maxLength={60}
                                className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl px-5 py-3 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-medium placeholder:text-muted/60"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej. Lentes VR Oculus Quest 3, Licencia Figma..."
                            />
                        </div>

                        {/* Price & Currency */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">
                                {isDirectBuy ? "Precio de Venta y Moneda" : "Precio Base y Moneda"} <span className="text-accent-teal">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4">
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold transition-colors group-focus-within:text-accent-teal">$</span>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-neutral-900/50 border border-border-subtle rounded-2xl pl-10 pr-5 py-3 text-base focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all font-mono placeholder:text-muted/50"
                                        value={basePrice}
                                        onChange={e => setBasePrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex bg-neutral-900/50 border border-border-subtle rounded-2xl p-1.5 relative">
                                    <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-neutral-800 rounded-xl transition-all duration-300 ease-out shadow-sm border border-white/5" style={{ left: currency === 'USDC' ? '6px' : 'calc(50% + 0px)' }} />
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USDC')}
                                        className={`flex-1 relative z-10 font-bold text-sm rounded-xl py-2 flex items-center justify-center gap-2 transition-colors ${currency === 'USDC' ? 'text-white' : 'text-muted hover:text-white'}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-400">U</div>
                                        USDC
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('XLM')}
                                        className={`flex-1 relative z-10 font-bold text-sm rounded-xl py-2 flex items-center justify-center gap-2 transition-colors ${currency === 'XLM' ? 'text-white' : 'text-muted hover:text-white'}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-neutral-100/10 border border-neutral-400/50 flex items-center justify-center text-[10px] text-neutral-300">X</div>
                                        XLM
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Visibilidad <span className="text-accent-teal">*</span></label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('public')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${privacy === 'public' ? 'bg-accent-teal/10 border-accent-teal text-white' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border'}`}
                                >
                                    <Globe className="w-4 h-4" /> Público
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('private')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${privacy === 'private' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border'}`}
                                >
                                    <Users className="w-4 h-4" /> Solo Equipo
                                </button>
                            </div>

                            {privacy === 'private' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <select
                                        value={selectedSquadId}
                                        onChange={(e) => setSelectedSquadId(e.target.value)}
                                        className="w-full bg-neutral-900/50 border border-orange-500/30 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Selecciona tu equipo...</option>
                                        {userSquads.map((squad) => (
                                            <option key={squad.id} value={squad.id} className="bg-neutral-900">
                                                {squad.name}
                                            </option>
                                        ))}
                                        {userSquads.length === 0 && (
                                            <option value="" disabled>No estás en ningún equipo</option>
                                        )}
                                    </select>
                                    <p className="text-[10px] text-muted mt-2 px-1">
                                        Solo los miembros del equipo seleccionado podrán ver y pujar por este artículo.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Duration Group */}
                        {!isDirectBuy && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-end">
                                    <label className="block text-sm font-bold text-foreground">Duración <span className="text-accent-teal">*</span></label>
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
                                            className={`flex-1 min-w-[50px] py-3 px-2 rounded-xl text-sm font-bold transition-all border ${durationDays === days ? 'bg-accent-teal/15 border-accent-teal text-white shadow-[0_0_15px_rgba(0,242,255,0.1)] ring-1 ring-accent-teal/30' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border hover:bg-neutral-800'}`}
                                        >
                                            {days}{days === 1 ? 'd' : 'd'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Condition Group */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Estado del Artículo</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCondition('nuevo')}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${condition === 'nuevo' ? 'bg-white/10 border-white text-white shadow-inner' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border hover:bg-neutral-800'}`}
                                >
                                    ✨ Nuevo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCondition('usado')}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all border ${condition === 'usado' ? 'bg-white/10 border-white text-white shadow-inner' : 'bg-neutral-900/50 border-border-subtle text-muted hover:border-border hover:bg-neutral-800'}`}
                                >
                                    ♻️ Usado
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-border-subtle pb-4">
                        <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-muted hover:text-white transition-colors border border-border-subtle bg-transparent rounded-2xl">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="create-auction-form"
                                disabled={loading || !title || !basePrice || (privacy === 'private' && !selectedSquadId)}
                                className="flex justify-center items-center gap-2 px-5 py-3 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap disabled:opacity-50 disabled:shadow-none disabled:hover:bg-accent-teal relative overflow-hidden group min-w-[180px]"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                <span className={loading ? "opacity-90" : "flex items-center gap-2"}>
                                    {loading ? "Procesando..." : (isDirectBuy ? "Crear Venta Directa" : "Publicar Subasta")}
                                </span>
                                {/* Subtle shine effect */}
                                {!loading && <div className="absolute inset-0 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

