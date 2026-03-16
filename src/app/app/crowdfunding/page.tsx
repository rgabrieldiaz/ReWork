"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Info, Plus, Gift, CheckCircle, Clock, AlertCircle, X, Heart, Activity, Share2, ArrowUpRight, Filter, Loader2, ChevronDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import { useSettings } from "@/hooks/useSettings";
import CreateCrowdfundModal from "@/components/CreateCrowdfundModal";
import { ColectaDetailModal } from "@/components/ColectaDetailModal";
import { useNotifications } from "@/hooks/useNotifications";
import { useWorkspace } from "@/hooks/useWorkspace";
import { signTransaction, getNetworkDetails } from "@stellar/freighter-api";

// Utils
const truncateKey = (key: string) => `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;

export default function ColectasPage() {
    const { t } = useSettings();
    const { connected, address: publicKey } = useFreighter();
    const { createNotification } = useNotifications();
    const { activeWorkspace } = useWorkspace();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userTeamWallets, setUserTeamWallets] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Custom hook inner logic mapped to timeout for debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // New Filter State matching Marketplace
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'finished' | 'myDonations'>('all');
    const [activeSort, setActiveSort] = useState<'recent' | 'endingSoon' | 'popular'>('recent');
    const [activeFilter, setActiveFilter] = useState<'none' | 'goalMet' | 'almostThere'>('none');

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedColecta, setSelectedColecta] = useState<any>(null);
    const [donationAmounts, setDonationAmounts] = useState<Record<number, string>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch data
    const fetchCampaigns = async () => {
        if (!activeWorkspace?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from("crowdfunds").select("*").eq("workspace_id", activeWorkspace.id).order("created_at", { ascending: false });
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

    const fetchTeamWallets = async () => {
        if (!publicKey) {
            setUserTeamWallets(new Set());
            return;
        }
        try {
            const { data: user } = await supabase.from('users').select('id').eq('wallet_address', publicKey).maybeSingle();
            if (!user) {
                setUserTeamWallets(new Set([publicKey]));
                return;
            }
            const { data: mySquads } = await supabase.from('squad_members').select('squad_id').eq('user_id', user.id);
            if (!mySquads || mySquads.length === 0) {
                setUserTeamWallets(new Set([publicKey]));
                return;
            }
            const squadIds = mySquads.map(s => s.squad_id);
            const { data: allMembers } = await supabase.from('squad_members').select('user_id').in('squad_id', squadIds);
            const userIds = allMembers?.map(m => m.user_id) || [];
            if (userIds.length > 0) {
                const { data: teammates } = await supabase.from('users').select('wallet_address').in('id', userIds);
                const wallets = teammates?.map(t => t.wallet_address) || [];
                setUserTeamWallets(new Set(wallets));
            } else {
                setUserTeamWallets(new Set([publicKey]));
            }
        } catch (err) {
            console.error("Error fetching team wallets", err);
            setUserTeamWallets(new Set([publicKey]));
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchTeamWallets();
    }, [activeWorkspace?.id, publicKey]);

    // Derived Data
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        campaigns.forEach(c => c.tags?.forEach((t: string) => tags.add(t)));
        return Array.from(tags);
    }, [campaigns]);

    const filteredCampaigns = useMemo(() => {
        let filtered = [...campaigns];

        if (debouncedSearchQuery) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                c.organizer.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
        }

        const now = Date.now();

        // Tabs Filtering
        if (activeTab === 'active') {
            filtered = filtered.filter(c => new Date(c.deadline).getTime() > now && c.current_amount < c.goal_amount);
        } else if (activeTab === 'finished') {
            filtered = filtered.filter(c => new Date(c.deadline).getTime() <= now || c.current_amount >= c.goal_amount);
        } else if (activeTab === 'myDonations') {
            const donatedIds = new Set(donations.map(d => d.crowdfund_id));
            filtered = filtered.filter(c => donatedIds.has(c.id));
        }

        // Privacy Filtering
        filtered = filtered.filter(c => {
            if (c.privacy === 'private') {
                return c.organizer === publicKey || userTeamWallets.has(c.organizer);
            }
            return true;
        });

        // Pills Filtering
        if (activeFilter === 'goalMet') {
            filtered = filtered.filter(c => c.current_amount >= c.goal_amount);
        } else if (activeFilter === 'almostThere') {
            filtered = filtered.filter(c => {
                const progress = c.current_amount / c.goal_amount;
                return progress >= 0.75 && progress < 1.0;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            if (activeSort === 'endingSoon') {
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            } else if (activeSort === 'popular') {
                return b.donor_count - a.donor_count;
            } else { // 'recent'
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return filtered;
    }, [campaigns, debouncedSearchQuery, activeTab, activeFilter, activeSort, donations]);

    // Actions
    const handleDonate = async (camp: any, overrideAmount?: number) => {
        if (!connected || !publicKey) {
            showToast("Conecta tu wallet Freighter para aportar.", 'error');
            return;
        }

        const amountToDonate = overrideAmount || Number(donationAmounts[camp.id]);
        if (!amountToDonate || amountToDonate <= 0) return;

        setProcessingId(camp.id);
        try {
            // 1. Deploy escrow via server proxy (same pattern as Marketplace)
            const USDC_CONTRACT = "CAV77QB3YSS6GUK4X54N7H2N5L2F3X2I2D6MNCXNC6R74ZZVNDP4N7F2";
            const PLATFORM_ADDR = "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI";

            const payload: any = {
                signer: publicKey,
                engagementId: `rework-crowdfund-${camp.id}-${Date.now()}`,
                title: `Donación: ${camp.title}`,
                description: `Aporte de ${amountToDonate} USDC para la colecta de ${camp.title}`,
                roles: {
                    approver: camp.organizer,
                    serviceProvider: camp.organizer,
                    platformAddress: PLATFORM_ADDR,
                    releaseSigner: camp.organizer,
                    disputeResolver: PLATFORM_ADDR,
                    receiver: camp.organizer,
                },
                amount: amountToDonate,
                platformFee: 0.5,
                milestones: [{ 
                    description: `Colecta: ${camp.title}`,
                    amount: amountToDonate
                }],
                trustline: {
                    address: PLATFORM_ADDR,
                    symbol: "USDC"
                }
            };

            console.log("[Crowdfunding] Sending TW Payload:", JSON.stringify(payload, null, 2));

            const deployRes = await fetch('/api/trustless-work/deploy-escrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const deployData = await deployRes.json();
            if (!deployRes.ok) throw new Error(deployData.error || deployData.message || "Error al crear el Escrow.");

            const { unsignedTransaction } = deployData;
            if (!unsignedTransaction) throw new Error("Sin XDR de Trustless Work.");

            // 2. Sign with Freighter
            const net = await getNetworkDetails();
            const signedResult = await signTransaction(unsignedTransaction, {
                networkPassphrase: net.networkPassphrase || "Test SDF Network ; September 2015"
            });
            const signedXdr = typeof signedResult === "string" ? signedResult : (signedResult as any)?.signedTxXdr || (signedResult as any)?.signedXdr || signedResult;
            if (!signedXdr) throw new Error("Firma cancelada o fallida desde Freighter.");

            // 3. Submit to network
            const sendRes = await fetch('/api/trustless-work/send-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xdr: signedXdr })
            });
            const sendText = await sendRes.text();
            let sendData: any = {};
            try { sendData = JSON.parse(sendText); } catch (_) {}
            if (!sendRes.ok) throw new Error(sendData.error || sendData.message || "Error enviando la transacción.");

            const newEscrowId = sendData.contractId || sendData.id || `escrow-cf-${Date.now()}`;

            // 4. Persist donation
            const { error: dbError } = await supabase.from("crowdfund_donations").insert([{
                crowdfund_id: camp.id,
                donor_public_key: publicKey,
                amount: parseInt(amountToDonate.toString()),
                escrow_contract_id: newEscrowId,
            }]);
            if (dbError) throw dbError;

            // 5. Update campaign amount
            const { error: rpcError } = await supabase.rpc('increment_crowdfund_amount', {
                target_id: camp.id,
                inc_amount: parseInt(amountToDonate.toString())
            });
            if (rpcError) {
                await supabase.from("crowdfunds").update({
                    current_amount: camp.current_amount + parseInt(amountToDonate.toString()),
                    donor_count: camp.donor_count + 1
                }).eq("id", camp.id);
            }

            // 6. Notify organizer
            if (camp.organizer !== publicKey) {
                await createNotification({
                    user_profile_id: camp.organizer,
                    title: "¡Nuevo aporte en tu Colecta!",
                    message: `Han aportado ${amountToDonate} USDC a "${camp.title}".`,
                    type: 'activity',
                    icon: 'Gift',
                    action_text: 'Ver Colecta',
                    action_url: '/app/crowdfunding'
                });
            }

            setDonationAmounts(prev => ({ ...prev, [camp.id]: "" }));
            fetchCampaigns();
            showToast("🎉 Donación realizada. Los fondos están en Escrow de Trustless Work.");
        } catch (err: any) {
            console.error(err);
            showToast("Error: " + (err.message || "Error desconocido"), 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleAction = async (camp: any, action: 'release' | 'refund') => {
        setProcessingId(camp.id);
        try {
            await new Promise(r => setTimeout(r, 1500));
            showToast(action === 'release'
                ? "Fondos liberados exitosamente del Escrow hacia tu cuenta."
                : "Se ha solicitado el reembolso (Claim Refund) de la donación."
            );
        } catch (error) {
            console.error(error);
            showToast("Error al procesar la acción.", 'error');
        } finally {
            setProcessingId(null);
        }
    };

    // Bug 8: Republish expired campaign
    const handleRepublish = async (camp: any) => {
        if (!publicKey || camp.organizer !== publicKey) {
            showToast("Solo el organizador puede republicar.", 'error');
            return;
        }
        setProcessingId(`republish-${camp.id}`);
        try {
            const newDeadline = new Date();
            newDeadline.setDate(newDeadline.getDate() + 30); // +30 días

            const { error } = await supabase.from('crowdfunds').insert([{
                workspace_id: localStorage.getItem('rework_current_workspace') || '00000000-0000-0000-0000-000000000000',
                title: camp.title,
                description: camp.description,
                organizer: camp.organizer,
                goal_amount: camp.goal_amount,
                current_amount: 0,
                donor_count: 0,
                deadline: newDeadline.toISOString(),
                image: camp.image,
                tags: camp.tags,
                privacy: camp.privacy,
                currency: camp.currency || 'USDC',
            }]);
            if (error) throw error;
            showToast("✅ Colecta republicada con 30 días adicionales.");
            fetchCampaigns();
        } catch (err: any) {
            showToast("Error al republicar: " + err.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'error'
                        ? 'bg-red-500/20 border-red-500/30 text-red-300'
                        : 'bg-accent-teal/20 border-accent-teal/30 text-accent-teal'
                }`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <p className="text-sm font-medium">{toast.msg}</p>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
            )}
            {/* Cabecera, Buscador y Botón Crear */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-[60%]">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground m-0 shrink-0">{t.colectas.title}</h1>
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.colectas.searchPlaceholder || "Buscar colectas..."}
                            className="pl-11 pr-4 py-3 bg-card border border-neutral-300 dark:border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent-teal transition-colors w-full shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="w-11 h-11 flex items-center justify-center text-muted hover:text-accent-teal hover:bg-accent-teal/10 border border-border-subtle rounded-xl transition-colors shrink-0"
                        title={t.colectas.about || "Info"}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex justify-center items-center gap-2 px-5 py-3 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 text-black" />
                        <span>{t.colectas.create || "Crear Colecta"}</span>
                    </button>
                </div>
            </div>

            {/* Tabs de Navegación */}
            <div className="flex items-center gap-6 border-b border-border-subtle mt-2 overflow-x-auto scrollbar-hide">
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm whitespace-nowrap ${activeTab === 'all' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('all')}
                >
                    Todas
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm whitespace-nowrap ${activeTab === 'active' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Activas
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm whitespace-nowrap ${activeTab === 'finished' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('finished')}
                >
                    Finalizadas
                </button>
                <div className="flex-1" />
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors text-sm whitespace-nowrap ${activeTab === 'myDonations' ? 'border-accent-teal text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
                    onClick={() => setActiveTab('myDonations')}
                >
                    Mis Aportes
                </button>
            </div>

            {/* Sistema de Pills para Filtros y Orden */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 px-2 mb-4 scrollbar-hide -mx-2">
                {/* Sort Pills (Mutually Exclusive) */}
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeSort === 'recent' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                    onClick={() => setActiveSort('recent')}
                >
                    Recientes
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeSort === 'endingSoon' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                    onClick={() => setActiveSort('endingSoon')}
                >
                    Terminan Pronto
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-2 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeSort === 'popular' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                    onClick={() => setActiveSort('popular')}
                >
                    Populares
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-border mx-2 shrink-0"></div>

                {/* Filter Pills (Togglable) */}
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeFilter === 'almostThere' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                    onClick={() => setActiveFilter(activeFilter === 'almostThere' ? 'none' : 'almostThere')}
                >
                    Cerca de la Meta
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-2 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeFilter === 'goalMet' ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40' : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'}`}
                    onClick={() => setActiveFilter(activeFilter === 'goalMet' ? 'none' : 'goalMet')}
                >
                    Meta Alcanzada
                </button>
            </div>

            {/* Listado de Colectas */}
            {loading ? (
                <div className="py-20 flex justify-center text-muted">{t.colectas.loading}</div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted border border-border-subtle rounded-2xl bg-card/50 border-dashed">
                    <AlertCircle className="w-12 h-12 mb-4 text-foreground/50" />
                    <p className="text-foreground/60">{t.colectas.noResults}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredCampaigns.map((camp) => {
                        const progress = Math.min(100, Math.floor((camp.current_amount / camp.goal_amount) * 100));
                        const hasDonated = donations.some(d => d.crowdfund_id === camp.id);
                        const isGoalMet = camp.current_amount >= camp.goal_amount;
                        const isExpired = new Date(camp.deadline).getTime() < Date.now();
                        const isOrganizer = camp.organizer === publicKey;
                        const isProcessing = processingId === camp.id;

                        return (
                            <div
                                key={camp.id}
                                onClick={() => setSelectedColecta(camp)}
                                className="bg-card cursor-pointer rounded-2xl border border-border-subtle overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col md:flex-row shadow-lg"
                            >
                                <div className="w-full md:w-48 xl:w-64 min-h-[200px] bg-neutral-900/40 md:border-r border-border-subtle flex-shrink-0 relative overflow-hidden group/img">
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

                                    {/* Status Badge Top Right */}
                                    <div className="absolute top-4 right-4 z-20">
                                        {isGoalMet ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-teal/20 backdrop-blur-md rounded-full text-xs font-bold text-accent-teal border border-accent-teal/40 shadow-[0_0_10px_var(--accent-teal)30]">
                                                <CheckCircle className="w-3.5 h-3.5" /> Meta
                                            </span>
                                        ) : isExpired ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full text-xs font-bold text-red-400 border border-red-500/40">
                                                <X className="w-3.5 h-3.5" /> Fin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-400 border border-blue-500/40">
                                                <Activity className="w-3.5 h-3.5" /> Activa
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-20">
                                        {camp.tags?.map((tag: string) => (
                                            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-foreground bg-card/60 backdrop-blur-md px-2 py-1 rounded-md border border-border-subtle" title={tag}>{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-xl leading-tight text-foreground mb-1 group-hover:text-accent-teal transition-colors">{camp.title}</h3>
                                            <p className="text-xs text-muted flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {t.colectas.endsOn} {new Date(camp.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted mb-6 flex-1">{camp.description || `Apoya esta colecta con tus ${camp.goal_amount === 150 ? 'USDC' : 'XLM'}.`}</p>

                                    <div className="mt-auto">
                                        {/* Barra de Progreso */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-foreground tracking-wide">{camp.current_amount.toLocaleString()} <span className="text-muted font-normal">/ {camp.goal_amount.toLocaleString()} {camp.goal_amount === 150 ? 'USDC' : 'XLM'}</span></span>
                                                <span className="font-medium flex items-center gap-1.5" style={{ color: isGoalMet ? 'var(--accent-teal)' : '#fff' }}>
                                                    {isGoalMet && <CheckCircle className="w-3.5 h-3.5" />} {progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden shadow-inner border border-border-subtle">
                                                <div
                                                    className={`h-full rounded-full relative transition-all duration-1000 ${isGoalMet ? 'bg-accent-teal shadow-[0_0_15px_var(--accent-teal)40]' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-accent-teal'}`}
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent"></div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted flex justify-between">
                                                <span>{t.colectas.organizer} {truncateKey(camp.organizer)}</span>
                                                <span>{camp.donor_count} {t.colectas.contributions}</span>
                                            </div>
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

            <ColectaDetailModal
                isOpen={!!selectedColecta}
                onClose={() => setSelectedColecta(null)}
                colecta={selectedColecta}
                onDonate={handleDonate}
                onAction={handleAction}
                isProcessing={processingId === selectedColecta?.id}
                hasDonated={selectedColecta ? donations.some(d => d.crowdfund_id === selectedColecta.id) : false}
                isOrganizer={selectedColecta ? selectedColecta.organizer === publicKey : false}
                t={t}
            />

            {/* Info Modal */}
            {
                isInfoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-full h-32 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                            <div className="flex justify-between items-center p-6 border-b border-border-subtle relative z-10">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500" fill="currentColor" /> Colectas ReWork
                                </h2>
                                <button onClick={() => setIsInfoModalOpen(false)} className="text-muted hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 relative z-10">
                                <p className="text-muted leading-relaxed mb-6">
                                    Fomentá la colaboración y logren objetivos juntos. Cada aporte se gestiona mediante escrows no custodiales de Trustless Work, garantizando seguridad y transparencia total.
                                </p>

                                <div className="bg-foreground/5 border border-accent-teal/20 rounded-xl p-4 mb-6">
                                    <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-accent-teal" /> Escrow Seguro
                                    </h3>
                                    <p className="text-sm text-muted">
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
