"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Users, Hexagon, ChevronRight, LogOut, Globe, Zap, Loader2, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useBalances } from "@/hooks/useBalances";
import { supabase } from "@/lib/supabase";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  owner_wallet: string | null;
  is_public: boolean;
  seeking_collaborators: boolean;
  tags: string[];
  member_count: number;
  squad_count: number;
  created_at: string;
}

interface GlobalBounty {
  id: string;
  title: string;
  description: string;
  status: string;
  reward_usdc: number;
}

export default function WorkspacesHub() {
  const router = useRouter();
  const { language, setLanguage } = useSettings();
  const { address, connected } = useFreighter();
  const { profile } = useProfile();
  const { xlmBalance, usdcBalance } = useBalances(address);

  const [myWorkspace, setMyWorkspace] = useState<Workspace | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  const [showBounties, setShowBounties] = useState(false);
  const [bounties, setBounties] = useState<GlobalBounty[]>([]);
  const [loadingBounties, setLoadingBounties] = useState(false);

  const [addressCopied, setAddressCopied] = useState(false);

  // Cargar workspace del usuario conectado
  useEffect(() => {
    if (!address) {
      setLoadingWorkspace(false);
      return;
    }
    const fetchMyWorkspace = async () => {
      setLoadingWorkspace(true);
      // Fetch ALL workspaces owned by this wallet (may be multiple)
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_wallet", address)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching workspace:", error);

      const list = (data || []) as Workspace[];
      // Prefer the private workspace (is_public = false) → that's the org workspace
      const privateWs = list.find(w => !w.is_public) ?? list[0] ?? null;
      setMyWorkspace(privateWs);
      if (privateWs) {
        setEditName(privateWs.name);
        setEditDesc(privateWs.description || "");
      }
      setLoadingWorkspace(false);

      // Guardar workspace_id en localStorage para el dashboard
      if (privateWs?.id) {
        localStorage.setItem("rework_current_workspace", privateWs.id);
      }
    };
    fetchMyWorkspace();
  }, [address]);

  // Cargar bounties globales
  const loadBounties = async () => {
    if (bounties.length > 0) { setShowBounties(true); return; }
    setLoadingBounties(true);
    const { data } = await supabase
      .from("squad_goals")
      .select("id, title, description, status, reward_usdc")
      .eq("is_global_bounty", true)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(5);
    setBounties((data || []) as GlobalBounty[]);
    setLoadingBounties(false);
    setShowBounties(true);
  };

  const handleSaveWorkspace = async () => {
    if (!myWorkspace || !isAdmin) return;
    setSavingWorkspace(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ name: editName.trim(), description: editDesc.trim() })
      .eq("id", myWorkspace.id);
    if (!error) {
      setMyWorkspace({ ...myWorkspace, name: editName.trim(), description: editDesc.trim() });
      setEditingWorkspace(false);
    }
    setSavingWorkspace(false);
  };

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const auraScore = profile?.points || 0;
  const reputationLabel = auraScore >= 1000 ? "Diamond" : auraScore >= 500 ? "Gold" : auraScore >= 100 ? "Silver" : "Bronze";
  const reputationColor = auraScore >= 1000 ? "text-cyan-300" : auraScore >= 500 ? "text-yellow-400" : auraScore >= 100 ? "text-slate-300" : "text-amber-600";

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden text-foreground">

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* ────────────────── HEADER IDENTIDAD GLOBAL ────────────────── */}
      <div className="w-full flex items-center justify-between z-10 max-w-7xl mx-auto py-4 gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-accent-teal/10 rounded-lg flex items-center justify-center border border-accent-teal/30">
            <svg className="w-5 h-5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">ReWork</span>
        </div>

        {/* Identidad + Patrimonio */}
        {connected && (
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* AURA Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl">
              <Hexagon className="w-4 h-4 text-accent-teal" />
              <span className="text-xs font-mono font-bold">
                AURA <span className={reputationColor}>{reputationLabel}</span>
              </span>
              <span className="text-xs text-muted">{auraScore.toLocaleString()} pts</span>
            </div>

            {/* Balances */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl">
              <span className="text-xs font-mono text-muted">XLM</span>
              <span className="text-xs font-bold">{xlmBalance ?? "—"}</span>
              <span className="text-border-subtle">|</span>
              <span className="text-xs font-mono text-muted">USDC</span>
              <span className="text-xs font-bold text-accent-teal">{usdcBalance ?? "—"}</span>
            </div>

            {/* Wallet address */}
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl hover:bg-foreground/10 transition-colors"
              title="Copiar dirección"
            >
              {addressCopied
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                : <Copy className="w-3.5 h-3.5 text-muted" />
              }
              <span className="text-xs font-mono text-muted">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground"
          >
            {language === 'es' ? 'ES' : 'EN'}
          </button>
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Salir
          </Link>
        </div>
      </div>

      {/* ────────────────── MAIN CONTENT ────────────────── */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center z-10 py-10">

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Tus Entornos <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-blue-500">ReWork</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Seleccioná el espacio de trabajo al que deseás acceder. Tu Identidad (AURA) y tu Wallet son globales en todos tus entornos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

          {/* ── CARD IZQUIERDA: Workspace Privado (dinámico desde Supabase) ── */}
          <div
            onClick={() => !isAdmin && myWorkspace && router.push("/app")}
            className={`glass-card p-8 rounded-3xl border border-border-subtle hover:border-accent-teal/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] ${myWorkspace && !isAdmin ? 'cursor-pointer' : 'cursor-default'} ${!myWorkspace ? 'opacity-80' : ''}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-accent-teal/30 transition-colors overflow-hidden">
                {myWorkspace?.logo_url
                  ? <img src={myWorkspace.logo_url} alt={myWorkspace.name} className="w-full h-full object-cover" />
                  : <Building2 className="w-7 h-7 text-foreground" />
                }
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && myWorkspace && (
                  <button
                    onClick={e => { e.stopPropagation(); setEditingWorkspace(!editingWorkspace); if (editingWorkspace) { setEditName(myWorkspace.name); setEditDesc(myWorkspace.description || ""); } }}
                    className="text-xs font-mono px-2 py-1 rounded-lg bg-accent-teal/10 text-accent-teal border border-accent-teal/20 hover:bg-accent-teal/20 transition-colors"
                  >
                    {editingWorkspace ? "Cancelar" : "Editar"}
                  </button>
                )}
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                  {loadingWorkspace ? "Cargando..." : myWorkspace ? "Pro Environment" : "Sin Workspace"}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              {loadingWorkspace ? (
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-accent-teal" />
                  <span className="text-muted text-sm">Cargando tu entorno...</span>
                </div>
              ) : myWorkspace ? (
                <>
                  {/* Nombre editable */}
                  {editingWorkspace ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-full text-2xl font-bold bg-foreground/5 border border-accent-teal/30 rounded-xl px-3 py-2 mb-2 focus:outline-none focus:border-accent-teal text-foreground"
                      placeholder="Nombre del workspace"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-accent-teal transition-colors flex items-center justify-between">
                      {myWorkspace.name}
                      {!isAdmin && <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />}
                    </h2>
                  )}

                  {/* Descripción editable */}
                  {editingWorkspace ? (
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      rows={3}
                      className="w-full text-sm bg-foreground/5 border border-accent-teal/30 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:border-accent-teal text-foreground resize-none"
                      placeholder="Descripción del workspace"
                    />
                  ) : (
                    <p className="text-muted text-sm mb-4">{myWorkspace.description || "Entorno corporativo privado."}</p>
                  )}

                  {/* Save button */}
                  {editingWorkspace && (
                    <button
                      onClick={e => { e.stopPropagation(); handleSaveWorkspace(); }}
                      disabled={savingWorkspace}
                      className="mb-4 flex items-center gap-2 px-4 py-2 bg-accent-teal text-black font-bold text-sm rounded-xl hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
                    >
                      {savingWorkspace ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {savingWorkspace ? "Guardando..." : "Guardar cambios"}
                    </button>
                  )}

                  {myWorkspace.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {myWorkspace.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-accent-teal/10 text-accent-teal rounded-full border border-accent-teal/20">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {myWorkspace.member_count} Miembros</span>
                    <span className="flex items-center gap-1.5"><Hexagon className="w-4 h-4 text-accent-teal" /> {myWorkspace.squad_count} Squads</span>
                    {isAdmin && !editingWorkspace && (
                      <button onClick={e => { e.stopPropagation(); router.push("/app"); }} className="ml-auto text-xs font-bold text-accent-teal hover:underline flex items-center gap-1">
                        Ingresar <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2 text-muted">No tenés un Workspace propio</h2>
                  <p className="text-muted text-sm mb-4">Creá tu workspace organizacional o uníte a uno existente desde la galería de alianzas.</p>
                  <button className="text-xs font-bold text-accent-teal hover:underline flex items-center gap-1">
                    Crear Workspace <ExternalLink className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── CARD DERECHA: Red de Creadores Web3 ── */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-purple-500/30 transition-colors">
                <Users className="w-7 h-7 text-foreground" />
              </div>
              <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
                Community DAO
              </span>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                Red de Creadores Web3
              </h2>
              <p className="text-muted text-sm mb-4">
                Comunidad abierta. Participá en proyectos open-source y ganá recompensas (Bounties) de la tesorería global.
              </p>

              {/* Explorar Bounties Toggle */}
              <button
                onClick={() => showBounties ? setShowBounties(false) : loadBounties()}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors mb-4 text-sm font-bold text-purple-300"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {showBounties ? "Ocultar Bounties Globales" : "Explorar Bounties Globales"}
                </span>
                {loadingBounties ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className={`w-4 h-4 transition-transform ${showBounties ? 'rotate-90' : ''}`} />}
              </button>

              {/* Bounties List */}
              {showBounties && (
                <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 duration-300">
                  {bounties.length === 0 ? (
                    <p className="text-xs text-muted text-center py-3">No hay bounties disponibles ahora.</p>
                  ) : bounties.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-border-subtle">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{b.title}</p>
                        <p className="text-xs text-muted truncate">{b.description}</p>
                      </div>
                      <span className="shrink-0 ml-3 text-xs font-mono font-bold text-accent-teal bg-accent-teal/10 border border-accent-teal/20 px-2 py-0.5 rounded-full">
                        {b.reward_usdc} USDC
                      </span>
                    </div>
                  ))}
                  <Link href="/app/squad-goals" className="block text-xs text-center text-purple-400 hover:text-purple-300 transition-colors pt-1">
                    Ver todas las misiones →
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1,200+ Miembros</span>
                <span className="flex items-center gap-1.5">🟢 Abierto</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTÓN ALIANZAS ── */}
        <div className="mt-10 text-center relative z-10">
          <Link
            href="/workspaces/alliances"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border-subtle hover:border-accent-teal/30 rounded-2xl text-sm font-bold text-foreground hover:text-accent-teal transition-all group"
          >
            <Globe className="w-4 h-4" />
            Explorar Nuevas Alianzas Públicas
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-muted mt-2">Descubrí workspaces que buscan colaboradores con tu perfil AURA</p>
        </div>

      </div>
    </div>
  );
}
