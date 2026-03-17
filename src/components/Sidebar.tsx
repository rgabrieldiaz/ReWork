"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, TrendingUp, ShoppingBag, Users, LifeBuoy, Target, ChevronLeft, ChevronRight, Globe, ShieldCheck, Shield } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ChevronDown, Plus } from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { connected, address, connect } = useFreighter();
    const { profile, loading } = useProfile();
    const { t, isSidebarCollapsed, toggleSidebar } = useSettings();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const firstName = profile?.first_name || t.profile.title;
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : "U";
    const role = profile?.role || t.profile.role;

    const navItems = [
        { name: t.nav.dashboard, href: "/app", icon: Home },
        { name: "Red Global", href: "/app/global-network", icon: Globe },
        { name: t.nav.squadGoals, href: "/app/squad-goals", icon: Target },
        { name: t.nav.crowdfunding, href: "/app/crowdfunding", icon: TrendingUp },
        { name: t.nav.marketplace, href: "/app/marketplace", icon: ShoppingBag },
        { name: t.nav.people, href: "/app/teams", icon: Users },
        { name: t.nav.learning, href: "/app/learn", icon: Lightbulb },
        { name: t.nav.helpDesk, href: "/app/help-desk", icon: LifeBuoy },
        { name: "Identidad", href: "/app/web3-identity", icon: ShieldCheck },
    ];

    const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-card/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-full bg-background border-r border-border-subtle flex flex-col transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
            `}>
                <div className={`flex items-center relative transition-all duration-300 ${isSidebarCollapsed ? 'justify-center py-8' : 'justify-between p-8'}`}>
                    <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                        <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                                <path clipRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'hidden opacity-0 w-0' : 'block w-auto opacity-100'}`}>
                            Re<span className="text-accent-teal">Work</span>
                        </span>
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-border-subtle hover:bg-muted text-foreground items-center justify-center rounded-full border border-border shadow-sm transition-colors z-50"
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 pr-0.5" />}
                    </button>

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-muted hover:text-foreground relative z-10"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Workspace Selector */}
                <div className={`px-4 mb-4 transition-all duration-300 ${isSidebarCollapsed ? 'lg:px-2' : ''}`}>
                    <div className="relative">
                        <button
                            onClick={() => !isSidebarCollapsed && setIsWorkspaceOpen(!isWorkspaceOpen)}
                            className={`w-full flex items-center bg-foreground/5 border border-border-subtle rounded-xl hover:bg-foreground/10 transition-all overflow-hidden ${isSidebarCollapsed ? 'justify-center p-2' : 'p-3 gap-3'}`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent-teal/20 border border-accent-teal/30 flex items-center justify-center flex-shrink-0">
                                {activeWorkspace?.logo_url ? (
                                    <img src={activeWorkspace.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span className="text-accent-teal font-bold text-xs">{activeWorkspace?.name?.charAt(0) || "W"}</span>
                                )}
                            </div>
                            {!isSidebarCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-bold truncate text-foreground">
                                            {activeWorkspace?.name || "Seleccionar..."}
                                        </p>
                                        <p className="text-[10px] text-muted uppercase tracking-widest font-semibold truncate leading-none mt-0.5">
                                            Workspace Activo
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isWorkspaceOpen && !isSidebarCollapsed && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border-subtle rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                <p className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border-subtle mb-1">
                                    Tus Entornos
                                </p>
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws.id}
                                        onClick={() => {
                                            setActiveWorkspaceId(ws.id);
                                            setIsWorkspaceOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors ${activeWorkspace?.id === ws.id ? 'bg-accent-teal/5 text-accent-teal' : 'text-foreground'}`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-muted/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
                                            {ws.logo_url ? (
                                                <img src={ws.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <span className="font-bold text-xs">{ws.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium truncate">{ws.name}</span>
                                    </button>
                                ))}
                                <div className="border-t border-border-subtle mt-1 pt-1">
                                    <Link
                                        href="/workspaces"
                                        className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                                        onClick={() => setIsWorkspaceOpen(false)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-muted/5 border border-dashed border-border-subtle flex items-center justify-center flex-shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Gestionar</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
                    {activeWorkspace?.is_premium && (activeWorkspace.userRole === 'admin' || activeWorkspace.userRole === 'owner') && (
                        <Link
                            href="/app/admin"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                pathname === '/app/admin'
                                    ? 'bg-accent-teal/10 text-accent-teal border-l-2 border-accent-teal'
                                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                            } ${isSidebarCollapsed ? 'px-4 lg:px-0 lg:justify-center' : 'px-4 gap-4'}`}
                        >
                            <Shield className={`w-5 h-5 flex-shrink-0 ${pathname.includes('/admin') ? "text-accent-teal" : "text-muted group-hover:text-accent-teal"}`} />
                            <span className={`font-bold whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>Panel Admin</span>
                        </Link>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center py-3 rounded-xl transition-all group overflow-hidden ${isActive
                                    ? "text-foreground bg-foreground/5 active-nav-border border border-border-subtle/50"
                                    : "text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent"
                                    } ${isSidebarCollapsed ? 'px-4 lg:px-0 lg:justify-center' : 'px-4 gap-4'}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-accent-teal" : "text-muted group-hover:text-foreground"}`} />
                                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-6 border-t border-border-subtle mt-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:px-2 lg:py-6' : ''}`}>
                    {connected ? (
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className={`w-full text-left glass-card flex items-center transition-colors group cursor-pointer overflow-hidden ${isSidebarCollapsed ? 'lg:p-2 lg:justify-center' : 'p-4 gap-3 hover:bg-foreground/5 hover:border-accent-teal/50'}`}
                        >
                            <div className={`w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center border border-accent-teal/30 flex-shrink-0 transition-colors overflow-hidden ${isSidebarCollapsed ? '' : 'group-hover:border-accent-teal'}`}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-accent-teal text-sm">{initials}</span>
                                )}
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                                <p className="text-sm font-semibold truncate text-foreground">
                                    {loading ? <span className="animate-pulse bg-muted/10 rounded w-20 h-4 block mb-1"></span> : fullName}
                                </p>
                                <p className="text-xs text-muted">{role}</p>
                            </div>
                        </button>
                    ) : (
                        <div className={`glass-card text-center relative overflow-hidden group transition-all duration-300 ${isSidebarCollapsed ? 'lg:p-2 cursor-pointer' : 'p-5'}`}
                            onClick={isSidebarCollapsed ? connect : undefined}>
                            {/* Background glow effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-accent-teal/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className={`mx-auto rounded-full bg-background/80 border border-accent-teal/20 flex items-center justify-center relative z-10 transition-all ${isSidebarCollapsed ? 'w-10 h-10 mb-0 group-hover:border-accent-teal' : 'w-12 h-12 mb-3'}`}>
                                <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:h-0' : 'w-auto opacity-100'}`}>
                                <h3 className="text-sm font-bold text-foreground mb-2 relative z-10">{t.profile.title}</h3>
                                <p className="text-xs text-muted mb-4 px-1 relative z-10 leading-relaxed">
                                    {t.profile.connectPrompt}
                                </p>
                                <button
                                    onClick={connect}
                                    className="w-full py-2 bg-accent-teal/10 text-accent-teal hover:bg-accent-teal hover:text-background rounded-lg border border-accent-teal/20 transition-all text-xs font-bold uppercase tracking-widest relative z-10"
                                >
                                    {t.common.connect}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
            {isProfileModalOpen && (
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            )}
        </>
    );
}
