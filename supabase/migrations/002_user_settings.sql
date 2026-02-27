-- supabase/migrations/002_user_settings.sql

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id     TEXT PRIMARY KEY,
  daily_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_manage_own" ON public.user_settings
  FOR ALL
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
