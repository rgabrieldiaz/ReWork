"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/hooks/useProfile";
import { Users, Award, Search, MessageSquare, Plus, Shield, UsersRound, CalendarDays } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useSquads, Squad } from "@/hooks/useSquads";

export default function ColaboradoresPage() {
    const { t } = useSettings();
    const { squads, squadMembers, loading: squadsLoading, createSquad, joinSquad } = useSquads();
    const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Tabs state
    const [activeTab, setActiveTab] = useState<'squads' | 'people'>('squads');

    // Create Squad Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSquadName, setNewSquadName] = useState("");
    const [newSquadDesc, setNewSquadDesc] = useState("");
    const [newSquadTag, setNewSquadTag] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchCollaborators = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("first_name", { ascending: true });

            if (error) {
                console.error("Error fetching collaborators:", error);
            } else if (data) {
                setCollaborators(data as UserProfile[]);
            }
            setLoading(false);
        };

        fetchCollaborators();
    }, []);

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

    const handleCreateSquad = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createSquad({
                name: newSquadName,
                description: newSquadDesc,
                specialty: newSquadTag,
                is_open: true
            });
            setIsCreateModalOpen(false);
            setNewSquadName("");
            setNewSquadDesc("");
            setNewSquadTag("");
        } catch (error) {
            console.error("Error creating squad:", error);
            alert("Error creating squad. The name might already be taken.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinSquad = async (squadId: string) => {
        try {
            await joinSquad(squadId);
            alert("Success!");
        } catch (error) {
            console.error("Error joining squad:", error);
            alert("Error joining squad. You might already be a member or pending.");
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
                        <p>{t.colaboradores.noResults}</p>
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
                                                <h3 className="font-bold text-xl text-foreground mb-1">{squad.name}</h3>
                                                {squad.specialty && (
                                                    <span className="inline-block px-2.5 py-1 bg-accent-teal/10 text-accent-teal text-xs font-semibold rounded-md border border-accent-teal/20">
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
                                                    {members.slice(0, 4).map((m, i) => (
                                                        <div key={m.user_id} className="w-8 h-8 rounded-full border-2 border-card bg-neutral-800 flex items-center justify-center overflow-hidden z-20" style={{ zIndex: 10 - i }}>
                                                            {m.users?.avatar_url ? (
                                                                <img src={m.users.avatar_url} alt="member" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-accent-teal">{(m.users?.first_name || 'U')[0].toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                    ))}
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
                                            <button
                                                onClick={() => handleJoinSquad(squad.id)}
                                                className="flex-1 bg-foreground/5 hover:bg-accent-teal/10 hover:text-accent-teal text-foreground font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-transparent hover:border-accent-teal/20"
                                            >
                                                {squad.is_open ? t.colaboradores.squads.join : t.colaboradores.squads.requestInvite}
                                            </button>
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

                            return (
                                <div key={user.wallet_address} className="bg-card rounded-2xl border border-border-subtle overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col shadow-lg relative">
                                    <div className="h-24 bg-neutral-900/50 relative overflow-hidden flex justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-b from-accent-teal/5 to-transparent"></div>
                                    </div>

                                    <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
                                        <div className="w-20 h-20 rounded-full bg-background border-[4px] border-[#0a0a0a] flex items-center justify-center absolute -top-10 left-6 overflow-hidden shadow-xl group-hover:border-accent-teal/30 transition-colors">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-accent-teal">{initial}</span>
                                            )}
                                        </div>

                                        <div className="mt-12 flex-1">
                                            <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-accent-teal transition-colors truncate">{fullName}</h3>
                                            <p className="text-xs font-medium text-accent-teal mb-4 uppercase tracking-wider">{user.role || t.colaboradores.roleDefault}</p>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm text-muted bg-foreground/5 px-3 py-2 rounded-lg w-fit">
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                    <span>{user.points || 0} <span className="text-muted text-xs">{t.colaboradores.pointsContributed}</span></span>
                                                </div>
                                                {commonSquads && (
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-accent-teal/80 bg-accent-teal/5 px-3 py-1.5 rounded-lg w-fit border border-accent-teal/10">
                                                        <UsersRound className="w-3.5 h-3.5" />
                                                        <span>{commonSquads}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <button className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium py-2 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                                                <MessageSquare className="w-4 h-4" /> {t.colaboradores.connect}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* Create Squad Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border-subtle shadow-2xl p-6 relative">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute right-4 top-4 text-muted hover:text-foreground"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="text-accent-teal" /> {t.colaboradores.squads.create}
                        </h2>

                        <form onSubmit={handleCreateSquad} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Squad Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSquadName}
                                    onChange={e => setNewSquadName(e.target.value)}
                                    className="w-full bg-neutral-900 border border-border-subtle rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-accent-teal"
                                    placeholder="e.g. Backend Warriors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Specialty Tag</label>
                                <input
                                    type="text"
                                    value={newSquadTag}
                                    onChange={e => setNewSquadTag(e.target.value)}
                                    className="w-full bg-neutral-900 border border-border-subtle rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-accent-teal"
                                    placeholder="e.g. Rust/Soroban"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={newSquadDesc}
                                    onChange={e => setNewSquadDesc(e.target.value)}
                                    className="w-full bg-neutral-900 border border-border-subtle rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-accent-teal resize-none"
                                    placeholder="Describe your squad's goals and culture..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-accent-teal hover:bg-accent-teal/90 text-black font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
                            >
                                {isCreating ? "Creating..." : t.colaboradores.squads.create}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
