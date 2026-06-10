import { getDb } from '../../db/client.js'
import { scrapeWithPlaywright } from './_playwright-base.js'

const FIRM_ID = 'sequoia'
const URL = 'https://www.sequoiacap.com/companies/'

export async function scrapeSequoia() {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO portfolio_companies (vc_firm_id, company_name, stage, sector, website, description)
    VALUES (@vc_firm_id, @company_name, @stage, @sector, @website, @description)
    ON CONFLICT(vc_firm_id, company_name) DO UPDATE SET
      stage = excluded.stage, scraped_at = datetime('now')
  `)
  const updateFirm = db.prepare(`UPDATE vc_firms SET last_scraped = datetime('now') WHERE id = ?`)

  console.log(`Scraping ${FIRM_ID} portfolio…`)

  const companies = await scrapeWithPlaywright(URL, async (page) => {
    await page.waitForSelector('[class*="company"], [class*="portfolio"], .grid a, article', { timeout: 15000 }).catch(() => {})

    return page.evaluate(() => {
      const items = []
      // Try common selectors for portfolio grids
      const cards = document.querySelectorAll(
        '[class*="CompanyCard"], [class*="company-card"], [class*="portfolio-item"], .companies-grid a, article'
      )
      cards.forEach(card => {
        const name = card.querySelector('h2, h3, h4, [class*="name"], [class*="title"]')?.textContent?.trim()
        const desc = card.querySelector('p, [class*="description"], [class*="excerpt"]')?.textContent?.trim()
        const sector = card.querySelector('[class*="sector"], [class*="category"], [class*="tag"]')?.textContent?.trim()
        const link = card.querySelector('a')?.href || card.href
        if (name) items.push({ name, desc, sector, link })
      })
      return items
    })
  })

  let count = 0
  db.transaction(() => {
    for (const c of companies) {
      if (!c.name) continue
      upsert.run({
        vc_firm_id: FIRM_ID,
        company_name: c.name,
        stage: null,
        sector: c.sector || null,
        website: c.link || null,
        description: c.desc || null,
      })
      count++
    }
  })()
  updateFirm.run(FIRM_ID)
  console.log(`${FIRM_ID}: upserted ${count} portfolio companies.`)
  return count
}
