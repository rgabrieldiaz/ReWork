"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSettings } from "@/hooks/useSettings";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSidebarCollapsed } = useSettings();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto bg-background custom-scrollbar w-full relative ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
