-- Migration 008: Mise à jour table llm_costs pour Story 5.5
-- Ajouter tokens_input/tokens_output, cost_cents, summary_id ; retirer tokens_used/cost_usd

-- Ajouter nouvelles colonnes
ALTER TABLE public.llm_costs
  ADD COLUMN IF NOT EXISTS tokens_input INTEGER,
  ADD COLUMN IF NOT EXISTS tokens_output INTEGER,
  ADD COLUMN IF NOT EXISTS cost_cents NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS summary_id UUID REFERENCES public.summaries(id) ON DELETE SET NULL;

-- Migrer les données existantes (reset à 0 : anciennes valeurs en USD non convertibles en centimes EUR)
UPDATE public.llm_costs
SET
  tokens_input = COALESCE(tokens_used, 0),
  tokens_output = 0,
  cost_cents = 0
WHERE tokens_input IS NULL;

-- Rendre NOT NULL après migration
ALTER TABLE public.llm_costs
  ALTER COLUMN tokens_input SET NOT NULL,
  ALTER COLUMN tokens_output SET NOT NULL,
  ALTER COLUMN cost_cents SET NOT NULL;

-- Supprimer anciennes colonnes
ALTER TABLE public.llm_costs
  DROP COLUMN IF EXISTS tokens_used,
  DROP COLUMN IF EXISTS cost_usd;

-- Index pour requêtes d'agrégat mensuel par utilisateur
CREATE INDEX IF NOT EXISTS idx_llm_costs_user_month ON public.llm_costs(user_id, created_at);

-- RLS : isolation stricte par utilisateur
ALTER TABLE public.llm_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY llm_costs_user_select ON public.llm_costs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY llm_costs_service_all ON public.llm_costs
  FOR ALL USING (auth.role() = 'service_role');
