/**
 * Production entrypoint.
 *
 * Runs the public API and the scheduled scraper pipeline in one process so a
 * SQLite-backed deployment can keep reads and writes on the same persistent disk.
 */
import { getDb } from './db/client.js'

if (process.env.AUTO_SEED !== 'false') {
  const db = getDb()
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM vc_firms').get()
  if (count === 0) {
    console.log('Database is empty; seeding bundled starter data.')
    await import('./db/seed.js')
  }
}

await import('./api/index.js')
await import('./scheduler.js')
