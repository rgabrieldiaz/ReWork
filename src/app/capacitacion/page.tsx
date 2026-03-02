"use client";

import { PlayCircle, Award, BookOpen, Lock } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function CapacitacionPage() {
    const { t } = useSettings();
    const courses = [
        {
            id: 1,
            title: "Fundamentos de Blockchain",
            description: "Conceptos básicos, criptografía y seguridad descentralizada.",
            duration: "45 min",
            modules: 3,
            icon: Lock,
            color: "text-blue-500",
            bgWrapper: "bg-blue-500/10",
            progress: 100,
        },
        {
            id: 2,
            title: "Finanzas con Stellar Network",
            description: "Swaps corporativos, transacciones y activos reales anclados.",
            duration: "1h 20m",
            modules: 5,
            icon: ZapIcon,
            color: "text-accent-teal",
            bgWrapper: "bg-accent-teal/10",
            progress: 60,
        },
        {
            id: 3,
            title: "Smart Contracts Avanzados",
            description: "Automatización de procesos legales usando Soroban.",
            duration: "2h 15m",
            modules: 8,
            icon: BookOpen,
            color: "text-purple-500",
            bgWrapper: "bg-purple-500/10",
            progress: 0,
        },
        {
            id: 4,
            title: "Ciberseguridad en la Nube",
            description: "Protección de datos distribuidos e infraestructuras web3.",
            duration: "50 min",
            modules: 4,
            icon: Award,
            color: "text-orange-500",
            bgWrapper: "bg-orange-500/10",
            progress: 0,
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t.capacitacion.title}</h1>
                <p className="text-muted">{t.capacitacion.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="p-6 bg-card rounded-2xl border border-border-subtle hover:border-border-subtle transition-all group flex flex-col h-full">
                        <div className="flex gap-5 mb-6">
                            <div className={`p-4 rounded-xl shrink-0 h-min ${course.bgWrapper} ${course.color}`}>
                                <course.icon size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-teal transition-colors">{course.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">{course.description}</p>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center justify-between text-xs text-muted mb-3 font-medium">
                                <span className="flex items-center gap-1.5"><PlayCircle size={14} /> {course.modules} {t.capacitacion.modules}</span>
                                <span>{course.duration}</span>
                            </div>

                            <div className="w-full bg-neutral-900 rounded-full h-1.5 mb-4 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${course.progress === 100 ? 'bg-blue-500' : 'bg-accent-teal'}`}
                                    style={{ width: `${course.progress}%` }}
                                ></div>
                            </div>

                            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${course.progress === 100 ? 'bg-foreground/5 text-muted cursor-default' : 'bg-foreground/10 hover:bg-foreground/15 text-foreground'}`}>
                                {course.progress === 100 ? t.capacitacion.completed : course.progress > 0 ? t.capacitacion.continue : t.capacitacion.start}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ZapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
