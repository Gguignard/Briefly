-- supabase/migrations/012_onboarding_completed.sql

ALTER TABLE public.user_settings ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
