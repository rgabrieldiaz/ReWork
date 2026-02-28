"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/hooks/useProfile";
import { Users, Award, Search, MessageSquare } from "lucide-react";

export default function ColaboradoresPage() {
    const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCollaborators = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                // Sort by first name for a neat alphabetical list instead of ranking
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

    const filteredCollaborators = collaborators.filter(c => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-bold tracking-tight mb-3 flex items-center gap-3">
                            Colaboradores <Users className="text-accent-teal" />
                        </h1>
                        <p className="text-neutral-300 leading-relaxed">
                            Conocé a tus compañeros de equipo. ReWork fomenta un ecosistema colaborativo donde todos aportamos valor y construimos juntos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="relative max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o rol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-accent-teal/50 transition-colors"
                />
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-neutral-500">Cargando equipo...</div>
            ) : filteredCollaborators.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-neutral-500 border border-white/5 rounded-2xl bg-[#0a0a0a]/50 border-dashed">
                    <Users className="w-12 h-12 mb-4 text-neutral-600" />
                    <p>No se encontraron colaboradores.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCollaborators.map((user) => {
                        const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : "U";
                        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Usuario Anónimo";
                        
                        return (
                            <div key={user.wallet_address} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden group hover:border-accent-teal/30 transition-all flex flex-col shadow-lg relative">
                                <div className="h-24 bg-neutral-900/50 relative overflow-hidden flex justify-center">
                                     <div className="absolute inset-0 bg-gradient-to-b from-accent-teal/5 to-transparent"></div>
                                </div>
                                
                                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
                                    <div className="w-20 h-20 rounded-full bg-deep-navy border-[4px] border-[#0a0a0a] flex items-center justify-center absolute -top-10 left-6 overflow-hidden shadow-xl group-hover:border-accent-teal/30 transition-colors">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-accent-teal">{initial}</span>
                                        )}
                                    </div>
                                    
                                    <div className="mt-12">
                                        <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-accent-teal transition-colors truncate">{fullName}</h3>
                                        <p className="text-xs font-medium text-accent-teal mb-4 uppercase tracking-wider">{user.role || "Colaborador"}</p>
                                        
                                        <div className="flex items-center gap-2 text-sm text-neutral-400 bg-white/5 px-3 py-2 rounded-lg w-fit">
                                            <Award className="w-4 h-4 text-yellow-500" />
                                            <span>{user.points || 0} <span className="text-neutral-500 text-xs">PTS Aportados</span></span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-2">
                                        <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                                            <MessageSquare className="w-4 h-4" /> Conectar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
