/**
 * Seeds the database from the existing sampleData.js for local dev.
 * Run once: node pipeline/db/seed.js
 */
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { getDb } from './client.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dir, '../../src/data/sampleData.js')

const { raises, vcFirms } = await import(pathToFileURL(dataPath).href)

const db = getDb()

const insertFirm = db.prepare(`
  INSERT OR REPLACE INTO vc_firms (id, name, short_name, founded, hq, aum, color, description, website)
  VALUES (@id, @name, @short_name, @founded, @hq, @aum, @color, @description, @website)
`)

const insertRaise = db.prepare(`
  INSERT OR REPLACE INTO raises (company, round, amount, valuation, date, sector, hq, description, source)
  VALUES (@company, @round, @amount, @valuation, @date, @sector, @hq, @description, @source)
`)

const insertPortfolio = db.prepare(`
  INSERT OR IGNORE INTO portfolio_companies (vc_firm_id, company_name, stage, sector, description)
  VALUES (@vc_firm_id, @company_name, @stage, @sector, @description)
`)

const insertInvestment = db.prepare(`
  INSERT OR IGNORE INTO investments (vc_firm_id, raise_id, source, confirmed)
  VALUES (@vc_firm_id, @raise_id, @source, @confirmed)
`)

const getRaiseId = db.prepare(`SELECT id FROM raises WHERE company = ? AND date = ?`)
const getFirmByShortName = db.prepare(`SELECT id FROM vc_firms WHERE short_name = ?`)

db.transaction(() => {
  // Seed VC firms
  for (const firm of vcFirms) {
    insertFirm.run({
      id: firm.id,
      name: firm.name,
      short_name: firm.shortName,
      founded: firm.founded,
      hq: firm.hq,
      aum: firm.aum,
      color: firm.color,
      description: firm.description,
      website: firm.website || null,
    })
  }
  console.log(`Seeded ${vcFirms.length} VC firms.`)

  // Seed raises + investments
  let raiseCount = 0
  let investmentCount = 0
  let portfolioCount = 0

  for (const r of raises) {
    insertRaise.run({
      company: r.company,
      round: r.round,
      amount: r.amount,
      valuation: r.valuation || null,
      date: r.date,
      sector: r.sector,
      hq: r.hq || null,
      description: r.description || null,
      source: 'manual',
    })
    raiseCount++

    const row = getRaiseId.get(r.company, r.date)
    if (!row) continue

    for (const investorName of (r.investors || [])) {
      const firm = getFirmByShortName.get(investorName)
      if (!firm) continue

      // Add to portfolio_companies
      insertPortfolio.run({
        vc_firm_id: firm.id,
        company_name: r.company,
        stage: r.round,
        sector: r.sector,
        description: r.description || null,
      })
      portfolioCount++

      // Link investment
      insertInvestment.run({
        vc_firm_id: firm.id,
        raise_id: row.id,
        source: 'manual',
        confirmed: 1,
      })
      investmentCount++
    }
  }

  console.log(`Seeded ${raiseCount} raises, ${portfolioCount} portfolio entries, ${investmentCount} investments.`)
})()

console.log('Seed complete.')
