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
}

interface WorkspaceContextType {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    setActiveWorkspaceId: (id: string) => void;
    loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const { address: walletAddress } = useFreighter();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!walletAddress) {
            setWorkspaces([]);
            setActiveWorkspace(null);
            setLoading(false);
            return;
        }

        const fetchWorkspaces = async () => {
            setLoading(true);
            try {
                // Fetch user ID first
                const { data: userData } = await supabase
                    .from('users')
                    .select('id')
                    .eq('wallet_address', walletAddress)
                    .single();

                if (userData) {
                    // Fetch workspaces where user is a member or owner
                    const { data: memberData } = await supabase
                        .from('workspace_members')
                        .select('workspace_id, workspaces(*)')
                        .eq('user_id', userData.id);

                    const userWorkspaces = memberData?.map(m => m.workspaces as unknown as Workspace) || [];
                    
                    // Also fetch workspaces owned by wallet if not already included
                    const { data: ownedData } = await supabase
                        .from('workspaces')
                        .select('*')
                        .eq('owner_wallet', walletAddress);
                    
                    const ownedWorkspaces = ownedData || [];
                    
                    // Combine and remove duplicates by ID
                    const allWorkspaces = [...userWorkspaces, ...ownedWorkspaces];
                    const uniqueWorkspaces = Array.from(new Map(allWorkspaces.map(w => [w.id, w])).values());

                    setWorkspaces(uniqueWorkspaces);

                    // Set active workspace from localStorage or default to first
                    const savedId = localStorage.getItem('rework_active_workspace_id');
                    const initial = uniqueWorkspaces.find(w => w.id === savedId) || uniqueWorkspaces[0] || null;
                    setActiveWorkspace(initial);
                    if (initial) {
                        localStorage.setItem('rework_active_workspace_id', initial.id);
                    }
                }
            } catch (err) {
                console.error('Error fetching workspaces:', err);
            } finally {
                setLoading(false);
            }
        };

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
        <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspaceId, loading }}>
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
