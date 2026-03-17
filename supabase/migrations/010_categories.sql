-- supabase/migrations/010_categories.sql
-- Story 8.1 : CRUD Catégories

-- Table categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Index
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Contrainte unicité nom par utilisateur
CREATE UNIQUE INDEX idx_categories_user_name ON public.categories(user_id, name);

-- FK newsletters → categories
ALTER TABLE public.newsletters
  ADD CONSTRAINT fk_newsletters_category
  FOREIGN KEY (category_id) REFERENCES public.categories(id)
  ON DELETE SET NULL;
