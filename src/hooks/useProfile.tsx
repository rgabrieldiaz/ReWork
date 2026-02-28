"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useFreighter } from '@/hooks/useFreighter';

export interface UserProfile {
    wallet_address: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string | null;
    points: number;
    updated_at: string;
}

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ data?: UserProfile, error?: any }>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { address: walletAddress } = useFreighter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!walletAddress) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('wallet_address', walletAddress)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (data) {
                    setProfile(data as UserProfile);
                }
            } catch (err) {
                console.error('Error in fetchProfile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        const channel = supabase
            .channel(`public:users:wallet_address=eq.${walletAddress}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'users', filter: `wallet_address=eq.${walletAddress}` },
                (payload) => {
                    setProfile(payload.new as UserProfile);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [walletAddress]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!walletAddress) return { error: 'No wallet connected' };

        const { data, error } = await supabase
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('wallet_address', walletAddress)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return { error };
        }

        if (data) setProfile(data as UserProfile);
        return { data: data as UserProfile };
    };

    return (
        <ProfileContext.Provider value= {{ profile, loading, updateProfile }
}>
    { children }
    </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
