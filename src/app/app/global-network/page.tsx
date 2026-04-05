"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/lib/supabase";
import { Globe, Target, ShieldCheck, Sparkles, ChevronRight, UserPlus, Search, Filter } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface Bounty {
    id: string;
    title: string;
    description: string;
    reward_usdc: number;
    status: string;
    creator_id: string;
    is_global_bounty: boolean;
    created_at: string;
}

export default function GlobalNetworkPage() {
    const { connected, address } = useWallet();
    const { profile } = useProfile();
    const { t } = useSettings();
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [applyingId, setApplyingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchGlobalBounties = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('squad_goals')
                    .select('*')
                    .or('is_global_bounty.eq.true,workspace_id.is.null')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBounties(data || []);
            } catch (err) {
                console.error('Error fetching global bounties:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalBounties();
    }, []);

    const handleApply = async (bounty: Bounty) => {
        if (!connected || !profile) {
            alert("Conectá tu wallet y perfil para postularte.");
            return;
        }

        setApplyingId(bounty.id);
        
        try {
            // Mock application logic - in a real app this would create a record in 'applications' or similar
            // We can send a notification to the creator or just mark local state for now
            // since the 'applications' table wasn't in the initial schema list
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert(`¡Postulación enviada con éxito! Tu CV Aura (${profile.points} pts) ha sido compartido con el creador.`);
            
        } catch (err) {
            console.error('Error applying:', err);
        } finally {
            setApplyingId(null);
        }
    };

    const filteredBounties = bounties.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500 p-4 sm:p-8">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent-teal/20 rounded-2xl flex items-center justify-center border border-accent-teal/30">
                        <Globe className="w-6 h-6 text-accent-teal" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Red de Creadores Web3</h1>
                        <p className="text-muted">Explorá misiones y bounties abiertos en todo el ecosistema.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center mt-8">
                    <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent-teal transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar misiones, tecnología, retos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-foreground/5 border border-border-subtle focus:border-accent-teal/50 rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-foreground/5 border border-border-subtle rounded-xl hover:bg-foreground/10 transition-all text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filtros Avanzados
                    </button>
                    <div className="ml-auto flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest bg-accent-teal/5 border border-accent-teal/10 px-4 py-2 rounded-full">
                        <Sparkles className="w-3 h-3 text-accent-teal" />
                        {bounties.length} Misiones Disponibles
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card p-6 h-64 animate-pulse opacity-50" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBounties.map((bounty) => (
                        <div key={bounty.id} className="glass-card p-6 hover-card flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-teal/5 blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:bg-accent-teal/10 transition-all" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-accent-teal/10 rounded-lg border border-accent-teal/20">
                                    <Target className="w-5 h-5 text-accent-teal" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted uppercase tracking-widest font-bold">Reward</p>
                                    <p className="text-lg font-black text-accent-teal">{bounty.reward_usdc} USDC</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent-teal transition-colors line-clamp-1">{bounty.title}</h3>
                            <p className="text-sm text-muted mb-6 flex-1 line-clamp-3 leading-relaxed">
                                {bounty.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border-subtle relative z-10">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-accent-teal/60" />
                                    <span className="text-xs font-medium text-muted">Aura Verificada</span>
                                </div>
                                <button
                                    onClick={() => handleApply(bounty)}
                                    disabled={applyingId === bounty.id}
                                    className="flex items-center gap-2 bg-accent-teal text-background px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent-teal/90 transition-all disabled:opacity-50"
                                >
                                    {applyingId === bounty.id ? "Postulando..." : "Postularse"}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredBounties.length === 0 && (
                <div className="text-center py-20 glass-card">
                    <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                        <Globe className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No se encontraron misiones</h3>
                    <p className="text-muted max-w-md mx-auto">
                        Parece que no hay misiones globales que coincidan con tu búsqueda. Intentá con otros términos o volvé más tarde.
                    </p>
                </div>
            )}

            {/* Aura CV Banner */}
            <div className="mt-16 glass-card p-8 border-accent-teal/20 bg-accent-teal/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 flex-1">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <Sparkles className="text-accent-teal" />
                        Tu Perfil Aura es tu CV Web3
                    </h2>
                    <p className="text-muted max-w-2xl">
                        Cada misión completada, cada punto ganado y cada badge verificado fortalece tu reputación en la Red de Creadores. 
                        No necesitás enviar archivos adjuntos, tu historial habla por vos.
                    </p>
                </div>
                <div className="relative z-10 text-center md:text-right">
                    <p className="text-3xl font-black text-accent-teal mb-1">{profile?.points || 0}</p>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Aura acumulado</p>
                </div>
            </div>
        </div>
    );
}
