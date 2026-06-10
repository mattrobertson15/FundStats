# FundStats Roadmap

Feature ideas for the VC tracking dashboard and broader app.

---

## In Progress / Next Up

### Co-Investor Analysis (VC Tracker)
The `investments` table already has VC→raise relationships. Surface which firms co-invest together most often — heatmap or force-directed graph showing firm-to-firm overlap. Useful for understanding who runs in the same circles.

### React Router
Replace the single-page layout with proper routes (`/`, `/vc/:firmId`, `/company/:slug`). Unlocks shareable links, browser history, and richer detail pages. Foundation for everything else that follows.

---

## High Impact, Lower Effort

### Sector Trend View
Per-sector time series showing growth/decline rates (e.g. "AI/ML up 40% QoQ vs CleanTech down 15%"). The Recharts infrastructure is already in place — this is a new view on existing data.

### CSV / PDF Export
Export filtered deal lists or VC portfolios to spreadsheet. Simple to add, disproportionately useful once real data is flowing.

### Deal Alerts (Pipeline)
Once the EDGAR poller is running, fire a webhook or email (Resend/Postmark) when a tracked VC's portfolio company files a new Form D. Makes the tool proactive rather than passive.

---

## Medium Effort, Meaningful Upgrades

### Company Detail Pages
With React Router in place, replace the detail modal with full `/company/:slug` pages. Show all funding rounds over time, all co-investors, sector, HQ, and description. Enables richer profiles as real data comes in.

### Global Search
Extend the existing NewsFeed search across the whole app — companies, VC firms, sectors, deal descriptions. Single search bar in the header.

### YoY / QoQ Comparison Charts
Overlay current period vs. prior period on the funding chart. Useful for spotting acceleration or slowdown trends.

### Geographic Heatmap
Plot deal activity by HQ location on a US map. Highlights emerging startup hubs beyond SF/NY/Boston.

---

## Longer Term

### User Watchlists
Bookmark specific companies or VC firms rather than showing all 10 firms by default. Requires auth — Supabase Auth fits naturally into the planned migration.

### Email Digest
Weekly deal summary email: top raises of the week, most active VC, breakout sector. Pairs well with the pipeline scheduler already built.

### Portfolio Company Status Tracking
Track lifecycle events: acquired, IPO'd, shut down. Enriches the VC firm profiles significantly.

### Public API
Expose the `/api/raises` and `/api/vcs` endpoints publicly (with rate limiting) so others can build on the data.

### Mobile / PWA
The Tailwind UI is close to responsive already. A PWA manifest or React Native wrapper would cover mobile access with minimal rework.

---

## Data & Pipeline

### Valuation Multiples
Once valuation data fills in via Claude enrichment, show entry multiple trends per sector (valuation / ARR estimates from news).

### Deal Velocity Metrics
Deals per week/month as a leading indicator — are VCs deploying faster or pulling back?

### Crunchbase / Harmonic Integration
Optional paid upgrade (~$300-500/mo) for real-time investor names directly from the data source rather than inferring via portfolio page scraping.
