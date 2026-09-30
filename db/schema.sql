-- Mon carnet de recettes
-- À exécuter une fois dans l'éditeur SQL de Neon (ou via psql),
-- après avoir créé la base. Ne contient aucun secret.

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) > 0),
  ingredients TEXT NOT NULL CHECK (char_length(btrim(ingredients)) > 0),
  preparation TEXT NOT NULL CHECK (char_length(btrim(preparation)) > 0),
  photo_url TEXT NOT NULL CHECK (
    photo_url LIKE 'https://%.public.blob.vercel-storage.com/%'
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes (created_at DESC);
