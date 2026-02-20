-- supabase/seed.sql
INSERT INTO public.users (clerk_id, email, tier)
VALUES
  ('user_test_001', 'test@example.com', 'free'),
  ('user_test_002', 'pro@example.com', 'pro')
ON CONFLICT (clerk_id) DO NOTHING;
