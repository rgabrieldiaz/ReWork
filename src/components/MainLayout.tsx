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

    const isAppRoute = pathname.startsWith("/app");

    return (
        <div className="flex h-screen overflow-hidden">
            {isAppRoute && (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}
            <main id="main-scroll-container" className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto bg-background custom-scrollbar w-full relative ${
                !isAppRoute ? '' : (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')
            }`}>
                {isAppRoute && (
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                )}
                <div className={!isAppRoute ? "" : "p-4 sm:p-8"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
