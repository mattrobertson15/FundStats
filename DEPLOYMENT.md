# FundStats Deployment

FundStats has two deployable pieces:

1. The React/Vite frontend, which can be hosted as a static site.
2. The scraper/API service in `pipeline/`, which serves `/api/*` and refreshes the SQLite database on a schedule.

## Frontend

Deploy the repo root to a static host.

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-api-host>`

For local production testing:

```bash
npm ci
VITE_API_URL=http://localhost:4317 npm run build
npm run preview
```

## Scraper/API Service

Deploy `pipeline/` as a long-running Node/container service.

- Start command without Docker: `npm ci && npm run live`
- Dockerfile: `pipeline/Dockerfile`
- Docker build context: `pipeline/`
- Required persistent storage: mount a disk at `/data`
- Environment variables:
  - `PORT`: supplied by most hosts; defaults to `3001`
  - `DB_PATH=/data/fundstats.db`
  - `ANTHROPIC_API_KEY`: optional, enables Claude enrichment

The `live` command starts both the Express API and the scheduler in the same process. That is intentional for SQLite deployments: the API and scraper need to read/write the same database file on the same persistent disk.

The live service automatically seeds bundled starter data the first time it sees an empty `vc_firms` table. To disable that behavior, set `AUTO_SEED=false`.

You can also seed manually:

```bash
cd pipeline
DB_PATH=/data/fundstats.db npm run seed
```

Health check:

```bash
curl https://<your-api-host>/api/status
```

## Scheduler

The hosted `live` process runs:

- Daily EDGAR polling at `06:00 UTC`
- Weekly VC portfolio scraping at `05:00 UTC` on Sundays

To run a refresh manually:

```bash
cd pipeline
DB_PATH=/data/fundstats.db npm run pipeline:now
```
