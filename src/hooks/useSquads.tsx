"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFreighter } from '@/hooks/useFreighter';

export interface Squad {
    id: string;
    name: string;
    description: string | null;
    specialty: string | null;
    leader_id: string;
    is_open: boolean;
    created_at: string;
}

export interface SquadMember {
    squad_id: string;
    user_id: string;
    role: 'leader' | 'member' | 'pending';
    joined_at: string;
    // Relationships
    users?: {
        avatar_url: string | null;
        first_name: string | null;
        last_name: string | null;
        role: string | null;
    };
}

export function useSquads() {
    const { address: walletAddress } = useFreighter();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [squadMembers, setSquadMembers] = useState<Record<string, SquadMember[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSquads = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // First fetch all squads
            const { data: squadsData, error: squadsError } = await supabase
                .from('squads')
                .select('*')
                .order('created_at', { ascending: false });

            if (squadsError) throw squadsError;

            setSquads(squadsData || []);

            // Then fetch all active members to display avatars
            const { data: membersData, error: membersError } = await supabase
                .from('squad_members')
                .select(`
                    squad_id,
                    user_id,
                    role,
                    joined_at,
                    users (
                        avatar_url,
                        first_name,
                        last_name,
                        role
                    )
                `);

            if (membersError) throw membersError;

            // Group members by squad_id
            const groupedMembers: Record<string, SquadMember[]> = {};
            (membersData || []).forEach((member: any) => {
                if (!groupedMembers[member.squad_id]) {
                    groupedMembers[member.squad_id] = [];
                }
                groupedMembers[member.squad_id].push(member);
            });

            setSquadMembers(groupedMembers);

        } catch (err: any) {
            console.error('Error fetching squads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSquads();
    }, [fetchSquads]);

    const createSquad = async (squadData: Partial<Squad>) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        // We assume walletAddress maps to users.id as it does in ProfileContext. 
        // We fetch the internal user id first.
        const { data: user } = await supabase.from('users').select('id').eq('wallet_address', walletAddress).single();
        if (!user) throw new Error("User profile not found");

        const { data: newSquad, error: squadError } = await supabase
            .from('squads')
            .insert([{ ...squadData, leader_id: user.id }])
            .select()
            .single();

        if (squadError) throw squadError;

        // Add leader to members
        const { error: memberError } = await supabase
            .from('squad_members')
            .insert([{ squad_id: newSquad.id, user_id: user.id, role: 'leader' }]);

        if (memberError) throw memberError;

        await fetchSquads();
        return newSquad;
    };

    const joinSquad = async (squadId: string) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        const { data: user } = await supabase.from('users').select('id').eq('wallet_address', walletAddress).single();
        if (!user) throw new Error("User profile not found");

        // Check if squad is open
        const { data: squad } = await supabase.from('squads').select('is_open').eq('id', squadId).single();
        const role = squad?.is_open ? 'member' : 'pending';

        const { data: newMember, error } = await supabase
            .from('squad_members')
            .insert([{ squad_id: squadId, user_id: user.id, role }])
            .select()
            .single();

        if (error) {
            // Already requested or member?
            if (error.code === '23505') throw new Error("Already joined or requested.");
            throw error;
        }

        await fetchSquads();
        return newMember;
    };

    const leaveSquad = async (squadId: string) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        const { data: user } = await supabase.from('users').select('id').eq('wallet_address', walletAddress).single();
        if (!user) throw new Error("User profile not found");

        const { error } = await supabase
            .from('squad_members')
            .delete()
            .eq('squad_id', squadId)
            .eq('user_id', user.id);

        if (error) throw error;
        await fetchSquads();
    };

    const disbandSquad = async (squadId: string) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        const { data: user } = await supabase.from('users').select('id').eq('wallet_address', walletAddress).single();
        if (!user) throw new Error("User profile not found");

        // Verify leadership logic relies on RLS or we check manually
        // Delete all members
        await supabase.from('squad_members').delete().eq('squad_id', squadId);

        const { error } = await supabase
            .from('squads')
            .delete()
            .eq('id', squadId)
            .eq('leader_id', user.id); // extra security

        if (error) throw error;
        await fetchSquads();
    };

    return { squads, squadMembers, loading, error, fetchSquads, createSquad, joinSquad, leaveSquad, disbandSquad };
}
