"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Award, BookOpen, Lock, X, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";

interface Course {
    id: number;
    title: string;
    description: string;
    duration: string;
    modules: number;
    icon: React.ComponentType<any>;
    color: string;
    bgWrapper: string;
    progress: number;
    points: number;
    content: string[];
}

export default function CapacitacionPage() {
    const { t } = useSettings();
    const { addPoints } = useProfile();
    const [completedCourses, setCompletedCourses] = useState<Set<number>>(new Set());
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [currentModule, setCurrentModule] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Load completed courses from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("rework_completed_courses");
            if (stored) setCompletedCourses(new Set(JSON.parse(stored)));
        } catch (_) {}
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const courses: Course[] = [
        {
            id: 1,
            title: "Fundamentos de Blockchain",
            description: "Conceptos básicos, criptografía y seguridad descentralizada.",
            duration: "45 min",
            modules: 3,
            icon: Lock,
            color: "text-blue-500",
            bgWrapper: "bg-blue-500/10",
            progress: completedCourses.has(1) ? 100 : 0,
            points: 50,
            content: [
                "¿Qué es una blockchain? Una cadena de bloques es un registro distribuido e inmutable de transacciones verificadas por múltiples nodos en la red.",
                "Criptografía de clave pública: tu wallet Freighter usa un par de claves (pública/privada) para firmar transacciones de forma segura sin revelar tu clave privada.",
                "Consenso en Stellar: el Protocolo de Consenso Estelar (SCP) permite acuerdos rápidos y eficientes sin minería, usando validadores de confianza.",
            ]
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
            progress: completedCourses.has(2) ? 100 : 0,
            points: 75,
            content: [
                "USDC en Stellar: Circle emite USDC nativamente en Stellar, permitiendo transacciones estables con fees mínimos (0.00001 XLM por operación).",
                "Trustlines: antes de recibir un activo no nativo (como USDC), tu cuenta debe establecer un trustline hacia el emisor del token.",
                "Path Payments: Stellar permite intercambiar activos automáticamente usando el orden book descentralizado, sin necesidad de un intermediario.",
                "Soroban Smart Contracts: los contratos inteligentes de Stellar permiten automatizar acuerdos como los escrows de Trustless Work.",
                "Assets Anchorizados: los SAPs (Stellar Asset Protocols) permiten representar activos del mundo real (como dólares o acciones) en la blockchain.",
            ]
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
            progress: completedCourses.has(3) ? 100 : 0,
            points: 100,
            content: [
                "Soroban SDK: escrito en Rust, Soroban permite contratos eficientes y seguros con acceso a datos en cadena.",
                "Tipos de escrow: single-release (un pago al final), milestone-based (pagos por hitos) y multi-release (múltiples beneficiarios).",
                "Trustless Work: la plataforma abstrae la complejidad de Soroban ofreciendo una API REST para deployer escrows sin código adicional.",
                "Seguridad en contratos: la inmutabilidad, transparencia y auditoría on-chain son las principales ventajas sobre contratos tradicionales.",
                "Casos de uso: salarios condicionales, escrows de freelancers, crowdfunding verificado y NFTs de acceso.",
                "Invocación de contratos: el XDR (External Data Representation) es el formato binario estándar para transacciones en Stellar.",
                "Testing con Soroban CLI: podés simular contratos localmente antes de deployar a testnet.",
                "Mejores prácticas: siempre verificar el resultado de la transacción (SUCCESS/FAILED) antes de actualizar tu base de datos.",
            ]
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
            progress: completedCourses.has(4) ? 100 : 0,
            points: 60,
            content: [
                "Gestión de claves: nunca compartas tu clave privada. Usar hardware wallets o extensiones seguras como Freighter para todas las operaciones.",
                "Phishing Web3: verificar siempre la URL del sitio antes de conectar tu wallet. Las dApps legítimas nunca piden tu seed phrase.",
                "RLS en Supabase: las políticas de Row Level Security garantizan que cada usuario solo acceda a los datos que le pertenecen.",
                "Auditoría on-chain: cualquier transacción puede ser verificada públicamente en Stellar Expert, asegurando transparencia total.",
            ]
        },
    ];

    const handleStartCourse = (course: Course) => {
        if (completedCourses.has(course.id)) return;
        setActiveCourse(course);
        setCurrentModule(0);
    };

    const handleNextModule = () => {
        if (!activeCourse) return;
        if (currentModule < activeCourse.modules - 1) {
            setCurrentModule(m => m + 1);
        }
    };

    const handleCompleteCourse = async () => {
        if (!activeCourse || isCompleting) return;
        setIsCompleting(true);
        try {
            await addPoints(activeCourse.points, `Curso completado: ${activeCourse.title}`);
            const updated = new Set([...completedCourses, activeCourse.id]);
            setCompletedCourses(updated);
            localStorage.setItem("rework_completed_courses", JSON.stringify([...updated]));
            setActiveCourse(null);
            showToast(`🎓 ¡Curso completado! +${activeCourse.points} puntos ganados.`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border bg-accent-teal/20 border-accent-teal/30 text-accent-teal backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">{toast}</p>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t.capacitacion.title}</h1>
                <p className="text-muted">{t.capacitacion.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {courses.map((course) => {
                    const isCompleted = completedCourses.has(course.id);
                    return (
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
                                    <div className="flex items-center gap-3">
                                        <span className="text-accent-teal font-semibold">+{course.points} pts</span>
                                        <span>{course.duration}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-neutral-900 rounded-full h-1.5 mb-4 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-blue-500' : 'bg-accent-teal'}`}
                                        style={{ width: `${isCompleted ? 100 : 0}%` }}
                                    />
                                </div>

                                <button
                                    onClick={() => handleStartCourse(course)}
                                    disabled={isCompleted}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        isCompleted
                                            ? 'bg-foreground/5 text-accent-teal cursor-default border border-accent-teal/20'
                                            : 'bg-foreground/10 hover:bg-foreground/15 text-foreground'
                                    }`}
                                >
                                    {isCompleted ? <><CheckCircle className="w-4 h-4" /> {t.capacitacion.completed}</> : t.capacitacion.start}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Course Modal */}
            {activeCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-full h-24 bg-accent-teal/5 blur-[50px] pointer-events-none" />

                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-border-subtle relative z-10">
                            <div>
                                <p className="text-xs text-muted mb-1">Módulo {currentModule + 1} de {activeCourse.modules}</p>
                                <h2 className="text-lg font-bold">{activeCourse.title}</h2>
                            </div>
                            <button onClick={() => setActiveCourse(null)} className="text-muted hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1 bg-neutral-900">
                            <div
                                className="h-full bg-accent-teal transition-all duration-500"
                                style={{ width: `${((currentModule + 1) / activeCourse.modules) * 100}%` }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 relative z-10">
                            <div className="bg-foreground/5 border border-border-subtle rounded-xl p-5 mb-6 min-h-[120px]">
                                <p className="text-sm text-muted leading-relaxed">
                                    {activeCourse.content[Math.min(currentModule, activeCourse.content.length - 1)]}
                                </p>
                            </div>

                            {currentModule < activeCourse.modules - 1 ? (
                                <button
                                    onClick={handleNextModule}
                                    className="w-full py-3 bg-foreground/10 hover:bg-foreground/15 text-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    Siguiente módulo <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCompleteCourse}
                                    disabled={isCompleting}
                                    className="w-full py-3 bg-accent-teal hover:bg-accent-teal/80 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.2)] disabled:opacity-60"
                                >
                                    {isCompleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><CheckCircle className="w-4 h-4" /> Finalizar y ganar +{activeCourse.points} pts</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
    );
}
