-- Migration 005: Table raw_emails pour stocker les emails bruts reçus
-- Story 4.4: Pipeline BullMQ — Queue email.process

CREATE TABLE raw_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_text TEXT NOT NULL,
  content_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE raw_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own raw emails"
  ON raw_emails FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE INDEX idx_raw_emails_user_id ON raw_emails(user_id);
