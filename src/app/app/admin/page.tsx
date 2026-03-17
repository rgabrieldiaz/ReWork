"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Users, 
    Wallet, 
    Shield, 
    Globe, 
    Activity, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    ChevronRight, 
    ArrowLeft,
    UserMinus,
    ShieldAlert,
    ShieldCheck,
    BarChart3,
    SwitchCamera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSettings } from "@/hooks/useSettings";
import { useBalances } from "@/hooks/useBalances";

interface WorkspaceMember {
    id: string;
    role: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
        wallet_address: string;
        points: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { t } = useSettings();
    const { activeWorkspace } = useWorkspace();

    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState<any>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

    // Get treasury balance
    const { xlmBalance, usdcBalance } = useBalances(workspace?.treasury_address || null);

    const isAdmin = activeWorkspace?.userRole === 'admin' || activeWorkspace?.userRole === 'owner';

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!activeWorkspace) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                setWorkspace(activeWorkspace);

                // Fetch members
                const { data: membersData } = await supabase
                    .from('workspace_members')
                    .select(`
                        id,
                        role,
                        user:user_id (
                            id,
                            first_name,
                            last_name,
                            avatar_url,
                            wallet_address,
                            points
                        )
                    `)
                    .eq('workspace_id', activeWorkspace.id);

                if (membersData) {
                    setMembers(membersData as any);
                }
            } catch (err) {
                console.error("Error loading admin data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [activeWorkspace]);

    const togglePolicy = async () => {
        if (!workspace) return;
        const newVal = !workspace.hide_global_network;
        const { error } = await supabase
            .from('workspaces')
            .update({ hide_global_network: newVal })
            .eq('id', workspace.id);
        
        if (!error) {
            setWorkspace({ ...workspace, hide_global_network: newVal });
        }
    };

    const updateMemberRole = async (memberId: string, currentRole: string) => {
        setUpdatingMemberId(memberId);
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const { error } = await supabase
            .from('workspace_members')
            .update({ role: newRole })
            .eq('id', memberId);

        if (!error) {
            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        }
        setUpdatingMemberId(null);
    };

    const revokeAccess = async (memberId: string) => {
        if (!confirm("¿Estás seguro de que querés revocar el acceso a este miembro?")) return;
        setUpdatingMemberId(memberId);
        const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('id', memberId);

        if (!error) {
            setMembers(members.filter(m => m.id !== memberId));
        }
        setUpdatingMemberId(null);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
            </div>
        );
    }

    if (!activeWorkspace || !isAdmin) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center py-20">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
                <p className="text-muted max-w-md">No tenés permisos de administrador para este espacio o el espacio no es Premium.</p>
                <button 
                    onClick={() => router.push('/app')}
                    className="mt-6 flex items-center gap-2 text-accent-teal font-bold hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Tablero
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 p-4 sm:p-8 pb-32">
            <header className="mb-12">
                <button 
                    onClick={() => router.push('/app')}
                    className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-teal/10 rounded-2xl flex items-center justify-center border border-accent-teal/30">
                            <Shield className="w-6 h-6 text-accent-teal" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
                            <p className="text-muted">{workspace.name} · Premium Workspace</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* ── COLUMNA IZQUIERDA: GESTIÓN & POLÍTICAS ── */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Member Management */}
                    <section className="glass-card p-0 overflow-hidden">
                        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-accent-teal" />
                                Gestión de Miembros
                            </h2>
                            <span className="text-xs font-bold text-muted uppercase tracking-widest">{members.length} Miembros</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-foreground/5 text-xs font-bold text-muted uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Puntos Cura</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {members.map((member) => (
                                        <tr key={member.id} className="hover:bg-foreground/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center border border-accent-teal/20 overflow-hidden">
                                                        {member.user.avatar_url ? (
                                                            <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-accent-teal">{member.user.first_name[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold truncate">{member.user.first_name} {member.user.last_name}</p>
                                                        <p className="text-[10px] font-mono text-muted truncate">{member.user.wallet_address.slice(0, 6)}...{member.user.wallet_address.slice(-4)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                                                    member.role === 'admin' || member.role === 'owner' ? 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal' : 'bg-foreground/5 border-border-subtle text-muted'
                                                }`}>
                                                    {member.role === 'owner' ? 'Fundador' : member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold font-mono text-foreground">{member.user.points.toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {member.role !== 'owner' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => updateMemberRole(member.id, member.role)}
                                                            disabled={updatingMemberId === member.id}
                                                            className="p-2 rounded-lg bg-foreground/5 border border-border-subtle hover:bg-accent-teal/10 hover:text-accent-teal transition-all disabled:opacity-50"
                                                            title={member.role === 'admin' ? 'Degradar a Miembro' : 'Promover a Admin'}
                                                        >
                                                            {member.role === 'admin' ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => revokeAccess(member.id)}
                                                            disabled={updatingMemberId === member.id}
                                                            className="p-2 rounded-lg bg-foreground/5 border border-border-subtle hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                                                            title="Revocar Acceso"
                                                        >
                                                            <UserMinus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Aura Growth Chart (Simulated) */}
                    <section className="glass-card p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-accent-teal" />
                                Crecimiento AURA del Equipo
                            </h3>
                            <span className="text-xs text-muted">Últimos 30 días</span>
                        </div>
                        
                        <div className="h-48 flex items-end gap-2 px-2">
                            {[45, 60, 55, 75, 90, 85, 100, 110, 95, 120, 135, 150].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div 
                                        className="w-full bg-accent-teal/20 border-t border-accent-teal/40 rounded-t-md group-hover:bg-accent-teal/40 transition-all duration-500 delay-[50ms]"
                                        style={{ height: `${(h/150) * 100}%` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-[10px] font-bold bg-background border border-border-subtle px-1.5 py-0.5 rounded shadow-xl">+{h}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-muted uppercase tracking-widest px-2">
                            <span>Feb</span>
                            <span>Marzo</span>
                        </div>
                    </section>
                </div>

                {/* ── COLUMNA DERECHA: TESORERÍA & POLÍTICAS ── */}
                <div className="space-y-8">
                    
                    {/* Treasury */}
                    <section className="glass-card p-6 bg-accent-teal/5 border-accent-teal/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                        
                        <div className="flex items-center gap-2 mb-6">
                            <Wallet className="w-5 h-5 text-accent-teal" />
                            <h3 className="font-bold">Tesorería Corporativa</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="p-4 rounded-2xl bg-background/50 border border-border-subtle">
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Stellar Address</p>
                                <p className="text-xs font-mono text-accent-teal truncate max-w-full">
                                    {workspace?.treasury_address || 'No configurada'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-background/50 border border-border-subtle">
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">XLM Balance</p>
                                    <p className="text-xl font-black">{xlmBalance ?? '0.00'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-background/50 border border-border-subtle">
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">USDC Balance</p>
                                    <p className="text-xl font-black text-accent-teal">{usdcBalance ?? '0.00'}</p>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-accent-teal text-background font-bold rounded-xl hover:bg-accent-teal/90 transition-all text-sm">
                                <Activity className="w-4 h-4" />
                                Ver Transacciones
                            </button>
                        </div>
                    </section>

                    {/* Policies */}
                    <section className="glass-card p-6">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent-teal" />
                            Políticas de Espacio
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Ocultar Red Global</p>
                                    <p className="text-xs text-muted leading-tight mt-0.5">Los miembros no verán misiones externas fuera de este workspace.</p>
                                </div>
                                <button 
                                    onClick={togglePolicy}
                                    className={`w-12 h-6 rounded-full transition-all relative ${workspace?.hide_global_network ? 'bg-accent-teal' : 'bg-foreground/20'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${workspace?.hide_global_network ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 opacity-50">
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Aprobación Manual de AURA</p>
                                    <p className="text-xs text-muted leading-tight mt-0.5">Requiere revisión administrativa para otorgar puntos.</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-foreground/20 relative">
                                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white opacity-50" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-orange-200/80 leading-relaxed italic">
                                "Como administrador, sos responsable de la integridad de este espacio y de la distribución justa de recompensas."
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
