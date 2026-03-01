-- supabase/migrations/004_newsletters.sql
-- Story 4.2: CRUD Newsletters (Ajout / Suppression / Activation)

CREATE TABLE IF NOT EXISTS public.newsletters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email_address TEXT NOT NULL,
  category_id   UUID,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletters_select_own" ON public.newsletters
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "newsletters_insert_own" ON public.newsletters
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "newsletters_update_own" ON public.newsletters
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "newsletters_delete_own" ON public.newsletters
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Index
CREATE INDEX idx_newsletters_user_id ON public.newsletters(user_id);

-- Trigger updated_at
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
