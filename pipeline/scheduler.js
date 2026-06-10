/**
 * Pipeline scheduler.
 *
 * Schedule:
 *   Daily 6am UTC  — EDGAR poller → matcher → Claude enrichment
 *   Weekly Sunday  — All VC portfolio scrapers → matcher
 *
 * Run manually:  node pipeline/scheduler.js --now
 * Start daemon:  node pipeline/scheduler.js
 *
 * Supabase migration: replace node-cron with pg_cron or Edge Function triggers.
 */
import cron from 'node-cron'
import { runEdgarPoller }   from './scrapers/edgar.js'
import { runAllScrapers }   from './scrapers/run-all.js'
import { runMatcher }       from './enrichment/matcher.js'
import { runEnrichment }    from './enrichment/claude.js'

async function runDailyPipeline() {
  console.log(`\n[${new Date().toISOString()}] Daily pipeline starting…`)
  try {
    await runEdgarPoller({ days: 2 })
    await runMatcher()
    await runEnrichment({ batchMode: true, limit: 100 })
    console.log(`[${new Date().toISOString()}] Daily pipeline complete.`)
  } catch (err) {
    console.error('Daily pipeline error:', err)
  }
}

async function runWeeklyPipeline() {
  console.log(`\n[${new Date().toISOString()}] Weekly portfolio scrape starting…`)
  try {
    await runAllScrapers()
    await runMatcher()
    console.log(`[${new Date().toISOString()}] Weekly pipeline complete.`)
  } catch (err) {
    console.error('Weekly pipeline error:', err)
  }
}

// --now flag: run everything immediately and exit
if (process.argv.includes('--now')) {
  await runWeeklyPipeline()
  await runDailyPipeline()
  process.exit(0)
}

// Scheduled jobs
cron.schedule('0 6 * * *',   runDailyPipeline,  { timezone: 'UTC' })
cron.schedule('0 5 * * 0',   runWeeklyPipeline, { timezone: 'UTC' })

console.log('FundStats pipeline scheduler running.')
console.log('  Daily pipeline: 06:00 UTC')
console.log('  Weekly scrape:  05:00 UTC Sundays')
