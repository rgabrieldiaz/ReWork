"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Hexagon, Globe, Send, CheckCircle2, Loader2, Search, Tag } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

interface PublicWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tags: string[];
  member_count: number;
  squad_count: number;
  seeking_collaborators: boolean;
  logo_url: string | null;
}

export default function AlliancesGallery() {
  const { address, connected } = useFreighter();
  const { profile } = useProfile();

  const [workspaces, setWorkspaces] = useState<PublicWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSeeking, setFilterSeeking] = useState(false);
  const [requestSent, setRequestSent] = useState<Record<string, boolean>>({});
  const [requestLoading, setRequestLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("workspaces")
        .select("id, name, slug, description, tags, member_count, squad_count, seeking_collaborators, logo_url")
        .eq("is_public", true)
        .order("member_count", { ascending: false });
      setWorkspaces((data || []) as PublicWorkspace[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleJoinRequest = async (workspace: PublicWorkspace) => {
    if (!connected || !address) {
      showToast("Conectá tu wallet para enviar una solicitud.", "error");
      return;
    }
    setRequestLoading(workspace.id);
    try {
      const { error } = await supabase.from("workspace_join_requests").insert({
        workspace_id: workspace.id,
        requester_wallet: address,
        message: `Solicitud de ${profile?.first_name || address.slice(0, 8)} con ${profile?.points || 0} pts AURA.`,
        status: "pending",
      });
      if (error) throw error;
      setRequestSent(prev => ({ ...prev, [workspace.id]: true }));
      showToast(`Solicitud enviada a ${workspace.name}. Te notificarán pronto.`);
    } catch (err: any) {
      showToast(err?.message || "Error al enviar la solicitud.", "error");
    } finally {
      setRequestLoading(null);
    }
  };

  const filtered = workspaces.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.description || "").toLowerCase().includes(search.toLowerCase()) ||
      w.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchSeeking = filterSeeking ? w.seeking_collaborators : true;
    return matchSearch && matchSeeking;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-500/8 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${toast.type === "success" ? "bg-accent-teal/10 border-accent-teal/30 text-accent-teal" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : "⚠"}
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <Link href="/workspaces" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Volver a Entornos
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">
              Alianzas <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-purple-400">Públicas</span>
            </h1>
            <p className="text-muted mt-2">Workspaces abiertos donde podés colaborar con tu perfil AURA actual.</p>
          </div>

          {/* AURA Badge */}
          {connected && (
            <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl border border-border-subtle">
              <Hexagon className="w-5 h-5 text-accent-teal" />
              <div>
                <p className="text-xs text-muted">Tu AURA</p>
                <p className="text-sm font-bold">{profile?.points?.toLocaleString() || 0} pts</p>
              </div>
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent-teal/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setFilterSeeking(!filterSeeking)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${filterSeeking ? "bg-accent-teal/10 border-accent-teal/30 text-accent-teal" : "bg-foreground/5 border-border-subtle text-muted hover:text-foreground"}`}
          >
            <Tag className="w-4 h-4" />
            Buscando colaboradores
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No se encontraron alianzas</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <div key={w.id} className="glass-card p-6 rounded-2xl border border-border-subtle hover:border-accent-teal/30 transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-teal/30 to-transparent"></div>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-foreground/10 rounded-xl flex items-center justify-center border border-border-subtle overflow-hidden shrink-0">
                    {w.logo_url
                      ? <img src={w.logo_url} alt={w.name} className="w-full h-full object-cover" />
                      : <span className="text-xl">{w.name.charAt(0)}</span>
                    }
                  </div>
                  {w.seeking_collaborators && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      🟢 Buscando
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base mb-1 group-hover:text-accent-teal transition-colors">{w.name}</h3>
                <p className="text-muted text-xs mb-3 line-clamp-2">{w.description}</p>

                {/* Tags */}
                {w.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {w.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-foreground/5 text-muted rounded-full border border-border-subtle">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {w.member_count}</span>
                  <span className="flex items-center gap-1"><Hexagon className="w-3.5 h-3.5 text-accent-teal" /> {w.squad_count} Squads</span>
                </div>

                {/* Action button */}
                {requestSent[w.id] ? (
                  <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Solicitud enviada
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinRequest(w)}
                    disabled={requestLoading === w.id}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20 hover:bg-accent-teal/20 text-accent-teal text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {requestLoading === w.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                    {requestLoading === w.id ? "Enviando..." : "Solicitar unirse"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
