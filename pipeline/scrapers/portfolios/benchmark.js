import { getDb } from '../../db/client.js'
import { scrapeWithPlaywright } from './_playwright-base.js'

const FIRM_ID = 'benchmark'
const URL = 'https://www.benchmark.com/'

export async function scrapeBenchmark() {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO portfolio_companies (vc_firm_id, company_name, stage, sector, website, description)
    VALUES (@vc_firm_id, @company_name, @stage, @sector, @website, @description)
    ON CONFLICT(vc_firm_id, company_name) DO UPDATE SET scraped_at = datetime('now')
  `)
  const updateFirm = db.prepare(`UPDATE vc_firms SET last_scraped = datetime('now') WHERE id = ?`)

  console.log(`Scraping ${FIRM_ID} portfolio…`)

  const companies = await scrapeWithPlaywright(URL, async (page) => {
    await page.waitForTimeout(2000)
    return page.evaluate(() => {
      const items = []
      document.querySelectorAll('[class*="company"], [class*="portfolio"], [class*="investment"]').forEach(el => {
        const name = el.querySelector('h2, h3, h4, [class*="name"]')?.textContent?.trim()
        const desc = el.querySelector('p')?.textContent?.trim()
        if (name) items.push({ name, desc })
      })
      return items
    })
  })

  let count = 0
  db.transaction(() => {
    for (const c of companies) {
      if (!c.name) continue
      upsert.run({ vc_firm_id: FIRM_ID, company_name: c.name, stage: null, sector: null, website: null, description: c.desc || null })
      count++
    }
  })()
  updateFirm.run(FIRM_ID)
  console.log(`${FIRM_ID}: upserted ${count} portfolio companies.`)
  return count
}
