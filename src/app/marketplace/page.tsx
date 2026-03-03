"use client";

import { useState, useEffect, useMemo } from "react";
import { Gavel, Clock, Search, ShieldCheck, Plus, XCircle, HandCoins, ChevronDown, Info, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { signTransaction, getNetworkDetails } from "@stellar/freighter-api";
import { CreateAuctionModal } from "@/components/CreateAuctionModal";
import { UserBadge } from "@/components/UserBadge";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";

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
    const { t } = useSettings();

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'direct' | 'history'>('all');
    const [activeSort, setActiveSort] = useState<'recent' | 'endingSoon'>('recent');
    const [activeFilter, setActiveFilter] = useState<'none' | 'new' | 'used' | 'myBids'>('none');
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

        const now = new Date().getTime();

        if (activeTab === 'history') {
            // For History tab, ONLY show finished/cancelled/expired items
            filtered = filtered.filter(a => {
                if (a.status === 'finished' || a.status === 'cancelled') return true;
                if (a.end_time && new Date(a.end_time).getTime() <= now) return true;
                return false;
            });
        } else {
            // Normal tabs filtering
            if (activeTab === 'auction') {
                filtered = filtered.filter(a => !a.is_direct_buy);
            } else if (activeTab === 'direct') {
                filtered = filtered.filter(a => a.is_direct_buy);
            }

            // Implicit/Explicit hideFinished logic for active tabs
            if (hideFinished) {
                filtered = filtered.filter(a => {
                    if (a.status === 'finished' || a.status === 'cancelled') return false;
                    if (a.end_time && new Date(a.end_time).getTime() <= now) return false;
                    return true;
                });
            }
        }

        filtered.sort((a, b) => {
            if (activeSort === 'endingSoon') {
                if (!a.end_time) return 1;
                if (!b.end_time) return -1;
                return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
            }
            if (activeSort === 'recent') {
                // Assuming ID represents creation order
                return b.id - a.id;
            }
            return 0;
        });

        return filtered;
    }, [auctions, debouncedSearchQuery, activeTab, activeFilter, activeSort, address, hideFinished]);

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
            alert(t.alerts.bidSuccess);
            await addPoints(10, t.alerts.newBidMilestone);
        } catch (error: any) {
            console.error(error);
            alert(`${t.alerts.processError} ${error.message}`);
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
            {/* Cabecera, Buscador y Botón Crear */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-[60%]">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground m-0 shrink-0">{t.marketplace.title}</h1>
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.marketplace.searchPlaceholder}
                            className="pl-11 pr-4 py-3 bg-card border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent-teal transition-colors w-full shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="w-11 h-11 flex items-center justify-center text-muted hover:text-accent-teal hover:bg-accent-teal/10 border border-border-subtle rounded-xl transition-colors shrink-0"
                        title={t.marketplace.aboutTitle}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex justify-center items-center gap-2 px-5 py-3 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 text-black" />
                        <span>{t.marketplace.createSell}</span>
                    </button>
                </div>
            </div>

            {/* Tabs de Navegación */}
            <div className="flex items-center gap-6 border-b border-border-subtle mt-2">
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm ${activeTab === 'all' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('all')}
                >
                    {t.marketplace.tabAll}
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm ${activeTab === 'auction' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('auction')}
                >
                    {t.marketplace.tabAuctions}
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm ${activeTab === 'direct' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('direct')}
                >
                    {t.marketplace.tabDirect}
                </button>
                <div className="flex-1" />
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm ${activeTab === 'history' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('history')}
                >
                    {t.marketplace.tabHistory}
                </button>
            </div>

            {/* Sistema de Pills para Filtros y Orden */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 mb-4 justify-between scrollbar-hide">
                <div className="flex items-center gap-2">
                    {/* Sort Pills (Mutually Exclusive) */}
                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 ${activeSort === 'recent' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                        onClick={() => setActiveSort('recent')}
                    >
                        {t.marketplace.pillRecent}
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-2 whitespace-nowrap cursor-pointer hover:scale-105 ${activeSort === 'endingSoon' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                        onClick={() => setActiveSort('endingSoon')}
                    >
                        {t.marketplace.pillEndingSoon}
                    </button>

                    {/* Separator */}
                    <div className="w-px h-6 bg-border mx-2 shrink-0"></div>

                    {/* Filter Pills (Togglable) */}
                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 ${activeFilter === 'new' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                        onClick={() => setActiveFilter(activeFilter === 'new' ? 'none' : 'new')}
                    >
                        {t.marketplace.pillNew}
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-2 whitespace-nowrap cursor-pointer hover:scale-105 ${activeFilter === 'used' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                        onClick={() => setActiveFilter(activeFilter === 'used' ? 'none' : 'used')}
                    >
                        {t.marketplace.pillUsed}
                    </button>

                    <div className="w-px h-6 bg-border mx-2 shrink-0 hidden sm:block"></div>

                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ml-1 whitespace-nowrap cursor-pointer hover:scale-105 ${activeFilter === 'myBids' ? 'bg-accent-teal text-black border border-accent-teal shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                        onClick={() => setActiveFilter(activeFilter === 'myBids' ? 'none' : 'myBids')}
                    >
                        {t.marketplace.pillMyBids}
                    </button>
                </div>

                {activeTab !== 'history' && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted hover:text-foreground transition-colors shrink-0">
                        <input
                            type="checkbox"
                            checked={hideFinished}
                            onChange={(e) => setHideFinished(e.target.checked)}
                            className="w-4 h-4 rounded border-border-subtle text-accent-teal focus:ring-accent-teal bg-card"
                        />
                        {t.marketplace.hideFinished}
                    </label>
                )}
            </div>
            {displayedAuctions.length === 0 ? (
                <div className="text-center py-20 border border-border-subtle border-dashed rounded-2xl bg-card">
                    <Search className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-1">{t.marketplace.noAuctionsTitle}</h3>
                    <p className="text-muted text-sm">{t.marketplace.noAuctionsSelected}</p>
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
                            t={t}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-full h-32 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                            <div className="flex justify-between items-center p-6 border-b border-border-subtle relative z-10">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Gavel className="w-5 h-5 text-accent-teal" /> {t.marketplace.aboutTitle}
                                </h2>
                                <button onClick={() => setIsInfoModalOpen(false)} className="text-muted hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 relative z-10">
                                <p className="text-muted leading-relaxed mb-6">
                                    {t.marketplace.aboutDescription}
                                </p>

                                <div className="bg-foreground/5 border border-accent-teal/20 rounded-xl p-4 mb-6">
                                    <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-accent-teal" /> {t.marketplace.secureEscrow}
                                    </h3>
                                    <p className="text-sm text-muted">
                                        {t.marketplace.secureEscrowDesc}
                                    </p>
                                </div>
                                <a
                                    href="https://docs.trustlesswork.com/trustless-work/es"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex justify-center items-center px-4 py-3 bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 rounded-xl text-accent-teal font-bold transition-colors"
                                >
                                    {t.marketplace.readDocs}
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
function AuctionCard({ item, bids, setBids, handleBid, loadingIds, currentAddress, onCancel, onClaim, t }: any) {
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
        <div className={`bg-card rounded-2xl border ${isFinished || isCancelled ? 'border-neutral-800 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'border-border-subtle hover:border-accent-teal/30'} overflow-hidden group transition-all flex flex-col shadow-lg`}>
            <div className={`h-48 ${isFinished || isCancelled ? 'bg-neutral-900/50' : 'bg-neutral-900'} border-b border-border-subtle flex items-center relative justify-center text-7xl flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500`}>
                {item.image.length < 5 ? item.image : (
                    <img src={item.image} alt="Auction Image" className="w-full h-full object-cover" />
                )}

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <div className="flex-1" />
                    {isCancelled ? (
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <XCircle className="w-3.5 h-3.5" /> {t.marketplace.cancelled}
                        </div>
                    ) : isFinished ? (
                        <div className="bg-neutral-500/10 text-muted border border-neutral-500/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                            {t.marketplace.finished}
                        </div>
                    ) : item.end_time ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="bg-accent-teal/10 text-accent-teal border border-accent-teal/20 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                                <Clock className="w-3.5 h-3.5" /> {timeLeftStr}
                            </div>
                            <div className="bg-foreground/10 text-foreground border border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md backdrop-blur-md">
                                {(item.condition === 'nuevo' ? t.marketplace.new : item.condition === 'usado' ? t.marketplace.used : item.condition || t.marketplace.new)}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent-teal transition-colors">{item.title}</h3>
                </div>
                <div className="text-xs text-muted mb-3 flex justify-between items-center bg-foreground/5 py-1.5 px-2.5 rounded-lg border border-border-subtle">
                    <span className="truncate mr-2 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-accent-teal shrink-0" />
                        {truncateAddress(item.seller)}
                    </span>
                    <span className="text-muted font-medium font-mono whitespace-nowrap bg-card px-2 py-0.5 rounded-md border border-border-subtle">{item.bid_count} {t.marketplace.bidsCount}</span>
                </div>

                <div className="text-sm text-muted font-medium mb-4 flex items-center justify-between">
                    <span>{t.marketplace.basePrice}</span>
                    <span className="text-foreground font-mono">{item.base_price} {currency}</span>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end bg-[#050505] p-3 rounded-xl border border-border-subtle">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">{item.is_direct_buy ? t.marketplace.fixedPrice : t.marketplace.currentWinner}</span>
                            {item.current_winner_address ? (
                                <UserBadge address={item.current_winner_address} />
                            ) : (
                                <span className="text-xs text-neutral-600 font-mono mt-1">{t.marketplace.noOneYet}</span>
                            )}
                        </div>
                        <span className={`text-xl font-mono font-bold tracking-tight ${isFinished ? 'text-muted' : 'text-accent-teal'}`}>
                            {item.current_bid.toLocaleString()} {currency}
                        </span>
                    </div>

                    {/* STATUS BADGES FOR FINISHED ITEMS */}
                    {isFinished && !isCancelled && (
                        <div className="flex flex-col gap-2 pt-1">
                            {item.current_winner_address ? (
                                <>
                                    <div className="w-full bg-accent-teal/10 text-accent-teal border border-accent-teal/20 px-3 py-2 text-xs font-bold rounded-xl flex items-center justify-between">
                                        <span>{t.marketplace.soldTo}</span>
                                        <span className="font-mono">{truncateAddress(item.current_winner_address)}</span>
                                    </div>
                                    {/* Trustless Escrow Badge */}
                                    <div className="w-full bg-[#050505] text-green-500 border border-green-500/20 px-3 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> {t.marketplace.paymentVerifiedOnChain}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full bg-foreground/5 text-muted border border-border-subtle px-3 py-2 text-xs font-medium rounded-xl flex items-center justify-center">
                                    {t.marketplace.finishedNoOffers}
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA PARA COMPRADORES ACTIVOS */}
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
                                <div className="flex flex-1 bg-card border border-border-subtle rounded-xl overflow-hidden focus-within:border-accent-teal transition-colors">
                                    <button
                                        onClick={() => handleStep(-1)}
                                        disabled={currentVal <= minBid || loadingIds[item.id]}
                                        className="px-4 text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 transition-colors border-r border-border-subtle text-xl flex items-center justify-center"
                                        style={{ paddingBottom: '2px' }}
                                    >-</button>
                                    <div className="flex-1 relative flex items-center justify-center">
                                        <span className="text-muted text-sm font-bold mr-1">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-center text-sm font-mono focus:outline-none transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground"
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
                                        className="px-4 text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 transition-colors border-l border-border-subtle text-xl flex items-center justify-center"
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
                                className="w-full py-2.5 bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-foreground disabled:opacity-40 disabled:hover:bg-red-500/5 disabled:hover:text-red-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                {item.bid_count > 0 ? t.marketplace.lockedBids : t.marketplace.deleteAuction}
                            </button>
                        </div>
                    )}

                    {/* VISTA PARA OWNER - Retirar activos si no se vendió */}
                    {(isFinished || isCancelled) && item.bid_count === 0 && isOwner && (
                        <div className="pt-1">
                            <button onClick={onClaim} className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground/5 border border-border-subtle hover:bg-foreground hover:text-black text-foreground rounded-xl text-sm font-bold transition-all shadow-lg">
                                <HandCoins className="w-4 h-4" /> {t.marketplace.claimAsset}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
