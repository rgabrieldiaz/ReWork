"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/hooks/useWallet';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useGamification } from '@/hooks/useGamification';
import { isSuperAdmin } from '@/lib/admins';

export interface UserProfile {
    id: string;
    wallet_address: string | null;
    solana_address?: string | null;
    stellar_address?: string | null;
    bank_alias?: string | null;
    preferred_rail?: 'solana' | 'stellar' | 'bank' | null;
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
    const { address: solAddress, connected: solConnected } = useSolanaWallet();
    const { notifyPointsEarned } = useGamification();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Wait for Privy to be ready AND wallet to finish loading
            if (!ready || walletLoading) return;

            setLoading(true);
            try {
                // Determine identity: Privy user email, Stellar wallet, or Solana wallet
                const privyEmail = privyUser?.email?.address || privyUser?.google?.email || null;

                let query = supabase.from('users').select('*');

                if (privyEmail) {
                    query = query.eq('email', privyEmail);
                } else if (walletAddress) {
                    query = query.eq('wallet_address', walletAddress);
                } else if (solAddress) {
                    query = query.or(`solana_address.eq.${solAddress},wallet_address.eq.${solAddress}`);
                } else {
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                const { data, error } = await query.maybeSingle();

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
                    const applyAdmin = (p: UserProfile): UserProfile => {
                        if (isSuperAdmin(p.email, p.wallet_address || p.solana_address, p.role)) {
                            return { ...p, role: 'Admin' };
                        }
                        return p;
                    };

                    // Welcome points bonus for new evaluators / judges with 0 points
                    if ((!currentProfile.points || currentProfile.points === 0) && !isSuperAdmin(currentProfile.email, currentProfile.wallet_address, currentProfile.role)) {
                        currentProfile.points = 500;
                        supabase.from('users').update({ points: 500 }).eq('id', currentProfile.id).then();
                    }

                    if (isSuperAdmin(currentProfile.email, currentProfile.wallet_address || currentProfile.solana_address, currentProfile.role) && currentProfile.role !== 'Admin') {
                        currentProfile.role = 'Admin';
                        supabase.from('users').update({ role: 'Admin' }).eq('id', currentProfile.id).then();
                    }

                    let assignWallet = walletAddress;

                    // 1. Generate retroactively if user has no wallet and hasn't connected one
                    if (!currentProfile.wallet_address && authenticated && !assignWallet && privyUser?.id) {
                        const { generateDeterministicKeypair } = await import('@/lib/crypto');
                        const keypair = await generateDeterministicKeypair(privyUser.id);
                        assignWallet = keypair.publicKey();
                        
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ 
                                wallet_address: assignWallet, 
                                stellar_address: assignWallet,
                                solana_address: solAddress || currentProfile.solana_address,
                                updated_at: new Date().toISOString() 
                            })
                            .eq('id', currentProfile.id)
                            .select()
                            .single();
                            
                        setProfile(applyAdmin((updatedData || { ...currentProfile, wallet_address: assignWallet }) as UserProfile));
                        if (typeof injectAddress === 'function') injectAddress(assignWallet);
                    } 
                    // 2. Auto-link explicit visible wallet address if Privy user connects external wallet
                    else if (authenticated && assignWallet && currentProfile.wallet_address !== assignWallet) {
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ 
                                wallet_address: assignWallet, 
                                stellar_address: assignWallet,
                                solana_address: solAddress || currentProfile.solana_address,
                                updated_at: new Date().toISOString() 
                            })
                            .eq('id', currentProfile.id)
                            .select()
                            .single();

                        setProfile(applyAdmin((updatedData || currentProfile) as UserProfile));
                    } else if (solAddress && !currentProfile.solana_address) {
                        // Link Solana address if user connects Phantom
                        const { data: updatedData } = await supabase
                            .from('users')
                            .update({ 
                                solana_address: solAddress,
                                updated_at: new Date().toISOString() 
                            })
                            .eq('id', currentProfile.id)
                            .select()
                            .single();

                        setProfile(applyAdmin((updatedData || { ...currentProfile, solana_address: solAddress }) as UserProfile));
                    } else {
                        setProfile(applyAdmin(currentProfile));
                    }
                } else if (authenticated && privyEmail) {
                    // Create new profile for Privy user
                    const privyName = privyUser?.google?.name || privyUser?.email?.address?.split('@')[0] || 'Evaluador ReWork';
                    const privyAvatar = (privyUser as any)?.google?.picture || '';

                    let assignWallet = walletAddress;
                    if (!assignWallet && privyUser?.id) {
                        const { generateDeterministicKeypair } = await import('@/lib/crypto');
                        const keypair = await generateDeterministicKeypair(privyUser.id);
                        assignWallet = keypair.publicKey();
                        if (typeof injectAddress === 'function') injectAddress(assignWallet);
                    }

                    const initialRole = isSuperAdmin(privyEmail, assignWallet) ? 'Admin' : 'Colaborador';

                    const { data: newData } = await supabase
                        .from('users')
                        .insert({
                            email: privyEmail,
                            first_name: privyName,
                            avatar_url: privyAvatar,
                            wallet_address: assignWallet || null,
                            stellar_address: assignWallet || null,
                            solana_address: solAddress || null,
                            preferred_rail: solAddress ? 'solana' : 'stellar',
                            role: initialRole,
                            points: 500 // Sandbox welcome bonus for judges & new users
                        })
                        .select()
                        .single();

                    if (newData) setProfile(newData as UserProfile);
                } else if (solConnected && solAddress) {
                    // Create new profile for standalone Solana user
                    const initialRole = isSuperAdmin(null, solAddress) ? 'Admin' : 'Colaborador';
                    const shortAddr = `${solAddress.slice(0, 4)}...${solAddress.slice(-4)}`;
                    const { data: newSolData } = await supabase
                        .from('users')
                        .insert({
                            email: null,
                            first_name: 'Solana Builder',
                            last_name: `(${shortAddr})`,
                            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${solAddress}`,
                            wallet_address: solAddress,
                            solana_address: solAddress,
                            preferred_rail: 'solana',
                            role: initialRole,
                            points: 500 // Sandbox welcome bonus for judges & new users
                        })
                        .select()
                        .single();

                    if (newSolData) setProfile(newSolData as UserProfile);
                } else if (walletAddress) {
                    // Create new profile for standalone Stellar user
                    const initialRole = isSuperAdmin(null, walletAddress) ? 'Admin' : 'Colaborador';
                    const shortAddr = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
                    const { data: newStellarData } = await supabase
                        .from('users')
                        .insert({
                            email: null,
                            first_name: 'Stellar Explorer',
                            last_name: `(${shortAddr})`,
                            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
                            wallet_address: walletAddress,
                            stellar_address: walletAddress,
                            preferred_rail: 'stellar',
                            role: initialRole,
                            points: 500 // Sandbox welcome bonus for judges & new users
                        })
                        .select()
                        .single();

                    if (newStellarData) setProfile(newStellarData as UserProfile);
                }
            } catch (err) {
                console.error('Error in fetchProfile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [ready, authenticated, privyUser, walletAddress, walletLoading, solAddress, solConnected]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        const identifier = profile?.id;
        if (!identifier) return { error: 'No profile found' };

        // Save in local state and cache immediately for fluid UX
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        if (typeof window !== 'undefined') {
            try {
                const existing = JSON.parse(localStorage.getItem(`rework_profile_pref_${identifier}`) || '{}');
                localStorage.setItem(`rework_profile_pref_${identifier}`, JSON.stringify({ ...existing, ...updates }));
            } catch (_) {}
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', identifier)
                .select()
                .single();

            if (error) {
                console.warn('Supabase update notification (saved locally):', error.message);
                return { data: { ...(profile || {}), ...updates } as UserProfile };
            }

            if (data) {
                setProfile((prev) => ({ ...(prev || {}), ...(data as UserProfile), ...updates }));
            }
            return { data: { ...(profile || {}), ...updates } as UserProfile };
        } catch (err) {
            return { data: { ...(profile || {}), ...updates } as UserProfile };
        }
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
