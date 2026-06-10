import { getDb } from '../../db/client.js'
import { scrapeWithPlaywright } from './_playwright-base.js'

const FIRM_ID = 'founders-fund'
const URL = 'https://foundersfund.com/portfolio/'

export async function scrapeFoundersFund() {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO portfolio_companies (vc_firm_id, company_name, stage, sector, website, description)
    VALUES (@vc_firm_id, @company_name, @stage, @sector, @website, @description)
    ON CONFLICT(vc_firm_id, company_name) DO UPDATE SET
      scraped_at = datetime('now')
  `)
  const updateFirm = db.prepare(`UPDATE vc_firms SET last_scraped = datetime('now') WHERE id = ?`)

  console.log(`Scraping ${FIRM_ID} portfolio…`)

  const companies = await scrapeWithPlaywright(URL, async (page) => {
    await page.waitForTimeout(3000) // wait for JS render
    return page.evaluate(() => {
      const items = []
      document.querySelectorAll('a[href]').forEach(el => {
        const name = el.querySelector('h2, h3, h4, strong, [class*="name"]')?.textContent?.trim()
          || (el.textContent.trim().length < 60 ? el.textContent.trim() : null)
        const desc = el.querySelector('p, [class*="desc"]')?.textContent?.trim()
        if (name && name.length > 1 && name.length < 80) {
          items.push({ name, desc, link: el.href })
        }
      })
      return [...new Map(items.map(i => [i.name, i])).values()]
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
        sector: null,
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
