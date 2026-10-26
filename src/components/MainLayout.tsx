"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSidebarCollapsed } = useSettings();
    const pathname = usePathname();
    const router = useRouter();
    const { profile, loading: profileLoading } = useProfile();
    const { ready, authenticated } = usePrivy();

    const isAppRoute = pathname.startsWith("/app");
    const isDeckRoute = pathname.startsWith("/deck");

    const isAuthenticated = authenticated || !!profile;
    const isLoading = !ready || profileLoading;

    useEffect(() => {
        if (isAppRoute && !isLoading && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isAppRoute, isLoading, isAuthenticated, router]);

    if (isAppRoute && (isLoading || !isAuthenticated)) {
        return (
            <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background gap-3">
                <Loader2 className="w-6 h-6 text-accent-teal animate-spin" />
                <p className="text-xs text-muted font-medium">Cargando espacio de trabajo...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] h-screen overflow-hidden bg-background">
            {isAppRoute && (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}
            <main
                id="main-scroll-container"
                className={`flex-1 min-w-0 transition-all duration-200 ease-out ${
                    isDeckRoute ? "overflow-hidden h-full" : "overflow-y-auto overflow-x-hidden"
                } bg-background custom-scrollbar relative ${
                    !isAppRoute ? "" : isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
                }`}
            >
                {isAppRoute && (
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                )}
                <div className={!isAppRoute ? (isDeckRoute ? "h-full" : "") : "px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
