import React from "react";
import Link from "next/link";
import { Shield, Lock, FileCheck, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function SeguridadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      {/* Background Orbs */}
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <Shield className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Arquitectura de Seguridad Null-Trust</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            ReWork utiliza Contratos Escrow Inteligentes (no custodiales) soportados por Trustless Work y la red de Stellar.
          </p>
        </div>

        <div className="space-y-8">
          
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle relative overflow-hidden group">
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0 border border-border-subtle group-hover:border-accent-teal/50 transition-colors">
                <Lock className="w-6 h-6 text-foreground group-hover:text-accent-teal transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Escrows Inteligentes y No Custodiales</h3>
                <p className="text-muted leading-relaxed mb-4">
                  Todo intercambio de valor monetario (USDC, XLM) entre usuarios corporativos o comunitarios opera bajo un smart contract (Escrow).
                  El dinero no es custodiado por ReWork ni por la empresa; los fondos viajan encriptados a un bóveda temporal en Stellar regida por Trustless Work.
                </p>
                <div className="bg-foreground/5 rounded-lg p-4 font-mono text-sm border border-border-subtle">
                  <span className="text-accent-teal">{"// Lógica Autoejecutable"}</span><br/>
                  <span className="text-muted">Si {`(Misión == Aprobada)`} {`{ Liberar Fondos a Wallet }`}</span><br/>
                  <span className="text-muted">Else if {`(Tiempo == Vencido)`} {`{ Devolver Fondos }`}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle relative overflow-hidden group">
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0 border border-border-subtle group-hover:border-accent-teal/50 transition-colors">
                <FileCheck className="w-6 h-6 text-foreground group-hover:text-accent-teal transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Micro-Fees de Red</h3>
                <p className="text-muted leading-relaxed">
                  Stellar provee un ecosistema extremadamente veloz capaz de soportar +1k transacciones por segundo garantizando comisiones que rondan los ~0.00001 XLM (menos de un centavo). Esto permite micropagos por recompensas de equipo sin ser devorados por fees transaccionales.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <Link href="/auth" className="inline-flex items-center gap-2 bg-foreground text-background font-bold py-3 px-8 rounded-full hover:bg-muted transition-colors">
            Crear Identidad <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
