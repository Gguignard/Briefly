-- supabase/migrations/009_subscriptions.sql
-- Story 7.1 : Configuration Stripe & Produits

-- Ajouter stripe_customer_id à la table users
ALTER TABLE public.users ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Table subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id     TEXT NOT NULL,
  status                 TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy : les utilisateurs lisent leurs propres abonnements
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Index pour les requêtes par user_id (FK, requêtes fréquentes)
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Index pour les lookups webhook par stripe_customer_id
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Trigger updated_at (réutilise la fonction existante)
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
