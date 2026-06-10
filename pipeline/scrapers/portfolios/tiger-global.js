/**
 * Tiger Global — no public portfolio page. We rely on EDGAR Form D matching
 * and news extraction for Tiger Global investments.
 * This stub exists so the runner doesn't fail; it returns 0 and logs a note.
 */
import { getDb } from '../../db/client.js'

const FIRM_ID = 'tiger-global'

export async function scrapeTigerGlobal() {
  console.log(`${FIRM_ID}: no public portfolio page — skipping DOM scrape. Investments sourced via EDGAR/news enrichment.`)
  return 0
}
