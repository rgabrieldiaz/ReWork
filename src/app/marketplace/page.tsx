"use client";

import { useState, useEffect, useMemo } from "react";
import { Gavel, Clock, Search, ShieldCheck, Plus, XCircle, HandCoins, ChevronDown, Info, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { signTransaction, getNetworkDetails } from "@stellar/freighter-api";
import { CreateAuctionModal } from "@/components/CreateAuctionModal";
import { UserBadge } from "@/components/UserBadge";
import { useProfile } from "@/hooks/useProfile";

// Dummy addresses for demo purposes
const DUMMY_PLATFORM_ADDRESS = "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H";
const XLM_TESTNET_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

interface Auction {
    id: number;
    title: string;
    seller: string;
    base_price: number;
    current_bid: number;
    bid_count: number;
    status: string; // 'active', 'finished', 'cancelled'
    current_winner_address: string | null;
    escrow_contract_id: string | null;
    end_time: string | null; // ISO Timestamp string
    image: string;
    is_direct_buy: boolean;
    currency: string;
    condition?: 'nuevo' | 'usado';
}

// Custom hook to calculate time left
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

function truncateAddress(addr: string) {
    if (!addr || addr.length < 20) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Hook for debouncing search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function MarketplacePage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [bids, setBids] = useState<Record<number, string>>({});
    const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
    const { connected, address } = useFreighter();
    const { addPoints } = useProfile();

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [sortBy, setSortBy] = useState("time-asc");
    const [conditionFilter, setConditionFilter] = useState("ambas");
    const [hideFinished, setHideFinished] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const fetchAuctions = async () => {
        const { data, error } = await supabase.from("auctions").select("*").order("id", { ascending: false });
        if (data) setAuctions(data);
        if (error) console.error("Error fetching auctions:", error);
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    // Filter and Sort Logic
    const displayedAuctions = useMemo(() => {
        let filtered = [...auctions];

        if (debouncedSearchQuery) {
            filtered = filtered.filter(a => a.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
        }

        if (conditionFilter !== "ambas") {
            filtered = filtered.filter(a => (a.condition || "nuevo") === conditionFilter);
        }

        if (hideFinished) {
            const now = new Date().getTime();
            filtered = filtered.filter(a => {
                if (a.status === 'finished' || a.status === 'cancelled') return false;
                if (a.end_time && new Date(a.end_time).getTime() <= now) return false;
                return true;
            });
        }

        filtered.sort((a, b) => {
            if (sortBy === "popularity") {
                const popA = a.base_price > 0 ? a.current_bid / a.base_price : 0;
                const popB = b.base_price > 0 ? b.current_bid / b.base_price : 0;
                return popB - popA; // descending
            }
            if (sortBy === "time-asc") {
                if (!a.end_time) return 1;
                if (!b.end_time) return -1;
                return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
            }
            if (sortBy === "date-desc") {
                // Assuming ID represents creation order
                return b.id - a.id;
            }
            return 0;
        });

        return filtered;
    }, [auctions, debouncedSearchQuery, sortBy, hideFinished, conditionFilter]);

    const handleBid = async (auction: Auction) => {
        if (!connected || !address) {
            alert("Por favor, conecta tu billetera Freighter primero.");
            return;
        }

        const bidAmountStr = bids[auction.id];
        if (!bidAmountStr) return;

        const bidAmount = Number(bidAmountStr);
        if (bidAmount <= auction.current_bid || bidAmount < auction.base_price) {
            alert("Tu oferta debe ser mayor a la actual y al precio inicial.");
            return;
        }

        setLoadingIds(prev => ({ ...prev, [auction.id]: true }));

        try {
            const assetSymbol = auction.currency || "USDC";

            // 1. Prepare Payload for Trustless Work Escrow
            const payload: any = {
                signer: address,
                engagementId: `rework-auction-${auction.id}-${Date.now()}`,
                title: `Puja para ${auction.title}`,
                description: `Bloqueando fondos para oferta de ${bidAmount} ${assetSymbol} en Marketplace ReWork.`,
                roles: {
                    approver: address, // En uso real sería una cuenta multi-firma o backend
                    serviceProvider: auction.seller.length > 20 ? auction.seller : DUMMY_PLATFORM_ADDRESS,
                    platformAddress: DUMMY_PLATFORM_ADDRESS,
                    releaseSigner: address,
                    disputeResolver: DUMMY_PLATFORM_ADDRESS,
                    receiver: auction.seller.length > 20 ? auction.seller : DUMMY_PLATFORM_ADDRESS,
                },
                amount: bidAmount,
                platformFee: 0.5,
                milestones: [
                    { description: "Aprobación y entrega del artículo por el vendedor" }
                ],
                trustline: {
                    address: XLM_TESTNET_CONTRACT,
                    symbol: assetSymbol // TW uses this for display
                }
            };

            // 2. Proxy deploy
            const deployRes = await fetch('/api/trustless-work/deploy-escrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const deployData = await deployRes.json();

            if (!deployRes.ok) throw new Error(deployData.error || deployData.message || "Error al crear el Escrow en el servidor.");

            const { unsignedTransaction } = deployData;
            if (!unsignedTransaction) throw new Error("No XDR proveniente de Trustless Work.");

            // 3. Sign Transaction via Freighter
            const net = await getNetworkDetails();
            const signedResult = await signTransaction(unsignedTransaction, {
                networkPassphrase: net.networkPassphrase || "Test SDF Network ; September 2015"
            });
            const signedXdr = typeof signedResult === "string" ? signedResult : (signedResult as any)?.signedTxXdr || (signedResult as any)?.signedXdr || (signedResult as any)?.xdr || signedResult;

            if (!signedXdr) throw new Error("Firma cancelada o fallida desde Freighter.");

            // 4. Submit to Trustless Work 
            const response = await fetch('/api/trustless-work/send-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xdr: signedXdr })
            });

            const textResponse = await response.text();
            let result;
            try {
                result = textResponse ? JSON.parse(textResponse) : {};
            } catch (e) {
                // Empty string happens if the Next.js API returns 200 without a body
                result = {};
            }

            if (!response.ok) throw new Error(result.error || result.message || "Error enviando la transacción a la red.");

            const newEscrowId = result.contractId || result.id || `escrow-mock-${Date.now()}`;

            // 5. Update Supabase
            const { error: sbError } = await supabase
                .from("auctions")
                .update({
                    current_bid: bidAmount,
                    current_winner_address: address,
                    escrow_contract_id: newEscrowId,
                    bid_count: auction.bid_count + 1
                })
                .eq("id", auction.id);

            if (sbError) throw sbError;

            // Optimistic update
            setAuctions(prev => prev.map(a => a.id === auction.id ? {
                ...a, current_bid: bidAmount, current_winner_address: address, escrow_contract_id: newEscrowId, bid_count: auction.bid_count + 1
            } : a));
            setBids(prev => ({ ...prev, [auction.id]: "" }));
            alert(`¡Puja exitosa! Fondos asegurados en el Smart Contract.`);
            await addPoints(10, "¡Nueva puja realizada!");
        } catch (error: any) {
            console.error(error);
            alert(`Error creando oferta: ${error.message}`);
        } finally {
            setLoadingIds(prev => ({ ...prev, [auction.id]: false }));
        }
    };

    const handleCancelAuction = async (auction: Auction) => {
        if (!confirm("¿Seguro que deseas eliminar esta subasta? Esta acción no se puede deshacer.")) return;

        try {
            if (auction.bid_count === 0) {
                // Hard delete if no bids
                const { error } = await supabase.from("auctions").delete().eq("id", auction.id);
                if (error) throw error;
                setAuctions(prev => prev.filter(a => a.id !== auction.id));
                alert("Subasta eliminada definitivamente.");
            } else {
                // Soft cancel if bids exist (safety feature, though button should be disabled)
                const { error } = await supabase.from("auctions").update({ status: 'cancelled' }).eq("id", auction.id);
                if (error) throw error;
                setAuctions(prev => prev.map(a => a.id === auction.id ? { ...a, status: 'cancelled' } : a));
                alert("Subasta cancelada.");
            }
        } catch (error) {
            console.error("Error cancelando subasta:", error);
            alert("Error al intentar borrar la subasta.");
        }
    };

    const handleClaimBack = async (id: number) => {
        alert("En el entorno de producción, esta acción llama al SDK de TrustlessWork para retirar/devolver los activos retenidos.");
        const { error } = await supabase.from("auctions").update({ status: 'finished' }).eq("id", id);
        if (!error) {
            setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: 'finished' } : a));
            alert("Activos reclamados exitosamente.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Filtros y Controles Principales */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 flex-1 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-2 mr-2 shrink-0">
                        <h1 className="text-2xl font-bold tracking-tight text-white m-0">Marketplace</h1>
                    </div>

                    <div className="relative flex-1 w-full min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar en el marketplace..."
                            className="pl-11 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent-teal transition-colors w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="pl-4 pr-10 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent-teal appearance-none cursor-pointer w-full whitespace-nowrap text-white h-full inline-block"
                            >
                                <option value="time-asc">⌚ Terminan Pronto</option>
                                <option value="popularity">🔥 Más Populares</option>
                                <option value="date-desc">✨ Recientes</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <div className="relative shrink-0">
                            <select
                                value={conditionFilter}
                                onChange={e => setConditionFilter(e.target.value)}
                                className="pl-4 pr-10 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent-teal appearance-none cursor-pointer text-white h-full inline-block"
                            >
                                <option value="ambas">Ambas Cond.</option>
                                <option value="nuevo">Nuevos</option>
                                <option value="usado">Usados</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <label className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 cursor-pointer hover:text-white transition-colors bg-[#0a0a0a] border border-white/10 px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap shrink-0 h-full">
                            <input
                                type="checkbox"
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded border-white/10 bg-black text-accent-teal focus:ring-accent-teal focus:ring-offset-black accent-accent-teal cursor-pointer"
                                checked={hideFinished}
                                onChange={(e) => setHideFinished(e.target.checked)}
                            />
                            Ocultar finalizadas
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-start xl:justify-end">
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-accent-teal hover:bg-accent-teal/10 border border-white/10 rounded-xl transition-colors shrink-0"
                        title="Acerca del Marketplace"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex justify-center items-center gap-1.5 px-3 sm:px-4 py-2 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 text-black" />
                        <span className="hidden sm:inline">Crear Subasta</span>
                        <span className="sm:hidden">Crear</span>
                    </button>
                </div>
            </div>
            {displayedAuctions.length === 0 ? (
                <div className="text-center py-20 border border-white/5 border-dashed rounded-2xl bg-[#0a0a0a]">
                    <Search className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No hay subastas</h3>
                    <p className="text-neutral-500 text-sm">No encontramos artículos para tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedAuctions.map((item) => (
                        <AuctionCard
                            key={item.id}
                            item={item}
                            bids={bids}
                            setBids={setBids}
                            handleBid={handleBid}
                            loadingIds={loadingIds}
                            currentAddress={address}
                            onCancel={() => handleCancelAuction(item)}
                            onClaim={() => handleClaimBack(item.id)}
                        />
                    ))}
                </div>
            )
            }

            <CreateAuctionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchAuctions}
            />

            {/* Info Modal */}
            {
                isInfoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-full h-32 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                            <div className="flex justify-between items-center p-6 border-b border-white/5 relative z-10">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Gavel className="w-5 h-5 text-accent-teal" /> Marketplace ReWork
                                </h2>
                                <button onClick={() => setIsInfoModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 relative z-10">
                                <p className="text-neutral-300 leading-relaxed mb-6">
                                    Este es un mercado Peer-to-Peer interno. Todas las operaciones publicadas aquí están protegidas por Smart Contracts interactuando sobre la blockchain de Stellar.
                                </p>

                                <div className="bg-black/50 border border-accent-teal/20 rounded-xl p-4 mb-6">
                                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-accent-teal" /> Escrow Seguro
                                    </h3>
                                    <p className="text-sm text-neutral-400">
                                        Tus fondos permanecen en un contrato cripto seguro hasta que se valida el intercambio, garantizando confianza sin necesidad de intermediarios humanos.
                                    </p>
                                </div>
                                <a
                                    href="https://docs.trustlesswork.com/trustless-work/es"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex justify-center items-center px-4 py-3 bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 rounded-xl text-accent-teal font-bold transition-colors"
                                >
                                    Leer Documentación Oficial
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

// Subcomponent para manejar la tarjeta y el countdown local
function AuctionCard({ item, bids, setBids, handleBid, loadingIds, currentAddress, onCancel, onClaim }: any) {
    const { str: timeLeftStr, isEnded } = useCountdown(item.end_time);

    const isOwner = currentAddress === item.seller;
    const isFinished = item.status === 'finished' || isEnded;
    const isCancelled = item.status === 'cancelled';
    const currency = item.currency || 'USDC';

    useEffect(() => {
        // Auto-actualizar BD si el front detecta fin de tiempo
        if (isEnded && item.status === 'active') {
            supabase.from('auctions').update({ status: 'finished' }).eq('id', item.id).then();
        }
    }, [isEnded, item.status, item.id]);

    return (
        <div className={`bg-[#0a0a0a] rounded-2xl border ${isFinished || isCancelled ? 'border-neutral-800 opacity-70' : 'border-white/5 hover:border-accent-teal/30'} overflow-hidden group transition-all flex flex-col shadow-lg`}>
            <div className={`h-48 ${isFinished || isCancelled ? 'bg-neutral-900/50' : 'bg-neutral-900'} border-b border-white/5 flex items-center relative justify-center text-7xl flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500`}>
                {item.image.length < 5 ? item.image : (
                    <img src={item.image} alt="Auction Image" className="w-full h-full object-cover" />
                )}

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <div className="flex-1" />
                    {isCancelled ? (
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <XCircle className="w-3.5 h-3.5" /> Cancelado
                        </div>
                    ) : isFinished ? (
                        <div className="bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                            Finalizado
                        </div>
                    ) : item.end_time ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                                <Clock className="w-3.5 h-3.5" /> {timeLeftStr}
                            </div>
                            <div className="bg-white/10 text-white border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md backdrop-blur-md">
                                {(item.condition || "nuevo")}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent-teal transition-colors">{item.title}</h3>
                </div>
                <div className="text-xs text-neutral-500 mb-3 flex justify-between items-center bg-white/5 py-1.5 px-2.5 rounded-lg border border-white/5">
                    <span className="truncate mr-2 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-accent-teal shrink-0" />
                        {truncateAddress(item.seller)}
                    </span>
                    <span className="text-neutral-400 font-medium font-mono whitespace-nowrap bg-black px-2 py-0.5 rounded-md border border-white/5">{item.bid_count} pujas</span>
                </div>

                <div className="text-sm text-neutral-400 font-medium mb-4 flex items-center justify-between">
                    <span>Precio Base</span>
                    <span className="text-white font-mono">{item.base_price} {currency}</span>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end bg-[#050505] p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">{item.is_direct_buy ? 'Precio Fijo' : 'Ganador Actual'}</span>
                            {item.current_winner_address ? (
                                <UserBadge address={item.current_winner_address} />
                            ) : (
                                <span className="text-xs text-neutral-600 font-mono mt-1">Nadie aún</span>
                            )}
                        </div>
                        <span className={`text-xl font-mono font-bold tracking-tight ${isFinished ? 'text-neutral-400' : 'text-accent-teal'}`}>
                            {item.current_bid.toLocaleString()} {currency}
                        </span>
                    </div>

                    {/* VISTA PARA COMPRADORES */}
                    {!isFinished && !isCancelled && !isOwner && !item.is_direct_buy && (() => {
                        const minBid = Math.max(item.current_bid + 1, item.base_price);
                        const currentVal = bids[item.id] !== undefined && bids[item.id] !== ""
                            ? Number(bids[item.id])
                            : minBid;

                        const handleStep = (step: number) => {
                            let nextVal = currentVal + step;
                            if (nextVal < minBid) nextVal = minBid;
                            setBids({ ...bids, [item.id]: nextVal.toString() });
                        };

                        return (
                            <div className="flex gap-2.5 pt-1">
                                <div className="flex flex-1 bg-black border border-white/10 rounded-xl overflow-hidden focus-within:border-accent-teal transition-colors">
                                    <button
                                        onClick={() => handleStep(-1)}
                                        disabled={currentVal <= minBid || loadingIds[item.id]}
                                        className="px-4 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors border-r border-white/10 text-xl flex items-center justify-center"
                                        style={{ paddingBottom: '2px' }}
                                    >-</button>
                                    <div className="flex-1 relative flex items-center justify-center">
                                        <span className="text-neutral-500 text-sm font-bold mr-1">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-center text-sm font-mono focus:outline-none transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white"
                                            value={bids[item.id] !== undefined ? bids[item.id] : minBid}
                                            onChange={(e) => setBids({ ...bids, [item.id]: e.target.value })}
                                            onBlur={() => {
                                                if (Number(bids[item.id]) < minBid) setBids({ ...bids, [item.id]: minBid.toString() });
                                            }}
                                            disabled={loadingIds[item.id]}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleStep(1)}
                                        disabled={loadingIds[item.id]}
                                        className="px-4 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors border-l border-white/10 text-xl flex items-center justify-center"
                                        style={{ paddingBottom: '2px' }}
                                    >+</button>
                                </div>
                                <button
                                    onClick={() => handleBid(item)}
                                    disabled={loadingIds[item.id] || (bids[item.id] !== undefined && Number(bids[item.id]) < minBid)}
                                    className="bg-accent-teal/10 hover:bg-accent-teal text-accent-teal hover:text-black px-4 py-2 rounded-xl transition-all font-bold shrink-0 disabled:opacity-50 disabled:hover:bg-accent-teal/10 disabled:hover:text-accent-teal flex items-center gap-1.5"
                                    title="Realizar Oferta Mediante Escrow"
                                >
                                    {loadingIds[item.id] ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Puja
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })()}

                    {/* VISTA PARA OWNER - Cancelar Subasta (Solo si no hay pujas) */}
                    {isOwner && !isFinished && !isCancelled && (
                        <div className="pt-1">
                            <button
                                onClick={onCancel}
                                disabled={item.bid_count > 0}
                                className="w-full py-2.5 bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:hover:bg-red-500/5 disabled:hover:text-red-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                {item.bid_count > 0 ? "Bloqueado (Pujas activas)" : "Eliminar Subasta"}
                            </button>
                        </div>
                    )}

                    {/* VISTA PARA OWNER - Retirar activos si no se vendió */}
                    {(isFinished || isCancelled) && item.bid_count === 0 && isOwner && (
                        <div className="pt-1">
                            <button onClick={onClaim} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 hover:bg-white hover:text-black text-white rounded-xl text-sm font-bold transition-all shadow-lg">
                                <HandCoins className="w-4 h-4" /> Reclamar Activo Puesto
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
