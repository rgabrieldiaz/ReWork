"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, AlertCircle, Building2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function JoinWorkspacePage({ params: paramsProp }: { params: any }) {
  const params = React.use(paramsProp) as { slug: string };
  const { slug } = params;
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { t } = useSettings();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function fetchWorkspace() {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setError(t.joinPage.notFound);
      } else {
        setWorkspace(data);
      }
    }
    fetchWorkspace();
  }, [slug]);

  const handleJoin = async () => {
    if (!profile) {
      // Save intent and redirect to auth
      localStorage.setItem("rework_join_intent", slug);
      router.push("/auth");
      return;
    }

    setJoining(true);
    const { error: joinError } = await supabase
      .from("workspace_members")
      .insert({
        user_id: profile.wallet_address,
        workspace_id: workspace.id,
        role: "member"
      });

    setJoining(false);

    if (joinError && joinError.code !== "23505") { // 23505 is unique violation (already joined)
      setError(t.joinPage.joinError + joinError.message);
    } else {
      localStorage.setItem("rework_current_workspace", workspace.id);
      router.push("/app");
    }
  };

  // Auto-join if user is already logged in and there is an intent
  useEffect(() => {
    const intent = localStorage.getItem("rework_join_intent");
    if (intent === slug && profile && workspace) {
      localStorage.removeItem("rework_join_intent");
      handleJoin();
    }
  }, [profile, workspace, slug]);


  if (profileLoading || !workspace && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t.joinPage.errorTitle}</h2>
          <p className="text-muted mb-6">{error}</p>
          <button onClick={() => router.push("/")} className="bg-foreground text-background font-bold py-2 px-6 rounded-xl hover:bg-muted transition-colors">{t.joinPage.back}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
       {/* Background */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-teal/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="glass-card p-10 rounded-3xl max-w-lg w-full text-center border border-border-subtle relative z-10 shadow-2xl shadow-accent-teal/5">
        <div className="w-20 h-20 bg-foreground/5 border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-accent-teal" />
        </div>
        <h1 className="text-3xl font-bold mb-3">{t.joinPage.title} {workspace.name}</h1>
        <p className="text-muted mb-8 leading-relaxed">
          {t.joinPage.desc}
        </p>

        <button 
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-accent-teal text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-teal/90 transition-colors shadow-[0_0_20px_rgba(0,242,255,0.2)] disabled:opacity-70"
        >
          {joining ? (
             <><Loader2 className="w-5 h-5 animate-spin"/> {t.joinPage.joining}</>
          ) : (
            profile ? t.joinPage.enter : t.joinPage.connect
          )}
        </button>
      </div>
    </div>
  );
}
