/**
 * Shared Playwright helper for VC portfolio scrapers.
 * Each firm scraper calls scrapeWithPlaywright() and provides a page handler.
 */
import { chromium } from 'playwright'

export async function scrapeWithPlaywright(url, handler, { timeout = 30000 } = {}) {
  const browser = await chromium.launch({ headless: true })
  try {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout })
    const result = await handler(page)
    await ctx.close()
    return result
  } finally {
    await browser.close()
  }
}

/**
 * Intercept the first matching XHR/fetch response and return its JSON.
 * Useful for sites that load portfolio data via API call on page load.
 */
export async function interceptJson(url, matchUrl, { timeout = 20000 } = {}) {
  const browser = await chromium.launch({ headless: true })
  try {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    })
    const page = await ctx.newPage()

    const responsePromise = page.waitForResponse(
      r => r.url().includes(matchUrl) && r.status() === 200,
      { timeout }
    )
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout })

    const response = await responsePromise
    const json = await response.json()
    await ctx.close()
    return json
  } finally {
    await browser.close()
  }
}
