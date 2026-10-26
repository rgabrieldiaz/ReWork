"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Users,
  Hexagon,
  ChevronRight,
  LogOut,
  Globe,
  Zap,
  Loader2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Settings,
  GripVertical,
  LayoutGrid,
  List,
  Search,
  X as XIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useWallet } from "@/hooks/useWallet";
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

const STORAGE_ORDER_KEY = "rework_workspaces_order";
const STORAGE_VIEW_KEY = "rework_workspaces_view_mode";

export default function WorkspacesPage() {
  const { t, language, setLanguage } = useSettings();
  const router = useRouter();
  const { address, connected } = useWallet();
  const { profile } = useProfile();
  const { xlmBalance, usdcBalance } = useBalances(address);
  const { workspaces, loading: loadingWorkspaces, joinRequests, setActiveWorkspaceId } = useWorkspace();

  const isAdmin = profile?.role?.toLowerCase() === "admin";

  // Reordering state
  const [orderedWorkspaces, setOrderedWorkspaces] = useState<HookWorkspace[]>([]);
  const [hasCustomOrder, setHasCustomOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Search & view mode
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Global Bounties in Alliances
  const [showBounties, setShowBounties] = useState(false);
  const [bounties, setBounties] = useState<GlobalBounty[]>([]);
  const [loadingBounties, setLoadingBounties] = useState(false);

  const [addressCopied, setAddressCopied] = useState(false);

  // Load view mode preference
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_VIEW_KEY);
      if (savedView === "list" || savedView === "grid") {
        setViewMode(savedView);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize ordered workspaces from localStorage
  useEffect(() => {
    if (!workspaces || workspaces.length === 0) {
      setOrderedWorkspaces([]);
      return;
    }

    try {
      const rawSavedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
      if (rawSavedOrder) {
        const savedIds: string[] = JSON.parse(rawSavedOrder);
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          const map = new Map(workspaces.map((w) => [w.id, w]));
          const sorted: HookWorkspace[] = [];

          // Put saved in order
          for (const id of savedIds) {
            const ws = map.get(id);
            if (ws) {
              sorted.push(ws);
              map.delete(id);
            }
          }
          // Append any remaining newly created ones
          for (const ws of map.values()) {
            sorted.push(ws);
          }

          setOrderedWorkspaces(sorted);
          setHasCustomOrder(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not parse saved workspace order", e);
    }

    setOrderedWorkspaces(workspaces);
    setHasCustomOrder(false);
  }, [workspaces]);

  const handleToggleView = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, mode);
    } catch {
      // ignore
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (searchQuery.trim() !== "") return; // Disable drag while searching
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...orderedWorkspaces];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setOrderedWorkspaces(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setHasCustomOrder(true);

    try {
      const ids = updated.map((w) => w.id);
      localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(ids));
      toast.success("Nuevo orden de espacios guardado");
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleResetOrder = () => {
    try {
      localStorage.removeItem(STORAGE_ORDER_KEY);
    } catch {
      // ignore
    }
    setOrderedWorkspaces([...workspaces]);
    setHasCustomOrder(false);
    toast.info("Orden restablecido por defecto");
  };

  // Filter by search
  const visibleWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return orderedWorkspaces;
    const q = searchQuery.toLowerCase();
    return orderedWorkspaces.filter(
      (ws) =>
        ws.name?.toLowerCase().includes(q) ||
        ws.description?.toLowerCase().includes(q) ||
        ws.slug?.toLowerCase().includes(q)
    );
  }, [orderedWorkspaces, searchQuery]);

  const enterWorkspace = (ws: HookWorkspace) => {
    setActiveWorkspaceId(ws.id);
    router.push("/app");
  };

  const loadBounties = async () => {
    if (bounties.length > 0) {
      setShowBounties(true);
      return;
    }
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
  const reputationLabel =
    auraScore >= 1000
      ? "Diamond"
      : auraScore >= 500
      ? "Gold"
      : auraScore >= 100
      ? "Silver"
      : "Bronze";
  const reputationColor =
    auraScore >= 1000
      ? "text-cyan-300"
      : auraScore >= 500
      ? "text-yellow-400"
      : auraScore >= 100
      ? "text-slate-300"
      : "text-amber-600";

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-6 relative overflow-hidden text-foreground">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* ────────────────── HEADER IDENTIDAD GLOBAL ────────────────── */}
      <div className="w-full flex items-center justify-between z-10 max-w-7xl mx-auto py-3 gap-4 flex-wrap border-b border-border-subtle/50 pb-4 mb-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-accent-teal/10 rounded-xl flex items-center justify-center border border-accent-teal/30 shadow-[0_0_15px_rgba(0,242,255,0.15)]">
            <svg className="w-5 h-5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">ReWork</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-muted hidden sm:block">Portal de Espacios y Red Global</p>
          </div>
        </div>

        {/* Identidad + Patrimonio */}
        {connected && (
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {/* AURA Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl backdrop-blur-sm">
              <Hexagon className="w-4 h-4 text-accent-teal" />
              <span className="text-xs font-mono font-bold">
                AURA <span className={reputationColor}>{reputationLabel}</span>
              </span>
              <span className="text-xs text-muted">{auraScore.toLocaleString()} pts</span>
            </div>

            {/* Balances */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl backdrop-blur-sm">
              <span className="text-xs font-mono text-muted">XLM</span>
              <span className="text-xs font-bold">{xlmBalance ?? "—"}</span>
              <span className="text-border-subtle">|</span>
              <span className="text-xs font-mono text-muted">USDC</span>
              <span className="text-xs font-bold text-accent-teal">{usdcBalance ?? "—"}</span>
            </div>

            {/* Wallet address */}
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border-subtle rounded-xl hover:bg-foreground/10 transition-colors backdrop-blur-sm"
              title="Copiar dirección"
            >
              {addressCopied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted" />
              )}
              <span className="text-xs font-mono text-muted">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-bold text-muted hover:text-foreground shrink-0"
          >
            {language === "es" ? "ES" : "EN"}
          </button>
          <Link
            href="/logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10 border border-border-subtle transition-colors text-xs font-medium shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>{t.workspacesPage.logout}</span>
          </Link>
        </div>
      </div>

      {/* ────────────────── MAIN CONTAINER ────────────────── */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col z-10 py-2">
        {/* Título y Subtítulo compacto */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {t.workspacesPage.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal via-cyan-400 to-blue-500">
                ReWork
              </span>
            </h1>
            <p className="text-muted text-sm max-w-2xl mt-1">
              {t.workspacesPage.subtitle}
            </p>
          </div>

          {/* Barra de herramientas: Búsqueda, Vista (Grid/Lista) y Drag Info */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Buscador */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar espacio..."
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-foreground/5 border border-border-subtle focus:border-accent-teal/50 focus:outline-none focus:ring-1 focus:ring-accent-teal/30 transition-all text-foreground placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Grid / Lista */}
            <div className="flex items-center p-0.5 rounded-xl bg-foreground/5 border border-border-subtle">
              <button
                onClick={() => handleToggleView("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-accent-teal/20 text-accent-teal shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                title="Vista Cuadrícula compacta"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleView("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-accent-teal/20 text-accent-teal shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                title="Vista Lista densa (sin scroll)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Botón restablecer orden personalizado si existe */}
            {hasCustomOrder && (
              <button
                onClick={handleResetOrder}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted hover:text-accent-teal bg-foreground/5 hover:bg-foreground/10 border border-border-subtle rounded-xl transition-all"
                title="Restablecer orden inicial"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* ── SECCIÓN: INVITACIONES PENDIENTES ── */}
        {joinRequests.some((r) => r.status === "pending") && (
          <div className="mb-6 animate-in slide-in-from-left-4 duration-500">
            <h2 className="text-xs font-bold text-accent-teal uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Solicitudes Pendientes
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {joinRequests
                .filter((r) => r.status === "pending")
                .map((req) => (
                  <div
                    key={req.id}
                    className="glass-card p-3 rounded-xl border border-accent-teal/30 bg-accent-teal/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Esperando respuesta de {req.workspace_name}
                      </p>
                      <p className="text-[11px] text-muted">Tu AURA está siendo evaluada.</p>
                    </div>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-teal/70" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── SECCIÓN PRINCIPAL: MIS ESPACIOS (Con Drag & Drop y Sin Scroll) ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-accent-teal" /> Mis Espacios de Trabajo
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-foreground/5 border border-border-subtle text-muted">
                {visibleWorkspaces.length} {visibleWorkspaces.length === 1 ? "espacio" : "espacios"}
              </span>
            </div>

            <p className="text-[11px] text-muted hidden md:flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-accent-teal/70" />
              Arrastra y suelta para reordenar a tu gusto
            </p>
          </div>

          {loadingWorkspaces ? (
            <div className="glass-card p-12 rounded-2xl border border-border-subtle flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
              <p className="text-xs text-muted font-mono">Cargando tus entornos...</p>
            </div>
          ) : visibleWorkspaces.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-border-subtle text-center">
              <p className="text-muted text-sm mb-3">
                {searchQuery ? "No se encontraron espacios con ese criterio." : t.workspacesPage.noOwnWorkspace}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-accent-teal hover:underline inline-flex items-center gap-1"
                >
                  Limpiar búsqueda
                </button>
              ) : (
                <button className="text-xs font-bold text-accent-teal hover:underline inline-flex items-center gap-1">
                  {t.workspacesPage.createWorkspace} <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* ────────────────── VISTA CUADRÍCULA COMPACTA (2 A 3 COLUMNAS) ────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleWorkspaces.map((ws, index) => {
                const isDraggingThis = draggedIndex === index;
                const isOverThis = dragOverIndex === index;

                return (
                  <div
                    key={ws.id}
                    draggable={!searchQuery}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => enterWorkspace(ws)}
                    className={`glass-card p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden flex flex-col cursor-pointer select-none ${
                      isDraggingThis
                        ? "opacity-40 scale-95 border-dashed border-accent-teal"
                        : isOverThis
                        ? "ring-2 ring-accent-teal/70 border-accent-teal bg-accent-teal/10 scale-[1.02] shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                        : "border-border-subtle hover:border-accent-teal/50 hover:shadow-[0_4px_24px_rgba(0,242,255,0.08)] hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Glowing corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent-teal/15 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125"></div>

                    {/* Top Row: Drag Handle + Logo + Role/Showcase Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3.5 relative z-10">
                      <div className="flex items-center gap-2.5">
                        {/* Drag Handle */}
                        <div
                          className="p-1 -ml-1 text-muted/40 hover:text-accent-teal group-hover:text-muted cursor-grab active:cursor-grabbing transition-colors"
                          title="Arrastrar para reordenar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Logo / Avatar */}
                        <div className="w-11 h-11 bg-background/80 border border-border-subtle rounded-xl flex items-center justify-center shadow-inner group-hover:border-accent-teal/40 transition-colors overflow-hidden shrink-0">
                          {ws.logo_url ? (
                            <img src={ws.logo_url} alt={ws.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-foreground/80 group-hover:text-accent-teal transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Badges & Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {(ws.slug === "rework" ||
                          ws.slug === "rework-global" ||
                          ws.name?.toLowerCase().includes("rework")) && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-accent-teal border border-accent-teal/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Showcase
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            ws.userRole === "owner"
                              ? "bg-accent-teal/10 border-accent-teal/30 text-accent-teal"
                              : ws.userRole === "admin"
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                              : "bg-foreground/5 border-border-subtle text-muted"
                          }`}
                        >
                          {ws.userRole === "owner"
                            ? "Host"
                            : ws.userRole === "admin"
                            ? "Admin"
                            : ws.userRole || "Miembro"}
                        </span>

                        {(isAdmin ||
                          (ws.is_premium && (ws.userRole === "admin" || ws.userRole === "owner"))) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/app/admin");
                            }}
                            className="p-1.5 rounded-lg bg-foreground/5 border border-border-subtle hover:bg-accent-teal/10 hover:text-accent-teal transition-all"
                            title="Configuración"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="relative z-10 flex-1 flex flex-col mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold group-hover:text-accent-teal transition-colors truncate">
                          {ws.name}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-accent-teal opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      <p className="text-muted text-xs line-clamp-2 mt-1 leading-relaxed">
                        {ws.description || t.workspacesPage.privateDesc}
                      </p>
                    </div>

                    {/* Bottom: Metrics & Enter Tag */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted border-t border-border-subtle/60 pt-3 relative z-10 mt-auto">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-muted/70" /> {ws.member_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hexagon className="w-3.5 h-3.5 text-accent-teal/70" /> {ws.squad_count || 0} Squads
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-accent-teal group-hover:underline">
                        Acceder →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ────────────────── VISTA LISTA DENSA (SÚPER COMPACTA) ────────────────── */
            <div className="flex flex-col gap-2">
              {visibleWorkspaces.map((ws, index) => {
                const isDraggingThis = draggedIndex === index;
                const isOverThis = dragOverIndex === index;

                return (
                  <div
                    key={ws.id}
                    draggable={!searchQuery}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => enterWorkspace(ws)}
                    className={`glass-card px-4 py-3 rounded-xl border transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isDraggingThis
                        ? "opacity-40 scale-98 border-dashed border-accent-teal"
                        : isOverThis
                        ? "ring-2 ring-accent-teal/70 border-accent-teal bg-accent-teal/10 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                        : "border-border-subtle hover:border-accent-teal/40 hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {/* Left: Drag handle + Logo + Name + Description */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="text-muted/40 hover:text-accent-teal group-hover:text-muted cursor-grab active:cursor-grabbing shrink-0"
                        title="Arrastrar para reordenar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="w-8 h-8 bg-background border border-border-subtle rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {ws.logo_url ? (
                          <img src={ws.logo_url} alt={ws.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-foreground/80 group-hover:text-accent-teal transition-colors" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate group-hover:text-accent-teal transition-colors">
                            {ws.name}
                          </span>
                          {(ws.slug === "rework" ||
                            ws.slug === "rework-global" ||
                            ws.name?.toLowerCase().includes("rework")) && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-accent-teal border border-accent-teal/30 shrink-0">
                              ⭐ Showcase
                            </span>
                          )}
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-foreground/5 border border-border-subtle text-muted shrink-0 hidden sm:inline">
                            {ws.userRole || "Colaborador"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted truncate hidden md:block">
                          {ws.description || t.workspacesPage.privateDesc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Metrics + Action */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {ws.member_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hexagon className="w-3.5 h-3.5 text-accent-teal" /> {ws.squad_count || 0}
                        </span>
                      </div>

                      <button className="flex items-center gap-1 text-xs font-bold text-accent-teal bg-accent-teal/10 hover:bg-accent-teal/20 px-3 py-1.5 rounded-xl border border-accent-teal/30 transition-all">
                        Entrar <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SECCIÓN HORIZONTAL INFERIOR: ALIANZAS Y RED GLOBAL (Compacta y Balanceada) ── */}
        <div className="glass-card rounded-2xl border border-border-subtle p-5 relative overflow-hidden bg-gradient-to-r from-purple-500/[0.06] via-transparent to-blue-500/[0.06]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {t.workspacesPage.alliances}: {t.workspacesPage.globalNetwork}
                  </h3>
                  <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {t.workspacesPage.communityDAO}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5 max-w-xl">
                  {t.workspacesPage.daoDesc} Tu AURA y reputación profesional son válidas en toda la red.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Botón para ver bounties globales */}
              <button
                onClick={() => (showBounties ? setShowBounties(false) : loadBounties())}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-xs font-bold text-purple-300"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{showBounties ? t.workspacesPage.bountiesHide : t.workspacesPage.bountiesShow}</span>
                {loadingBounties ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${showBounties ? "rotate-90" : ""}`}
                  />
                )}
              </button>

              {/* Botón para explorar alianzas */}
              <Link
                href="/workspaces/alliances"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border-subtle hover:border-purple-400/40 text-xs font-bold text-foreground hover:text-purple-300 transition-all"
              >
                <span>{t.workspacesPage.exploreAlliances}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Lista de Bounties Desplegable */}
          {showBounties && (
            <div className="mt-4 pt-4 border-t border-border-subtle/60 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-2">
                <span>Misiones y Bounties Activos en la Red</span>
                <Link
                  href="/app/squad-goals"
                  className="text-[11px] text-muted hover:text-purple-300 transition-colors"
                >
                  {t.workspacesPage.viewAllMissions} →
                </Link>
              </div>
              {bounties.length === 0 ? (
                <p className="text-xs text-muted text-center py-2">{t.workspacesPage.noBounties}</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {bounties.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-foreground/5 rounded-xl border border-border-subtle flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{b.title}</p>
                        <p className="text-[10px] text-muted truncate">{b.description}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono font-bold text-accent-teal bg-accent-teal/10 border border-accent-teal/20 px-2 py-0.5 rounded-full">
                        {b.reward_usdc} USDC
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
