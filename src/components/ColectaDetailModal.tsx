import { useState, useEffect } from "react";
import { X, Search, Activity, Clock, HandCoins, ChevronRight, CheckCircle, ShieldCheck, Share2, Loader2, ArrowUpRight, Gift } from "lucide-react";

interface Colecta {
    id: number;
    title: string;
    description: string;
    organizer: string;
    goal_amount: number;
    current_amount: number;
    donor_count: number;
    deadline: string;
    created_at: string;
    image_url: string;
    tags: string[];
}

interface ColectaDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    colecta: Colecta | null;
    onDonate: (colecta: Colecta, amount: number) => void;
    onAction: (colecta: Colecta, action: 'release' | 'refund') => void;
    isProcessing: boolean;
    hasDonated: boolean;
    isOrganizer: boolean;
    t: any; // Translation object
}

function truncateKey(key: string) {
    if (!key) return "";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function ColectaDetailModal({ isOpen, onClose, colecta, onDonate, onAction, isProcessing, hasDonated, isOrganizer, t }: ColectaDetailModalProps) {
    const [donationAmount, setDonationAmount] = useState<string>("");

    // Reset amount when colecta changes
    useEffect(() => {
        setDonationAmount("");
    }, [colecta]);

    // Handle initial state rendering logic 
    if (!isOpen || !colecta) return null;

    const progress = Math.min(100, Math.round((colecta.current_amount / colecta.goal_amount) * 100));
    const isGoalMet = colecta.current_amount >= colecta.goal_amount;
    const isExpired = new Date(colecta.deadline).getTime() < Date.now();
    const currency = colecta.goal_amount === 150 ? 'USDC' : 'XLM'; // Mock logic for currency

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-background border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all max-h-[90vh]">

                {/* Botón Cerrar (Mobile) */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 z-50 p-2 bg-background/50 hover:bg-background/80 text-foreground rounded-full backdrop-blur-md transition-all border border-border-subtle"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Columna Izquierda: Visual (Glassmorphism) */}
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center p-8 overflow-hidden bg-muted/10">
                    {/* Background Effects */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-accent-teal/20 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    </div>

                    {/* Contenido Visual */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-card/40 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl overflow-hidden group">
                            {colecta.image_url?.startsWith('http') || colecta.image_url?.startsWith('/') ? (
                                <img src={colecta.image_url} alt={colecta.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <span className="text-8xl md:text-[120px] filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{colecta.image_url}</span>
                            )}
                        </div>

                        {/* Etiquetas sobre la imagen */}
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {colecta.tags?.map((tag) => (
                                <span key={tag} className="px-4 py-1.5 bg-background/60 backdrop-blur-md border border-border-subtle rounded-full text-xs font-bold text-foreground uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Detalles y Inputs */}
                <div className="md:w-1/2 flex flex-col bg-card relative overflow-y-auto">
                    {/* Botón Cerrar (Desktop) */}
                    <button
                        onClick={onClose}
                        className="hidden md:flex absolute top-6 right-6 p-2 text-muted hover:text-foreground hover:bg-neutral-800 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 md:p-10 flex-1 flex flex-col">

                        {/* Status Badge */}
                        <div className="mb-4 flex items-center gap-2">
                            {isGoalMet ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {t.colectas?.goalMetSuccess || "Meta Alcanzada"}
                                </span>
                            ) : isExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                    <X className="w-3.5 h-3.5" />
                                    Finalizada
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <Activity className="w-3.5 h-3.5" />
                                    Activa
                                </span>
                            )}
                        </div>

                        {/* Title & Desc */}
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight pr-8">
                            {colecta.title}
                        </h2>

                        <div className="flex items-center gap-4 text-sm text-muted mb-6">
                            <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-lg border border-border-subtle">
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {colecta.organizer.slice(0, 2)}
                                </span>
                                {truncateKey(colecta.organizer)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Termina el {new Date(colecta.deadline).toLocaleDateString()}
                            </span>
                        </div>

                        <p className="text-muted text-sm mb-8 leading-relaxed">
                            {colecta.description || `Apoya esta iniciativa aportando ${currency} a través de un contrato escrow seguro en la red Stellar.`}
                        </p>

                        {/* Progress Section */}
                        <div className="space-y-3 mb-8 bg-background p-6 rounded-2xl border border-border-subtle">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Recaudado</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-foreground tracking-tight">{colecta.current_amount.toLocaleString()}</span>
                                        <span className="text-muted font-medium">/ {colecta.goal_amount.toLocaleString()} {currency}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold" style={{ color: isGoalMet ? 'var(--accent-teal)' : '#fff' }}>
                                        {progress}%
                                    </span>
                                </div>
                            </div>

                            <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden shadow-inner border border-border-subtle mt-4">
                                <div
                                    className={`h-full rounded-full relative transition-all duration-1000 ${isGoalMet ? 'bg-accent-teal shadow-[0_0_15px_var(--accent-teal)40]' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-accent-teal'}`}
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-foreground/20 to-transparent"></div>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm text-muted mt-2 pt-2 border-t border-border-subtle/50">
                                <span>{colecta.donor_count} aportes realizados</span>
                                {isGoalMet && <span>Monto asegurado</span>}
                            </div>
                        </div>

                        {/* Action Inputs */}
                        <div className="mt-auto">
                            {isOrganizer ? (
                                <div className="space-y-4">
                                    {isGoalMet ? (
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => onAction(colecta, 'release')}
                                            className="w-full bg-accent-teal hover:bg-accent-teal/80 text-black font-semibold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] flex justify-center items-center gap-2 group text-lg"
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5 transition-transform group-hover:scale-110" />}
                                            {t.colectas?.releaseFunds || "Liberar Fondos"}
                                        </button>
                                    ) : (
                                        <div className="bg-neutral-800/50 border border-border-subtle p-4 rounded-xl text-center">
                                            <p className="text-muted text-sm">{t.colectas?.manageFailed || "Debes alcanzar la meta para retirar."}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {!isGoalMet && !isExpired && (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={donationAmount}
                                                    onChange={(e) => setDonationAmount(e.target.value)}
                                                    placeholder="Ej. 50"
                                                    className="w-full bg-background border border-border-subtle rounded-xl pl-6 pr-16 py-4 text-lg text-foreground font-medium focus:outline-none focus:border-accent-teal transition-all placeholder:text-muted/50 shadow-inner"
                                                    disabled={isProcessing}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-semibold bg-card px-2 py-1 rounded-md text-sm border border-border-subtle">
                                                    {currency}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onDonate(colecta, Number(donationAmount))}
                                                disabled={isProcessing || !donationAmount || Number(donationAmount) <= 0}
                                                className="bg-foreground hover:bg-neutral-200 text-black font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group sm:w-auto w-full text-lg"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        {t.colectas?.donateWithEscrow || "Aportar"}
                                                        <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {isExpired && !isGoalMet && hasDonated && (
                                        <button
                                            onClick={() => onAction(colecta, 'refund')}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-xl transition-colors border border-red-500/20 flex justify-center items-center gap-2 group text-lg"
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                            {t.colectas?.claimRefund || "Reclamar Reembolso"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Trustless Work Banner */}
                        <div className="mt-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden isolate">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 dark:from-blue-500/5 to-transparent -z-10" />
                            <div className="bg-blue-100 dark:bg-accent-teal/10 p-2.5 rounded-lg shrink-0 border border-blue-200 dark:border-accent-teal/20">
                                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-accent-teal" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                                    Contrato Escrow Inteligente
                                </h4>
                                <p className="text-xs text-blue-800/80 dark:text-blue-200/70 leading-relaxed">
                                    Protegido por <strong>Trustless Work</strong> en Stellar.
                                    {isGoalMet
                                        ? " La meta fue alcanzada. Los fondos pueden ser liberados al organizador, o reembolsados si algo falla."
                                        : " Tu aporte quedará bloqueado en un contrato inteligente. Si no se alcanza la meta, podrás reclamar el reembolso total automáticamete."}
                                    <br /><span className="mt-1 inline-block opacity-70">Fee estimado red Stellar: ~0.00001 XLM</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
