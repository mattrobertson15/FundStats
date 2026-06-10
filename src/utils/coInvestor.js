export function getPairKey(a, b) {
  return [a, b].sort().join('|')
}

export function computeCoInvestments(raises, vcFirms) {
  const trackedNames = new Set(vcFirms.map(f => f.shortName))
  const pairCounts = {}
  const sharedDeals = {}

  for (const raise of raises) {
    const investors = (raise.investors || []).filter(inv => trackedNames.has(inv))
    for (let i = 0; i < investors.length; i++) {
      for (let j = i + 1; j < investors.length; j++) {
        const key = getPairKey(investors[i], investors[j])
        pairCounts[key] = (pairCounts[key] || 0) + 1
        if (!sharedDeals[key]) sharedDeals[key] = []
        sharedDeals[key].push(raise)
      }
    }
  }

  // Total co-investment activity per firm (sum across all its pairs)
  const firmTotals = {}
  for (const [key, count] of Object.entries(pairCounts)) {
    const [a, b] = key.split('|')
    firmTotals[a] = (firmTotals[a] || 0) + count
    firmTotals[b] = (firmTotals[b] || 0) + count
  }

  return { pairCounts, sharedDeals, firmTotals }
}
