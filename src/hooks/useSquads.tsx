"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/hooks/useWallet';
import { useCeloWallet } from '@/hooks/useCeloWallet';
import { useProfile } from '@/hooks/useProfile';
import { useWorkspace } from '@/hooks/useWorkspace';

export interface Squad {
    id: string;
    name: string;
    description: string | null;
    specialty: string | null;
    emoji: string | null;
    leader_id: string;
    is_open: boolean;
    created_at: string;
}

export interface SquadMember {
    squad_id: string;
    user_id: string;
    role: 'leader' | 'member' | 'pending';
    joined_at: string;
    users?: {
        avatar_url: string | null;
        first_name: string | null;
        last_name: string | null;
        role: string | null;
    };
}

export function useSquads() {
    const { address: stellarAddress } = useWallet();
    const { address: celoAddress } = useCeloWallet();
    const { profile } = useProfile();
    const walletAddress = celoAddress || profile?.wallet_address || stellarAddress;
    const { activeWorkspace } = useWorkspace();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [squadMembers, setSquadMembers] = useState<Record<string, SquadMember[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSquads = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!activeWorkspace?.id) {
                setSquads([]);
                setLoading(false);
                return;
            }

            const { data: squadsData, error: squadsError } = await supabase
                .from('squads')
                .select('*')
                .eq('workspace_id', activeWorkspace.id)
                .order('created_at', { ascending: false });

            if (squadsError) throw squadsError;

            setSquads(squadsData || []);

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
    }, [activeWorkspace?.id]);

    useEffect(() => {
        fetchSquads();
    }, [fetchSquads, activeWorkspace?.id]);

    const resolveCurrentUserId = async (): Promise<string> => {
        if (profile?.id) return profile.id;
        if (!walletAddress) throw new Error("Conectá tu cuenta para operar con equipos.");
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', walletAddress)
            .maybeSingle();
        if (!user?.id) throw new Error("Perfil de usuario en sincronización. Intentá en unos segundos.");
        return user.id;
    };

    const createSquad = async (squadData: Partial<Squad>) => {
        const userId = await resolveCurrentUserId();

        const { data: newSquad, error: squadError } = await supabase
            .from('squads')
            .insert([{ ...squadData, leader_id: userId, workspace_id: activeWorkspace?.id }])
            .select()
            .single();

        if (squadError) throw squadError;

        const { error: memberError } = await supabase
            .from('squad_members')
            .insert([{ squad_id: newSquad.id, user_id: userId, role: 'leader' }]);

        if (memberError) throw memberError;

        await fetchSquads();
        return newSquad;
    };

    const joinSquad = async (squadId: string) => {
        const userId = await resolveCurrentUserId();

        const { data: squad } = await supabase.from('squads').select('is_open').eq('id', squadId).single();
        const role = squad?.is_open ? 'member' : 'pending';

        const { data: newMember, error } = await supabase
            .from('squad_members')
            .insert([{ squad_id: squadId, user_id: userId, role }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') throw new Error("Ya sos miembro o solicitaste unirte a este equipo.");
            throw error;
        }

        if (role === 'pending') {
            const { data: squadData } = await supabase.from('squads').select('name, leader_id').eq('id', squadId).single();
            if (!squadData) {
                await fetchSquads();
                return newMember;
            }
            const { data: leaderProfile } = await supabase.from('users').select('wallet_address').eq('id', squadData.leader_id).single();
            const { data: requesterProfile } = await supabase.from('users').select('first_name, last_name').eq('id', userId).single();

            if (leaderProfile?.wallet_address) {
                await supabase.from('notifications').insert([{
                    user_profile_id: leaderProfile.wallet_address,
                    title: "Solicitud de Unión",
                    message: `${requesterProfile?.first_name || 'Alguien'} quiere unirse a tu equipo ${squadData.name}.`,
                    type: 'community',
                    icon: 'UserPlus',
                    payload: {
                        type: 'join_request',
                        squadId: squadId,
                        squadName: squadData.name,
                        userId: userId,
                        requesterName: `${requesterProfile?.first_name || ''} ${requesterProfile?.last_name || ''}`.trim()
                    },
                    action_status: 'pending'
                }]);
            }
        }

        await fetchSquads();
        return newMember;
    };

    const leaveSquad = async (squadId: string) => {
        const userId = await resolveCurrentUserId();

        const { error } = await supabase
            .from('squad_members')
            .delete()
            .eq('squad_id', squadId)
            .eq('user_id', userId);

        if (error) throw error;
        await fetchSquads();
    };

    const disbandSquad = async (squadId: string) => {
        const userId = await resolveCurrentUserId();

        await supabase.from('squad_members').delete().eq('squad_id', squadId);

        const { error } = await supabase
            .from('squads')
            .delete()
            .eq('id', squadId)
            .eq('leader_id', userId);

        if (error) throw error;
        await fetchSquads();
    };

    const transferLeadership = async (squadId: string, newLeaderId: string) => {
        const userId = await resolveCurrentUserId();

        const { error: squadError } = await supabase
            .from('squads')
            .update({ leader_id: newLeaderId })
            .eq('id', squadId);

        if (squadError) throw squadError;

        await supabase
            .from('squad_members')
            .update({ role: 'member' })
            .eq('squad_id', squadId)
            .eq('user_id', userId);

        const { error: memberError } = await supabase
            .from('squad_members')
            .update({ role: 'leader' })
            .eq('squad_id', squadId)
            .eq('user_id', newLeaderId);

        if (memberError) throw memberError;

        await fetchSquads();
    };

    const respondToJoinRequest = async (notificationId: string, squadId: string, requesterId: string, action: 'accept' | 'reject') => {
        try {
            if (action === 'accept') {
                const { error: memberError } = await supabase
                    .from('squad_members')
                    .update({ role: 'member' })
                    .eq('squad_id', squadId)
                    .eq('user_id', requesterId);

                if (memberError) throw memberError;

                const { data: requester } = await supabase.from('users').select('wallet_address').eq('id', requesterId).single();
                const { data: squad } = await supabase.from('squads').select('name').eq('id', squadId).single();

                if (requester?.wallet_address && squad) {
                    await supabase.from('notifications').insert([{
                        user_profile_id: requester.wallet_address,
                        title: "Solicitud Aceptada",
                        message: `Has sido aceptado en el equipo ${squad.name}.`,
                        type: 'community',
                        icon: 'CheckCircle'
                    }]);
                }
            } else {
                const { error: deleteError } = await supabase
                    .from('squad_members')
                    .delete()
                    .eq('squad_id', squadId)
                    .eq('user_id', requesterId);

                if (deleteError) throw deleteError;

                const { data: requester } = await supabase.from('users').select('wallet_address').eq('id', requesterId).single();
                const { data: squad } = await supabase.from('squads').select('name').eq('id', squadId).single();

                if (requester?.wallet_address && squad) {
                    await supabase.from('notifications').insert([{
                        user_profile_id: requester.wallet_address,
                        title: "Solicitud Rechazada",
                        message: `Tu solicitud para unirte al equipo ${squad.name} fue rechazada.`,
                        type: 'community',
                        icon: 'XCircle'
                    }]);
                }
            }

            await supabase
                .from('notifications')
                .update({ action_status: action === 'accept' ? 'accepted' : 'rejected' })
                .eq('id', notificationId);
        } catch (err) {
            console.error('Error responding to join request:', err);
            throw err;
        } finally {
            await fetchSquads();
        }
    };

    const respondToMissionProposal = async (notificationId: string, squadId: string, userId: string, action: 'accept' | 'reject') => {
        try {
            if (action === 'accept') {
                const { error: memberError } = await supabase
                    .from('squad_members')
                    .upsert([{ squad_id: squadId, user_id: userId, role: 'member' }], { onConflict: 'squad_id,user_id' });

                if (memberError) throw memberError;

                const { data: squad } = await supabase.from('squads').select('name, leader_id').eq('id', squadId).single();
                if (squad) {
                    const { data: leader } = await supabase.from('users').select('wallet_address').eq('id', squad.leader_id).single();
                    if (leader?.wallet_address) {
                        await supabase.from('notifications').insert([{
                            user_profile_id: leader.wallet_address,
                            title: "Misión Aceptada",
                            message: `Un colaborador ha aceptado tu propuesta de misión para ${squad.name}.`,
                            type: 'community',
                            icon: 'CheckCircle'
                        }]);
                    }
                }
            }

            await supabase
                .from('notifications')
                .update({ action_status: action === 'accept' ? 'accepted' : 'rejected' })
                .eq('id', notificationId);
        } catch (err) {
            console.error('Error responding to mission proposal:', err);
            throw err;
        } finally {
            await fetchSquads();
        }
    };

    return { squads, squadMembers, loading, error, fetchSquads, createSquad, joinSquad, leaveSquad, disbandSquad, transferLeadership, respondToJoinRequest, respondToMissionProposal };
}
