/**
 * a16z portfolio scraper.
 * a16z embeds portfolio data as __NEXT_DATA__ JSON in the page — no Playwright needed.
 */
import { getDb } from '../../db/client.js'

const FIRM_ID = 'a16z'
const URL = 'https://a16z.com/portfolio/'

export async function scrapeA16z() {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO portfolio_companies (vc_firm_id, company_name, stage, sector, website, description)
    VALUES (@vc_firm_id, @company_name, @stage, @sector, @website, @description)
    ON CONFLICT(vc_firm_id, company_name) DO UPDATE SET
      stage = excluded.stage,
      sector = excluded.sector,
      website = excluded.website,
      scraped_at = datetime('now')
  `)
  const updateFirm = db.prepare(`UPDATE vc_firms SET last_scraped = datetime('now') WHERE id = ?`)

  console.log(`Scraping ${FIRM_ID} portfolio…`)

  const res = await fetch(URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FundStats/1.0)' },
  })
  if (!res.ok) throw new Error(`a16z fetch failed: ${res.status}`)

  const html = await res.text()

  // Extract __NEXT_DATA__ JSON embedded in the page
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (!match) {
    console.warn('a16z: __NEXT_DATA__ not found — page structure may have changed.')
    return 0
  }

  let nextData
  try {
    nextData = JSON.parse(match[1])
  } catch {
    console.warn('a16z: failed to parse __NEXT_DATA__ JSON')
    return 0
  }

  // Navigate the Next.js page props to find portfolio companies
  // Structure varies; try common paths
  const pageProps = nextData?.props?.pageProps
  const companies =
    pageProps?.companies ||
    pageProps?.portfolioCompanies ||
    pageProps?.data?.companies ||
    []

  if (!Array.isArray(companies) || companies.length === 0) {
    console.warn(`a16z: found 0 companies in __NEXT_DATA__ (keys: ${Object.keys(pageProps || {}).join(', ')})`)
    return 0
  }

  let count = 0
  const stmt = db.transaction(() => {
    for (const c of companies) {
      const name = c.name || c.title || c.companyName
      if (!name) continue
      upsert.run({
        vc_firm_id: FIRM_ID,
        company_name: name.trim(),
        stage: c.stage || c.fundingStage || null,
        sector: c.sector || c.category || c.tags?.[0] || null,
        website: c.website || c.url || null,
        description: c.description || c.excerpt || null,
      })
      count++
    }
  })
  stmt()
  updateFirm.run(FIRM_ID)
  console.log(`a16z: upserted ${count} portfolio companies.`)
  return count
}
