"use client";

import { Heart, Activity, Gift, Share2, ArrowUpRight } from "lucide-react";

export default function ColectasPage() {
    const campaigns = [
        {
            id: 1,
            title: "Notebook Pro Fin de Año",
            organizer: "Recursos Humanos",
            raised: 7500,
            goal: 10000,
            donors: 142,
            daysLeft: 5,
            image: "💻",
            tags: ["Equipamiento", "Compañeros"],
        },
        {
            id: 2,
            title: "Viaje a Estados Unidos 🇺🇸",
            organizer: "Desarrollo",
            raised: 4500,
            goal: 8000,
            donors: 85,
            daysLeft: 12,
            image: "✈️",
            tags: ["Viajes", "Incentivos"],
        },
        {
            id: 3,
            title: "Fondo Evento Anual 2026",
            organizer: "Comité de Eventos",
            raised: 15400,
            goal: 30000,
            donors: 250,
            daysLeft: 45,
            image: "🎉",
            tags: ["Fiesta", "Empresa"],
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Colectas <Heart className="text-red-500" fill="currentColor" />
                    </h1>
                    <p className="text-neutral-400">Apoya objetivos comunes de la comunidad donando tus XLM.</p>
                </div>
                <button className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4" /> Crear Colecta
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {campaigns.map((camp) => {
                    const progress = Math.min(100, Math.round((camp.raised / camp.goal) * 100));
                    return (
                        <div key={camp.id} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden group hover:border-[#13ec5b]/30 transition-all flex flex-col md:flex-row">
                            <div className="w-full md:w-32 xl:w-40 bg-neutral-900/50 md:border-r border-white/5 flex flex-col items-center justify-center py-6 px-4 flex-shrink-0">
                                <div className="text-5xl group-hover:scale-110 transition-transform duration-500 mb-4">{camp.image}</div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    {camp.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 bg-black px-2 py-0.5 rounded-md border border-white/10 text-center w-full">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-xl leading-tight">{camp.title}</h3>
                                    <button className="text-neutral-500 hover:text-white transition-colors shrink-0 ml-2">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-neutral-500 mb-6">Organizado por {camp.organizer}</p>

                                <div className="mt-auto space-y-4">
                                    <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-[#13ec5b] h-full rounded-full relative" style={{ width: `${progress}%` }}>
                                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg text-white">{camp.raised.toLocaleString()} <span className="text-xs text-neutral-500">XLM</span></p>
                                            <p className="text-neutral-500">de {camp.goal.toLocaleString()} XLM</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="font-medium text-white flex items-center justify-end gap-1.5"><Activity className="w-3.5 h-3.5 text-[#13ec5b]" /> {progress}%</p>
                                            <p className="text-neutral-500">{camp.donors} donantes</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex gap-3">
                                        <input type="number" placeholder="Ej. 100 XLM" className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#13ec5b]" />
                                        <button className="bg-[#13ec5b] hover:bg-[#11cc4e] text-black font-semibold px-4 rounded-xl transition-colors flex items-center justify-center gap-1 whitespace-nowrap">
                                            Donar <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
