"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/hooks/useWallet';
import { useGamification } from '@/hooks/useGamification';

export interface UserProfile {
    id: string;
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
    const { ready, authenticated, user: privyUser } = usePrivy();
    const { address: walletAddress, loading: walletLoading, injectAddress } = useWallet();
    const { notifyPointsEarned } = useGamification();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Wait for Privy to be ready AND wallet to finish loading
            if (!ready || walletLoading) return;

            setLoading(true);
            try {
                // Determine identity: Privy user email or wallet address
                const privyEmail = privyUser?.email?.address || privyUser?.google?.email || null;

                let query = supabase.from('users').select('*');

                if (privyEmail) {
                    // Fetch by email if authenticated via Privy
                    query = query.eq('email', privyEmail);
                } else if (walletAddress) {
                    // Fetch by wallet if connected via SWK
                    query = query.eq('wallet_address', walletAddress);
                } else {
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                const { data, error } = await query.single();

                if (error && error.code !== 'PGRST116') {
                    console.warn('Error fetching profile detail HTTP/DB:', JSON.stringify({
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    }, null, 2));
                }

                if (data) {
                    const currentProfile = data as UserProfile;

                    let assignWallet = walletAddress;

                    // 1. Generate retroactively if user has no wallet and hasn't connected one
                    if (!currentProfile.wallet_address && authenticated && !assignWallet && privyUser?.id) {
                        const { generateDeterministicKeypair } = await import('@/lib/crypto');
                        const keypair = await generateDeterministicKeypair(privyUser.id);
                        assignWallet = keypair.publicKey();
                        
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ wallet_address: assignWallet, updated_at: new Date().toISOString() })
                            .eq('id', currentProfile.id)
                            .select()
                            .single();
                            
                        setProfile((updatedData || { ...currentProfile, wallet_address: assignWallet }) as UserProfile);
                        if (typeof injectAddress === 'function') injectAddress(assignWallet);
                    } 
                    // 2. Auto-link explicit visible wallet address if Privy user connects a new/different external wallet
                    else if (authenticated && assignWallet && currentProfile.wallet_address !== assignWallet) {
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ wallet_address: assignWallet, updated_at: new Date().toISOString() })
                            .eq('id', currentProfile.id)
                            .select()
                            .single();

                        setProfile((updatedData || currentProfile) as UserProfile);
                    } else {
                        setProfile(currentProfile);
                    }
                } else if (authenticated && privyEmail) {
                    // Create new profile for Privy user
                    const privyName = privyUser?.google?.name || privyUser?.email?.address?.split('@')[0] || '';
                    const privyAvatar = (privyUser as any)?.google?.picture || '';

                    let assignWallet = walletAddress;
                    if (!assignWallet && privyUser?.id) {
                        const { generateDeterministicKeypair } = await import('@/lib/crypto');
                        const keypair = await generateDeterministicKeypair(privyUser.id);
                        assignWallet = keypair.publicKey();
                        if (typeof injectAddress === 'function') injectAddress(assignWallet);
                    }

                    const { data: newData } = await supabase
                        .from('users')
                        .insert({
                            email: privyEmail,
                            first_name: privyName,
                            avatar_url: privyAvatar,
                            wallet_address: assignWallet || null,
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

        fetchProfile();
    }, [ready, authenticated, privyUser, walletAddress, walletLoading]);

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
