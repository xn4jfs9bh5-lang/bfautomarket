-- =============================================
-- BF AUTO MARKET — Schema Supabase
-- =============================================
-- Copie-colle ce SQL dans Supabase → SQL Editor → Run

-- Table des favoris
CREATE TABLE IF NOT EXISTS favoris (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  source TEXT,
  price_eur NUMERIC,
  location TEXT,
  country TEXT,
  link TEXT,
  fuel TEXT,
  year INTEGER,
  km INTEGER,
  image_url TEXT,
  visual_condition TEXT,
  accident_free BOOLEAN,
  verdict TEXT,
  score INTEGER,
  marge_min NUMERIC,
  marge_max NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des achats
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  prix_achat NUMERIC NOT NULL,
  pays TEXT,
  prix_revente_bf NUMERIC DEFAULT 0,
  year INTEGER,
  cylindree INTEGER,
  cout_total NUMERIC,
  marge_reelle NUMERIC,
  date_achat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table historique des scans
CREATE TABLE IF NOT EXISTS scans (
  id BIGSERIAL PRIMARY KEY,
  vehicle_count INTEGER DEFAULT 0,
  top_deals INTEGER DEFAULT 0,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_favoris_key ON favoris(key);
CREATE INDEX IF NOT EXISTS idx_favoris_created ON favoris(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);

-- Activer Row Level Security (optionnel mais recommandé)
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Politique: accès public (pour MVP, à restreindre plus tard avec auth)
CREATE POLICY "Accès public favoris" ON favoris FOR ALL USING (true);
CREATE POLICY "Accès public purchases" ON purchases FOR ALL USING (true);
CREATE POLICY "Accès public scans" ON scans FOR ALL USING (true);
