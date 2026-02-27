"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, TrendingUp, ShoppingBag, Trophy, LifeBuoy } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Inicio", href: "/", icon: Home },
        { name: "Capacitación", href: "/capacitacion", icon: Lightbulb },
        { name: "Colectas", href: "/colectas", icon: TrendingUp },
        { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
        { name: "Ranking", href: "/ranking", icon: Trophy },
        { name: "Help Desk", href: "/helpdesk", icon: LifeBuoy },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen fixed">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tighter">
                    Re<span className="text-[#13ec5b]">Work</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-[#13ec5b]/10 text-[#13ec5b]"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-white/5">
                <h3 className="font-semibold text-sm mb-1">¡Publicidad Disponible!</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                    Impulsa tu marca aquí y llega a miles de colaboradores.
                </p>
                <button className="mt-4 w-full text-xs font-semibold py-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition text-white">
                    Quick Swap
                </button>
            </div>
        </aside>
    );
}
