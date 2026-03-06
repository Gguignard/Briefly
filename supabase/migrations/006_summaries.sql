-- Migration 006: Table summaries pour stocker les résumés IA
-- Story 5.2: Worker summary.generate

CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_email_id UUID NOT NULL UNIQUE REFERENCES raw_emails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  key_points TEXT[] NOT NULL,
  source_url TEXT,
  llm_tier TEXT NOT NULL CHECK (llm_tier IN ('basic', 'premium')),
  llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'groq')),
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
  ON summaries FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE INDEX idx_summaries_user_id_created ON summaries(user_id, created_at DESC);
CREATE INDEX idx_summaries_raw_email_id ON summaries(raw_email_id);
