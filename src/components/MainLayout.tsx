"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSettings } from "@/hooks/useSettings";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSidebarCollapsed } = useSettings();
    const pathname = usePathname();

    const publicPaths = ["/", "/auth", "/workspaces", "/caracteristicas", "/seguridad", "/planes", "/sobre-nosotros", "/terminos-de-uso", "/privacidad", "/status", "/logout"];
    const isPublicRoute = publicPaths.includes(pathname) || pathname.startsWith("/join/");

    return (
        <div className="flex h-screen overflow-hidden">
            {!isPublicRoute && (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}
            <main id="main-scroll-container" className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto bg-background custom-scrollbar w-full relative ${
                isPublicRoute ? '' : (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')
            }`}>
                {!isPublicRoute && (
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                )}
                <div className={isPublicRoute ? "" : "p-4 sm:p-8"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
