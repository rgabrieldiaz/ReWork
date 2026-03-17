"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useFreighter } from '@/hooks/useFreighter';
import { useGamification } from '@/hooks/useGamification';

export interface UserProfile {
    id: string; // UUID from Supabase Auth
    wallet_address: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string | null;
    birth_date: string | null;
    points: number;
    updated_at: string;
}

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ data?: UserProfile, error?: any }>;
    addPoints: (amount: number, reason: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { address: walletAddress, loading: walletLoading } = useFreighter();
    const { notifyPointsEarned } = useGamification();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // 1. Get Supabase Auth Session
                const { data: { session } } = await supabase.auth.getSession();
                const authUser = session?.user;

                let query = supabase.from('users').select('*');
                
                if (authUser) {
                    // Fetch by UUID if logged in via Google/Email
                    query = query.eq('id', authUser.id);
                } else if (walletAddress) {
                    // Fetch by wallet if NOT logged in but wallet is connected
                    query = query.eq('wallet_address', walletAddress);
                } else {
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                const { data, error } = await query.single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (data) {
                    const currentProfile = data as UserProfile;
                    
                    // 2. Auto-link logic: If logged in via Auth but wallet is new/not linked
                    if (authUser && walletAddress && currentProfile.wallet_address !== walletAddress) {
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
                            .eq('id', authUser.id)
                            .select()
                            .single();
                        
                        if (updatedData) {
                            setProfile(updatedData as UserProfile);
                        } else {
                            setProfile(currentProfile);
                        }
                    } else {
                        setProfile(currentProfile);
                    }
                } else if (authUser) {
                    // This shouldn't normally happen due to the trigger, but as a fallback:
                    // Create profile if it doesn't exist but user is authenticated
                     const { data: newData } = await supabase
                        .from('users')
                        .insert({
                            id: authUser.id,
                            email: authUser.email,
                            first_name: authUser.user_metadata?.full_name || '',
                            avatar_url: authUser.user_metadata?.avatar_url || '',
                            points: 0
                        })
                        .select()
                        .single();
                    if (newData) setProfile(newData as UserProfile);
                }
            } catch (err) {
                console.error('Error in fetchProfile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!walletLoading) {
            fetchProfile();
        }

        // Listen for Auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            if (!walletLoading) fetchProfile();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [walletAddress, walletLoading]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        const identifier = profile?.id;
        if (!identifier) return { error: 'No profile found' };

        const { data, error } = await supabase
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', identifier)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return { error };
        }

        if (data) setProfile(data as UserProfile);
        return { data: data as UserProfile };
    };

    const addPoints = async (amount: number, reason: string = "¡Puntos extra!") => {
        if (!profile?.id) return;
        const newPoints = (profile.points || 0) + amount;

        const { data, error } = await supabase
            .from('users')
            .update({ points: newPoints, updated_at: new Date().toISOString() })
            .eq('id', profile.id)
            .select()
            .single();

        if (!error && data) {
            setProfile(data as UserProfile);
            notifyPointsEarned(amount, reason);
        } else {
            console.error("Error adding points:", error);
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, loading, updateProfile, addPoints }}>
            {children}
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
