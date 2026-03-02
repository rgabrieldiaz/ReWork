"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/hooks/useProfile";

interface UserBadgeProps {
    address: string;
}

export function UserBadge({ address }: UserBadgeProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (!address) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('first_name, last_name, avatar_url, role')
                    .eq('wallet_address', address)
                    .single();

                if (!error && data && isMounted) {
                    setProfile(data as UserProfile);
                }
            } catch (err) {
                // Ignore errors gracefully (silent fail for missing profiles)
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { isMounted = false; };
    }, [address]);

    if (loading) {
        return <div className="animate-pulse bg-foreground/10 rounded w-24 h-4"></div>;
    }

    if (!profile || (!profile.first_name && !profile.last_name)) {
        // Fallback to truncated address if no full profile exists
        const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Anónimo";
        return <span className="text-xs text-muted font-mono truncate max-w-[100px]">{truncated}</span>;
    }

    const { first_name, last_name, avatar_url } = profile;
    const initial = first_name ? first_name.charAt(0).toUpperCase() : "U";

    return (
        <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 rounded-full bg-muted/10 border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                {avatar_url ? (
                    <img src={avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[10px] font-bold text-accent-teal">{initial}</span>
                )}
            </div>
            <span className="text-xs text-muted font-medium truncate max-w-[100px]" title={`${first_name || ""} ${last_name || ""}`}>
                {first_name} {last_name ? last_name.charAt(0) + "." : ""}
            </span>
        </div>
    );
}
