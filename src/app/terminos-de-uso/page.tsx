"use client";

import React from "react";
import { Scale } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function TerminosDeUsoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <Scale className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Términos de Uso</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Las reglas del juego On-Chain aplicables al ecosistema descentralizado de ReWork.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle">
            <h3 className="text-2xl font-bold mb-4 text-foreground">1. Servicios Descentralizados (Non-Custodial)</h3>
            <p className="text-muted leading-relaxed mb-8">
              ReWork no retiene, custodia ni invierte los fondos de sus usuarios (XLM, USDC). Proveemos exclusivamente una infraestructura de software que compila los acuerdos entre las partes en Contratos Inteligentes tipo Escrow dentro de la red Stellar y Trustless Work, sujetos a validación de red autónoma.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">2. Naturaleza Inmutable de la Identidad AURA</h3>
            <p className="text-muted leading-relaxed mb-8">
               El registro de participación, el cumplimiento de Squad Goals, y las victorias en Subastas de Talento constituyen atributos registrados criptográficamente en la cuenta de cada usuario (su AURA). Las cancelaciones, penalizaciones o disputas perdidas también se almacenarán On-Chain, conformando un legajo incorruptible y público por diseño.
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">3. Disputas de Escrows</h3>
            <p className="text-muted leading-relaxed mb-8">
               Toda controversia donde las partes no logren consenso directo en la liberación y/o cancelación de un Smart Contract (Misión, Colecta) se resolverá de conformidad con el panel de votación/kleros delegados dictaminado por los estatutos del ecosistema Trustless Work; ReWork Inc. declina toda competencia corporativa sobre fallos ejecutivos arbitrales.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">4. Responsabilidades del Usuario</h3>
            <p className="text-muted leading-relaxed mb-8">
               Como participante de una arquitectura descentralizada, usted acepta la responsabilidad total sobre la custodia de sus credenciales (billeteras conectadas). ReWork no provee mecanismos centralizados de recuperación de contraseñas (como "Olvidé mi contraseña") para cuentas gestionadas por Web3 wallets. Asimismo, todo material (texto, imágenes) subido al Marketplace o a las misiones debe adherirse a normas de convivencia profesional y no violar propiedad intelectual de terceros. ReWork se reserva el derecho de desconectar Workspaces enteros de la UI en caso de abuso coordinado.
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">5. Tarifas y Micro-Fees de Red</h3>
            <p className="text-muted leading-relaxed mb-8">
               Si bien la creación de cuentas "AURA" es subsidiada inicialmente por ReWork a través de un servicio de Faucet (gas-less onboarding), el uso continuo e intensivo de transacciones puede requerir pequeñas tarifas (bases_fees) nativas de la red Stellar (típicamente fracciones de centavo). Adicionalmente, ciertas transacciones de compra en el mercado pueden incurrir en una comisión (take-rate) deducida automáticamente por el Smart Contract antes del desembolso al vendedor.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">6. Modificaciones al Protocolo</h3>
            <p className="text-muted leading-relaxed mb-8">
               El equipo de Core Developers se guarda la facultad de actualizar, parchar o migrar los repositorios de Smart Contracts subyacentes (Soroban) para tapar brechas de vulnerabilidad o mejorar la eficiencia (gas optimization). Las notificaciones de estas actualizaciones se realizarán a través de nuestra página de Status o anuncios directos. El uso continuado del Frontend implica la adaptación a dichos upgrades algorítmicos.
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
