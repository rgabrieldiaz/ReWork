"use client";

import { useState, useEffect, useMemo } from "react";
import { Target, Users, AlertCircle, Loader2, CheckCircle, Clock, Search, Plus, Info, X, ShieldCheck, ArrowUpRight, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import CreateSquadGoalModal from "@/components/CreateSquadGoalModal";
import { useInitializeEscrow, useSendTransaction, useReleaseFunds } from "@trustless-work/escrow/hooks";
import { InitializeMultiReleaseEscrowPayload, MultiReleaseReleaseFundsPayload } from "@trustless-work/escrow/types";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function SquadGoalsPage() {
    const { t } = useSettings();
    const { connected, address: publicKey, sign } = useFreighter();
    const { createNotification } = useNotifications();
    const { activeWorkspace } = useWorkspace();
    const [activeTab, setActiveTab] = useState<"activas" | "propuestas">("propuestas");
    const [searchQuery, setSearchQuery] = useState("");

    const [goals, setGoals] = useState<any[]>([]);
    const [votes, setVotes] = useState<any[]>([]);
    const [squadMembers, setSquadMembers] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 5000);
    };

    const { deployEscrow } = useInitializeEscrow();
    const { releaseFunds } = useReleaseFunds();
    const { sendTransaction } = useSendTransaction();

    const fetchAllData = async () => {
        if (!activeWorkspace?.id) return;
        setLoading(true);
        try {
            const [usersRes, goalsRes, votesRes] = await Promise.all([
                supabase.from("users").select("wallet_address, first_name, last_name, avatar_url"),
                supabase.from("squad_goals").select("*").eq("workspace_id", activeWorkspace.id).order("created_at", { ascending: false }),
                supabase.from("squad_goal_votes").select("*")
            ]);

            if (usersRes.data) setSquadMembers(usersRes.data);
            if (goalsRes.data) setGoals(goalsRes.data);
            if (votesRes.data) setVotes(votesRes.data);
        } catch (error) {
            console.error("Error fetching squad data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [activeWorkspace?.id]);

    const totalSquadSize = squadMembers.length || 1;
    const requiredVotes = Math.ceil(totalSquadSize * 0.7);

    // Filter goals
    let activeGoals = goals.filter(g => g.status === "funded" || g.status === "completed");
    let proposedGoals = goals.filter(g => g.status === "proposal");

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        activeGoals = activeGoals.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
        proposedGoals = proposedGoals.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }

    const getGoalVotes = (goalId: string) => votes.filter(v => v.goal_id === goalId);
    const hasVoted = (goalId: string) => votes.some(v => v.goal_id === goalId && v.wallet_address === publicKey);

    const handleVote = async (goalId: string) => {
        if (!publicKey) return showToast(t.alerts.connectWalletFirst, 'error');
        if (hasVoted(goalId)) return;

        setProcessingId(goalId);
        try {
            await supabase.from("squad_goal_votes").insert({
                goal_id: goalId,
                wallet_address: publicKey
            });

            // Buscar la meta para notificar al creador
            const goal = goals.find(g => g.id === goalId);
            if (goal && goal.creator_id !== publicKey) {
                await createNotification({
                    user_profile_id: goal.creator_id,
                    title: "Nueva firma en tu Misión",
                    message: `Alguien ha firmado tu propuesta "${goal.title}".`,
                    type: 'community',
                    icon: 'CheckCircle',
                    action_text: 'Ver Misión',
                    action_url: '/squad-goals'
                });
            }

            await fetchAllData();
            showToast("✅ Firma registrada correctamente.");
        } catch (e) {
            console.error(e);
            showToast(t.squadGoals.errorVoting, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleFundMission = async (goal: any) => {
        if (!publicKey) return showToast(t.alerts.connectWalletFirst, 'error');
        if (!process.env.NEXT_PUBLIC_TW_API_KEY) return showToast("Trustless Work API key faltante. Contactá al administrador.", 'error');

        const memberWallets = squadMembers.filter(m => m.wallet_address).map(m => m.wallet_address);
        if (memberWallets.length === 0) return showToast(t.squadGoals.errorFunding + " No hay wallets de miembros registradas.", 'error');

        const amountPerMember = Number((goal.amount / memberWallets.length).toFixed(7));

        setProcessingId(goal.id);

        try {
            // 1. Build Multi-Release Escrow Payload
            const payload: InitializeMultiReleaseEscrowPayload = {
                signer: publicKey,
                engagementId: `rework-squad-${goal.id.slice(0, 8)}`,
                title: goal.title,
                description: goal.description,
                platformFee: 0,
                roles: {
                    approver: publicKey, // Funder/Empresa
                    serviceProvider: goal.creator_id, // Creator is representative
                    platformAddress: "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI",
                    releaseSigner: publicKey,
                    disputeResolver: "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI"
                },
                trustline: {
                    address: "CAV77QB3YSS6GUK4X54N7H2N5L2F3X2I2D6MNCXNC6R74ZZVNDP4N7F2", // USDC Testnet contract
                    symbol: "USDC"
                },
                milestones: memberWallets.map((wallet, index) => ({
                    description: `Pago a colaborador ${index + 1}`,
                    amount: amountPerMember,
                    receiver: wallet
                }))
            };

            const { unsignedTransaction } = await deployEscrow(payload, "multi-release");
            if (!unsignedTransaction) throw new Error("No unsigned transaction returned");

            const { signedTxXdr } = await sign(unsignedTransaction, "Test SDF Network ; September 2015");
            if (!signedTxXdr) throw new Error("Transaction signature failed");

            const data = await sendTransaction(signedTxXdr);

            if (data.status === "SUCCESS" && "contractId" in data) {
                // Update Supabase
                await supabase.from("squad_goals").update({
                    status: "funded",
                    trustless_contract_id: data.contractId
                }).eq("id", goal.id);

                // Notificar a todos los miembros del squad
                for (const member of squadMembers) {
                    if (member.wallet_address) {
                        await createNotification({
                            user_profile_id: member.wallet_address,
                            title: "Misión Activada",
                            message: `La misión "${goal.title}" ha sido fondeada por la empresa vía Trustless Work.`,
                            type: 'activity',
                            icon: 'Target',
                            action_text: 'Ver Misiones Activas',
                            action_url: '/squad-goals'
                        });
                    }
                }

                showToast(t.squadGoals.fundSuccess);
                fetchAllData();
            } else {
                showToast(`${t.squadGoals.errorFunding} ${data.message}`, 'error');
            }

        } catch (e: any) {
            console.error("Funding error", e);
            showToast(`${t.squadGoals.errorFunding} ${e.message}`, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReleaseMission = async (goal: any) => {
        if (!publicKey) return showToast(t.alerts.connectWalletFirst, 'error');
        if (!goal.trustless_contract_id) {
            showToast("Esta misión no tiene un contrato Trustless Work activo. Debe ser fondeada primero.", 'error');
            return;
        }

        const memberWallets = squadMembers.filter(m => m.wallet_address).map(m => m.wallet_address);

        setProcessingId(`release-${goal.id}`);

        try {
            // In Trustless Work Multi-Release, we release milestone by milestone. For ReWork demo, we'll just attempt first milestone or a loop.
            // Simplified: we'll loop to trigger the first N milestones release.
            for (let i = 0; i < memberWallets.length; i++) {
                const payload: MultiReleaseReleaseFundsPayload = {
                    contractId: goal.trustless_contract_id,
                    releaseSigner: publicKey,
                    milestoneIndex: String(i)
                };

                const { unsignedTransaction } = await releaseFunds(payload, "multi-release");
                if (unsignedTransaction) {
                    const { signedTxXdr } = await sign(unsignedTransaction, "Test SDF Network ; September 2015");
                    const data = await sendTransaction(signedTxXdr);
                    if (data.status !== "SUCCESS") {
                        console.error(`Failed releasing index ${i}:`, data.message);
                    }
                }
            }

            await supabase.from("squad_goals").update({ status: "completed" }).eq("id", goal.id);
            showToast(t.squadGoals.releaseSuccess);
            fetchAllData();

        } catch (e: any) {
            console.error("Release error", e);
            showToast(`Error al liberar fondos: ${e.message || 'Error desconocido'}`, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300 max-w-sm ${
                    toast.type === 'error'
                        ? 'bg-red-500/20 border-red-500/30 text-red-300'
                        : 'bg-accent-teal/20 border-accent-teal/30 text-accent-teal'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                    <p className="text-sm font-medium">{toast.msg}</p>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 shrink-0"><X className="w-4 h-4" /></button>
                </div>
            )}
            {/* Cabecera, Buscador y Botón Crear */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-[60%]">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground m-0 shrink-0">{t.squadGoals.title}</h1>
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar misiones..."
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
                        title={(t.squadGoals as any)?.aboutTitle || "Info"}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex justify-center items-center gap-2 px-5 py-3 bg-accent-teal hover:bg-accent-teal/80 text-black rounded-xl transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 text-black" />
                        <span>{t.squadGoals.propose}</span>
                    </button>
                </div>
            </div>

            {/* Pills Filters */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 px-2 mb-4 scrollbar-hide -mx-2">
                <button
                    onClick={() => setActiveTab("propuestas")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeTab === 'propuestas'
                        ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40'
                        : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'
                        }`}
                >
                    Propuestas en Votación
                </button>
                <button
                    onClick={() => setActiveTab("activas")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all mr-1 whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 ${activeTab === 'activas'
                        ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40'
                        : 'bg-card border border-border-subtle text-muted hover:text-foreground hover:border-border'
                        }`}
                >
                    Misiones Activas
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center items-center gap-3 text-muted">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-teal" /> {t.squadGoals.loading}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === "propuestas" && proposedGoals.map(goal => {
                        const goalVotes = getGoalVotes(goal.id);
                        const progress = Math.min(100, (goalVotes.length / requiredVotes) * 100);
                        const userVoted = hasVoted(goal.id);
                        const isProcessing = processingId === goal.id;
                        const readyToFund = goalVotes.length >= requiredVotes;

                        // Get signers avatars
                        const signers = goalVotes.map(v => {
                            const user = squadMembers.find(m => m.wallet_address === v.wallet_address);
                            return { id: v.wallet_address, avatar_url: user?.avatar_url, initials: user?.first_name?.[0] || '?' };
                        });

                        return (
                            <div key={goal.id} className="bg-card rounded-2xl border border-border-subtle overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col shadow-lg p-6 relative">
                                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-foreground/5 rounded-full text-muted flex items-center gap-1">
                                    {goal.amount} {goal.currency || "USDC"}
                                </span>

                                <div className="w-12 h-12 flex items-center justify-center text-4xl mb-4 bg-foreground/5 rounded-2xl border border-border-subtle shadow-inner">
                                    {goal.image || "🎯"}
                                </div>

                                <h3 className="font-semibold text-xl text-foreground mb-2 pr-16">{goal.title}</h3>
                                <p className="text-sm text-muted mb-6 flex-1 line-clamp-3">{goal.description}</p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-xs text-muted">
                                        <div className="flex items-center gap-2">
                                            {signers.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {signers.slice(0, 3).map((signer, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full border border-card bg-neutral-800 flex items-center justify-center overflow-hidden z-10" style={{ zIndex: 10 - i }}>
                                                            {signer.avatar_url ? (
                                                                <img src={signer.avatar_url} alt="Signer" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[10px] text-white/70 font-bold">{signer.initials}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {signers.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full border border-card bg-neutral-800 flex items-center justify-center z-0">
                                                            <span className="text-[9px] text-white/70 font-bold">+{signers.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 0 Firmas</span>
                                            )}
                                        </div>
                                        <span className="text-accent-teal font-mono">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-teal shadow-[0_0_10px_rgba(0,242,255,0.5)] transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {readyToFund ? (
                                    <button
                                        onClick={() => handleFundMission(goal)}
                                        disabled={isProcessing}
                                        className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.squadGoals.funding}</> : t.squadGoals.fundMission}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVote(goal.id)}
                                        disabled={userVoted || isProcessing || !connected}
                                        className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${userVoted
                                            ? "bg-foreground/5 text-accent-teal border border-accent-teal/20"
                                            : "bg-foreground/10 hover:bg-foreground/15 text-foreground"
                                            } disabled:opacity-50`}
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {userVoted ? <><CheckCircle className="w-4 h-4" /> {t.squadGoals.voted}</> : t.squadGoals.signProposal}
                                    </button>
                                )}
                            </div>
                        )
                    })}

                    {activeTab === "propuestas" && proposedGoals.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted border border-border-subtle rounded-2xl bg-card/50 border-dashed">
                            <Target className="w-12 h-12 mb-4 text-neutral-600" />
                            <p>{t.squadGoals.noProposals}</p>
                        </div>
                    )}

                    {activeTab === "activas" && activeGoals.map(goal => {
                        const isProcessing = processingId === `release-${goal.id}`;
                        const goalVotes = getGoalVotes(goal.id);

                        // Get signers avatars
                        const signers = goalVotes.map(v => {
                            const user = squadMembers.find(m => m.wallet_address === v.wallet_address);
                            return { id: v.wallet_address, avatar_url: user?.avatar_url, initials: user?.first_name?.[0] || '?' };
                        });

                        return (
                            <div key={goal.id} className="bg-card rounded-2xl border border-accent-teal/20 overflow-hidden flex flex-col shadow-[0_0_15px_rgba(0,242,255,0.05)] p-6 relative">
                                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-foreground/5 rounded-full text-muted flex items-center gap-1">
                                    {goal.amount} {goal.currency || "USDC"}
                                </span>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 flex items-center justify-center text-4xl bg-foreground/5 rounded-2xl border border-border-subtle shadow-inner">
                                        {goal.image || "🎯"}
                                    </div>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-accent-teal/10 text-accent-teal text-xs font-bold rounded-full border border-accent-teal/20">
                                        <Clock className="w-3.5 h-3.5" /> En Progreso
                                    </span>
                                </div>

                                <h3 className="font-semibold text-xl text-foreground mb-2 pr-16">{goal.title}</h3>
                                <p className="text-sm text-muted mb-4 flex-1 line-clamp-3">{goal.description}</p>

                                {signers.length > 0 && (
                                    <div className="flex items-center gap-2 mb-6 text-xs text-muted">
                                        Firmada por:
                                        <div className="flex -space-x-2">
                                            {signers.slice(0, 5).map((signer, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border border-card bg-neutral-800 flex items-center justify-center overflow-hidden z-10" style={{ zIndex: 10 - i }}>
                                                    {signer.avatar_url ? (
                                                        <img src={signer.avatar_url} alt="Signer" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-white/70 font-bold">{signer.initials}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {signers.length > 5 && (
                                                <div className="w-6 h-6 rounded-full border border-card bg-neutral-800 flex items-center justify-center z-0">
                                                    <span className="text-[9px] text-white/70 font-bold">+{signers.length - 5}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-background border border-border-subtle rounded-xl mb-6 flex items-center justify-between">
                                    <div className="text-xs text-muted font-medium">{t.squadGoals.trustlessReward}</div>
                                    <div className="font-bold text-accent-teal text-lg">{goal.amount} {goal.currency || "USDC"}</div>
                                </div>

                                {goal.status === "completed" ? (
                                    <div className="w-full py-3 bg-accent-teal/10 text-accent-teal font-bold rounded-xl border border-accent-teal/20 flex justify-center items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> {t.squadGoals.missionCompleted}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleReleaseMission(goal)}
                                        disabled={isProcessing}
                                        className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.squadGoals.releasing}</> : t.squadGoals.releaseSplit}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            <CreateSquadGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchAllData}
            />
            {/* Info Modal */}
            {isInfoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-full h-32 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                        <div className="flex justify-between items-center p-6 border-b border-border-subtle relative z-10">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Target className="w-5 h-5 text-accent-teal" />
                                {(t.squadGoals as any)?.aboutTitle || "Sobre Squad Goals"}
                            </h2>
                            <button onClick={() => setIsInfoModalOpen(false)} className="text-muted hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 relative z-10">
                            <p className="text-muted leading-relaxed mb-6">
                                {(t.squadGoals as any)?.aboutDescription || "Los Squad Goals permiten a los equipos organizarse, proponer objetivos y financiarlos de forma descentralizada. Una vez que la misión es aprobada y verificada, los fondos se liberan."}
                            </p>

                            <div className="bg-foreground/5 border border-accent-teal/20 rounded-xl p-4 mb-6">
                                <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-accent-teal" /> {(t.squadGoals as any)?.trustlessTitle || "Contrato Escrow Inteligente:"}
                                </h3>
                                <p className="text-sm text-muted">
                                    {(t.squadGoals as any)?.trustlessDesc || "Todos los fondos se gestionan mediante Trustless Work, asegurando que el dinero solo se libera si la misión se cumple exitosamente."}
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
            )}
        </div>
    );
}
