"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, Clock, History, AlertCircle } from "lucide-react";
import { UserBadge } from "@/components/UserBadge";

interface Auction {
    id: number;
    title: string;
    seller: string;
    base_price: number;
    current_bid: number;
    bid_count: number;
    status: string;
    current_winner_address: string | null;
    escrow_contract_id: string | null;
    end_time: string | null;
    image: string;
    is_direct_buy: boolean;
    currency: string;
    condition?: 'nuevo' | 'usado';
}

interface AuctionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    auction: Auction | null;
    currentAddress: string | null;
    onBid: (auction: Auction, bidAmount: number) => Promise<void>;
    loadingBids: Record<number, boolean>;
    t: any; // Translations
}

// Reuse countdown logic
function useCountdown(endTime: string | null) {
    const [timeLeft, setTimeLeft] = useState<{ str: string; isEnded: boolean }>({ str: "", isEnded: false });

    useEffect(() => {
        if (!endTime) return;
        const target = new Date(endTime).getTime();

        const updateTime = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ str: "Finalizado", isEnded: true });
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                let str = "";
                if (days > 0) str += `${days}d `;
                str += `${hours}h ${minutes}m ${seconds}s`;
                setTimeLeft({ str, isEnded: false });
            }
        };

        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [endTime]);

    return timeLeft;
}

export function AuctionDetailModal({ isOpen, onClose, auction, currentAddress, onBid, loadingBids, t }: AuctionDetailModalProps) {
    const [bidAmount, setBidAmount] = useState<number>(0);
    const { str: timeLeftStr, isEnded } = useCountdown(auction?.end_time || null);

    useEffect(() => {
        if (auction) {
            setBidAmount(Math.max(auction.current_bid + 1, auction.base_price));
        }
    }, [auction]);

    if (!isOpen || !auction) return null;

    const isUrl = auction.image.startsWith("http");
    const currency = auction.currency || 'USDC';
    const isOwner = currentAddress === auction.seller;
    const isFinished = auction.status === 'finished' || isEnded;
    const isCancelled = auction.status === 'cancelled';
    const minBid = Math.max(auction.current_bid + 1, auction.base_price);
    const isLoading = loadingBids[auction.id];

    const handleStep = (step: number) => {
        let nextVal = bidAmount + step;
        if (nextVal < minBid) nextVal = minBid;
        setBidAmount(nextVal);
    };

    const submitBid = async () => {
        if (auction.is_direct_buy) {
            await onBid(auction, auction.base_price);
        } else {
            await onBid(auction, bidAmount);
        }
        // Don't close modal automatically so user can see the updated state,
        // or close it if the parent tells us. 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-gradient-to-br from-neutral-900 to-black border border-border-subtle rounded-3xl w-full max-w-5xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row relative z-10">

                {/* Left Column: Visual (Glassmorphism) */}
                <div className="w-full md:w-[45%] md:border-r border-border-subtle bg-card/30 p-6 sm:p-8 flex flex-col justify-center relative min-h-[300px]">
                    <div className="aspect-square w-full bg-neutral-900/50 border border-border-subtle rounded-3xl flex items-center justify-center overflow-hidden shadow-inner relative group isolate">
                        <div className="absolute inset-0 bg-accent-teal/5 rounded-3xl -z-10 transition-colors duration-500" />

                        {isUrl ? (
                            <img src={auction.image} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" onError={(e) => { (e.target as any).src = "📦" }} />
                        ) : (
                            <span className="text-[120px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-110">{auction.image}</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-10">
                            <h4 className="font-bold text-xl text-white leading-tight line-clamp-2">{auction.title}</h4>
                            <div className="flex justify-between items-end mt-3">
                                <span className="text-accent-teal font-black text-2xl tracking-tight">
                                    {auction.is_direct_buy ? `${auction.base_price} ${currency}` : `${auction.current_bid || auction.base_price} ${currency}`}
                                </span>
                                <span className="text-[10px] text-white/90 uppercase font-black tracking-widest bg-white/10 px-2.5 py-1 rounded border border-white/20 backdrop-blur-md">
                                    {auction.condition === 'nuevo' ? '✨ Nuevo' : '♻️ Usado'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Details */}
                <div className="w-full md:w-[55%] p-6 sm:p-8 flex flex-col relative bg-gradient-to-br from-card/30 to-black">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-card/50 hover:bg-white/10 border border-border-subtle text-muted hover:text-white transition-all hover:rotate-90 z-20">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mb-6 pr-12">
                        <div className="flex items-center gap-2 mb-2">
                            {auction.is_direct_buy ? (
                                <span className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                    🛍️ Compra Directa
                                </span>
                            ) : (
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                    🔨 Subasta
                                </span>
                            )}
                            {isFinished && !isCancelled && (
                                <span className="bg-neutral-500/10 text-muted border border-neutral-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                    {t.marketplace.finished}
                                </span>
                            )}
                            {isCancelled && (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                    Cancelado
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent break-words leading-tight">{auction.title}</h2>
                    </div>

                    <div className="flex-1 space-y-6">
                        {/* Seller Details */}
                        <div className="flex items-center justify-between bg-neutral-900/40 border border-border-subtle p-4 rounded-2xl">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Vendedor</span>
                                <UserBadge address={auction.seller} />
                            </div>
                            {!auction.is_direct_buy && (
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Historial</span>
                                    <span className="text-sm font-mono font-medium flex items-center justify-end gap-1.5 text-neutral-300">
                                        <History className="w-3.5 h-3.5" />
                                        {auction.bid_count} {t.marketplace.bidsCount}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Modals content based on mode */}
                        <div className="bg-[#050505] p-5 rounded-2xl border border-border-subtle shadow-inner">
                            {auction.is_direct_buy ? (
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] uppercase font-bold tracking-wider text-muted mb-1">Precio Fijo</span>
                                        <span className="text-3xl font-mono font-black text-white">{auction.base_price} <span className="text-accent-teal">{currency}</span></span>
                                    </div>
                                    {isFinished && auction.current_winner_address && (
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Comprador</span>
                                            <UserBadge address={auction.current_winner_address} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] uppercase font-bold tracking-wider text-muted mb-1">Mejor Oferta</span>
                                            <span className="text-3xl font-mono font-black text-white">{auction.current_bid || auction.base_price} <span className="text-accent-teal">{currency}</span></span>
                                        </div>
                                        {auction.end_time && !isFinished && !isCancelled && (
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Tiempo Restante</span>
                                                <span className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 px-3 py-1.5 text-sm font-bold rounded-xl flex items-center justify-end gap-1.5 font-mono shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                                                    <Clock className="w-4 h-4" /> {timeLeftStr}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">{t.marketplace.currentWinner}</span>
                                            {auction.current_winner_address ? (
                                                <UserBadge address={auction.current_winner_address} />
                                            ) : (
                                                <span className="text-xs text-neutral-500 font-mono mt-0.5">{t.marketplace.noOneYet}</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Precio Inicial</span>
                                            <span className="text-sm font-mono text-neutral-400">{auction.base_price} {currency}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions (Only visible if not owner, active, not cancelled etc) */}
                        {!isFinished && !isCancelled && !isOwner && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {!auction.is_direct_buy && (
                                    <div className="flex flex-1 bg-card border border-border-subtle rounded-xl overflow-hidden focus-within:border-accent-teal transition-colors h-14">
                                        <button
                                            onClick={() => handleStep(-1)}
                                            disabled={bidAmount <= minBid || isLoading}
                                            className="px-5 mx-1 text-muted hover:text-white disabled:opacity-30 transition-colors text-2xl flex items-center justify-center font-light pb-1"
                                        >-</button>
                                        <div className="flex-1 relative flex items-center justify-center border-x border-border-subtle/50">
                                            <span className="text-muted text-sm font-bold mr-1">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-center text-lg font-mono font-bold focus:outline-none transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white"
                                                value={bidAmount}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setBidAmount(val);
                                                }}
                                                onBlur={() => {
                                                    if (bidAmount < minBid) setBidAmount(minBid);
                                                }}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleStep(1)}
                                            disabled={isLoading}
                                            className="px-5 mx-1 text-muted hover:text-white disabled:opacity-30 transition-colors text-2xl flex items-center justify-center font-light pb-1"
                                        >+</button>
                                    </div>
                                )}
                                <button
                                    onClick={submitBid}
                                    disabled={isLoading || (!auction.is_direct_buy && bidAmount < minBid)}
                                    className={`h-14 flex items-center justify-center gap-2 px-8 ${auction.is_direct_buy ? 'w-full' : 'w-auto sm:min-w-[160px]'} bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-sm font-black shadow-[0_0_15px_rgba(0,242,255,0.15)] disabled:opacity-50 disabled:shadow-none min-w-[180px] relative overflow-hidden group`}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        auction.is_direct_buy ? "Comprar Ahora" : "Pujar"
                                    )}
                                    {!isLoading && <div className="absolute inset-0 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />}
                                </button>
                            </div>
                        )}

                        {isOwner && !isFinished && !isCancelled && (
                            <div className="pt-2">
                                <div className="flex items-center gap-2 p-3 bg-foreground/5 border border-border-subtle rounded-xl text-muted text-sm">
                                    <AlertCircle className="w-4 h-4 text-accent-teal shrink-0" />
                                    Eres el vendedor de este artículo.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trustless Work Info Box (Bottom Right) */}
                    <div className="mt-8 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start isolate relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent -z-10" />
                        <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-100">Contrato Escrow Inteligente</h4>
                            <p className="text-xs text-blue-200/70 mt-1 mb-2 leading-relaxed">
                                Los fondos serán custodiados on-chain por <strong>Trustless Work</strong>.
                                <br />
                                {auction.is_direct_buy
                                    ? "El pago se libera apenas confirmas la recepción del artículo."
                                    : "El pago se libera al finalizar exitosamente la subasta."}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 bg-blue-500/10 inline-flex px-2 py-1 rounded-md border border-blue-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Fee estimado de red: ~0.00001 XLM
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

