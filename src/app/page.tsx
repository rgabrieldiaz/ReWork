import Image from "next/image";

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-8 custom-scrollbar">
        {/* BEGIN: Left Column - Active Contracts & Market */}
        <div className="col-span-12 xl:col-span-8 space-y-8">

          {/* BEGIN: Active Contract Card */}
          <section className="glass-card overflow-hidden p-6 relative group border border-accent-teal/10">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent-teal/10 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 className="text-xs font-bold text-accent-teal uppercase tracking-widest">Colecta Principal</h2>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">STATUS: IN PROGRESS • ENDS OCT 31</span>
            </div>

            <div className="mb-10">
              <h3 className="text-4xl font-bold mb-2">Expansión Regional Q4</h3>
              <p className="text-slate-400 max-w-lg">Ayudanos a financiar la apertura de nuestras nuevas oficinas en Córdoba y Rosario para el equipo comercial y desarrollo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
              <div>
                <p className="text-slate-400 text-sm mb-1">Objetivo de Recaudación</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold tracking-tighter">50,000</span>
                  <span className="text-accent-teal font-bold">XLM</span>
                </div>
                <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent-teal h-full w-[85%] glow-teal"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-mono">
                  <span className="text-slate-500">85% Completado</span>
                  <span className="text-accent-teal">+12% esta semana</span>
                </div>
              </div>
              <div className="md:border-l md:border-border-glass md:pl-12 flex flex-col justify-center">
                <p className="text-slate-400 text-sm mb-1">Tu Aporte Estimado</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold tracking-tighter">450</span>
                  <span className="text-accent-teal font-bold">XLM</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Ranking #12 de 240 contribuidores</p>
              </div>
            </div>

            {/* Smart Contract Preview (Mini) */}
            <div className="bg-[#050c14] rounded-2xl p-6 border border-border-glass font-mono text-xs hidden sm:block">
              <div className="flex items-center justify-between mb-4 border-b border-border-glass pb-4">
                <span className="text-slate-500">stellar_escrow_contract.rs</span>
                <span className="text-accent-teal bg-accent-teal/5 px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="space-y-1">
                <p><span className="text-purple-400">pub fn</span> <span className="text-yellow-300">release_funds</span>(env: Env) {'{'}</p>
                <p className="pl-4 text-slate-500">// Release conditions check</p>
                <p className="pl-4"><span className="text-pink-400">if</span> (target_reached &gt;= <span className="text-orange-400">50000</span>) &amp;&amp;</p>
                <p className="pl-4">(community_votes &gt; <span className="text-orange-400">90%</span>) {'{'}</p>
                <p className="pl-8"><span className="text-cyan-400">unlock_escrow_bounty</span>(&env);</p>
                <p className="pl-4">{'}'}</p>
                <p>{'}'}</p>
              </div>
            </div>
          </section>

          {/* BEGIN: Market Highlights */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Subastas Exclusivas</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-accent-teal text-deep-navy font-bold rounded-xl text-xs hover:bg-white transition-colors">TODO</button>
                <button className="px-4 py-2 bg-glass-white border border-border-glass text-slate-400 font-bold rounded-xl text-xs hover:text-white transition-colors">MERCH</button>
                <button className="px-4 py-2 bg-glass-white border border-border-glass text-slate-400 font-bold rounded-xl text-xs hover:text-white transition-colors">NFTS</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Item 1 */}
              <div className="glass-card group cursor-pointer overflow-hidden border-none relative h-72">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                {/* Fallback pattern gradient if image doesn't load */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-deep-navy -z-10"></div>
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-[10px] font-bold text-accent-teal bg-accent-teal/20 px-2 py-0.5 rounded tracking-widest uppercase mb-2 inline-block">Edición Limitada</span>
                  <h4 className="text-lg font-bold mb-4">Silla Gamer Ergonómica #04</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase">Oferta Actual</span>
                      <span className="font-mono text-accent-teal font-bold">2,400 PTS</span>
                    </div>
                    <button className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-accent-teal group-hover:text-deep-navy transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="glass-card group cursor-pointer overflow-hidden border-none relative h-72">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                {/* Fallback pattern gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-deep-navy -z-10"></div>
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/20 px-2 py-0.5 rounded tracking-widest uppercase mb-2 inline-block">Oficina Premium</span>
                  <h4 className="text-lg font-bold mb-4">Auriculares Noise Cancelling</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase">Comprar Ahora</span>
                      <span className="font-mono text-accent-teal font-bold">1,200 PTS</span>
                    </div>
                    <button className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-accent-teal group-hover:text-deep-navy transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BEGIN: Right Column - Swap Widget & Activity */}
        <div className="col-span-12 xl:col-span-4 space-y-8">

          {/* BEGIN: Swap Widget */}
          <section className="glass-card p-6 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Intercambio Rápido</h2>
              <button className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>
            </div>

            <div className="space-y-4 relative">
              {/* Pay Section */}
              <div className="bg-deep-navy/50 p-5 rounded-2xl border border-border-glass">
                <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
                  <span>ENTREGAS</span>
                  <span>BALANCE: 1,250 PTS</span>
                </div>
                <div className="flex items-center justify-between">
                  <input className="bg-transparent outline-none border-none p-0 text-3xl font-mono font-bold focus:ring-0 w-1/2 text-white" type="text" defaultValue="500" />
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700">
                    <div className="w-5 h-5 bg-accent-teal rounded-full flex items-center justify-center text-[10px] text-deep-navy font-bold">P</div>
                    <span className="font-bold text-sm">Puntos</span>
                  </div>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pt-1">
                <button className="w-10 h-10 bg-slate-800 border-4 border-deep-navy rounded-full flex items-center justify-center text-accent-teal hover:rotate-180 transition-transform duration-500 shadow-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                </button>
              </div>

              {/* Receive Section */}
              <div className="bg-deep-navy/50 p-5 rounded-2xl border border-border-glass">
                <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
                  <span>RECIBÍS</span>
                  <span className="text-accent-teal">100 Pts ≈ 5.208 XLM ↗</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-mono font-bold text-accent-teal">26.04</span>
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white">★</div>
                    <span className="font-bold text-sm tracking-widest">XLM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs font-mono text-slate-500 px-2">
              <div className="flex justify-between">
                <span>Fee de red (Stellar)</span>
                <span>0.00001 XLM</span>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-gradient-to-r from-accent-teal/20 to-accent-teal/40 border border-accent-teal/30 rounded-2xl font-bold flex items-center justify-center gap-4 group relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-20 bg-accent-teal flex items-center justify-center transition-transform duration-500 translate-x-0 group-hover:translate-x-full">
                <svg className="w-6 h-6 text-deep-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
              </div>
              <span className="uppercase tracking-[0.2em] text-accent-teal group-hover:text-white transition-colors">Confirmar Swap</span>
            </button>
          </section>

          {/* BEGIN: Live Activity */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Top Contribuidores</h2>
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="space-y-4">
              {/* Row 1 */}
              <div className="flex items-center gap-4 p-3 rounded-xl border border-accent-teal/20 bg-accent-teal/5">
                <div className="w-10 h-10 rounded-full bg-accent-teal text-deep-navy flex items-center justify-center font-bold text-xs">VOS</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Sesión Actual</span>
                    <span className="text-accent-teal font-mono">+500 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-teal h-full w-full"></div>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-glass-white transition-colors border border-transparent">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">SJ</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Sarah Jensen</span>
                    <span className="text-slate-400 font-mono">320 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-slate-600 h-full w-[45%]"></div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-glass-white transition-colors border border-transparent">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">MC</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Mike Chen</span>
                    <span className="text-slate-400 font-mono">210 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-slate-600 h-full w-[30%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 text-xs text-slate-500 hover:text-accent-teal transition-colors font-semibold uppercase tracking-widest">
              Ver los 120 contribuidores
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
