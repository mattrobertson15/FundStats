/**
 * Runs all VC portfolio scrapers sequentially.
 * Errors in individual scrapers are caught so one failure doesn't block the rest.
 */
import { scrapeA16z }          from './portfolios/a16z.js'
import { scrapeSequoia }       from './portfolios/sequoia.js'
import { scrapeYC }            from './portfolios/yc.js'
import { scrapeFoundersFund }  from './portfolios/founders-fund.js'
import { scrapeBenchmark }     from './portfolios/benchmark.js'
import { scrapeLightspeed }    from './portfolios/lightspeed.js'
import { scrapeAccel }         from './portfolios/accel.js'
import { scrapeTigerGlobal }   from './portfolios/tiger-global.js'
import { scrapeGV }            from './portfolios/gv.js'
import { scrapeKleinerPerkins } from './portfolios/kleiner-perkins.js'

const scrapers = [
  { name: 'a16z',           fn: scrapeA16z },
  { name: 'Sequoia',        fn: scrapeSequoia },
  { name: 'YC',             fn: scrapeYC },
  { name: 'Founders Fund',  fn: scrapeFoundersFund },
  { name: 'Benchmark',      fn: scrapeBenchmark },
  { name: 'Lightspeed',     fn: scrapeLightspeed },
  { name: 'Accel',          fn: scrapeAccel },
  { name: 'Tiger Global',   fn: scrapeTigerGlobal },
  { name: 'GV',             fn: scrapeGV },
  { name: 'Kleiner Perkins', fn: scrapeKleinerPerkins },
]

export async function runAllScrapers() {
  const results = {}
  for (const { name, fn } of scrapers) {
    try {
      results[name] = await fn()
    } catch (err) {
      console.error(`${name} scraper failed: ${err.message}`)
      results[name] = 0
    }
  }
  return results
}

// CLI
if (process.argv[1].endsWith('run-all.js')) {
  const results = await runAllScrapers()
  console.log('\nScraper summary:', results)
}
