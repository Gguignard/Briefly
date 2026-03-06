-- Migration 007: Index created_at pour la purge des données anciennes
-- Story 5.4: Stockage et Rétention des Résumés (90 jours)

CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_raw_emails_created_at ON raw_emails(created_at);
