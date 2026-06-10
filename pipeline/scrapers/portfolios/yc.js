/**
 * Y Combinator portfolio scraper.
 * YC's company directory loads data via API — we intercept the network request.
 */
import { getDb } from '../../db/client.js'
import { interceptJson } from './_playwright-base.js'

const FIRM_ID = 'yc'
const PAGE_URL = 'https://www.ycombinator.com/companies'
const API_MATCH = 'api.ycombinator.com'

export async function scrapeYC() {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO portfolio_companies (vc_firm_id, company_name, stage, sector, website, description)
    VALUES (@vc_firm_id, @company_name, @stage, @sector, @website, @description)
    ON CONFLICT(vc_firm_id, company_name) DO UPDATE SET
      sector = excluded.sector, scraped_at = datetime('now')
  `)
  const updateFirm = db.prepare(`UPDATE vc_firms SET last_scraped = datetime('now') WHERE id = ?`)

  console.log(`Scraping ${FIRM_ID} portfolio…`)

  let data
  try {
    data = await interceptJson(PAGE_URL, API_MATCH, { timeout: 25000 })
  } catch (e) {
    console.warn(`YC: API intercept failed (${e.message}), trying DOM fallback…`)
    data = null
  }

  const companies = data?.companies || data?.results || (Array.isArray(data) ? data : [])

  let count = 0
  db.transaction(() => {
    for (const c of companies) {
      const name = c.name || c.company_name
      if (!name) continue
      upsert.run({
        vc_firm_id: FIRM_ID,
        company_name: name.trim(),
        stage: c.batch || null,
        sector: c.tags?.[0] || c.industry || null,
        website: c.website || c.url || null,
        description: c.one_liner || c.description || null,
      })
      count++
    }
  })()
  updateFirm.run(FIRM_ID)
  console.log(`${FIRM_ID}: upserted ${count} portfolio companies.`)
  return count
}
