"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWallet } from './useWallet';
import { useCeloWallet } from './useCeloWallet';
import { useProfile } from './useProfile';

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
    payload?: any;
    action_status?: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const { address: stellarAddress } = useWallet();
    const { address: celoAddress } = useCeloWallet();
    const { profile } = useProfile();
    const address = celoAddress || profile?.wallet_address || stellarAddress;
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

        if (address) {
            const channel = supabase
                .channel(`notifications-${address}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_profile_id=eq.${address}`
                    },
                    () => {
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
        } catch (err) {
            console.error('Error creating notification:', err);
        }
    };

    const updateNotificationStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ action_status: status })
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(notif => notif.id === id ? { ...notif, action_status: status } : notif)
            );
        } catch (err) {
            console.error('Error updating notification status:', err);
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
        createNotification,
        updateNotificationStatus
    };
}
