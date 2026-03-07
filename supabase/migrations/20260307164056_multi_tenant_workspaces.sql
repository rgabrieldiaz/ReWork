-- Create Workspace isolation tables
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Give access to authenticated users to read workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspaces are viewable by everyone" ON public.workspaces FOR SELECT USING (true);

-- Workspace Members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Ties to auth.users UID or custom profile id
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable by all" ON public.workspace_members FOR SELECT USING (true);

-- Add workspace foreign keys to existing tables
-- Assuming tables: auctions, colectas, squad_goals exist
ALTER TABLE public.auctions ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.colectas ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.squad_goals ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Initialize a Default Workspace to not break current data
INSERT INTO public.workspaces (id, name, slug, logo_url) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'ReWork Global', 
  'rework-global', 
  null
) ON CONFLICT (slug) DO NOTHING;

-- Attach all existing records to the default workspace
UPDATE public.auctions SET workspace_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE workspace_id IS NULL;
UPDATE public.colectas SET workspace_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE workspace_id IS NULL;
UPDATE public.squad_goals SET workspace_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE workspace_id IS NULL;

-- Enable RLS and Policies for multi-tenancy on these tables could go here but skipping forced policies for now to avoid locking out existing logic that doesn't pass the token. We will filter at the app level.
