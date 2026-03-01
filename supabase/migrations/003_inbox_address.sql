-- supabase/migrations/003_inbox_address.sql
-- Story 4.1: Adresse email dédiée par utilisateur

ALTER TABLE public.users
  ADD COLUMN inbox_address TEXT UNIQUE;

-- Générer inbox_address pour les utilisateurs existants
UPDATE public.users
  SET inbox_address = gen_random_uuid() || '@mail.briefly.app'
  WHERE inbox_address IS NULL;

-- Rendre la colonne NOT NULL après population
ALTER TABLE public.users
  ALTER COLUMN inbox_address SET NOT NULL;
