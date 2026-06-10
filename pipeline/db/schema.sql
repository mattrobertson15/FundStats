-- FundStats SQLite schema
-- Supabase/Postgres migration notes are inline (see also README.md)

-- raises: one row per funding round
CREATE TABLE IF NOT EXISTS raises (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,  -- Supabase: BIGSERIAL or UUID
  company       TEXT    NOT NULL,
  round         TEXT,                               -- 'Pre-Seed' | 'Seed' | 'Series A-D'
  amount        REAL,                               -- $M raised
  valuation     REAL,                               -- $M post-money, nullable
  date          TEXT,                               -- ISO 8601 YYYY-MM-DD
  sector        TEXT,
  hq            TEXT,
  description   TEXT,
  source        TEXT DEFAULT 'edgar',               -- 'edgar' | 'news' | 'manual'
  accession_no  TEXT UNIQUE,                        -- EDGAR accession number, nullable
  created_at    TEXT DEFAULT (datetime('now'))       -- Supabase: TIMESTAMPTZ DEFAULT now()
);

-- vc_firms: tracked venture capital firms
CREATE TABLE IF NOT EXISTS vc_firms (
  id            TEXT PRIMARY KEY,                   -- slug: 'a16z', 'sequoia', etc.
  name          TEXT NOT NULL,
  short_name    TEXT,
  founded       INTEGER,
  hq            TEXT,
  aum           TEXT,
  color         TEXT,
  description   TEXT,
  website       TEXT,
  last_scraped  TEXT                                -- ISO 8601 datetime
);

-- investments: which VC invested in which raise (many-to-many)
CREATE TABLE IF NOT EXISTS investments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  vc_firm_id    TEXT NOT NULL REFERENCES vc_firms(id) ON DELETE CASCADE,
  raise_id      INTEGER NOT NULL REFERENCES raises(id) ON DELETE CASCADE,
  source        TEXT DEFAULT 'portfolio_page',      -- 'portfolio_page' | 'edgar' | 'news'
  confirmed     INTEGER DEFAULT 0,                  -- Supabase: BOOLEAN DEFAULT FALSE
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(vc_firm_id, raise_id)
);

-- portfolio_companies: raw scrape output from VC portfolio pages
-- Used as the source for matching against raises
CREATE TABLE IF NOT EXISTS portfolio_companies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  vc_firm_id    TEXT NOT NULL REFERENCES vc_firms(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  stage         TEXT,
  year          INTEGER,
  sector        TEXT,
  website       TEXT,
  description   TEXT,
  scraped_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(vc_firm_id, company_name)
);

CREATE INDEX IF NOT EXISTS idx_raises_date ON raises(date);
CREATE INDEX IF NOT EXISTS idx_raises_sector ON raises(sector);
CREATE INDEX IF NOT EXISTS idx_investments_vc ON investments(vc_firm_id);
CREATE INDEX IF NOT EXISTS idx_investments_raise ON investments(raise_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_firm ON portfolio_companies(vc_firm_id);
