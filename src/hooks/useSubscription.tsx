"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { toast } from "sonner";

export type PlanTier = "free" | "pro" | "enterprise" | "juror";
export type BillingChain = "celo" | "solana" | "stellar" | "fiat_ars" | "juror_pass";

export interface SubscriptionReceipt {
  plan: PlanTier;
  billingChain: BillingChain;
  txHash: string;
  amountPaid: number;
  activatedAt: string;
  expiresAt: string | null;
  workspaceId?: string;
}

interface SubscriptionContextType {
  plan: PlanTier;
  isPro: boolean;
  isJuror: boolean;
  ownedWorkspacesCount: number;
  maxFreeWorkspaces: number;
  maxFreeSquads: number;
  canCreateWorkspace: boolean;
  canCreateSquad: (activeSquadsCount: number) => boolean;
  escrowFeePercent: number;
  activeReceipt: SubscriptionReceipt | null;
  isUpgradeModalOpen: boolean;
  upgradeTriggerReason: string | null;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  upgradeToPro: (params: {
    chain: BillingChain;
    txHash: string;
    amountUsd: number;
    workspaceId?: string;
  }) => Promise<void>;
  activateJurorPass: (source?: string) => Promise<void>;
  setPlanForTesting: (targetPlan: "free" | "pro" | "juror") => Promise<void>;
}

const STORAGE_SUB_KEY = "rework_subscription_v1";

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const { workspaces, activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { address: stellarAddress } = useWallet();
  const { address: solAddress } = useSolanaWallet();

  const [plan, setPlan] = useState<PlanTier>("free");
  const [activeReceipt, setActiveReceipt] = useState<SubscriptionReceipt | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState<string | null>(null);
  const [hasExplicitOverride, setHasExplicitOverride] = useState(false);

  const maxFreeWorkspaces = 1;
  const maxFreeSquads = 3;

  // Count how many non-showcase workspaces the user owns
  const ownedWorkspacesCount = workspaces.filter((ws) => {
    const isFlagship =
      ws.slug === "rework" ||
      ws.slug === "rework-global" ||
      ws.id === "00000000-0000-0000-0000-000000000000" ||
      ws.id === "ws_rework_global_flagship";
    return !isFlagship && ws.userRole === "owner";
  }).length;

  // 1. Load saved subscription state & check URL parameters for Hackathon Evaluators
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode")?.toLowerCase();
      const refParam = params.get("ref")?.toLowerCase();
      const jurorParam = params.get("juror")?.toLowerCase();
      const evalParam = params.get("evaluator")?.toLowerCase();

      const isUrlJuror =
        modeParam === "juror" ||
        modeParam === "evaluator" ||
        jurorParam === "true" ||
        jurorParam === "1" ||
        evalParam === "true" ||
        (refParam &&
          ["colosseum", "superteam", "celo", "stellar", "baf", "hackathon", "jury"].includes(
            refParam
          ));

      if (isUrlJuror) {
        const jurorReceipt: SubscriptionReceipt = {
          plan: "juror",
          billingChain: "juror_pass",
          txHash: `juror-url-${refParam || modeParam || "hackathon"}`,
          amountPaid: 0,
          activatedAt: new Date().toISOString(),
          expiresAt: null,
        };
        setPlan("juror");
        setActiveReceipt(jurorReceipt);
        setHasExplicitOverride(true);
        localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(jurorReceipt));
        toast.success("Pase de Jurado Acreditado activo: acceso Pro ilimitado habilitado.");
        return;
      }

      const rawSaved = localStorage.getItem(STORAGE_SUB_KEY);
      if (rawSaved) {
        const parsed: SubscriptionReceipt = JSON.parse(rawSaved);
        if (parsed && parsed.plan) {
          setPlan(parsed.plan);
          setActiveReceipt(parsed);
          setHasExplicitOverride(true);
          return;
        }
      }
    } catch (e) {
      console.warn("[useSubscription] Error reading local subscription state:", e);
    }
  }, []);

  // 2. Sync with activeWorkspace.is_premium or Supabase subscriptions table if no local override
  useEffect(() => {
    if (hasExplicitOverride) return;

    const checkDatabaseSubscription = async () => {
      try {
        if (profile?.id) {
          const { data: subData, error: subErr } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", profile.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!subErr && subData && subData.plan) {
            const dbPlan = subData.plan as PlanTier;
            const receipt: SubscriptionReceipt = {
              plan: dbPlan,
              billingChain: (subData.billing_chain as BillingChain) || "celo",
              txHash: subData.payment_tx_hash || "db-verified",
              amountPaid: Number(subData.amount_paid || 0),
              activatedAt: subData.starts_at || new Date().toISOString(),
              expiresAt: subData.expires_at || null,
              workspaceId: subData.workspace_id || undefined,
            };
            setPlan(dbPlan);
            setActiveReceipt(receipt);
            return;
          }
        }

        // Check if current custom workspace is marked is_premium in DB
        if (
          activeWorkspace?.is_premium &&
          activeWorkspace.slug !== "rework" &&
          activeWorkspace.slug !== "rework-global" &&
          activeWorkspace.id !== "00000000-0000-0000-0000-000000000000"
        ) {
          setPlan("pro");
        }
      } catch {
        // Table may not exist yet on remote if migration not applied; fallback cleanly
      }
    };

    checkDatabaseSubscription();
  }, [profile?.id, activeWorkspace?.id, activeWorkspace?.is_premium, hasExplicitOverride]);

  const isPro = plan === "pro" || plan === "enterprise" || plan === "juror";
  const isJuror = plan === "juror";

  const canCreateWorkspace = isPro || ownedWorkspacesCount < maxFreeWorkspaces;
  const canCreateSquad = (activeSquadsCount: number) =>
    isPro || activeSquadsCount < maxFreeSquads;

  const escrowFeePercent = plan === "juror" ? 0 : isPro ? 0.25 : 0.5;

  const openUpgradeModal = (reason?: string) => {
    setUpgradeTriggerReason(reason || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeTriggerReason(null);
  };

  const upgradeToPro = async ({
    chain,
    txHash,
    amountUsd,
    workspaceId,
  }: {
    chain: BillingChain;
    txHash: string;
    amountUsd: number;
    workspaceId?: string;
  }) => {
    const targetWsId = workspaceId || activeWorkspace?.id;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);

    const receipt: SubscriptionReceipt = {
      plan: "pro",
      billingChain: chain,
      txHash,
      amountPaid: amountUsd,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresDate.toISOString(),
      workspaceId: targetWsId,
    };

    setPlan("pro");
    setActiveReceipt(receipt);
    setHasExplicitOverride(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(receipt));
    }

    // 1. Update workspace is_premium in Supabase
    if (targetWsId && targetWsId !== "ws_rework_global_flagship") {
      try {
        await supabase
          .from("workspaces")
          .update({ is_premium: true })
          .eq("id", targetWsId);
      } catch (e) {
        console.warn("[useSubscription] Could not update workspace is_premium:", e);
      }
    }

    // 2. Insert into subscriptions table if available
    if (profile?.id) {
      try {
        await supabase.from("subscriptions").insert({
          user_id: profile.id,
          workspace_id:
            targetWsId && targetWsId !== "ws_rework_global_flagship" ? targetWsId : null,
          plan: "pro",
          status: "active",
          starts_at: receipt.activatedAt,
          expires_at: receipt.expiresAt,
          billing_chain: chain,
          payment_tx_hash: txHash,
          amount_paid: amountUsd,
        });
      } catch {
        // Ignore if table not yet migrated on remote
      }
    }

    await refreshWorkspaces();
  };

  const activateJurorPass = async (source = "manual_ui") => {
    const receipt: SubscriptionReceipt = {
      plan: "juror",
      billingChain: "juror_pass",
      txHash: `juror-pass-${source}-${Date.now().toString(36)}`,
      amountPaid: 0,
      activatedAt: new Date().toISOString(),
      expiresAt: null,
      workspaceId: activeWorkspace?.id,
    };

    setPlan("juror");
    setActiveReceipt(receipt);
    setHasExplicitOverride(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(receipt));
    }

    if (profile?.id) {
      try {
        await supabase.from("subscriptions").insert({
          user_id: profile.id,
          workspace_id:
            activeWorkspace?.id && activeWorkspace.id !== "ws_rework_global_flagship"
              ? activeWorkspace.id
              : null,
          plan: "juror",
          status: "active",
          starts_at: receipt.activatedAt,
          expires_at: null,
          billing_chain: "juror_pass",
          payment_tx_hash: receipt.txHash,
          amount_paid: 0,
        });
      } catch {
        // ignore
      }
    }

    toast.success("Pase de Jurado activado: tenés acceso ilimitado sin costo a todas las funciones Pro.");
  };

  const setPlanForTesting = async (targetPlan: "free" | "pro" | "juror") => {
    if (targetPlan === "juror") {
      await activateJurorPass("switcher");
      return;
    }

    if (targetPlan === "pro") {
      await upgradeToPro({
        chain: "celo",
        txHash: `0xpro_demo_${Date.now().toString(16)}`,
        amountUsd: 49,
      });
      toast.success("Modo Plan Pro ($49 USDC/mes) activado.");
      return;
    }

    // Reset to Free tier
    const freeReceipt: SubscriptionReceipt = {
      plan: "free",
      billingChain: "celo",
      txHash: "free-tier",
      amountPaid: 0,
      activatedAt: new Date().toISOString(),
      expiresAt: null,
    };
    setPlan("free");
    setActiveReceipt(null);
    setHasExplicitOverride(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SUB_KEY, JSON.stringify(freeReceipt));
    }
    toast.info("Modo Usuario Gratuito (Free) activado: límites estándar de 1 espacio y 3 misiones aplicados.");
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        isPro,
        isJuror,
        ownedWorkspacesCount,
        maxFreeWorkspaces,
        maxFreeSquads,
        canCreateWorkspace,
        canCreateSquad,
        escrowFeePercent,
        activeReceipt,
        isUpgradeModalOpen,
        upgradeTriggerReason,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeToPro,
        activateJurorPass,
        setPlanForTesting,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
