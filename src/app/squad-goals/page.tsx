"use client";

import { useState, useEffect, useMemo } from "react";
import { Target, Users, AlertCircle, Loader2, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";
import CreateSquadGoalModal from "@/components/CreateSquadGoalModal";
import { useInitializeEscrow, useSendTransaction, useReleaseFunds } from "@trustless-work/escrow/hooks";
import { InitializeMultiReleaseEscrowPayload, MultiReleaseReleaseFundsPayload } from "@trustless-work/escrow/types";

export default function SquadGoalsPage() {
    const { connected, address: publicKey, sign } = useFreighter();
    const [activeTab, setActiveTab] = useState<"activas" | "propuestas">("propuestas");

    const [goals, setGoals] = useState<any[]>([]);
    const [votes, setVotes] = useState<any[]>([]);
    const [squadMembers, setSquadMembers] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { deployEscrow } = useInitializeEscrow();
    const { releaseFunds } = useReleaseFunds();
    const { sendTransaction } = useSendTransaction();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, goalsRes, votesRes] = await Promise.all([
                supabase.from("users").select("wallet_address, first_name, last_name, avatar_url"),
                supabase.from("squad_goals").select("*").order("created_at", { ascending: false }),
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
    }, []);

    const totalSquadSize = squadMembers.length || 1;
    const requiredVotes = Math.ceil(totalSquadSize * 0.7);

    // Filter goals
    const activeGoals = goals.filter(g => g.status === "funded" || g.status === "completed");
    const proposedGoals = goals.filter(g => g.status === "proposal");

    const getGoalVotes = (goalId: string) => votes.filter(v => v.goal_id === goalId);
    const hasVoted = (goalId: string) => votes.some(v => v.goal_id === goalId && v.wallet_address === publicKey);

    const handleVote = async (goalId: string) => {
        if (!publicKey) return alert("Conecta tu billetera primero.");
        if (hasVoted(goalId)) return;

        setProcessingId(goalId);
        try {
            await supabase.from("squad_goal_votes").insert({
                goal_id: goalId,
                wallet_address: publicKey
            });
            await fetchAllData();
        } catch (e) {
            console.error(e);
            alert("Error al votar");
        } finally {
            setProcessingId(null);
        }
    };

    const handleFundMission = async (goal: any) => {
        if (!publicKey) return alert("Conéctate como Empresa (Funder) para fondear.");
        if (!process.env.NEXT_PUBLIC_TW_API_KEY) return alert("Trustless Work API key missing");

        const memberWallets = squadMembers.filter(m => m.wallet_address).map(m => m.wallet_address);
        if (memberWallets.length === 0) return alert("No hay miembros en el squad con billetera.");

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
                    platformAddress: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
                    releaseSigner: publicKey,
                    disputeResolver: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW"
                },
                trustline: {
                    address: "GBBD47IF6LWK7P7MDEVSCWT7FC4JFMTWHWXIGPN6BMTWSQNEPW2H3F2P", // USDC Testnet issuer
                    symbol: "USDC" // Assuming USDC for this instance as per payload UI
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

                alert("Misión fondeada correctamente.");
                fetchAllData();
            } else {
                alert(`Error: ${data.message}`);
            }

        } catch (e: any) {
            console.error("Funding error", e);
            alert(`Error fondeando: ${e.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReleaseMission = async (goal: any) => {
        if (!publicKey) return alert("Requieres billetera conectada.");
        if (!goal.trustless_contract_id) return alert("No contract ID found.");

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
            alert("Fondos liberados y Misión completada!");
            fetchAllData();

        } catch (e: any) {
            console.error("Release error", e);
            alert("Error al liberar fondos");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-bold tracking-tight mb-3 flex items-center gap-3">
                            Squad Goals <Target className="text-accent-teal" />
                        </h1>
                        <p className="text-neutral-300 leading-relaxed">
                            Proponé objetivos de equipo. Cuando alcanzan un 70% de aprobación, la empresa los fondea vía <strong className="text-white">Trustless Work</strong> y el pago se divide automáticamente entre todos los miembros al completarse.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-accent-teal text-[#050c14] font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        Proponer Misión
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab("propuestas")}
                    className={`pb-3 px-2 font-medium transition-colors text-lg relative ${activeTab === 'propuestas' ? 'text-accent-teal' : 'text-neutral-500 hover:text-white'}`}
                >
                    Propuestas en Votación
                    {activeTab === 'propuestas' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal shadow-[0_0_10px_rgba(0,242,255,0.8)] rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("activas")}
                    className={`pb-3 px-2 font-medium transition-colors text-lg relative ${activeTab === 'activas' ? 'text-accent-teal' : 'text-neutral-500 hover:text-white'}`}
                >
                    Misiones Activas
                    {activeTab === 'activas' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal shadow-[0_0_10px_rgba(0,242,255,0.8)] rounded-t-full" />
                    )}
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center items-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-teal" /> Cargando Misiones...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === "propuestas" && proposedGoals.map(goal => {
                        const goalVotes = getGoalVotes(goal.id);
                        const progress = Math.min(100, (goalVotes.length / requiredVotes) * 100);
                        const userVoted = hasVoted(goal.id);
                        const isProcessing = processingId === goal.id;
                        const readyToFund = goalVotes.length >= requiredVotes;

                        return (
                            <div key={goal.id} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col shadow-lg p-6 relative">
                                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-white/5 rounded-full text-slate-300">
                                    {goal.amount} USDC
                                </span>

                                <h3 className="font-semibold text-xl text-white mb-2 pr-16">{goal.title}</h3>
                                <p className="text-sm text-neutral-400 mb-6 flex-1">{goal.description}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-xs text-neutral-400">
                                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {goalVotes.length} / {requiredVotes} Requeridos</span>
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
                                        className="w-full py-3 bg-white text-[#0a0a0a] font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Fondeando...</> : "Aprobar y Fondear (Empresa)"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVote(goal.id)}
                                        disabled={userVoted || isProcessing || !connected}
                                        className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${userVoted
                                            ? "bg-white/5 text-accent-teal border border-accent-teal/20"
                                            : "bg-white/10 hover:bg-white/15 text-white"
                                            } disabled:opacity-50`}
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {userVoted ? <><CheckCircle className="w-4 h-4" /> Votado</> : "Firmar Propuesta"}
                                    </button>
                                )}
                            </div>
                        )
                    })}

                    {activeTab === "propuestas" && proposedGoals.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-500 border border-white/5 rounded-2xl bg-[#0a0a0a]/50 border-dashed">
                            <Target className="w-12 h-12 mb-4 text-neutral-600" />
                            <p>No hay propuestas activas en el Squad.</p>
                        </div>
                    )}

                    {activeTab === "activas" && activeGoals.map(goal => {
                        const isProcessing = processingId === `release-${goal.id}`;

                        return (
                            <div key={goal.id} className="bg-[#0a0a0a] rounded-2xl border border-accent-teal/20 overflow-hidden flex flex-col shadow-[0_0_15px_rgba(0,242,255,0.05)] p-6 relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-accent-teal/10 text-accent-teal text-xs font-bold rounded-full border border-accent-teal/20">
                                        <Clock className="w-3.5 h-3.5" /> FONDEADO
                                    </span>
                                </div>

                                <h3 className="font-semibold text-xl text-white mb-2">{goal.title}</h3>
                                <p className="text-sm text-neutral-400 mb-6 flex-1">{goal.description}</p>

                                <div className="p-4 bg-deep-navy border border-white/5 rounded-xl mb-6 flex items-center justify-between">
                                    <div className="text-xs text-neutral-500 font-medium">Recompensa Trustless</div>
                                    <div className="font-bold text-accent-teal text-lg">{goal.amount} USDC</div>
                                </div>

                                {goal.status === "completed" ? (
                                    <div className="w-full py-3 bg-accent-teal/10 text-accent-teal font-bold rounded-xl border border-accent-teal/20 flex justify-center items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Misión Completada
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleReleaseMission(goal)}
                                        disabled={isProcessing}
                                        className="w-full py-3 bg-white text-[#0a0a0a] font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Liberando Pago Split...</> : "Misión Cumpilda (Liberar Pagos)"}
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
        </div>
    );
}
