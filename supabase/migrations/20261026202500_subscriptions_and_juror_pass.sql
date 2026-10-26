-- Migration: Production Subscriptions & Hackathon Juror Pass
-- Created: 2026-10-26

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    plan VARCHAR(32) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise', 'juror'
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trial'
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    billing_chain VARCHAR(32), -- 'celo', 'solana', 'stellar', 'fiat_ars', 'juror_pass'
    payment_tx_hash VARCHAR(128),
    amount_paid NUMERIC(18, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions viewable by everyone"
    ON public.subscriptions FOR SELECT
    USING (true);

CREATE POLICY "Users can insert and update subscriptions"
    ON public.subscriptions FOR ALL
    USING (true)
    WITH CHECK (true);
