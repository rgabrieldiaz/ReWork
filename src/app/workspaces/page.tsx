"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Users, Hexagon, ChevronRight, LogOut, Globe, Zap, Loader2, Copy, CheckCircle2, ExternalLink, Pencil, X as XIcon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useBalances } from "@/hooks/useBalances";
import { useWorkspace, Workspace as HookWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/lib/supabase";

interface GlobalBounty {
  id: string;
  title: string;
  description: string;
  reward_usdc: number;
  status: string;
}

export default function WorkspacesPage() {
  const { t, language, setLanguage } = useSettings();
  const router = useRouter();
  const { address, connected } = useFreighter();
  const { profile } = useProfile();
  const { xlmBalance, usdcBalance } = useBalances(address);
  const { workspaces, loading: loadingWorkspaces, joinRequests, setActiveWorkspaceId } = useWorkspace();

  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  const [showBounties, setShowBounties] = useState(false);
  const [bounties, setBounties] = useState<GlobalBounty[]>([]);
  const [loadingBounties, setLoadingBounties] = useState(false);

  const [addressCopied, setAddressCopied] = useState(false);

  // Use the first workspace as the "primary" one for display, or any logic to pick one
  const primaryWorkspace = workspaces[0] || null;

  useEffect(() => {
    if (primaryWorkspace) {
      setEditName(primaryWorkspace.name);
      setEditDesc(primaryWorkspace.description || "");
    }
  }, [primaryWorkspace]);

  const handleSaveWorkspace = async () => {
    if (!primaryWorkspace || !isAdmin) return;
    setSavingWorkspace(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ name: editName.trim(), description: editDesc.trim() })
      .eq("id", primaryWorkspace.id);
    if (!error) {
      // Local update is handled by the hook if we refresh, 
      // but for immediate feedback:
      setEditingWorkspace(false);
      window.location.reload(); // Quick refresh to update hook data
    }
    setSavingWorkspace(false);
  };

  const enterWorkspace = (ws: HookWorkspace) => {
    setActiveWorkspaceId(ws.id);
    router.push("/app");
  };

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
    setBounties((data || []) as any[]);
    setLoadingBounties(false);
    setShowBounties(true);
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
        <div className="flex items-center gap-3 shrink-0 min-w-[160px] justify-end">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground shrink-0"
          >
            {language === 'es' ? 'ES' : 'EN'}
          </button>
          <Link href="/logout" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-medium shrink-0">
            <LogOut className="w-4 h-4" /> <span>{t.workspacesPage.logout}</span>
          </Link>
        </div>
      </div>

      {/* ────────────────── MAIN CONTENT ────────────────── */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center z-10 py-10">

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t.workspacesPage.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-blue-500">ReWork</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            {t.workspacesPage.subtitle}
          </p>
        </div>

        {/* ── SECCIÓN: INVITACIONES PENDIENTES ── */}
        {joinRequests.some(r => r.status === 'pending') && (
          <div className="mb-10 animate-in slide-in-from-left-4 duration-500">
            <h2 className="text-sm font-bold text-accent-teal uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Solicitudes Pendientes
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {joinRequests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="glass-card p-4 rounded-2xl border border-accent-teal/20 bg-accent-teal/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Esperando respuesta de {req.workspace_name}</p>
                    <p className="text-xs text-muted">Tu AURA está siendo evaluada por el equipo.</p>
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-teal/50" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

          {/* ── COLUMNA IZQUIERDA: Mis Entornos (Propios y Miembros) ── */}
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Mis Espacios
            </h2>

            {loadingWorkspaces ? (
              <div className="glass-card p-8 rounded-3xl border border-border-subtle flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
              </div>
            ) : workspaces.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl border border-border-subtle text-center">
                <p className="text-muted mb-4">{t.workspacesPage.noOwnWorkspace}</p>
                <button className="text-sm font-bold text-accent-teal hover:underline flex items-center justify-center gap-1 w-full text-center">
                  {t.workspacesPage.createWorkspace} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => enterWorkspace(ws)}
                  className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-accent-teal/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] flex flex-col cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-accent-teal/30 transition-colors overflow-hidden">
                      {ws.logo_url
                        ? <img src={ws.logo_url} alt={ws.name} className="w-full h-full object-cover" />
                        : <Building2 className="w-7 h-7 text-foreground" />
                      }
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        ws.userRole === 'owner' ? 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal' :
                        ws.userRole === 'admin' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                        'bg-foreground/5 border-border-subtle text-muted'
                      }`}>
                        {ws.userRole || 'Collaborator'}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-accent-teal transition-colors flex items-center justify-between">
                      {ws.name}
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </h2>
                    <p className="text-muted text-sm mb-4 line-clamp-2">{ws.description || t.workspacesPage.privateDesc}</p>

                    <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4 mt-auto">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {ws.member_count || 0} {t.workspacesPage.members}</span>
                      <span className="flex items-center gap-1.5"><Hexagon className="w-4 h-4 text-accent-teal" /> {ws.squad_count || 0} Squads</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── COLUMNA DERECHA: Red Global & Discovery ── */}
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" /> {t.workspacesPage.alliances}
            </h2>

            <div className="glass-card p-8 rounded-3xl border border-border-subtle hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-14 h-14 bg-background border border-border-subtle rounded-2xl flex items-center justify-center shadow-inner group-hover:border-purple-500/30 transition-colors">
                  <Users className="w-7 h-7 text-foreground" />
                </div>
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
                  {t.workspacesPage.communityDAO}
                </span>
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {t.workspacesPage.globalNetwork}
                </h2>
                <p className="text-muted text-sm mb-4">
                  {t.workspacesPage.daoDesc}
                </p>

                {/* Explorar Bounties Toggle */}
                <button
                  onClick={() => showBounties ? setShowBounties(false) : loadBounties()}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors mb-4 text-sm font-bold text-purple-300"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {showBounties ? t.workspacesPage.bountiesHide : t.workspacesPage.bountiesShow}
                  </span>
                  {loadingBounties ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className={`w-4 h-4 transition-transform ${showBounties ? 'rotate-90' : ''}`} />}
                </button>

                {/* Bounties List */}
                {showBounties && (
                  <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 duration-300">
                    {bounties.length === 0 ? (
                      <p className="text-xs text-muted text-center py-3">{t.workspacesPage.noBounties}</p>
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
                      {t.workspacesPage.viewAllMissions} →
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs font-mono text-muted border-t border-border-subtle pt-4 mt-auto">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1,200+ {t.workspacesPage.members}</span>
                  <span className="flex items-center gap-1.5">🟢 {t.workspacesPage.open}</span>
                </div>
              </div>
            </div>

            {/* Acceso Global Alliances */}
            <div className="mt-auto pt-4">
              <Link
                href="/workspaces/alliances"
                className="flex items-center justify-center gap-2.5 w-full py-4 bg-foreground/5 hover:bg-foreground/10 border border-border-subtle hover:border-accent-teal/30 rounded-2xl text-sm font-bold text-foreground hover:text-accent-teal transition-all group shadow-sm"
              >
                <Globe className="w-4 h-4" />
                {t.workspacesPage.exploreAlliances}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[10px] text-muted text-center mt-3 uppercase tracking-widest">{t.workspacesPage.alliancesDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
