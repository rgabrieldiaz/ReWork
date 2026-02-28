"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, TrendingUp, ShoppingBag, Trophy, LifeBuoy } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";

export function Sidebar() {
    const pathname = usePathname();
    const { connected, address, connect } = useFreighter();
    const { profile, loading } = useProfile();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const firstName = profile?.first_name || "Usuario";
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : "U";
    const role = profile?.role || "Colaborador";

    const navItems = [
        { name: "Inicio", href: "/", icon: Home },
        { name: "Capacitación", href: "/capacitacion", icon: Lightbulb },
        { name: "Colectas", href: "/colectas", icon: TrendingUp },
        { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
        { name: "Ranking", href: "/ranking", icon: Trophy },
        { name: "Help Desk", href: "/helpdesk", icon: LifeBuoy },
    ];

    return (
        <aside className="w-64 bg-deep-navy border-r border-border-glass flex flex-col h-screen fixed z-50">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-deep-navy" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                            <path clipRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Re<span className="text-accent-teal">Work</span></span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive
                                ? "text-white bg-glass-white active-nav-border border border-border-glass/50"
                                : "text-slate-400 hover:text-white hover:bg-glass-white border border-transparent"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-accent-teal" : "text-slate-400 group-hover:text-white"}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-border-glass mt-auto">
                {connected ? (
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-full text-left glass-card p-4 flex items-center gap-3 hover:bg-glass-white hover:border-accent-teal/50 transition-colors group cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-accent-teal/30 flex-shrink-0 group-hover:border-accent-teal transition-colors overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-accent-teal text-sm">{initials}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-white">
                                {loading ? <span className="animate-pulse bg-slate-800 rounded w-20 h-4 block mb-1"></span> : fullName}
                            </p>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>
                    </button>
                ) : (
                    <div className="glass-card p-5 text-center relative overflow-hidden group">
                        {/* Background glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-accent-teal/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="w-12 h-12 mx-auto rounded-full bg-deep-navy/80 border border-accent-teal/20 flex items-center justify-center mb-3 relative z-10">
                            <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 relative z-10">Tu Perfil</h3>
                        <p className="text-xs text-slate-400 mb-4 px-1 relative z-10 leading-relaxed">
                            Conectá tu billetera para gestionar tu cuenta y ver tus recompensas.
                        </p>
                        <button
                            onClick={connect}
                            className="w-full py-2 bg-accent-teal/10 text-accent-teal hover:bg-accent-teal hover:text-deep-navy rounded-lg border border-accent-teal/20 transition-all text-xs font-bold uppercase tracking-widest relative z-10"
                        >
                            Conectar
                        </button>
                    </div>
                )}
            </div>

            {isProfileModalOpen && (
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            )}
        </aside>
    );
}
