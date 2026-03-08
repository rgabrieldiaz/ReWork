import React from "react";
import Link from "next/link";
import { UserCircle, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden pt-24 pb-16">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <UserCircle className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Nuestra Misión</h1>
          <p className="text-lg text-accent-teal max-w-2xl mx-auto leading-relaxed font-medium">
            Descentralizar la confianza laboral y devolverle el control del historial al talento.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle">
            <p className="text-muted leading-relaxed mb-6">
              El mercado laboral del futuro no dependerá ni de agencias intermediarias ni de monopolios de currículums. Creemos firmemente que la <strong>reputación es un activo inmutable</strong> y debe pertenecer a los individuos, no a las plataformas.
            </p>
            <p className="text-muted leading-relaxed mb-6">
               Para alcanzar esa visión, creamos <strong>Aura</strong>: la identidad soberana de ReWork. Tu Aura crece al cumplir compromisos, cobrar subastas y participar exitosamente en misiones colectivas dentro de tu Workspace. Debido a que las confirmaciones viajan On-Chain, tu perfil es un libro contable matemático irrefutable de que fuiste tú quien entregó el valor.
            </p>
            <p className="text-muted leading-relaxed">
              Combinamos las tecnologías de pagos eficientes de <strong>Stellar</strong> con la lógica arbitral humana de <strong>Trustless Work</strong> para proveer confianza programable entre personas y organizaciones que ni siquiera necesitan conocerse. Queremos un internet de oportunidades donde el trabajo hable y el código garantice tu recompensa.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/auth" className="inline-flex items-center gap-2 bg-foreground text-background font-bold py-3 px-8 rounded-full hover:bg-muted transition-colors">
            Forja tu Aura <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
