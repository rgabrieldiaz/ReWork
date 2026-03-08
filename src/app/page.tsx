"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Zap, Building2, Users, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicBackground } from "@/components/PublicBackground";

export default function LandingPage() {
  const { t, language, setLanguage } = useSettings();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-teal/30 selection:text-accent-teal overflow-x-hidden">
      
      {/* Background Effects */}
      <PublicBackground />

      {/* Navigation */}
      <PublicHeader />

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border-subtle mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
            </span>
            <span className="text-xs font-mono font-medium text-muted">Stellar Network V2.0 Active</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-4xl text-balance leading-[1.1]">
            El valor de la confianza, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal via-cyan-400 to-blue-500">
              garantizado por código.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-2xl text-balance mb-12">
            La infraestructura donde la reputación es tu activo más valioso y los pagos en USDC se liberan automáticamente al cumplir objetivos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/auth" 
              className="px-8 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            >
              Comenzar mi Identidad
              <Zap className="w-5 h-5 text-accent-teal" />
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 glass-card border border-border-subtle hover:border-accent-teal/50 rounded-xl font-bold transition-all flex items-center justify-center hover:bg-foreground/5"
            >
              Explorar Infraestructura
            </a>
          </div>
        </section>

        {/* Features / Tech Pillars */}
        <section id="features" className="py-24 px-6 border-y border-border-subtle bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pilares de Confianza</h2>
              <p className="text-muted max-w-2xl mx-auto">Construido con tecnología blockchain de vanguardia para garantizar transparencia absoluta.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-accent-teal/30 transition-colors group">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pagos Automatizados</h3>
                <p className="text-muted leading-relaxed">
                  Contratos Escrow inteligentes (Trustless Work) que aseguran los fondos y los liberan instantáneamente solo cuando el trabajo es validado por la comunidad o líderes.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Identidad Soberana (AURA)</h3>
                  <p className="text-muted leading-relaxed">
                    Tu reputación profesional es inmutable y te pertenece. Acumulá AURA a través de colaboraciones exitosas y llévatela a cualquier ecosistema B2B.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-emerald-500/30 transition-colors group">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Eficiencia Stellar</h3>
                <p className="text-muted leading-relaxed">
                  Liquidaciones globales en segundos con fracciones de centavo en comisiones usando USDC nativo sobre la red Stellar. Pagos fronterizos sin fricción.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions: Who is this for? */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Para Quién es ReWork?</h2>
              <p className="text-muted max-w-2xl mx-auto">Un entorno dual diseñado para impulsar tanto a estructuras tradicionales como a nuevas formas organizacionales.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Empresas */}
              <div className="glass-card p-10 border border-border-subtle rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                <Building2 className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Corporaciones y PyMEs</h3>
                <p className="text-muted mb-8 leading-relaxed">
                  Moderniza la retención de talento mediante un ecosistema interno (Squad Goals) para incentivos, bonos garantizados por código y un mercado peer-to-peer exclusivo para tu equipo.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Retención de Talento', 'Bonos Transparentes', 'Marketplace Interno'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

               {/* Comunidades */}
               <div className="glass-card p-10 border border-border-subtle rounded-3xl relative overflow-hidden group">
                <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-accent-teal/10 blur-3xl rounded-full"></div>
                <Users className="w-10 h-10 text-accent-teal mb-6" />
                <h3 className="text-2xl font-bold mb-4">Comunidades y Alianzas (DAOs)</h3>
                <p className="text-muted mb-8 leading-relaxed">
                  Infraestructura perfecta para coordinar trabajo descentralizado, manejar presupuestos conjuntos (Treasury) y repartir pagos de recompensas (Bounties) de forma justa y trustless.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Gestión de Bounties', 'Tesorería Conjunta', 'Reputación Cross-Chain'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className="w-4 h-4 text-accent-teal" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 border-t border-border-subtle bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de Infraestructura</h2>
            <p className="text-muted max-w-2xl mx-auto mb-16">Elige el plan que se adapte a la escala de tu confianza.</p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              
              <div className="glass-card p-8 rounded-3xl border border-border-subtle">
                <h3 className="text-xl font-bold mb-2">Personal Identidad</h3>
                <p className="text-2xl font-mono font-bold mb-6">Gratis</p>
                <p className="text-sm text-muted mb-8">Para freelancers y profesionales independientes.</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Perfil AURA Universal</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Acceso a Workspaces Públicos</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Wallet Stellar integrada</li>
                </ul>
                <Link href="/auth" className="block w-full text-center py-3 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-bold text-sm">
                  Crear Identidad
                </Link>
              </div>

              <div className="glass-card p-8 rounded-3xl border-2 border-accent-teal relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-teal text-black text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Workspace Pro</h3>
                <p className="text-2xl font-mono font-bold mb-6">$99<span className="text-sm text-muted font-sans"> / mes</span></p>
                <p className="text-sm text-muted mb-8">Para PyMEs, Agencias y Comunidades DAO.</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Entorno Workspace Privado</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Marketplace P2P Interno</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Hasta 50 usuarios (AURA)</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Smart Contracts de Trustless Work</li>
                </ul>
                <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-accent-teal text-black hover:bg-accent-teal/90 transition-colors font-bold text-sm shadow-md">
                  Comenzar Prueba
                </Link>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-border-subtle">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-2xl font-mono font-bold mb-6">A Medida</p>
                <p className="text-sm text-muted mb-8">Corporaciones multinacionales y grandes alianzas.</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Usuarios ilimitados</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> API de Interoperabilidad</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Soporte Dedicado 24/7</li>
                  <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" /> Nodos Privados Stellar (Opcional)</li>
                </ul>
                <button className="block w-full text-center py-3 rounded-xl border border-border-subtle hover:bg-foreground/5 transition-colors font-bold text-sm">
                  Contactar Ventas
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/caracteristicas" className="hover:text-accent-teal transition-colors">Características</Link></li>
              <li><Link href="/seguridad" className="hover:text-accent-teal transition-colors">Seguridad</Link></li>
              <li><Link href="/planes" className="hover:text-accent-teal transition-colors">Planes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Desarrolladores</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-accent-teal transition-colors">Documentación API</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Stellar/Soroban Docs</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Trustless Work Repo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Compañía</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/sobre-nosotros" className="hover:text-accent-teal transition-colors">Sobre Nosotros</Link></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Carreras</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-accent-teal transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border-subtle text-sm text-muted">
          <p>© 2026 ReWork Decentralized Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Stellar Network: Operacional
          </div>
        </div>
      </footer>
    </div>
  );
}
