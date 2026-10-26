"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Lightbulb,
    TrendingUp,
    ShoppingBag,
    Users,
    LifeBuoy,
    Target,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Shield,
    Compass,
    Briefcase,
    ChevronDown,
    Plus,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ReWorkIcon } from "@/components/ReWorkLogo";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { connected, connect } = useWallet();
    const { authenticated, user: privyUser, login: privyLogin } = usePrivy();
    const { profile, loading } = useProfile();
    const { t, language, isSidebarCollapsed, toggleSidebar } = useSettings();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const isUserAuthenticated = connected || authenticated || !!profile?.first_name;

    const firstName =
        profile?.first_name ||
        privyUser?.google?.name?.split(" ")[0] ||
        privyUser?.email?.address?.split("@")[0] ||
        t.profile.title;
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = firstName ? firstName.charAt(0).toUpperCase() : "U";
    const role = profile?.role || t.profile.role;

    const navGroups = [
        {
            label: language === "es" ? "Operaciones" : "Operations",
            items: [
                { name: language === "es" ? "Resumen del Espacio" : t.nav.dashboard, href: "/app", icon: Home },
                { name: t.nav.squadGoals, href: "/app/squad-goals", icon: Target },
                { name: language === "es" ? "Objetivos y DeFi" : (t.nav.goals || "Goals"), href: "/app/goals", icon: Compass },
                { name: t.nav.crowdfunding, href: "/app/crowdfunding", icon: TrendingUp },
            ],
        },
        {
            label: language === "es" ? "Red y Mercado" : "Network & Market",
            items: [
                { name: t.nav.servicesNetwork || "Red de Servicios", href: "/app/global-network", icon: Briefcase },
                { name: t.nav.marketplace, href: "/app/marketplace", icon: ShoppingBag },
                { name: t.nav.people, href: "/app/teams", icon: Users },
            ],
        },
        {
            label: language === "es" ? "Cuenta" : "Account",
            items: [
                { name: t.nav.web3Identity || (language === "es" ? "Identidad y Wallets" : "Identity"), href: "/app/web3-identity", icon: ShieldCheck },
                { name: t.nav.learning, href: "/app/learn", icon: Lightbulb },
                { name: t.nav.helpDesk, href: "/app/help-desk", icon: LifeBuoy },
            ],
        },
    ];

    const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                fixed top-0 left-0 z-50 h-screen w-full bg-[#0c0e14] border-r border-border-subtle flex flex-col transition-all duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                ${isSidebarCollapsed ? "lg:w-20" : "lg:w-60"}
            `}
            >
                {/* Brand Header */}
                <div
                    className={`flex items-center relative transition-all duration-300 ${
                        isSidebarCollapsed ? "justify-center py-5" : "justify-between px-5 py-5"
                    }`}
                >
                    <Link
                        href="/workspaces"
                        className={`flex items-center overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed ? "justify-center w-full" : "gap-2.5"
                        }`}
                    >
                        <div className="w-8 h-8 bg-accent-teal/10 rounded-lg border border-accent-teal/25 flex items-center justify-center flex-shrink-0">
                            <ReWorkIcon className="w-4 h-4" theme="cyan" />
                        </div>
                        <span
                            className={`text-lg font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed ? "hidden opacity-0 w-0" : "block w-auto opacity-100 text-foreground"
                            }`}
                        >
                            re<span className="text-accent-teal">work</span>
                        </span>
                    </Link>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-card hover:bg-foreground/10 text-muted hover:text-foreground items-center justify-center rounded-full border border-border-subtle shadow-sm transition-colors z-50 cursor-pointer"
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronLeft className="w-3.5 h-3.5" />
                        )}
                    </button>

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 text-muted hover:text-foreground relative z-10"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Workspace Selector */}
                <div className={`px-3 mb-3 transition-all duration-300 ${isSidebarCollapsed ? "lg:px-2" : ""}`}>
                    <div className="relative">
                        <button
                            onClick={() => !isSidebarCollapsed && setIsWorkspaceOpen(!isWorkspaceOpen)}
                            className={`w-full flex items-center bg-foreground/[0.03] border border-border-subtle rounded-lg hover:bg-foreground/[0.06] transition-all overflow-hidden cursor-pointer ${
                                isSidebarCollapsed ? "justify-center p-2" : "px-3 py-2 gap-2.5"
                            }`}
                        >
                            <div className="w-7 h-7 rounded-md bg-accent-teal/15 border border-accent-teal/25 flex items-center justify-center flex-shrink-0">
                                {activeWorkspace?.logo_url ? (
                                    <img
                                        src={activeWorkspace.logo_url}
                                        alt=""
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <span className="text-accent-teal font-bold text-xs">
                                        {activeWorkspace?.name?.charAt(0) || "W"}
                                    </span>
                                )}
                            </div>
                            {!isSidebarCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-xs font-semibold truncate text-foreground">
                                            {activeWorkspace?.name ||
                                                (language === "es" ? "Seleccionar..." : "Select...")}
                                        </p>
                                        <p className="text-[10px] text-muted truncate leading-none mt-0.5">
                                            {language === "es" ? "Espacio activo" : "Active workspace"}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 text-muted transition-transform ${
                                            isWorkspaceOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isWorkspaceOpen && !isSidebarCollapsed && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border-subtle rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted border-b border-border-subtle mb-1">
                                    {language === "es" ? "Cambiar de espacio" : "Switch workspace"}
                                </p>
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws.id}
                                        onClick={() => {
                                            setActiveWorkspaceId(ws.id);
                                            setIsWorkspaceOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/5 transition-colors cursor-pointer ${
                                            activeWorkspace?.id === ws.id
                                                ? "bg-accent-teal/10 text-accent-teal"
                                                : "text-foreground"
                                        }`}
                                    >
                                        <div className="w-6 h-6 rounded-md bg-foreground/5 border border-border-subtle flex items-center justify-center flex-shrink-0">
                                            {ws.logo_url ? (
                                                <img
                                                    src={ws.logo_url}
                                                    alt=""
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            ) : (
                                                <span className="font-bold text-[10px]">{ws.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium truncate">{ws.name}</span>
                                    </button>
                                ))}
                                <div className="border-t border-border-subtle mt-1 pt-1">
                                    <Link
                                        href="/workspaces"
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                                        onClick={() => setIsWorkspaceOpen(false)}
                                    >
                                        <div className="w-6 h-6 rounded-md bg-foreground/5 border border-dashed border-border-subtle flex items-center justify-center flex-shrink-0">
                                            <Plus className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-medium">
                                            {language === "es" ? "Ver todos los espacios" : "All workspaces"}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grouped Navigation */}
                <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar">
                    {(profile?.role?.toLowerCase() === "admin" ||
                        (activeWorkspace?.is_premium &&
                            (activeWorkspace?.userRole === "admin" || activeWorkspace?.userRole === "owner"))) && (
                        <div>
                            <Link
                                href="/app/admin"
                                onClick={onClose}
                                className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                                    pathname === "/app/admin"
                                        ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                                        : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                                } ${
                                    isSidebarCollapsed
                                        ? "p-2.5 lg:justify-center"
                                        : "px-3 py-2 gap-2.5"
                                }`}
                            >
                                <Shield
                                    className={`w-4 h-4 flex-shrink-0 ${
                                        pathname.includes("/admin") ? "text-accent-teal" : "text-muted"
                                    }`}
                                />
                                {!isSidebarCollapsed && (
                                    <span className="truncate">
                                        {language === "es" ? "Administración" : "Admin Panel"}
                                    </span>
                                )}
                            </Link>
                        </div>
                    )}

                    {navGroups.map((group) => (
                        <div key={group.label} className="space-y-0.5">
                            {!isSidebarCollapsed && (
                                <p className="px-3 pb-1 text-[10px] font-semibold text-muted/70 uppercase tracking-wider">
                                    {group.label}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        title={isSidebarCollapsed ? item.name : undefined}
                                        className={`flex items-center rounded-lg text-[13px] transition-all group ${
                                            isActive
                                                ? "text-foreground font-semibold bg-foreground/[0.06] border border-border-subtle"
                                                : "text-muted font-medium hover:text-foreground hover:bg-foreground/[0.03] border border-transparent"
                                        } ${
                                            isSidebarCollapsed
                                                ? "p-2.5 lg:justify-center"
                                                : "px-3 py-2 gap-2.5"
                                        }`}
                                    >
                                        <Icon
                                            className={`w-4 h-4 flex-shrink-0 ${
                                                isActive
                                                    ? "text-accent-teal"
                                                    : "text-muted group-hover:text-foreground"
                                            }`}
                                        />
                                        {!isSidebarCollapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom User / Auth Card */}
                <div
                    className={`p-3 border-t border-border-subtle mt-auto transition-all duration-300 ${
                        isSidebarCollapsed ? "lg:px-2" : ""
                    }`}
                >
                    {isUserAuthenticated ? (
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className={`w-full text-left rounded-lg bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-border-subtle flex items-center transition-colors group cursor-pointer overflow-hidden ${
                                isSidebarCollapsed
                                    ? "p-2 lg:justify-center"
                                    : "px-3 py-2.5 gap-2.5"
                            }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-accent-teal/15 flex items-center justify-center border border-accent-teal/30 flex-shrink-0 overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-accent-teal text-xs">{initials}</span>
                                )}
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold truncate text-foreground">
                                        {loading ? "Cargando..." : fullName}
                                    </p>
                                    <p className="text-[11px] text-muted truncate">{role}</p>
                                </div>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => (privyLogin ? privyLogin() : connect())}
                            className={`w-full rounded-lg bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/25 text-accent-teal transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isSidebarCollapsed ? "p-2.5" : "px-3 py-2.5 text-xs font-semibold"
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            {!isSidebarCollapsed && <span>{t.common.connect}</span>}
                        </button>
                    )}
                </div>
            </aside>
            {isProfileModalOpen && (
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            )}
        </>
    );
}
