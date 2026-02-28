"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 lg:ml-64 overflow-y-auto bg-deep-navy custom-scrollbar w-full relative">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
