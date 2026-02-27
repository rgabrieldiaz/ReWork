"use client";

import { useState, useEffect } from "react";
import { Gavel, Clock, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { useFreighter } from "@/hooks/useFreighter";
import { signTransaction, getNetworkDetails } from "@stellar/freighter-api";

// Dummy addresses for demo purposes
const DUMMY_SELLER_ADDRESS = "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE";
const DUMMY_PLATFORM_ADDRESS = "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H";

// Testnet XLM contract
const XLM_TESTNET_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

interface Auction {
    id: number;
    title: string;
    seller: string;
    current_bid: number;
    current_winner_address: string | null;
    escrow_contract_id: string | null;
    end_time: string;
    image: string;
    is_direct_buy: boolean;
}

export default function MarketplacePage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [bids, setBids] = useState<Record<number, string>>({});
    const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
    const { connected, address } = useFreighter();


    useEffect(() => {
        const fetchAuctions = async () => {
            const { data, error } = await supabase.from("auctions").select("*").order("id", { ascending: true });
            if (data) setAuctions(data);
        };
        fetchAuctions();
    }, []);

    const handleBid = async (auction: Auction) => {
        if (!connected || !address) {
            alert("Por favor, conecta tu billetera Freighter primero.");
            return;
        }

        const bidAmountStr = bids[auction.id];
        if (!bidAmountStr) return;

        const bidAmount = Number(bidAmountStr);
        if (bidAmount <= auction.current_bid) {
            alert("Tu oferta debe ser mayor a la actual.");
            return;
        }

        setLoadingIds(prev => ({ ...prev, [auction.id]: true }));

        try {
            // 1. Prepare Payload for Trustless Work Escrow
            const payload: any = {
                signer: address,
                engagementId: `rework-auction-${auction.id}-${Date.now()}`,
                title: `Puja para ${auction.title}`,
                description: `Bloqueando fondos para puja en el Marketplace por ${bidAmount} XLM.`,
                roles: {
                    approver: address,
                    serviceProvider: DUMMY_SELLER_ADDRESS,
                    platformAddress: DUMMY_PLATFORM_ADDRESS,
                    releaseSigner: address,
                    disputeResolver: DUMMY_PLATFORM_ADDRESS,
                    receiver: DUMMY_SELLER_ADDRESS,
                },
                amount: bidAmount,
                platformFee: 1, // 1% platform fee
                milestones: [
                    { description: "Recepción del artículo por el comprador" }
                ],
                trustline: {
                    address: XLM_TESTNET_CONTRACT,
                    symbol: "XLM"
                }
            };

            // 2. Get unsigned transaction XDR from Trustless Work via Proxy
            const deployRes = await fetch('/api/trustless-work/deploy-escrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const deployData = await deployRes.json();

            if (!deployRes.ok) {
                throw new Error(deployData.error || deployData.message || "Error al crear el Escrow en el servidor.");
            }

            const { unsignedTransaction } = deployData;
            if (!unsignedTransaction) throw new Error("No se pudo obtener el XDR de la transacción desde Trustless Work.");

            // 3. Sign Transaction via Freighter
            const net = await getNetworkDetails();
            const signedResult = await signTransaction(unsignedTransaction, {
                networkPassphrase: net.networkPassphrase || "Test SDF Network ; September 2015"
            });
            // We use the signed XDR if the SDK returns it as an object
            const signedXdr = typeof signedResult === "string" ? signedResult : (signedResult as any)?.signedTxXdr || (signedResult as any)?.signedXdr || (signedResult as any)?.xdr || signedResult;

            if (!signedXdr) throw new Error("Firma cancelada o fallida");

            // 4. Proxied Submit to Trustless Work
            const response = await fetch('/api/trustless-work/send-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xdr: signedXdr })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || "Error al enviar transacción");
            }

            const newEscrowId = result.contractId || result.id || "escrow-generado";

            // 5. Update Supabase
            const { error: sbError } = await supabase
                .from("auctions")
                .update({
                    current_bid: bidAmount,
                    current_winner_address: address,
                    escrow_contract_id: newEscrowId
                })
                .eq("id", auction.id);

            if (sbError) throw sbError;

            // Update local state
            setAuctions(prev => prev.map(a => a.id === auction.id ? { ...a, current_bid: bidAmount, current_winner_address: address, escrow_contract_id: newEscrowId } : a));
            setBids(prev => ({ ...prev, [auction.id]: "" }));
            alert(`¡Puja exitosa! Se ha creado un contrato Escrow (ID: ${newEscrowId}) reteniendo tus ${bidAmount} XLM.`);

        } catch (error: any) {
            console.error(error);
            alert(`Error creando oferta: ${error.message || "Problema desconocido"}`);
        } finally {
            setLoadingIds(prev => ({ ...prev, [auction.id]: false }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace</h1>
                    <p className="text-neutral-400">Subastas en vivo y canjes directos con XLM usando Escrows Trustless Work.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            className="pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#13ec5b] transition-colors w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {auctions.map((item) => (
                    <div key={item.id} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden group hover:border-[#13ec5b]/30 transition-all flex flex-col">
                        <div className="h-48 bg-neutral-900 border-b border-white/5 flex items-center justify-center text-7xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {item.image}
                        </div>

                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                                {!item.is_direct_buy && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md">
                                        <Clock className="w-3.5 h-3.5" />
                                        {item.end_time}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 mb-6">Ofrecido por {item.seller}</p>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-neutral-400">{item.is_direct_buy ? 'Precio' : 'Ganador Actual'}</span>
                                    <span className="text-2xl font-mono font-bold text-[#13ec5b]">{item.current_bid.toLocaleString()} XLM</span>
                                </div>

                                {item.current_winner_address && (
                                    <p className="text-xs text-neutral-500 mb-2 truncate">Por: {item.current_winner_address}</p>
                                )}

                                {!item.is_direct_buy ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder={`> ${item.current_bid} XLM`}
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#13ec5b]"
                                            value={bids[item.id] || ""}
                                            onChange={(e) => setBids({ ...bids, [item.id]: e.target.value })}
                                            disabled={loadingIds[item.id]}
                                        />
                                        <button
                                            onClick={() => handleBid(item)}
                                            disabled={loadingIds[item.id] || !bids[item.id]}
                                            className="bg-white/10 hover:bg-[#13ec5b] hover:text-black text-white p-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white"
                                            title="Realizar Oferta Mediante Escrow"
                                        >
                                            {loadingIds[item.id] ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Gavel className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <button className="w-full py-2.5 bg-[#13ec5b] hover:bg-[#11cc4e] text-black font-semibold rounded-xl transition-colors text-sm">
                                        Comprar Ahora
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
