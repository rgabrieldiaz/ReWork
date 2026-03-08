import React from "react";
import { LockKeyhole } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";
import { PublicFooter } from "@/components/PublicFooter";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      <PublicBackground />
      
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-teal/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-teal/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
             <LockKeyhole className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Política de Privacidad</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Privacidad criptográfica On-Chain y manejo de datos Off-Chain.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-subtle">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Aislamiento de Workspaces</h3>
            <p className="text-muted leading-relaxed mb-8">
              En ReWork, la información táctica, financiera y estratégica de cada organización (Workspace) está encapsulada a nivel Row Level Security (RLS) en nuestra base de datos relacional híbrida. Los usuarios adyacentes de la plataforma sin invitaciones criptográficas o correos matriculados no pueden auditar ni visualizar las misiones internas de otras compañías.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">Soberanía de Claves (Keystore)</h3>
            <p className="text-muted leading-relaxed mb-8">
               ReWork jamás requiere las semillas maestras (Seed Phrases) o las llaves privadas de sus usuarios. Nos conectamos e inyectamos las transacciones a través de billeteras especializadas (como Freighter Wallet), garantizando transacciones y firmas locales dentro del dispositivo del usuario. Si un usuario pierde sus credenciales de wallet, ReWork no puede recuperar esos fondos.
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">Tracking Anónimo de Plataforma</h3>
            <p className="text-muted leading-relaxed mb-8">
               Solo recolectamos telemetría analítica anónima mínima (vistas de páginas y performance SSR) con el estricto propósito de mejorar el UI/UX y detectar latencias sin recolectar identificadores persistentes publicitarios. ReWork jamás venderá historiales de empleo y salarios brutos a terceros comerciales ni data brokers de recursos humanos.
            </p>

             <h3 className="text-2xl font-bold mb-4 text-foreground">Política de Cookies y Web Storage</h3>
            <p className="text-muted leading-relaxed mb-8">
               Utilizamos `LocalStorage` y `SessionStorage` del cliente estrictamente para sostener su sesión criptográfica activa (conexión con la Billetera) y guardar preferencias locales como Modo Oscuro o el Workspace seleccionado. No inyectamos third-party cookies de rastreo publicitario. Todo el estado sensible reside y muere en el contexto de vida del navegador.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">Cumplimiento de Normativas Múltiples</h3>
            <p className="text-muted leading-relaxed mb-8">
               Al proveer una solución B2B, entendemos la fricción entre la naturaleza pública de Blockchains y leyes como RGPD (Europa) o Leyes de Privacidad Regionales. ReWork orquesta esto asegurando que ningún PII (Personal Identifiable Information) como nombres legales, direcciones o correos residan On-Chain. La Blockchain solo almacena direcciones públicas alfanuméricas (ej: `GABC...XYZ`) y metadatos hasheados; todo nombre o alias humano reside seguro en la Base de Datos Off-Chain y puede ser enmascarado/borrado a petición.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-foreground">Retención y "Derecho al Olvido"</h3>
            <p className="text-muted leading-relaxed mb-8">
               Cualquier usuario o empresa posee la facultad de aplicar a la eliminación dura ("Hard Delete") de su registro Off-Chain mediante nuestros paneles de configuración. Sin embargo, por las leyes inherentes de la matemática criptográfica descentralizada, su huella (wallet pública y transferencias XLM ejecutadas) permanecerá inscripta en los nodos inmutables de la red Stellar de manera perpetua, dissociada permanentemente del perfil original en ReWork.
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
