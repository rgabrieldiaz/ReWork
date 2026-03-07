"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, Bell, UserCircle, Trophy, Target, TrendingUp, ShoppingBag } from "lucide-react";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";

interface NotificationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
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

                                                {notif.action_url && notif.action_text && (
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
