"use client";

import { useState, useEffect, useMemo } from "react";
import { Gavel, Clock, Search, ShieldCheck, Plus, XCircle, HandCoins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { signTransaction, getNetworkDetails } from "@stellar/freighter-api";
import { CreateAuctionModal } from "@/components/CreateAuctionModal";

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

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [sortBy, setSortBy] = useState("time-asc");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    }, [auctions, debouncedSearchQuery, sortBy]);

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
            // 1. Prepare Payload for Trustless Work Escrow
            const payload: any = {
                signer: address,
                engagementId: `rework-auction-${auction.id}-${Date.now()}`,
                title: `Puja para ${auction.title}`,
                description: `Bloqueando fondos para oferta de ${bidAmount} XLM en Marketplace ReWork.`,
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
                    symbol: "XLM"
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

        } catch (error: any) {
            console.error(error);
            alert(`Error creando oferta: ${error.message}`);
        } finally {
            setLoadingIds(prev => ({ ...prev, [auction.id]: false }));
        }
    };

    const handleCancelAuction = async (id: number) => {
        if (!confirm("¿Seguro que deseas cancelar esta subasta?")) return;
        const { error } = await supabase.from("auctions").update({ status: 'cancelled' }).eq("id", id);
        if (!error) {
            setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
        } else {
            alert("Error al cancelar la subasta.");
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

            {/* Header / Banner de Trustless Work */}
            <div className="bg-[#0a0a0a] border border-[#13ec5b]/20 p-6 sm:p-8 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_0_30px_rgba(19,236,91,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#13ec5b]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#13ec5b]/20 to-black border border-[#13ec5b]/30 text-[#13ec5b] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(19,236,91,0.2)]">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Marketplace de ReWork</h2>
                        <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-2xl">
                            Todas las operaciones están protegidas por Smart Contracts de Stellar. Tus fondos permanecen en un <strong className="text-neutral-200">escrow seguro</strong> hasta que se valida el intercambio, garantizando confianza sin intermediarios.
                        </p>
                    </div>
                </div>
                <div className="shrink-0 flex gap-3 relative z-10 w-full sm:w-auto">
                    <a href="https://docs.trustlesswork.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-6 py-3 bg-black border border-white/10 hover:border-[#13ec5b]/50 text-white rounded-xl transition-all font-medium text-center">
                        Docs de TW
                    </a>
                </div>
            </div>

            {/* Controles: Buscar, Filtrar, Crear */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b border-white/5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar en el marketplace..."
                            className="pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#13ec5b] transition-colors w-full sm:w-72"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#13ec5b] appearance-none"
                    >
                        <option value="time-asc">⌚ Terminan Pronto</option>
                        <option value="popularity">🔥 Más Populares (Progreso)</option>
                        <option value="date-desc">✨ Recientemente Añadidos</option>
                    </select>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex justify-center items-center gap-2 px-6 py-2.5 bg-[#13ec5b] hover:bg-[#11cc4e] text-black rounded-xl transition-all text-sm font-bold shadow-[0_0_20px_rgba(19,236,91,0.2)] w-full lg:w-auto"
                >
                    <Plus className="w-5 h-5 text-black" />
                    Crear Subasta
                </button>
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
                            onCancel={() => handleCancelAuction(item.id)}
                            onClaim={() => handleClaimBack(item.id)}
                        />
                    ))}
                </div>
            )}

            <CreateAuctionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchAuctions}
            />
        </div>
    );
}

// Subcomponent para manejar la tarjeta y el countdown local
function AuctionCard({ item, bids, setBids, handleBid, loadingIds, currentAddress, onCancel, onClaim }: any) {
    const { str: timeLeftStr, isEnded } = useCountdown(item.end_time);

    const isOwner = currentAddress === item.seller;
    const isFinished = item.status === 'finished' || isEnded;
    const isCancelled = item.status === 'cancelled';

    useEffect(() => {
        // Auto-actualizar BD si el front detecta fin de tiempo
        if (isEnded && item.status === 'active') {
            supabase.from('auctions').update({ status: 'finished' }).eq('id', item.id).then();
        }
    }, [isEnded, item.status, item.id]);

    return (
        <div className={`bg-[#0a0a0a] rounded-2xl border ${isFinished || isCancelled ? 'border-neutral-800 opacity-70' : 'border-white/5 hover:border-[#13ec5b]/30'} overflow-hidden group transition-all flex flex-col shadow-lg`}>
            <div className={`h-48 ${isFinished || isCancelled ? 'bg-neutral-900/50' : 'bg-neutral-900'} border-b border-white/5 flex items-center relative justify-center text-7xl flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500`}>
                {item.image.length < 5 ? item.image : (
                    <img src={item.image} alt="Auction Image" className="w-full h-full object-cover" />
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-sm">
                        <span className="text-xs font-bold text-white tracking-wide">Base: {item.base_price} XLM</span>
                    </div>
                    {isCancelled ? (
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <XCircle className="w-3.5 h-3.5" /> Cancelado
                        </div>
                    ) : isFinished ? (
                        <div className="bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                            Finalizado
                        </div>
                    ) : item.end_time ? (
                        <div className="bg-[#13ec5b]/10 text-[#13ec5b] border border-[#13ec5b]/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(19,236,91,0.1)]">
                            <Clock className="w-3.5 h-3.5" /> {timeLeftStr}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-[#13ec5b] transition-colors">{item.title}</h3>
                </div>
                <div className="text-xs text-neutral-500 mb-5 flex justify-between items-center bg-white/5 py-1.5 px-2.5 rounded-lg border border-white/5">
                    <span className="truncate mr-2 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-[#13ec5b] shrink-0" />
                        {truncateAddress(item.seller)}
                    </span>
                    <span className="text-neutral-400 font-medium font-mono whitespace-nowrap bg-black px-2 py-0.5 rounded-md border border-white/5">{item.bid_count} pujas</span>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end bg-[#050505] p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">{item.is_direct_buy ? 'Precio Fijo' : 'Ganador Actual'}</span>
                            {item.current_winner_address ? (
                                <span className="text-xs text-neutral-400 font-mono truncate max-w-[100px]">{truncateAddress(item.current_winner_address)}</span>
                            ) : (
                                <span className="text-xs text-neutral-600 font-mono">Nadie aún</span>
                            )}
                        </div>
                        <span className={`text-xl font-mono font-bold tracking-tight ${isFinished ? 'text-neutral-400' : 'text-[#13ec5b]'}`}>
                            {item.current_bid.toLocaleString()} XLM
                        </span>
                    </div>

                    {/* VISTA PARA COMPRADORES */}
                    {!isFinished && !isCancelled && !isOwner && !item.is_direct_buy && (
                        <div className="flex gap-2.5 pt-1">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">$</span>
                                <input
                                    type="number"
                                    placeholder={`${Math.max(item.current_bid + 1, item.base_price)} min.`}
                                    className="w-full bg-black border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#13ec5b] transition-colors"
                                    value={bids[item.id] || ""}
                                    onChange={(e) => setBids({ ...bids, [item.id]: e.target.value })}
                                    disabled={loadingIds[item.id]}
                                />
                            </div>
                            <button
                                onClick={() => handleBid(item)}
                                disabled={loadingIds[item.id] || !bids[item.id]}
                                className="bg-[#13ec5b]/10 hover:bg-[#13ec5b] text-[#13ec5b] hover:text-black px-4 py-2.5 rounded-xl transition-all font-bold shrink-0 disabled:opacity-50 disabled:hover:bg-[#13ec5b]/10 disabled:hover:text-[#13ec5b] flex items-center gap-1.5"
                                title="Realizar Oferta Mediante Escrow"
                            >
                                {loadingIds[item.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Gavel className="w-4 h-4" /> Puja
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* VISTA PARA OWNER - Cancelar Subasta (Solo si no hay pujas) */}
                    {isOwner && !isFinished && !isCancelled && (
                        <div className="pt-1">
                            <button
                                onClick={onCancel}
                                disabled={item.bid_count > 0}
                                className="w-full py-2.5 bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:hover:bg-red-500/5 disabled:hover:text-red-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                {item.bid_count > 0 ? "Bloqueado (Pujas activas)" : "Cancelar Subasta"}
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
