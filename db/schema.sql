-- Recouvrement : dossiers et appels planifiés.
-- À exécuter une fois dans l'éditeur SQL de Neon (ou via psql),
-- après avoir créé la base. Ne contient aucun secret.
-- L'ancienne table recipes, si elle existe, n'est pas supprimée.

CREATE TABLE IF NOT EXISTS dossiers (
  id TEXT PRIMARY KEY,
  debtor_name TEXT NOT NULL CHECK (char_length(btrim(debtor_name)) > 0),
  phone TEXT NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0 AND amount_cents <= 1000000000),
  reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('ouvert', 'en_relance', 'clos')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dossiers_created_at_idx ON dossiers (created_at DESC);

CREATE TABLE IF NOT EXISTS appels (
  id TEXT PRIMARY KEY,
  dossier_id TEXT NOT NULL REFERENCES dossiers (id) ON DELETE CASCADE,
  phone TEXT NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planifie', 'en_cours', 'termine', 'echec', 'simulation')),
  mode TEXT CHECK (mode IS NULL OR mode IN ('reel', 'local')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  twilio_call_sid TEXT,
  elevenlabs_conversation_id TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appels_due_idx ON appels (status, scheduled_at);
CREATE INDEX IF NOT EXISTS appels_dossier_idx ON appels (dossier_id, scheduled_at DESC);
