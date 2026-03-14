"use client";

import React from "react";
import Link from "next/link";
import { Layers, Activity, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function CaracteristicasPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      {/* Background Orbs */}
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <Layers className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ecosistema ReWork</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Descubre las herramientas fundamentales que impulsan el talento descentralizado y los incentivos automatizados.
          </p>
        </div>

        <div className="space-y-8">
          
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle hover:border-accent-teal/30 transition-colors group">
            <h3 className="text-2xl font-bold mb-4 group-hover:text-accent-teal transition-colors flex items-center gap-3">
              <Activity className="w-6 h-6" /> Dashboard Global
            </h3>
            <p className="text-muted leading-relaxed mb-6">
              El panel de control actúa como tu hub financiero y laboral privado dentro del Workspace. Visualiza en tiempo real tu liquidez en billeteras Stellar (XLM y USDC), monitorea las subastas donde tienes pujas ganadoras, y examina las colectas de equipo. 
              Todo consolidado con gráficas dinámicas de Aura y el feed de actividad On-Chain, filtrado para asegurar la privacidad del tenant organizacional.
            </p>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle hover:border-accent-teal/30 transition-colors group">
            <h3 className="text-2xl font-bold mb-4 group-hover:text-accent-teal transition-colors flex items-center gap-3">
              <Layers className="w-6 h-6" /> Squad Goals y Autonomía
            </h3>
            <p className="text-muted leading-relaxed">
               Los equipos de trabajo horizontales (Squads) proponen sus propias misiones, recompensas y OKRs. El módulo de Squad Goals fomenta la verdadera autonomía: una vez aprobada una misión por la organización, el presupuesto Queda asegurado un Escrow de Trustless Work. Ningún manager puede revertir el pago arbitrariamente una vez que el equipo logre los hitos consensuados, dándole a los colaboradores la certidumbre técnica de pago que merecen.
            </p>
          </div>

        </div>

        <div className="mt-16 text-center">
          <Link href="/auth" className="inline-flex items-center gap-2 bg-foreground text-background font-bold py-3 px-8 rounded-full hover:bg-muted transition-colors">
            Unirse al Ecosistema <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
