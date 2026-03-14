"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/hooks/useProfile";
import { Users, Award, Search, MessageSquare, Plus, Shield, UsersRound, CalendarDays, ExternalLink, ChevronDown, Rocket, UserPlus } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useSquads, Squad } from "@/hooks/useSquads";
import CreateSquadModal from "@/components/CreateSquadModal";
import { useNotifications } from "@/hooks/useNotifications";
import { useFreighter } from "@/hooks/useFreighter";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function ColaboradoresPage() {
    const { t } = useSettings();
    const { squads, squadMembers, loading: squadsLoading, createSquad, joinSquad, fetchSquads, leaveSquad, disbandSquad } = useSquads();
    const { createNotification } = useNotifications();
    const { address: publicKey } = useFreighter();
    const { activeWorkspace } = useWorkspace();
    const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Tabs state
    const [activeTab, setActiveTab] = useState<'squads' | 'people'>('squads');

    // State for interactive connect dropdown
    const [openConnectDropdown, setOpenConnectDropdown] = useState<string | null>(null);

    // Create Squad Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchCollaborators = async () => {
            if (!activeWorkspace?.id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("workspace_id", activeWorkspace.id)
                .order("first_name", { ascending: true });

            if (error) {
                console.error("Error fetching collaborators:", error);
            } else if (data) {
                setCollaborators(data as UserProfile[]);
            }
            setLoading(false);
        };

        fetchCollaborators();
    }, [activeWorkspace?.id]);

    // Derived states
    const filteredSquads = squads.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.specialty && s.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCollaborators = collaborators.filter(c => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const handleSquadCreated = () => {
        setIsCreateModalOpen(false);
        fetchSquads();

        // fetchSquads is handled inside useSquads naturally or by refreshing
        // Actually since we don't return 'fetchSquads' explicitly from the simple hook
        // it may rely on auto-refresh or user reload, but it refreshes internally when created.
    };

    const handleJoinSquad = async (squadId: string, leaderId: string) => {
        try {
            await joinSquad(squadId);
            const leader = collaborators.find(c => c.wallet_address === leaderId);
            if (leader?.wallet_address && leader.wallet_address !== publicKey) {
                await createNotification({
                    user_profile_id: leader.wallet_address,
                    title: "Nuevo integrante en tu Squad",
                    message: "Alguien se ha unido a tu Squad o ha solicitado unirse.",
                    type: 'community',
                    icon: 'Users',
                    action_text: 'Ver Miembros',
                    action_url: '/colaboradores'
                });
            }
            alert("Success!");
        } catch (error: any) {
            console.error("Error joining squad:", error);
            alert(error.message || "Error joining squad. You might already be a member or pending.");
        }
    };

    const handleLeaveSquad = async (squadId: string) => {
        if (!confirm("¿Seguro que quieres abandonar este Squad?")) return;
        try {
            await leaveSquad(squadId);
            alert("Has abandonado el Squad.");
        } catch (error: any) {
            alert(error.message || "Error al abandonar el squad.");
        }
    };

    const handleDisbandSquad = async (squadId: string) => {
        if (!confirm("¿Estás seguro de desarmar este Squad? Esta acción no se puede deshacer.")) return;
        try {
            await disbandSquad(squadId);
            alert("El Squad ha sido eliminado.");
        } catch (error: any) {
            alert(error.message || "Error al eliminar el squad.");
        }
    };

    // Calculate common squads for a given user vs logged in user
    // Since we don't know the logged in user easily without full useProfile here, 
    // we'll assume standard connection for demonstration. In a real scenario, we check intersections 
    // of squad_members where user_id matches. For the demo, we show a calculated or random small number 
    // based on their wallet address to simulate "Common Squads".
    // Alternatively, we can derive it from `squadMembers` if we have full access.
    const getCommonSquadsStr = (userId: string) => {
        // Mocking common squads count statically for UI purposes based on string length
        const count = userId.length % 3;
        if (count === 0) return null;
        return t.colaboradores.squads.commonSquads.replace("{count}", count.toString());
    };

    const handleInvite = async (userToInvite: UserProfile) => {
        if (!publicKey) return alert("Por favor conecta tu wallet primero.");
        if (userToInvite.wallet_address === publicKey) return alert("No puedes invitarte a ti mismo.");

        try {
            await createNotification({
                user_profile_id: userToInvite.wallet_address,
                title: "Invitación de Squad",
                message: "Has sido invitado a unirte a un Squad.",
                type: 'community',
                icon: 'Users',
                action_text: 'Ver Squads',
                action_url: '/squad-goals'
            });
            alert("Invitación enviada correctamente.");
            setOpenConnectDropdown(null);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al enviar la invitación.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="bg-card flex flex-col items-center text-center rounded-2xl border border-border-subtle p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-10 left-10 w-96 h-96 bg-accent-teal/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-4">
                        {t.colaboradores.title} <Users className="text-accent-teal w-10 h-10" />
                    </h1>
                    <p className="text-muted text-lg leading-relaxed">
                        {t.colaboradores.subtitle}
                    </p>
                </div>
            </div>

            {/* Top Bar: Tabs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-4">
                <div className="flex bg-neutral-900 border border-border-subtle p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('squads')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'squads' ? 'bg-accent-teal text-black shadow-lg shadow-accent-teal/20' : 'text-muted hover:text-foreground'}`}
                    >
                        {t.colaboradores.tabs.squads}
                    </button>
                    <button
                        onClick={() => setActiveTab('people')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'people' ? 'bg-accent-teal text-black shadow-lg shadow-accent-teal/20' : 'text-muted hover:text-foreground'}`}
                    >
                        {t.colaboradores.tabs.people}
                    </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder={t.colaboradores.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-foreground focus:outline-none focus:border-accent-teal/50 transition-colors text-sm"
                        />
                    </div>
                    {activeTab === 'squads' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-foreground hover:bg-neutral-200 text-black font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shrink-0 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.colaboradores.squads.create}</span>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'squads' ? (
                // Squads View
                squadsLoading ? (
                    <div className="py-20 flex justify-center text-muted">{t.colaboradores.loading}</div>
                ) : filteredSquads.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted border border-border-subtle rounded-2xl bg-card/50 border-dashed">
                        <UsersRound className="w-12 h-12 mb-4 text-neutral-600" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Ningún Squad encontrado</h3>
                        <p className="max-w-md text-center">¿Nadie lidera este nicho? Sé el primero en crear un Squad y empieza a cambiar el juego.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-6 px-6 py-2 bg-accent-teal text-black font-semibold rounded-xl hover:bg-accent-teal/90 transition-colors"
                        >
                            Comandar Nuevo Squad
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSquads.map((squad) => {
                            const members = squadMembers[squad.id] || [];
                            return (
                                <div key={squad.id} className="bg-card rounded-2xl border border-border-subtle overflow-hidden hover:border-accent-teal/30 transition-all flex flex-col shadow-lg">
                                    <div className="p-6 flex-1 flex flex-col relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-foreground mb-1 break-words">
                                                    {(squad as any).emoji ? `${(squad as any).emoji} ` : "🛡️ "}{squad.name}
                                                </h3>
                                                {squad.specialty && (
                                                    <span className="inline-block px-2.5 py-1 bg-accent-teal/10 text-accent-teal text-xs font-semibold rounded-md border border-accent-teal/20 mt-1 max-w-full truncate">
                                                        {squad.specialty}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="bg-neutral-800/50 p-2 rounded-xl border border-border-subtle">
                                                <Shield className="w-5 h-5 text-accent-teal opacity-80" />
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted mb-6 flex-1 line-clamp-3">
                                            {squad.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto mb-6">
                                            {/* Member Avatars */}
                                            <div className="flex items-center">
                                                <div className="flex -space-x-3">
                                                    {members.slice(0, 4).map((m, i) => {
                                                        const member = m.users; // Assuming m is SquadMember and m.users is UserProfile
                                                        if (!member) return null;
                                                        return (
                                                            <div key={m.user_id} className="w-8 h-8 rounded-full border-2 border-card bg-background overflow-hidden relative" style={{ zIndex: 3 - i }}>
                                                                {member.avatar_url ? (
                                                                    <img src={member.avatar_url} alt="member" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[10px] items-center justify-center flex w-full h-full font-bold text-accent-teal">{(member.first_name || 'U')[0].toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                  {members.length > 4 && (
                                                        <div className="w-8 h-8 rounded-full border-2 border-card bg-neutral-900 flex items-center justify-center z-10">
                                                            <span className="text-[10px] font-bold text-muted">+{members.length - 4}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="ml-3 text-xs text-muted font-medium">{members.length} {t.colaboradores.squads.members}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border-subtle flex gap-3">
                                            {squad.leader_id === collaborators.find(c => c.wallet_address === publicKey)?.wallet_address ? (
                                                <button
                                                    onClick={() => handleDisbandSquad(squad.id)}
                                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-transparent"
                                                >
                                                    Desarmar Squad
                                                </button>
                                            ) : members.some((sm: any) => sm.user_id === collaborators.find(c => c.wallet_address === publicKey)?.wallet_address) ? (
                                                <button
                                                    onClick={() => handleLeaveSquad(squad.id)}
                                                    className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-transparent"
                                                >
                                                    Abandonar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoinSquad(squad.id, squad.leader_id)}
                                                    className="flex-1 bg-foreground/5 hover:bg-accent-teal/10 hover:text-accent-teal text-foreground font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-transparent hover:border-accent-teal/20"
                                                >
                                                    {squad.is_open ? t.colaboradores.squads.join : t.colaboradores.squads.requestInvite}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                // People View (Original Colaboradores view enhanced)
                loading ? (
                    <div className="py-20 flex justify-center text-muted">{t.colaboradores.loading}</div>
                ) : filteredCollaborators.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted border border-border-subtle rounded-2xl bg-card/50 border-dashed">
                        <Users className="w-12 h-12 mb-4 text-neutral-600" />
                        <p>{t.colaboradores.noResults}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCollaborators.map((user) => {
                            const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : "U";
                            const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || t.colaboradores.anonymous;
                            const commonSquads = getCommonSquadsStr(user.wallet_address);

                            // Mocking data for the new UI requirements since they might not be fully in the DB schema yet
                            // Points to Aura mapping
                            const auraPoints = user.points || 0;
                            const auraPercentage = Math.min(100, Math.max(10, (auraPoints / 1000) * 100));

                            // Mocking the "Disponibilidad / Open to Work" feature visually
                            const isAvailableForMissions = user.wallet_address.charCodeAt(0) % 2 === 0;

                            // Identifying squads the user belongs to (mocked by extracting some squads)
                            const userSquadMemberships = squads.slice(0, (user.wallet_address.length % 3) + 1);

                            const dropdownOpen = openConnectDropdown === user.wallet_address;

                            return (
                                <div key={user.wallet_address} className="bg-card rounded-2xl border border-border-subtle overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col shadow-lg relative">
                                    <div className="h-28 bg-neutral-900/50 relative overflow-hidden flex justify-center">
                                        {/* Glassmorphism gradient effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/10 via-background to-background"></div>
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-teal/20 rounded-full blur-[40px] pointer-events-none"></div>

                                        {isAvailableForMissions && (
                                            <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-[10px] uppercase rounded-md shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                                Disponible para Misiones
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative z-20">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-background border-[4px] border-[#0a0a0a] flex items-center justify-center absolute -top-10 left-0 overflow-hidden shadow-xl group-hover:border-accent-teal/50 group-hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-accent-teal">{initial}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-14 flex-1">
                                            <h3 className="font-semibold text-xl text-foreground mb-1 group-hover:text-accent-teal transition-colors truncate">{fullName}</h3>
                                            <p className="text-xs font-medium text-muted mb-4 tracking-wide">{user.role || t.colaboradores.roleDefault}</p>

                                            {/* Aura Bar instead of typical Points */}
                                            <div className="flex flex-col gap-1.5 mb-4">
                                                <div className="flex justify-between items-center text-xs">
                                                    <div className="flex items-center gap-1.5 font-bold text-accent-teal">
                                                        <Award className="w-3.5 h-3.5" /> AURA NEÓN
                                                    </div>
                                                    <span className="text-muted font-mono">{auraPoints} pts</span>
                                                </div>
                                                <div className="h-2 w-full bg-neutral-900/80 rounded-full overflow-hidden border border-border-subtle">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-accent-teal/50 to-accent-teal rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                                                        style={{ width: `${auraPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* User Squad Icons (Glassmorphism look) */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {userSquadMemberships.map((sq, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-1.5 bg-foreground/5 py-1 px-2 rounded-lg border border-border-subtle/50 text-xs backdrop-blur-sm"
                                                        title={sq.name}
                                                    >
                                                        <span>{(sq as any).emoji || "🛡️"}</span>
                                                        <span className="max-w-[80px] truncate text-muted">{sq.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {/* Enhanced Action Button Dropdown */}
                                            <div className="relative">
                                                <div className="flex overflow-hidden rounded-xl border border-accent-teal/30 bg-accent-teal/5 hover:bg-accent-teal/10 transition-colors shadow-sm">
                                                    <button className="flex-1 py-2.5 font-bold text-accent-teal text-sm flex items-center justify-center gap-2">
                                                        <MessageSquare className="w-4 h-4" /> Enviar Mensaje
                                                    </button>
                                                    <div className="w-px bg-accent-teal/20 hidden md:block" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenConnectDropdown(dropdownOpen ? null : user.wallet_address);
                                                        }}
                                                        className="px-3 bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20 transition-colors flex items-center"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {dropdownOpen && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setOpenConnectDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-card border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                                            <button className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-foreground/5 transition-colors">
                                                                <ExternalLink className="w-4 h-4 text-muted" /> Ver Perfil
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleInvite(user);
                                                                }}
                                                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-foreground/5 transition-colors"
                                                            >
                                                                <UserPlus className="w-4 h-4 text-muted" /> Invitar a mi Squad
                                                            </button>
                                                            <button className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-accent-teal/10 text-accent-teal transition-colors border-t border-border-subtle">
                                                                <Rocket className="w-4 h-4" /> Proponer Misión
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            <CreateSquadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleSquadCreated}
            />
        </div>
    );
}
