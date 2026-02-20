-- supabase/migrations/001_initial_schema.sql

-- Table users
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table llm_costs
CREATE TABLE IF NOT EXISTS public.llm_costs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tokens_used INT NOT NULL,
  cost_usd    DECIMAL(10, 6) NOT NULL,
  provider    TEXT NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_costs ENABLE ROW LEVEL SECURITY;

-- Policy users : lecture de son propre profil via clerk_id
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy llm_costs : via user_id lié au clerk_id
CREATE POLICY "llm_costs_select_own" ON public.llm_costs
  FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
