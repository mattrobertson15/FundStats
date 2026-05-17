export const ROUNDS = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D']

export const ROUND_COLORS = {
  'Pre-Seed': '#a78bfa',
  'Seed':     '#818cf8',
  'Series A': '#6366f1',
  'Series B': '#38bdf8',
  'Series C': '#22c55e',
  'Series D': '#f59e0b',
}

export const raises = [
  // 2024
  { id: 1,  company: 'NeuralPath AI',      round: 'Series B',  amount: 85,   valuation: 520,  date: '2024-01-08', sector: 'AI/ML',         hq: 'San Francisco, CA', description: 'NeuralPath AI raised $85M Series B to accelerate deployment of its foundation models for enterprise automation, bringing valuation to $520M.' },
  { id: 2,  company: 'GreenVolt Energy',   round: 'Series A',  amount: 42,   valuation: 180,  date: '2024-01-22', sector: 'CleanTech',     hq: 'Austin, TX',         description: 'GreenVolt Energy closed a $42M Series A to scale its grid-scale battery storage systems across the US Southwest.' },
  { id: 3,  company: 'Meridian Health',    round: 'Seed',      amount: 12,   valuation: 55,   date: '2024-02-05', sector: 'HealthTech',    hq: 'Boston, MA',         description: 'Meridian Health secured $12M Seed funding to expand its AI-driven diagnostic platform to rural healthcare providers.' },
  { id: 4,  company: 'Axiom Robotics',     round: 'Series C',  amount: 150,  valuation: 890,  date: '2024-02-14', sector: 'Robotics',      hq: 'Pittsburgh, PA',     description: 'Axiom Robotics raised $150M Series C to manufacture autonomous warehouse robots at scale, led by Tiger Global.' },
  { id: 5,  company: 'Luminary Finance',   round: 'Pre-Seed',  amount: 3.5,  valuation: 18,   date: '2024-02-28', sector: 'FinTech',       hq: 'New York, NY',       description: 'Luminary Finance emerged from stealth with $3.5M Pre-Seed to build real-time embedded insurance infrastructure.' },
  { id: 6,  company: 'CloudNest',          round: 'Series A',  amount: 28,   valuation: 140,  date: '2024-03-11', sector: 'DevTools',      hq: 'Seattle, WA',        description: 'CloudNest raised $28M Series A to scale its developer-first multi-cloud infrastructure management platform.' },
  { id: 7,  company: 'QuantumBridge',      round: 'Series B',  amount: 110,  valuation: 640,  date: '2024-03-19', sector: 'Quantum',       hq: 'Cambridge, MA',      description: 'QuantumBridge secured $110M Series B to commercialize error-corrected quantum processors for financial modeling.' },
  { id: 8,  company: 'Velox Logistics',    round: 'Series A',  amount: 35,   valuation: 165,  date: '2024-04-02', sector: 'Logistics',     hq: 'Chicago, IL',        description: 'Velox Logistics closed $35M Series A to expand its AI-dispatched last-mile delivery network to 12 new metro areas.' },
  { id: 9,  company: 'ArcLight Semi',      round: 'Series C',  amount: 200,  valuation: 1200, date: '2024-04-17', sector: 'Semiconductors', hq: 'Santa Clara, CA',   description: 'ArcLight Semi raised $200M Series C at a $1.2B valuation to tape out its next-gen edge-AI chip targeting autonomous vehicles.' },
  { id: 10, company: 'Petal Bio',          round: 'Seed',      amount: 18,   valuation: 72,   date: '2024-05-03', sector: 'Biotech',       hq: 'South San Francisco, CA', description: 'Petal Bio raised $18M Seed to advance its CRISPR-based gene editing platform targeting rare metabolic disorders.' },
  { id: 11, company: 'Folio EdTech',       round: 'Pre-Seed',  amount: 2.8,  valuation: 14,   date: '2024-05-15', sector: 'EdTech',        hq: 'Denver, CO',         description: 'Folio EdTech raised $2.8M Pre-Seed to build adaptive K-12 learning tools powered by personalized AI curricula.' },
  { id: 12, company: 'Stratos Space',      round: 'Series A',  amount: 55,   valuation: 310,  date: '2024-06-01', sector: 'SpaceTech',     hq: 'Hawthorne, CA',      description: 'Stratos Space closed a $55M Series A to develop reusable small-launch vehicles targeting LEO satellite deployment.' },
  { id: 13, company: 'Cipher Security',    round: 'Series B',  amount: 70,   valuation: 420,  date: '2024-06-20', sector: 'Cybersecurity', hq: 'Washington, DC',     description: 'Cipher Security raised $70M Series B to expand its zero-trust network access platform for federal agencies.' },
  { id: 14, company: 'Harvest AI',         round: 'Seed',      amount: 9,    valuation: 38,   date: '2024-07-08', sector: 'AgriTech',      hq: 'Des Moines, IA',     description: 'Harvest AI secured $9M Seed funding to deploy precision agriculture sensors and ML-based yield forecasting to Midwest farms.' },
  { id: 15, company: 'Nexus Materials',    round: 'Series A',  amount: 32,   valuation: 155,  date: '2024-07-22', sector: 'Materials',     hq: 'Raleigh, NC',        description: 'Nexus Materials raised $32M Series A to commercialize its graphene-enhanced battery cathode materials for EV manufacturers.' },
  { id: 16, company: 'Polar Analytics',   round: 'Series B',  amount: 62,   valuation: 380,  date: '2024-08-05', sector: 'Analytics',     hq: 'New York, NY',       description: 'Polar Analytics raised $62M Series B to grow its e-commerce attribution and profitability platform across North America and Europe.' },
  { id: 17, company: 'Embark Health',      round: 'Series D',  amount: 280,  valuation: 2100, date: '2024-08-19', sector: 'HealthTech',    hq: 'San Francisco, CA',  description: 'Embark Health closed $280M Series D at a $2.1B valuation to accelerate rollout of its virtual-first primary care network.' },
  { id: 18, company: 'Vanta AI',           round: 'Pre-Seed',  amount: 4.2,  valuation: 22,   date: '2024-09-03', sector: 'AI/ML',         hq: 'Austin, TX',         description: 'Vanta AI raised $4.2M Pre-Seed to build automated compliance documentation using large language models.' },
  { id: 19, company: 'Iris Vision',        round: 'Seed',      amount: 15,   valuation: 62,   date: '2024-09-17', sector: 'Computer Vision', hq: 'Atlanta, GA',      description: 'Iris Vision secured $15M Seed to develop real-time defect detection systems for semiconductor fabs using computer vision.' },
  { id: 20, company: 'Helix Compute',      round: 'Series C',  amount: 175,  valuation: 1050, date: '2024-10-01', sector: 'Cloud',          hq: 'Seattle, WA',       description: 'Helix Compute raised $175M Series C to build GPU cloud infrastructure optimized for AI training workloads.' },
  { id: 21, company: 'Trailhead Carbon',   round: 'Series A',  amount: 48,   valuation: 240,  date: '2024-10-14', sector: 'CleanTech',     hq: 'Portland, OR',       description: 'Trailhead Carbon closed $48M Series A to scale its direct air capture technology and build its first commercial facility.' },
  { id: 22, company: 'Sovereign Data',     round: 'Series B',  amount: 90,   valuation: 540,  date: '2024-11-05', sector: 'Data Privacy',  hq: 'New York, NY',       description: 'Sovereign Data raised $90M Series B to expand its privacy-preserving data clean room platform to global enterprise clients.' },
  { id: 23, company: 'Aurum Payments',     round: 'Seed',      amount: 11,   valuation: 48,   date: '2024-11-19', sector: 'FinTech',       hq: 'Miami, FL',          description: 'Aurum Payments secured $11M Seed to launch a cross-border B2B payments rail with sub-second settlement times.' },
  { id: 24, company: 'Phantom Mobility',   round: 'Series D',  amount: 320,  valuation: 2800, date: '2024-12-03', sector: 'Mobility',      hq: 'San Francisco, CA',  description: 'Phantom Mobility raised $320M Series D to bring its Level 4 autonomous trucking platform to commercial freight routes.' },
  { id: 25, company: 'Beacon Insurance',   round: 'Pre-Seed',  amount: 5,    valuation: 28,   date: '2024-12-17', sector: 'InsurTech',     hq: 'Chicago, IL',        description: 'Beacon Insurance emerged with $5M Pre-Seed to rebuild homeowners insurance underwriting with satellite imagery and ML.' },

  // 2025 Q1
  { id: 26, company: 'Lattice Genomics',   round: 'Series A',  amount: 60,   valuation: 300,  date: '2025-01-07', sector: 'Biotech',       hq: 'Cambridge, MA',      description: 'Lattice Genomics closed $60M Series A to develop its multi-cancer early detection blood test targeting 20+ cancer types.' },
  { id: 27, company: 'Obsidian Cloud',     round: 'Series C',  amount: 140,  valuation: 820,  date: '2025-01-21', sector: 'Cloud',         hq: 'San Jose, CA',       description: 'Obsidian Cloud raised $140M Series C to accelerate global expansion of its sovereign cloud platform for regulated industries.' },
  { id: 28, company: 'Forge Robotics',     round: 'Seed',      amount: 22,   valuation: 88,   date: '2025-02-04', sector: 'Robotics',      hq: 'Detroit, MI',        description: 'Forge Robotics secured $22M Seed to build collaborative welding robots for medium-sized auto parts manufacturers.' },
  { id: 29, company: 'Zenith AI',          round: 'Series B',  amount: 95,   valuation: 560,  date: '2025-02-18', sector: 'AI/ML',         hq: 'San Francisco, CA',  description: 'Zenith AI raised $95M Series B to grow its AI-powered legal research and contract analysis platform to Am Law 200 firms.' },
  { id: 30, company: 'Meridian Fusion',    round: 'Series A',  amount: 72,   valuation: 380,  date: '2025-03-04', sector: 'Energy',        hq: 'Vancouver, BC',      description: 'Meridian Fusion closed $72M Series A to advance its compact nuclear fusion reactor design toward proof-of-concept ignition.' },
  { id: 31, company: 'Crestline Bio',      round: 'Pre-Seed',  amount: 6,    valuation: 32,   date: '2025-03-18', sector: 'Biotech',       hq: 'San Diego, CA',      description: 'Crestline Bio raised $6M Pre-Seed to develop RNA-based therapeutics for neurodegenerative diseases including ALS.' },

  // 2025 Q2
  { id: 32, company: 'Solis Solar',        round: 'Series B',  amount: 88,   valuation: 510,  date: '2025-04-01', sector: 'CleanTech',     hq: 'Phoenix, AZ',        description: 'Solis Solar raised $88M Series B to manufacture its perovskite-silicon tandem solar panels at its new Arizona gigafactory.' },
  { id: 33, company: 'Atlas Defense',      round: 'Series C',  amount: 160,  valuation: 980,  date: '2025-04-15', sector: 'DefenseTech',   hq: 'Arlington, VA',      description: 'Atlas Defense secured $160M Series C to expand its AI-driven drone countermeasure systems to NATO allies.' },
  { id: 34, company: 'Nimbus AgriTech',    round: 'Seed',      amount: 14,   valuation: 58,   date: '2025-04-29', sector: 'AgriTech',      hq: 'Fresno, CA',         description: 'Nimbus AgriTech raised $14M Seed to commercialize its autonomous field-scouting drones for specialty crop farmers.' },
  { id: 35, company: 'Prism Analytics',    round: 'Series A',  amount: 40,   valuation: 210,  date: '2025-05-13', sector: 'Analytics',     hq: 'Austin, TX',         description: 'Prism Analytics closed $40M Series A to build real-time supply chain visibility software for Fortune 500 manufacturers.' },
]

function aggregateByPeriod(data, period) {
  const buckets = {}

  data.forEach(r => {
    const d = new Date(r.date)
    let key

    if (period === 'daily') {
      key = r.date
    } else if (period === 'monthly') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    } else if (period === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3) + 1
      key = `${d.getFullYear()} Q${q}`
    } else {
      key = String(d.getFullYear())
    }

    if (!buckets[key]) {
      buckets[key] = { period: key, Total: 0 }
      ROUNDS.forEach(rnd => { buckets[key][rnd] = 0 })
    }
    buckets[key][r.round] += r.amount
    buckets[key].Total += r.amount
  })

  return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period))
}

export function getChartData(period, activeRounds, raises) {
  const filtered = activeRounds.includes('Total')
    ? raises
    : raises.filter(r => activeRounds.includes(r.round))

  return aggregateByPeriod(filtered, period)
}
