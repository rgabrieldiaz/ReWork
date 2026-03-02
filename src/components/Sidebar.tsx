"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, TrendingUp, ShoppingBag, Users, LifeBuoy, Target } from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { connected, address, connect } = useFreighter();
    const { profile, loading } = useProfile();
    const { t } = useSettings();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const firstName = profile?.first_name || t.profile.title;
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : "U";
    const role = profile?.role || t.profile.role;

    const navItems = [
        { name: t.nav.dashboard, href: "/", icon: Home },
        { name: t.nav.squadGoals, href: "/squad-goals", icon: Target },
        { name: t.nav.crowdfunding, href: "/colectas", icon: TrendingUp },
        { name: t.nav.marketplace, href: "/marketplace", icon: ShoppingBag },
        { name: t.nav.people, href: "/colaboradores", icon: Users },
        { name: t.nav.learning, href: "/capacitacion", icon: Lightbulb },
        { name: t.nav.helpDesk, href: "/helpdesk", icon: LifeBuoy },
    ];

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
                fixed top-0 left-0 z-50 h-screen w-full lg:w-64 bg-background border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                                <path clipRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Re<span className="text-accent-teal">Work</span></span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-muted hover:text-foreground"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? "text-foreground bg-foreground/5 active-nav-border border border-border-subtle/50"
                                    : "text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-accent-teal" : "text-muted group-hover:text-foreground"}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-border-subtle mt-auto">
                    {connected ? (
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full text-left glass-card p-4 flex items-center gap-3 hover:bg-foreground/5 hover:border-accent-teal/50 transition-colors group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center border border-accent-teal/30 flex-shrink-0 group-hover:border-accent-teal transition-colors overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-accent-teal text-sm">{initials}</span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate text-foreground">
                                    {loading ? <span className="animate-pulse bg-muted/10 rounded w-20 h-4 block mb-1"></span> : fullName}
                                </p>
                                <p className="text-xs text-muted">{role}</p>
                            </div>
                        </button>
                    ) : (
                        <div className="glass-card p-5 text-center relative overflow-hidden group">
                            {/* Background glow effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-accent-teal/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="w-12 h-12 mx-auto rounded-full bg-background/80 border border-accent-teal/20 flex items-center justify-center mb-3 relative z-10">
                                <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
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
                    )}
                </div>
            </aside>
            {isProfileModalOpen && (
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            )}
        </>
    );
}
