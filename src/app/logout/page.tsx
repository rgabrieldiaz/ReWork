"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import { LogOut, ShieldCheck } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { disconnect } = useFreighter();

  useEffect(() => {
    // 1. Ejecutar desconexión de Wallet y Contextos
    disconnect();
    
    // 2. Limpiar Storage local excepto cosas puramente estéticas si se desea
    localStorage.removeItem("rework_current_workspace");
    
    // 3. Redirigir al Bridge (Auth) tras 2.5 segundos para mostrar el mensaje
    const timer = setTimeout(() => {
      router.push("/auth");
    }, 2500);

    return () => clearTimeout(timer);
  }, [disconnect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-teal/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="glass-card p-10 rounded-3xl max-w-lg w-full text-center border border-border-subtle relative z-10 shadow-2xl">
        <div className="w-20 h-20 bg-foreground/5 border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
          <LogOut className="w-10 h-10 text-foreground" />
          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1">
             <ShieldCheck className="w-6 h-6 text-accent-teal" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Cerrando Sesión Segura</h1>
        
        <p className="text-muted mb-8 leading-relaxed">
          Estamos desconectando tu billetera Stellar y limpiando tu entorno de trabajo. Tu Aura y tus datos organizacionales permanecen seguros Off-Chain y protegidos por Trustless Work.
        </p>

        <div className="flex flex-col items-center gap-3">
           <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent-teal animate-[loading_2.5s_ease-in-out_forwards]"></div>
           </div>
           <span className="text-xs text-muted uppercase tracking-widest font-bold">Redirigiendo al Bridge...</span>
        </div>
      </div>
    </div>
  );
}
