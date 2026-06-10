/**
 * Fuzzy-matches portfolio_companies names to raises companies,
 * then creates investments rows linking VC firm → raise.
 */
import { getDb } from '../db/client.js'

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(inc|llc|ltd|corp|co|the|technologies|technology|labs|ai|systems)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

function similarity(a, b) {
  const na = normalize(a), nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const maxLen = Math.max(na.length, nb.length)
  return 1 - levenshtein(na, nb) / maxLen
}

export async function runMatcher({ threshold = 0.80 } = {}) {
  const db = getDb()

  const portfolioCompanies = db.prepare(`
    SELECT pc.id, pc.vc_firm_id, pc.company_name
    FROM portfolio_companies pc
  `).all()

  const raises = db.prepare(`SELECT id, company FROM raises`).all()

  const insertInvestment = db.prepare(`
    INSERT OR IGNORE INTO investments (vc_firm_id, raise_id, source, confirmed)
    VALUES (@vc_firm_id, @raise_id, @source, @confirmed)
  `)

  let matched = 0
  const insertBatch = db.transaction((rows) => {
    for (const row of rows) insertInvestment.run(row)
  })

  const pending = []

  for (const pc of portfolioCompanies) {
    let bestScore = 0
    let bestRaise = null

    for (const raise of raises) {
      const score = similarity(pc.company_name, raise.company)
      if (score > bestScore) {
        bestScore = score
        bestRaise = raise
      }
    }

    if (bestScore >= threshold && bestRaise) {
      pending.push({
        vc_firm_id: pc.vc_firm_id,
        raise_id: bestRaise.id,
        source: 'portfolio_page',
        confirmed: bestScore >= 0.95 ? 1 : 0,
      })
      matched++
    }
  }

  insertBatch(pending)
  console.log(`Matcher: created ${matched} investment links from ${portfolioCompanies.length} portfolio entries.`)
  return matched
}

// CLI
if (process.argv[1].endsWith('matcher.js')) {
  await runMatcher()
}
