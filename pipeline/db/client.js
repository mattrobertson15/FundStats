/**
 * SQLite client wrapper using better-sqlite3.
 *
 * To swap for Supabase: replace this file with a @supabase/supabase-js client
 * that exposes the same interface. See README.md for migration details.
 */
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || join(__dir, '../../fundstats.db')

let _db

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')

    const schema = readFileSync(join(__dir, 'schema.sql'), 'utf8')
    _db.exec(schema)
  }
  return _db
}

export function closeDb() {
  if (_db) { _db.close(); _db = null }
}
