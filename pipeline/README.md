# FundStats Pipeline

Data pipeline for FundStats. Scrapes VC portfolio pages, polls SEC EDGAR Form D filings, and uses Claude API to enrich deal data.

## Quick Start

```bash
cd pipeline
npm install
npx playwright install chromium   # one-time, installs headless browser

# Seed from existing sample data
node db/seed.js

# Start the API server
node api/index.js                  # runs on http://localhost:3001

# Run a one-off pipeline (scrape + EDGAR + enrich)
node scheduler.js --now

# Start the daemon scheduler
node scheduler.js
```

Set `ANTHROPIC_API_KEY` in your environment for Claude enrichment. Without it, the enrichment step is skipped gracefully.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Architecture

```
SEC EDGAR EFTS API  ──┐
                       ├─→  raises table
VC Portfolio Pages  ──┤    portfolio_companies table
(Playwright)           │    investments table (VC → raise)
                       │         ↓
                    matcher   enrichment (Claude)
                                   ↓
                           api/index.js  (:3001)
                                   ↓
                           React frontend
```

## Environment Variables

| Variable           | Default              | Description                        |
|--------------------|----------------------|------------------------------------|
| `ANTHROPIC_API_KEY`| —                    | Required for Claude enrichment     |
| `DB_PATH`          | `../fundstats.db`    | SQLite database file path          |
| `PORT`             | `3001`               | API server port                    |
| `VITE_API_URL`     | `` (same origin)     | Frontend API base URL              |

For local dev with Vite, create `../.env.local`:
```
VITE_API_URL=http://localhost:3001
```

---

## Supabase Migration Guide

Supabase uses Postgres. The schema is compatible with minor syntax adjustments.

### 1. Create Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and copy the connection string and `anon` key.

### 2. Apply the schema

Open the Supabase **SQL Editor** and run `db/schema.sql` with these substitutions:

| SQLite syntax              | Postgres equivalent             |
|----------------------------|---------------------------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `BIGSERIAL PRIMARY KEY` |
| `datetime('now')`          | `NOW()`                         |
| `TEXT DEFAULT (datetime('now'))` | `TIMESTAMPTZ DEFAULT NOW()` |
| `INTEGER DEFAULT 0` (for confirmed) | `BOOLEAN DEFAULT FALSE` |

The indexes (`CREATE INDEX`) work as-is.

### 3. Swap the database client

Replace `pipeline/db/client.js` with the Supabase JS client:

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service role key for pipeline writes
)

export function getDb() { return supabase }
```

Update query patterns: replace `db.prepare(sql).all(params)` with `supabase.from('table').select(...)`.

### 4. Frontend: switch to Supabase client

In `src/hooks/useData.js`, replace the `apiFetch` calls:

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function useRaises() {
  // Use Supabase auto-generated REST or JS client
  const { data } = await supabase.from('raises').select('*, investments(vc_firms(short_name))')
  // ...
}
```

### 5. Row Level Security

Add a read-only public policy so the frontend anon key can read data:

```sql
ALTER TABLE raises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON raises FOR SELECT USING (true);
-- Repeat for vc_firms, investments, portfolio_companies
```

### 6. Scheduled jobs → Supabase Edge Functions

Replace `pipeline/scheduler.js` with Supabase Edge Functions + `pg_cron`:

```sql
-- Run EDGAR poller daily at 6am UTC
SELECT cron.schedule('edgar-daily', '0 6 * * *', $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/edgar-poller',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  );
$$);
```

Deploy scrapers as Edge Functions:
```bash
supabase functions deploy edgar-poller
supabase functions deploy portfolio-scraper
supabase functions deploy enrichment
```

### 7. Remove the Express API

Once on Supabase, `pipeline/api/index.js` is no longer needed — the frontend hits Supabase directly via the JS client.
