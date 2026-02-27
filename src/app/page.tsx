import { Users, Target, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Rendimiento Global</p>
              <h3 className="text-2xl font-bold mt-1">87%</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#13ec5b]/10 text-[#13ec5b] rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Objetivo Mensual</p>
              <h3 className="text-2xl font-bold mt-1">12,500 XLM</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Top Ranking</p>
              <h3 className="text-2xl font-bold mt-1">Juan Pérez</h3>
            </div>
          </div>
        </div>
      </section>

      <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 to-[#0a0a0a] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity blur-3xl rounded-full bg-[#13ec5b]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#13ec5b] mb-2 block">Sorteo Especial</span>
            <h2 className="text-3xl font-bold mb-2">Viaje a Abu Dabi 🇦🇪</h2>
            <p className="text-neutral-400 max-w-lg">Sorteo de entradas VIP para el GP de Fórmula 1 exclusivo para el Top 10 del Ranking de Contribuidores.</p>
          </div>
          <button className="px-6 py-3 bg-[#13ec5b] text-black font-semibold rounded-xl flex items-center gap-2 hover:bg-[#11cc4e] transition-colors whitespace-nowrap">
            Ver Requisitos <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            Subastas Destacadas
          </h3>
          <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-semibold text-lg">Silla Gamer Ergonómica</h4>
                <p className="text-sm text-neutral-500 mt-1">Publicado por Ana López</p>
              </div>
              <span className="text-[#13ec5b] font-mono font-medium bg-[#13ec5b]/10 px-3 py-1 rounded-full border border-[#13ec5b]/20">
                450 XLM
              </span>
            </div>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors text-sm">
              Pujar Ahora
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Colectas de la Comunidad</h3>
          <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-semibold text-lg">Viaje a Estados Unidos 🇺🇸</h4>
                <p className="text-sm text-neutral-500 mt-1">Por el equipo de Diseño</p>
              </div>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-2.5 mb-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-[#13ec5b] h-full rounded-full" style={{ width: "45%" }}></div>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-white">4,500 XLM <span className="text-neutral-500 font-normal">recaudado</span></span>
              <span className="text-neutral-400">Objetivo: 10,000 XLM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
