import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFreighter } from './useFreighter';

export type NotificationType = 'activity' | 'community';

export interface AppNotification {
    id: string;
    user_profile_id: string;
    title: string;
    message: string;
    type: NotificationType;
    icon?: string;
    action_url?: string;
    action_text?: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const { address } = useFreighter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!address) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_profile_id', address)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchNotifications();

        // Subscripción a cambios en realtime
        if (address) {
            const channel = supabase
                .channel('schema-db-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_profile_id=eq.${address}`
                    },
                    (payload) => {
                        console.log('Realtime notification event:', payload);
                        fetchNotifications();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [address, fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;

            // Local fallback update for faster UI response
            setNotifications(prev =>
                prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!address) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_profile_id', address)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const createNotification = async (data: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([data]);

            if (error) throw error;
            // No fetch needed as realtime subscription handles it
        } catch (err) {
            console.error('Error creating notification:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification
    };
}
