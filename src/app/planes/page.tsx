import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden pt-24 pb-16">
      {/* Background Orbs */}
      <PublicBackground />

      <PublicHeader />

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-accent-teal tracking-widest uppercase mb-2 block">Suscripción</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Escalabilidad Dinámica</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Sin bloqueos artificiales, pagá por el almacenamiento y complejidad de los contratos inteligentes que demande tu organización.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Gratuito */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative hover:border-accent-teal/30 transition-colors">
             <h3 className="text-2xl font-bold mb-2">Gratis</h3>
             <p className="text-muted text-sm mb-6 h-10">Exploradores de talento e identidades solitarias.</p>
             <div className="text-4xl font-bold mb-8">$0 <span className="text-lg text-muted font-normal">/mes</span></div>
             <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Perfil de Aura Inmutable</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Conexión a 1 Wallet Stellar</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Acceso a Comunidades DAOs</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Compras en Mercados Abiertos</li>
             </ul>
             <Link href="/auth" className="block w-full text-center py-3 rounded-xl border border-border-subtle font-bold hover:bg-foreground/5 transition-colors">
                Comenzar
             </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 rounded-3xl border border-accent-teal/50 relative shadow-[0_0_40px_rgba(0,242,255,0.1)] -translate-y-4">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-teal to-transparent opacity-50"></div>
             <span className="absolute top-4 right-4 text-[10px] font-bold text-black bg-accent-teal px-2 py-1 rounded-full uppercase tracking-wider">Popular</span>
             <h3 className="text-2xl font-bold mb-2">Pro</h3>
             <p className="text-muted text-sm mb-6 h-10">Compañías estructuradas buscando incentivos B2B.</p>
             <div className="text-4xl font-bold mb-8">$149 <span className="text-lg text-muted font-normal">/mes</span></div>
             <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Workspace Privado</li>
                <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Gestión hasta 50 Misiones/mes</li>
                <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Escrows Automatizados</li>
                <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-5 h-5 text-accent-teal flex-shrink-0" /> Analytics de Reputación</li>
             </ul>
             <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-accent-teal text-black font-bold hover:bg-accent-teal/90 transition-colors shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                Probar Entorno
             </Link>
          </div>

          {/* Enterprise */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative hover:border-purple-500/30 transition-colors">
             <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
             <p className="text-muted text-sm mb-6 h-10">Alianzas y ecosistemas descentralizados Masivos.</p>
             <div className="text-4xl font-bold mb-8">Custom</div>
             <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-purple-400 flex-shrink-0" /> Misiones y Escrows Ilimitados</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-purple-400 flex-shrink-0" /> Alianzas B2B habilitadas</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-purple-400 flex-shrink-0" /> Nodos de Infraestructura Dedicada</li>
                <li className="flex items-center gap-3 text-sm text-muted"><Check className="w-5 h-5 text-purple-400 flex-shrink-0" /> Soporte SLA 24/7</li>
             </ul>
             <a href="mailto:soporte@rework.com" className="block w-full text-center py-3 rounded-xl border border-border-subtle font-bold hover:bg-foreground/5 transition-colors">
                Contactar Ventas
             </a>
          </div>

        </div>
      </div>
    </div>
  );
}
