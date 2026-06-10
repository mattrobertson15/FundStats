/**
 * Express API server.
 * Exposes /api/raises and /api/vcs in the same shape as sampleData.js
 * so the React frontend needs minimal changes.
 */
import express from 'express'
import cors from 'cors'
import { getDb } from '../db/client.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// GET /api/raises
// Returns raises array with investors[] field populated from investments table.
// Query params: sector (csv), round (csv)
app.get('/api/raises', (req, res) => {
  const db = getDb()
  const { sector, round } = req.query

  let where = []
  const params = {}

  if (sector) {
    const sectors = sector.split(',').map(s => s.trim()).filter(Boolean)
    if (sectors.length) {
      where.push(`r.sector IN (${sectors.map((_, i) => `@sector${i}`).join(',')})`)
      sectors.forEach((s, i) => { params[`sector${i}`] = s })
    }
  }

  if (round) {
    const rounds = round.split(',').map(s => s.trim()).filter(Boolean)
    if (rounds.length) {
      where.push(`r.round IN (${rounds.map((_, i) => `@round${i}`).join(',')})`)
      rounds.forEach((r, i) => { params[`round${i}`] = r })
    }
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const raises = db.prepare(`
    SELECT r.id, r.company, r.round, r.amount, r.valuation, r.date,
           r.sector, r.hq, r.description, r.source
    FROM raises r
    ${whereClause}
    ORDER BY r.date DESC
  `).all(params)

  // Attach investors[] to each raise
  const investorsByRaise = {}
  if (raises.length) {
    const ids = raises.map(r => r.id)
    const investments = db.prepare(`
      SELECT i.raise_id, f.short_name
      FROM investments i
      JOIN vc_firms f ON f.id = i.vc_firm_id
      WHERE i.raise_id IN (${ids.map(() => '?').join(',')})
    `).all(...ids)

    for (const inv of investments) {
      if (!investorsByRaise[inv.raise_id]) investorsByRaise[inv.raise_id] = []
      investorsByRaise[inv.raise_id].push(inv.short_name)
    }
  }

  const result = raises.map(r => ({
    ...r,
    investors: investorsByRaise[r.id] || [],
  }))

  res.json(result)
})

// GET /api/vcs
// Returns vcFirms array in the same shape as sampleData.vcFirms
app.get('/api/vcs', (req, res) => {
  const db = getDb()
  const firms = db.prepare(`SELECT * FROM vc_firms ORDER BY name`).all()
  // Reshape to match frontend shape
  const result = firms.map(f => ({
    id: f.id,
    name: f.name,
    shortName: f.short_name,
    founded: f.founded,
    hq: f.hq,
    aum: f.aum,
    color: f.color,
    description: f.description,
    website: f.website,
    focus: [],
  }))
  res.json(result)
})

// GET /api/status — pipeline health check
app.get('/api/status', (req, res) => {
  const db = getDb()
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM raises)              AS raises,
      (SELECT COUNT(*) FROM vc_firms)            AS vc_firms,
      (SELECT COUNT(*) FROM investments)         AS investments,
      (SELECT COUNT(*) FROM portfolio_companies) AS portfolio_companies,
      (SELECT MAX(created_at) FROM raises)       AS last_raise_at
  `).get()
  res.json({ ok: true, db: counts })
})

app.listen(PORT, () => {
  console.log(`FundStats API listening on http://localhost:${PORT}`)
})

export default app
