/**
 * Claude API enrichment: fills in sector, valuation, description, and hq
 * for raises that came from EDGAR (which lacks this detail).
 *
 * Uses tool use with strict schema for guaranteed JSON output.
 * Uses Batch API for bulk runs (50% cheaper); falls back to single API for ad-hoc.
 */
import Anthropic from '@anthropic-ai/sdk'
import { getDb } from '../db/client.js'

const SECTORS = [
  'AI/ML', 'CleanTech', 'HealthTech', 'Robotics', 'FinTech', 'DevTools',
  'Quantum', 'Logistics', 'Semiconductors', 'Biotech', 'EdTech', 'SpaceTech',
  'Cybersecurity', 'AgriTech', 'Materials', 'Analytics', 'Cloud',
  'Computer Vision', 'Data Privacy', 'Mobility', 'InsurTech', 'Energy', 'DefenseTech',
]

const EXTRACT_TOOL = {
  name: 'extract_deal',
  description: 'Extract structured information about a venture capital funding deal.',
  input_schema: {
    type: 'object',
    properties: {
      sector: {
        type: 'string',
        enum: SECTORS,
        description: 'Best matching industry sector from the allowed list.',
      },
      round: {
        type: 'string',
        enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D'],
        description: 'Funding round stage if mentioned.',
      },
      amount: {
        type: 'number',
        description: 'Amount raised in $M (e.g. 85 for $85M). Null if not found.',
      },
      valuation: {
        type: 'number',
        description: 'Post-money valuation in $M. Null if not mentioned.',
      },
      hq: {
        type: 'string',
        description: 'Company headquarters city and state/country.',
      },
      description: {
        type: 'string',
        description: 'One or two sentence summary of the company and what the funding is for. Max 200 chars.',
      },
    },
    required: ['sector'],
  },
}

function buildPrompt(company, rawText) {
  return `Extract funding deal details for "${company}" from the following text. Use the extract_deal tool.\n\n<text>\n${rawText.slice(0, 4000)}\n</text>`
}

async function enrichSingle(client, raise) {
  const prompt = buildPrompt(raise.company, raise.description || raise.company)
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content: prompt }],
  })

  const toolUse = response.content.find(b => b.type === 'tool_use')
  return toolUse?.input || {}
}

export async function runEnrichment({ batchMode = false, limit = 50 } = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — skipping Claude enrichment.')
    return 0
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const db = getDb()

  // Find raises that need enrichment (from EDGAR, missing sector or description)
  const toEnrich = db.prepare(`
    SELECT id, company, description, sector, hq
    FROM raises
    WHERE source = 'edgar' AND (sector IS NULL OR description IS NULL)
    LIMIT ?
  `).all(limit)

  if (toEnrich.length === 0) {
    console.log('Enrichment: nothing to enrich.')
    return 0
  }

  const updateRaise = db.prepare(`
    UPDATE raises SET
      sector      = COALESCE(@sector, sector),
      round       = COALESCE(@round, round),
      amount      = CASE WHEN amount = 0 THEN COALESCE(@amount, amount) ELSE amount END,
      valuation   = COALESCE(@valuation, valuation),
      hq          = COALESCE(@hq, hq),
      description = COALESCE(@description, description)
    WHERE id = @id
  `)

  if (batchMode && toEnrich.length > 5) {
    // Use Claude Batch API for 50% discount
    console.log(`Enrichment: submitting ${toEnrich.length} items to Batch API…`)
    const requests = toEnrich.map(raise => ({
      custom_id: String(raise.id),
      params: {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        tools: [EXTRACT_TOOL],
        tool_choice: { type: 'any' },
        messages: [{
          role: 'user',
          content: buildPrompt(raise.company, raise.description || raise.company),
        }],
      },
    }))

    const batch = await client.messages.batches.create({ requests })
    console.log(`Batch submitted: ${batch.id} — check results after processing completes.`)
    console.log(`Poll status: node -e "import('@anthropic-ai/sdk').then(m => new m.default().messages.batches.retrieve('${batch.id}').then(console.log))"`)
    return toEnrich.length
  }

  // Standard sequential enrichment
  let enriched = 0
  for (const raise of toEnrich) {
    try {
      const data = await enrichSingle(client, raise)
      db.transaction(() => {
        updateRaise.run({ id: raise.id, ...data })
      })()
      enriched++
      await new Promise(r => setTimeout(r, 200)) // gentle rate limiting
    } catch (err) {
      console.warn(`Enrichment failed for raise ${raise.id} (${raise.company}): ${err.message}`)
    }
  }

  console.log(`Enrichment: updated ${enriched} raises.`)
  return enriched
}

// CLI
if (process.argv[1].endsWith('claude.js')) {
  await runEnrichment({ batchMode: process.argv.includes('--batch') })
}
