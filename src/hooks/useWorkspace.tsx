"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useFreighter } from "@/hooks/useFreighter";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    owner_wallet: string | null;
    is_public: boolean;
    description: string | null;
    userRole?: 'owner' | 'admin' | 'member';
    member_count?: number;
    squad_count?: number;
    is_premium?: boolean;
    hide_global_network?: boolean;
    treasury_address?: string | null;
}

interface JoinRequest {
    id: string;
    workspace_id: string;
    status: string;
    workspace_name?: string;
}

interface WorkspaceContextType {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    setActiveWorkspaceId: (id: string) => void;
    loading: boolean;
    joinRequests: JoinRequest[];
    refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const { address: walletAddress } = useFreighter();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWorkspaces = async () => {
        if (!walletAddress) {
            setWorkspaces([]);
            setJoinRequests([]);
            setActiveWorkspace(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch user ID first to check memberships
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('wallet_address', walletAddress)
                .single();

            let memberWorkspaces: Workspace[] = [];
            if (userData) {
                const { data: memberData } = await supabase
                    .from('workspace_members')
                    .select('workspace_id, role, workspaces(*, workspace_members(count), squads(count))')
                    .eq('user_id', userData.id);

                memberWorkspaces = memberData?.map(m => {
                    const ws = m.workspaces as any;
                    return {
                        ...ws,
                        userRole: m.role as any,
                        member_count: ws.workspace_members?.[0]?.count ?? 0,
                        squad_count: ws.squads?.[0]?.count ?? 0
                    };
                }) || [];
            }

            // Fetch workspaces owned directly by wallet
            const { data: ownedData } = await supabase
                .from('workspaces')
                .select('*, workspace_members(count), squads(count)')
                .eq('owner_wallet', walletAddress);

            const ownedWorkspaces = (ownedData || []).map((w: any) => ({
                ...w,
                userRole: 'owner' as const,
                member_count: w.workspace_members?.[0]?.count ?? 0,
                squad_count: w.squads?.[0]?.count ?? 0
            }));

            // Combine and prioritize 'owner' role if duplicate
            const workspaceMap = new Map<string, Workspace>();
            
            memberWorkspaces.forEach(w => workspaceMap.set(w.id, w));
            ownedWorkspaces.forEach(w => {
                const existing = workspaceMap.get(w.id);
                // Prioritize 'owner' role and ensure we take the most complete object
                if (!existing || existing.userRole !== 'owner') {
                    workspaceMap.set(w.id, w);
                } else if (existing.userRole === 'owner') {
                    // Merge properties if needed, but here they should be identical from both queries
                    workspaceMap.set(w.id, { ...existing, ...w });
                }
            });

            const uniqueWorkspaces = Array.from(workspaceMap.values());
            setWorkspaces(uniqueWorkspaces);

            // Fetch Join Requests
            const { data: requestsData } = await supabase
                .from('workspace_join_requests')
                .select('id, workspace_id, status, workspaces(name)')
                .eq('requester_wallet', walletAddress);
            
            const formattedRequests = requestsData?.map(r => ({
                id: r.id,
                workspace_id: r.workspace_id,
                status: r.status,
                workspace_name: (r.workspaces as any)?.name
            })) || [];

            setJoinRequests(formattedRequests);

            // Set active workspace
            const savedId = localStorage.getItem('rework_active_workspace_id');
            const initial = uniqueWorkspaces.find(w => w.id === savedId) || uniqueWorkspaces[0] || null;
            setActiveWorkspace(initial);
            if (initial) {
                localStorage.setItem('rework_active_workspace_id', initial.id);
            }
        } catch (err) {
            console.error('Error fetching workspaces:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [walletAddress]);

    const setActiveWorkspaceId = (id: string) => {
        const found = workspaces.find(w => w.id === id);
        if (found) {
            setActiveWorkspace(found);
            localStorage.setItem('rework_active_workspace_id', id);
        }
    };

    return (
        <WorkspaceContext.Provider value={{ 
            workspaces, 
            activeWorkspace, 
            setActiveWorkspaceId, 
            loading, 
            joinRequests,
            refreshWorkspaces: fetchWorkspaces
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
}
