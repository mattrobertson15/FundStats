import { ROUNDS } from '../data/sampleData'

export function computeVCStats(firm, raises) {
  const portfolio = raises.filter(r => r.investors?.includes(firm.shortName))
  const totalDeployed = portfolio.reduce((s, r) => s + r.amount, 0)
  const totalValuation = portfolio.reduce((s, r) => s + (r.valuation || 0), 0)
  const investmentCount = portfolio.length

  const sectorCounts = {}
  portfolio.forEach(r => { sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1 })
  const topSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s)

  const stageCounts = {}
  ROUNDS.forEach(r => { stageCounts[r] = 0 })
  portfolio.forEach(r => { stageCounts[r.round]++ })

  const quarterlyData = (() => {
    const buckets = {}
    portfolio.forEach(r => {
      const d = new Date(r.date)
      const q = Math.floor(d.getMonth() / 3) + 1
      const key = `${d.getFullYear()} Q${q}`
      if (!buckets[key]) buckets[key] = { period: key, amount: 0 }
      buckets[key].amount += r.amount
    })
    return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period))
  })()

  return { firm, portfolio, totalDeployed, totalValuation, investmentCount, topSectors, stageCounts, quarterlyData }
}
