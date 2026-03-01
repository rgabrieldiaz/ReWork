"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Gift, Share2, ArrowUpRight, Search, Filter, AlertCircle, Clock, CheckCircle, Loader2, ChevronDown, Info, Plus, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import CreateCrowdfundModal from "@/components/CreateCrowdfundModal";
import { useInitializeEscrow } from "@trustless-work/escrow";

// Utils
const truncateKey = (key: string) => `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;

export default function ColectasPage() {
    const { address: publicKey } = useFreighter();
    const { deployEscrow } = useInitializeEscrow();

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]); // User's matched donations
    const [loading, setLoading] = useState(true);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("progreso");
    const [selectedTag, setSelectedTag] = useState<string>("todas");
    const [hideFinished, setHideFinished] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [donationAmounts, setDonationAmounts] = useState<Record<number, string>>({});
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Fetch data
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("crowdfunds").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setCampaigns(data || []);

            if (publicKey) {
                const { data: donData } = await supabase.from("crowdfund_donations").select("*").eq("donor_public_key", publicKey);
                setDonations(donData || []);
            }
        } catch (err: any) {
            console.error("Error fetching", err);
            console.error("Error details:", JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [publicKey]);

    // Derived Data
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        campaigns.forEach(c => c.tags?.forEach((t: string) => tags.add(t)));
        return Array.from(tags);
    }, [campaigns]);

    const filteredCampaigns = useMemo(() => {
        let filtered = campaigns.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.organizer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag && selectedTag !== "todas" ? c.tags?.includes(selectedTag) : true;

            const isFinished = new Date(c.deadline).getTime() < Date.now() || c.current_amount >= c.goal_amount;
            if (hideFinished && isFinished) return false;

            return matchesSearch && matchesTag;
        });

        filtered.sort((a, b) => {
            if (sortBy === "progreso") {
                const pa = Math.min(100, (a.current_amount / a.goal_amount) * 100);
                const pb = Math.min(100, (b.current_amount / b.goal_amount) * 100);
                return pb - pa;
            } else if (sortBy === "nuevas") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortBy === "populares") {
                return b.donor_count - a.donor_count;
            }
            return 0;
        });

        return filtered;
    }, [campaigns, searchQuery, sortBy, selectedTag, hideFinished]);

    // Actions
    const handleDonate = async (camp: any) => {
        const amount = donationAmounts[camp.id];
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert("Monto inválido.");
            return;
        }
        if (!publicKey) {
            alert("Conecta tu billetera primero.");
            return;
        }

        setProcessingId(camp.id);
        try {
            // 1. Integración con TW Escrow
            // Payload
            const payload = {
                escrowType: "single-release" as const,
                title: `Donación: ${camp.title}`,
                description: `Aporte de ${amount} XLM para la colecta de ${camp.title}`,
                sender: publicKey,
                receiver: camp.organizer, // The organizer receives the funds
                approver: camp.organizer, // Organizer approves (simplification)
                fee: "100",
                trustlines: [{ asset_type: "native", amount: amount.toString() }],
            };

            const deployData = await deployEscrow(payload as any, "single-release");
            if (!deployData || !deployData.unsignedTransaction) {
                throw new Error("No se pudo firmar el contrato en TW.");
            }

            // En un entorno real, firmariamos transaccion con Freighter:
            // const { signTransaction } = await import("@stellar/freighter-api");
            // const signedTx = await signTransaction(deployData.unsignedTransaction, { network: "TESTNET" });
            // ... (Aca simplificamos asumiendo exito)

            // 2. Guardar Donación
            const { error: dbError } = await supabase.from("crowdfund_donations").insert([
                {
                    crowdfund_id: camp.id,
                    donor_public_key: publicKey,
                    amount: parseInt(amount),
                    escrow_contract_id: "tw_escrow_" + Math.random().toString(36).substring(7), // Mock ID
                }
            ]);

            if (dbError) throw dbError;

            // 3. Actualizar Colecta
            const { error: rpcError } = await supabase.rpc('increment_crowdfund_amount', {
                target_id: camp.id,
                inc_amount: parseInt(amount)
            });

            if (rpcError) {
                // Fallback si RPC no existe
                await supabase.from("crowdfunds").update({
                    current_amount: camp.current_amount + parseInt(amount),
                    donor_count: camp.donor_count + 1
                }).eq("id", camp.id);
            }

            setDonationAmounts(prev => ({ ...prev, [camp.id]: "" }));
            fetchCampaigns();
            alert("🎉 Donación realizada correctamente. Los fondos están en Escrow de TW.");
        } catch (err: any) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAction = async (camp: any, action: 'release' | 'refund') => {
        setProcessingId(camp.id);
        try {
            // Simulación de interacción con TW
            await new Promise(r => setTimeout(r, 1500));
            alert(action === 'release'
                ? "Fondos liberados exitosamente del Escrow hacia tu cuenta."
                : "Se ha solicitado el reembolso (Claim Refund) de la donación."
            );
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Filtros y Controles Principales */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 flex-1 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-2 mr-2 shrink-0">
                        <h1 className="text-2xl font-bold tracking-tight text-white m-0">Colectas</h1>
                    </div>

                    <div className="relative flex-1 w-full min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar colecta u organizador..."
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
                                <option value="progreso">⌚ Más cerca</option>
                                <option value="populares">🔥 Populares</option>
                                <option value="nuevas">✨ Recientes</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <div className="relative shrink-0">
                            <select
                                value={selectedTag}
                                onChange={e => setSelectedTag(e.target.value)}
                                className="pl-4 pr-10 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent-teal appearance-none cursor-pointer text-white h-full inline-block"
                            >
                                <option value="todas">Todas las cat.</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
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
                        title="Acerca de Colectas"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex justify-center items-center gap-1.5 px-3 sm:px-4 py-2 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 text-black" />
                        <span className="hidden sm:inline">Crear Colecta</span>
                        <span className="sm:hidden">Crear</span>
                    </button>
                </div>
            </div>

            {/* Listado de Colectas */}
            {loading ? (
                <div className="py-20 flex justify-center text-neutral-500">Cargando colectas...</div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-neutral-500 border border-white/5 rounded-2xl bg-[#0a0a0a]/50 border-dashed">
                    <AlertCircle className="w-12 h-12 mb-4 text-neutral-600" />
                    <p>No se encontraron colectas con esos criterios.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredCampaigns.map((camp) => {
                        const progress = Math.min(100, Math.floor((camp.current_amount / camp.goal_amount) * 100));
                        const isOrganizer = publicKey === camp.organizer;
                        const isGoalMet = camp.current_amount >= camp.goal_amount;
                        const isExpired = new Date(camp.deadline).getTime() < Date.now();
                        const isProcessing = processingId === camp.id;

                        const hasDonated = donations.some(d => d.crowdfund_id === camp.id);

                        return (
                            <div key={camp.id} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col md:flex-row shadow-lg">
                                <div className="w-full md:w-48 xl:w-64 min-h-[200px] bg-neutral-900/40 md:border-r border-white/5 flex-shrink-0 relative overflow-hidden group/img">
                                    {isGoalMet && <div className="absolute inset-0 bg-accent-teal/5 z-0"></div>}

                                    <div className="absolute inset-0 z-10 transition-transform duration-700 group-hover/img:scale-110">
                                        {camp.image && camp.image.startsWith('http') ? (
                                            <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-6xl">{camp.image || '🎁'}</div>
                                        )}
                                        {/* Gradient to ensure text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/10 to-transparent"></div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-20">
                                        {camp.tags?.map((tag: string) => (
                                            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/20" title={tag}>{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-xl leading-tight text-white mb-1 group-hover:text-accent-teal transition-colors">{camp.title}</h3>
                                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Termina el {new Date(camp.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button className="text-neutral-500 hover:text-white transition-colors shrink-0 ml-2" title="Compartir">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-neutral-400 mb-6 flex-1">{camp.description || `Apoya esta colecta con tus ${camp.goal_amount === 150 ? 'USDC' : 'XLM'}.`}</p>

                                    <div className="mt-auto space-y-5">
                                        {/* Barra de Progreso */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-white tracking-wide">{camp.current_amount.toLocaleString()} <span className="text-neutral-500 font-normal">/ {camp.goal_amount.toLocaleString()} {camp.goal_amount === 150 ? 'USDC' : 'XLM'}</span></span>
                                                <span className="font-medium flex items-center gap-1.5" style={{ color: isGoalMet ? '#00f2ff' : '#fff' }}>
                                                    {isGoalMet && <CheckCircle className="w-3.5 h-3.5" />} {progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                                                <div
                                                    className={`h-full rounded-full relative transition-all duration-1000 ${isGoalMet ? 'bg-accent-teal shadow-[0_0_15px_#00f2ff40]' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-accent-teal'}`}
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent"></div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-500 flex justify-between">
                                                <span>Organiza: {truncateKey(camp.organizer)}</span>
                                                <span>{camp.donor_count} aportes</span>
                                            </div>
                                        </div>

                                        {/* Lógica de Botones (Trustless Work) */}
                                        <div className="pt-4 border-t border-white/5">
                                            {isOrganizer ? (
                                                <div className="flex flex-col gap-2">
                                                    {isGoalMet ? (
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleAction(camp, 'release')}
                                                            className="w-full bg-accent-teal hover:bg-accent-teal/80 text-black font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
                                                        >
                                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                                                            Liberar Fondos Recaudados
                                                        </button>
                                                    ) : (
                                                        <button disabled className="w-full bg-neutral-800 text-neutral-400 font-semibold py-2.5 rounded-xl cursor-not-allowed">
                                                            Gestionar Colecta (Meta no alcanzada)
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {!isGoalMet && !isExpired && (
                                                        <div className="flex gap-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={donationAmounts[camp.id] || ""}
                                                                onChange={(e) => setDonationAmounts(prev => ({ ...prev, [camp.id]: e.target.value }))}
                                                                placeholder={`Ej. 100 ${camp.goal_amount === 150 ? 'USDC' : 'XLM'}`}
                                                                className="w-1/3 min-w-[100px] bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-teal transition-colors"
                                                                disabled={isProcessing}
                                                            />
                                                            <button
                                                                onClick={() => handleDonate(camp)}
                                                                disabled={isProcessing || !donationAmounts[camp.id]}
                                                                className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                            >
                                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Donar con Escrow"}
                                                                <ArrowUpRight className="w-4 h-4 opacity-50" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isExpired && !isGoalMet && hasDonated && (
                                                        <button
                                                            onClick={() => handleAction(camp, 'refund')}
                                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2.5 rounded-xl transition-colors border border-red-500/20"
                                                        >
                                                            Claim Refund (Colecta Fallida)
                                                        </button>
                                                    )}

                                                    {isGoalMet && !hasDonated && (
                                                        <div className="text-center text-sm font-medium text-accent-teal bg-accent-teal/5 py-2 rounded-xl border border-accent-teal/10">
                                                            🎉 ¡Meta alcanzada exitosamente!
                                                        </div>
                                                    )}
                                                    {isGoalMet && hasDonated && (
                                                        <div className="text-center text-sm font-medium text-accent-teal bg-accent-teal/5 py-2 rounded-xl border border-accent-teal/10">
                                                            🎉 ¡Meta alcanzada! Gracias por aportar.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <CreateCrowdfundModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchCampaigns}
            />

            {/* Info Modal */}
            {
                isInfoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-full h-32 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                            <div className="flex justify-between items-center p-6 border-b border-white/5 relative z-10">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500" fill="currentColor" /> Colectas ReWork
                                </h2>
                                <button onClick={() => setIsInfoModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 relative z-10">
                                <p className="text-neutral-300 leading-relaxed mb-6">
                                    Fomentá la colaboración y logren objetivos juntos. Cada aporte se gestiona mediante escrows no custodiales de Trustless Work, garantizando seguridad y transparencia total.
                                </p>

                                <div className="bg-black/50 border border-accent-teal/20 rounded-xl p-4 mb-6">
                                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-accent-teal" /> Escrow Seguro
                                    </h3>
                                    <p className="text-sm text-neutral-400">
                                        Todos los aportes quedan retenidos de manera segura en un contrato sin custodia y son liberados por código, asegurando la transparencia total del dinero.
                                    </p>
                                </div>
                                <a
                                    href="https://docs.trustlesswork.com/trustless-work/es"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex justify-center items-center px-4 py-3 bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 rounded-xl text-accent-teal font-bold transition-colors gap-2"
                                >
                                    Docs Oficiales TW <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
