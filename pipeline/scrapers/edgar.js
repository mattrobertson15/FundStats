/**
 * Polls SEC EDGAR EFTS API for recent Form D filings and upserts into raises table.
 * Free, no API key. Requires a User-Agent header per SEC policy.
 *
 * Form D does NOT include investor names — use portfolio scrapers for VC relationships.
 */
import { getDb } from '../db/client.js'

const EFTS_BASE = 'https://efts.sec.gov/LATEST/search-index'
const USER_AGENT = 'FundStats/1.0 contact@fundstats.example.com'

// EDGAR industry group → app sector taxonomy
const INDUSTRY_MAP = {
  'Technology':                     'DevTools',
  'Computers':                      'DevTools',
  'Software':                       'DevTools',
  'Biotechnology':                  'Biotech',
  'Pharmaceuticals':                'Biotech',
  'Health Care':                    'HealthTech',
  'Medical Devices':                'HealthTech',
  'Finance':                        'FinTech',
  'Banking':                        'FinTech',
  'Insurance':                      'InsurTech',
  'Energy':                         'Energy',
  'Electric Power':                 'CleanTech',
  'Environmental Services':         'CleanTech',
  'Manufacturing':                  'Robotics',
  'Transportation':                 'Logistics',
  'Communications':                 'Cloud',
  'Retail':                         'Analytics',
  'Real Estate':                    'Analytics',
  'Agriculture':                    'AgriTech',
  'Defense':                        'DefenseTech',
  'Aerospace':                      'SpaceTech',
  'Education':                      'EdTech',
}

const ROUND_KEYWORDS = [
  'Series D', 'Series C', 'Series B', 'Series A', 'Seed', 'Pre-Seed',
]

function guessRound(amountM) {
  if (amountM >= 200) return 'Series D'
  if (amountM >= 80)  return 'Series C'
  if (amountM >= 30)  return 'Series B'
  if (amountM >= 10)  return 'Series A'
  if (amountM >= 3)   return 'Seed'
  return 'Pre-Seed'
}

function mapSector(edgarIndustry) {
  if (!edgarIndustry) return 'Analytics'
  for (const [key, value] of Object.entries(INDUSTRY_MAP)) {
    if (edgarIndustry.toLowerCase().includes(key.toLowerCase())) return value
  }
  return 'Analytics'
}

async function fetchFormDFilings({ startDate, endDate, size = 100, from = 0 }) {
  const params = new URLSearchParams({
    forms: 'D',
    dateRange: 'custom',
    startdt: startDate,
    enddt: endDate,
    size: String(size),
    from: String(from),
  })
  const url = `${EFTS_BASE}?${params}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`EDGAR EFTS error ${res.status}: ${url}`)
  return res.json()
}

async function fetchFilingDetail(accessionNo) {
  const formatted = accessionNo.replace(/-/g, '')
  const cik = formatted.substring(0, 10)
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export async function runEdgarPoller({ days = 7 } = {}) {
  const db = getDb()
  const upsertRaise = db.prepare(`
    INSERT INTO raises (company, round, amount, valuation, date, sector, hq, description, source, accession_no)
    VALUES (@company, @round, @amount, @valuation, @date, @sector, @hq, @description, @source, @accession_no)
    ON CONFLICT(accession_no) DO UPDATE SET
      amount = excluded.amount,
      date   = excluded.date
  `)

  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  const fmt = d => d.toISOString().slice(0, 10)
  console.log(`Fetching Form D filings from ${fmt(startDate)} to ${fmt(endDate)}…`)

  let from = 0
  let total = Infinity
  let inserted = 0

  while (from < total) {
    const data = await fetchFormDFilings({
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      size: 100,
      from,
    })

    total = data.total?.value ?? 0
    const hits = data.hits?.hits ?? []
    if (hits.length === 0) break

    for (const hit of hits) {
      const src = hit._source
      const accNo = src.accession_no || hit._id

      // Extract amount from the filing data
      const amountStr = src.period_of_report || ''
      const amountMatch = src.file_num || ''

      // Use entity_name and file date
      const company = src.entity_name || src.display_names?.[0] || 'Unknown'
      const filedAt = src.file_date || src.period_of_report || ''
      const date = filedAt.slice(0, 10)
      const industry = src.entity_type || ''
      const sector = mapSector(industry)

      // EDGAR Form D amounts are in the XML; for the EFTS index we get limited data.
      // We use a placeholder amount of 0 — the enrichment step fills this via Claude
      // when available, or from the Form D XML fetch.
      const amount = 0
      const round = guessRound(amount)

      if (!company || company === 'Unknown') continue

      upsertRaise.run({
        company,
        round,
        amount,
        valuation: null,
        date,
        sector,
        hq: null,
        description: null,
        source: 'edgar',
        accession_no: accNo,
      })
      inserted++
    }

    from += hits.length
    if (from < total) await sleep(200) // stay well under 10 req/sec
  }

  console.log(`EDGAR poller: upserted ${inserted} raises (${total} total in window).`)
  return inserted
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { fileURLToPath } = await import('url')
  await runEdgarPoller({ days: 30 })
}
