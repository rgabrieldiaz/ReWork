"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, Bell, UserCircle, Trophy, Target, TrendingUp, ShoppingBag, UserPlus, XCircle } from "lucide-react";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { useSquads } from "@/hooks/useSquads";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";

interface NotificationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { respondToJoinRequest, respondToMissionProposal } = useSquads();
    const [activeTab, setActiveTab] = useState<'activity' | 'community'>('activity');
    const { t } = useSettings();

    if (!isOpen) return null;

    const filteredNotifications = notifications.filter(n => n.type === activeTab);

    const renderIcon = (n: AppNotification) => {
        const i = n.icon;
        if (!i) return <Bell className="w-5 h-5 text-accent-teal" />;

        switch (i) {
            case 'Target': return <Target className="w-5 h-5 text-accent-teal" />;
            case 'Trophy': return <Trophy className="w-5 h-5 text-amber-500" />;
            case 'UserCircle': return <UserCircle className="w-5 h-5 text-indigo-400" />;
            case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
            case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-accent-teal" />;
            case 'UserPlus': return <UserPlus className="w-5 h-5 text-accent-teal" />;
            case 'XCircle': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'CheckCircle': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            default:
                if (i.length <= 4) {
                    return <span className="text-xl">{i}</span>;
                }
                return <Bell className="w-5 h-5 text-accent-teal" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-background/90 backdrop-blur-xl border-l border-border-subtle shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Notificaciones</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-accent-teal hover:text-accent-teal/80 transition-colors mr-2 flex items-center gap-1"
                            >
                                <CheckCircle className="w-4 h-4" /> Marcar leídas
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors text-muted hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-4 gap-2">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-accent-teal text-black shadow-lg shadow-accent-teal/20' : 'bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10'}`}
                    >
                        Actividad
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'community' ? 'bg-accent-teal text-black shadow-lg shadow-accent-teal/20' : 'bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10'}`}
                    >
                        Comunidad
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                            <Bell className="w-12 h-12 text-muted mb-4" />
                            <h3 className="text-lg font-bold mb-2">No hay notificaciones</h3>
                            <p className="text-sm text-muted">Aún no tienes alertas recientes en esta pestaña.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`relative glass-card p-4 transition-all hover:bg-foreground/5 ${!notif.is_read ? 'border-accent-teal/50 bg-accent-teal/5' : ''}`}
                                    onClick={() => { if (!notif.is_read) markAsRead(notif.id) }}
                                >
                                    {!notif.is_read && (
                                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent-teal glow-teal"></span>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border-subtle flex items-center justify-center shrink-0">
                                            {renderIcon(notif)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="font-bold text-sm text-foreground mb-1 truncate">{notif.title}</h4>
                                            <p className="text-xs text-muted leading-relaxed mb-3">{notif.message}</p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-[10px] text-muted font-mono uppercase tracking-wider">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    {notif.payload?.type === 'join_request' && notif.action_status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await respondToJoinRequest(notif.id, notif.payload.squadId, notif.payload.userId, 'accept');
                                                                }}
                                                                className="px-3 py-1 bg-accent-teal text-black text-[10px] font-bold rounded hover:bg-accent-teal/80 transition-colors uppercase tracking-wider shadow-lg shadow-accent-teal/10"
                                                            >
                                                                Aceptar
                                                            </button>
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await respondToJoinRequest(notif.id, notif.payload.squadId, notif.payload.userId, 'reject');
                                                                }}
                                                                className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded hover:bg-red-500/20 transition-colors uppercase tracking-wider"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    ) : notif.payload?.type === 'team_mission_proposal' && notif.action_status === 'pending' ? (
                                                        <div className="w-full space-y-3 mt-1">
                                                            <div className="bg-foreground/5 rounded-lg p-3 border border-border-subtle">
                                                                <h5 className="text-[11px] font-bold text-accent-teal uppercase mb-1">{notif.payload.missionTitle}</h5>
                                                                <p className="text-[10px] text-muted leading-tight">{notif.payload.missionDescription}</p>
                                                                {notif.payload.missionReward && (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        <Trophy className="w-3 h-3 text-amber-500/70" />
                                                                        <span className="text-[10px] font-bold text-amber-500/90">{notif.payload.missionReward}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        // userId logic here: we need the current user's ID
                                                                        // Since we are in the notification drawer, we assume the user seeing it is the target
                                                                        // We'll need to fetch user profile or use a stable ID from the notification
                                                                        // Most reliable is to use the user_profile_id from the notification table which is the target
                                                                        // But respondToMissionProposal needs the internal UUID
                                                                        await respondToMissionProposal(notif.id, notif.payload.squadId, notif.payload.targetUserId, 'accept');
                                                                    }}
                                                                    className="flex-1 px-3 py-2 bg-accent-teal text-black text-[10px] font-bold rounded hover:bg-accent-teal/80 transition-colors uppercase tracking-wider shadow-lg shadow-accent-teal/10"
                                                                >
                                                                    Aceptar Misión
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        await respondToMissionProposal(notif.id, notif.payload.squadId, notif.payload.targetUserId, 'reject');
                                                                    }}
                                                                    className="px-3 py-2 bg-foreground/10 text-muted text-[10px] font-bold rounded hover:bg-foreground/20 transition-colors uppercase tracking-wider"
                                                                >
                                                                    Ignorar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : notif.payload?.type === 'team_invite' && notif.action_status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await respondToMissionProposal(notif.id, notif.payload.squadId, notif.payload.targetUserId, 'accept');
                                                                }}
                                                                className="px-3 py-1 bg-accent-teal text-black text-[10px] font-bold rounded hover:bg-accent-teal/80 transition-colors uppercase tracking-wider shadow-lg shadow-accent-teal/10"
                                                            >
                                                                Aceptar Invitación
                                                            </button>
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await respondToMissionProposal(notif.id, notif.payload.squadId, notif.payload.targetUserId, 'reject');
                                                                }}
                                                                className="px-3 py-1 bg-foreground/10 text-muted text-[10px] font-bold rounded hover:bg-foreground/20 transition-colors uppercase tracking-wider"
                                                            >
                                                                Ignorar
                                                            </button>
                                                        </div>
                                                    ) : (notif.payload?.type === 'join_request' || notif.payload?.type === 'team_mission_proposal' || notif.payload?.type === 'team_invite') && notif.action_status !== 'pending' ? (
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${notif.action_status === 'accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {notif.action_status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                                        </span>
                                                    ) : notif.action_url && notif.action_text && (
                                                        <Link
                                                            href={notif.action_url}
                                                            onClick={(e) => {
                                                                markAsRead(notif.id);
                                                                onClose();
                                                            }}
                                                            className="text-xs font-bold text-accent-teal hover:underline flex items-center gap-1"
                                                        >
                                                            {notif.action_text}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
