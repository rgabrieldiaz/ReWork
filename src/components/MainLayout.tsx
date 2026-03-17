"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSidebarCollapsed } = useSettings();
    const pathname = usePathname();
    const router = useRouter();
    const { profile, loading } = useProfile();

    const isAppRoute = pathname.startsWith("/app");

    useEffect(() => {
        // Auth Guard: If it's an app route and we're not loading and there's no profile, redirect to auth
        if (isAppRoute && !loading && !profile) {
            router.push("/auth");
        }
    }, [isAppRoute, loading, profile, router]);

    // Show a global loader for app routes while checking authentication
    // to prevent unauthorized content flickering
    if (isAppRoute && (loading || !profile)) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-accent-teal/20 border-t-accent-teal rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-accent-teal animate-pulse" />
                    </div>
                </div>
                <p className="text-muted font-medium animate-pulse">Verificando identidad...</p>
            </div>
        );
    }

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
