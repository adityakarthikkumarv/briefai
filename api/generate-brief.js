// api/generate-brief.js
// BriefAI — Core API Endpoint (Vercel Serverless Function)
// This file runs on the server. It calls NewsAPI + Claude and returns a brief.
// Vercel automatically exposes this as: https://your-site.vercel.app/api/generate-brief

import Anthropic from '@anthropic-ai/sdk'

export const config = { runtime: 'edge' }   // Use edge runtime for speed

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse request body
  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { companyName, meetingContext, yourRole } = body

  if (!companyName?.trim()) {
    return new Response(JSON.stringify({ error: 'companyName is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Check API keys ─────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({
      error: 'ANTHROPIC_API_KEY is not set. Please add it in Vercel Environment Variables.',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    // ── STEP 1: Fetch real news from NewsAPI ──────────────────────────────────
    const newsData = await fetchCompanyNews(companyName)

    // ── STEP 2: Call Claude to generate the brief ────────────────────────────
    const brief = await generateBriefWithClaude(
      companyName,
      meetingContext || 'Sales meeting',
      yourRole || 'Account Executive',
      newsData
    )

    return new Response(JSON.stringify(brief), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[generate-brief] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ── Fetch company news from NewsAPI ──────────────────────────────────────────
async function fetchCompanyNews(companyName) {
  if (!process.env.NEWS_API_KEY) {
    console.warn('[generate-brief] NEWS_API_KEY not set — skipping news fetch')
    return { articles: [], total: 0, note: 'NewsAPI key not configured' }
  }

  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', `"${companyName}"`)
  url.searchParams.set('from', fromDate)
  url.searchParams.set('sortBy', 'relevancy')
  url.searchParams.set('language', 'en')
  url.searchParams.set('pageSize', '10')
  url.searchParams.set('apiKey', process.env.NEWS_API_KEY)

  try {
    const res  = await fetch(url.toString())
    const data = await res.json()

    if (data.status !== 'ok') {
      console.warn('[generate-brief] NewsAPI error:', data.message)
      return { articles: [], total: 0, note: data.message }
    }

    return {
      articles: (data.articles || []).map(a => ({
        headline:    a.title,
        date:        a.publishedAt?.split('T')[0],
        source:      a.source?.name,
        source_url:  a.url,
        description: a.description,
      })),
      total: data.totalResults || 0,
    }
  } catch (err) {
    console.warn('[generate-brief] NewsAPI fetch failed:', err.message)
    return { articles: [], total: 0, note: err.message }
  }
}

// ── Generate brief with Claude ────────────────────────────────────────────────
async function generateBriefWithClaude(companyName, meetingContext, yourRole, newsData) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const newsContext = newsData.articles.length > 0
    ? `Recent news (last 30 days):\n${newsData.articles.map((a, i) =>
        `${i + 1}. ${a.headline} (${a.source}, ${a.date})\n   ${a.description || ''}`
      ).join('\n\n')}`
    : 'No recent news found from NewsAPI.'

  const systemPrompt = `You are BriefAI, a senior sales intelligence analyst.
Your job is to generate a concise, actionable 1-page meeting brief for a sales representative.

The brief must be based on the news provided and your training knowledge about the company.
Be specific. Be current. Be useful for a sales context.

CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no backticks. Just JSON.

Return this exact JSON structure:
{
  "company_overview": "2-sentence summary of what the company does and current state",
  "prep_score": <number 0-100 based on how much intelligence is available>,
  "recent_news": [
    {
      "headline": "...",
      "date": "YYYY-MM-DD or approximate",
      "source": "source name",
      "source_url": "url or empty string",
      "significance": "why this matters for the sales rep in one sentence"
    }
  ],
  "financial_signals": {
    "stage": "Startup/Series A/B/C/Growth/Public/Private",
    "last_funding": "amount and date if known, else Unknown",
    "revenue_estimate": "revenue range if known, else Unknown",
    "growth_signal": "Positive/Neutral/Negative",
    "employees": "approximate headcount if known",
    "ceo": "CEO name if known",
    "description": "1 sentence about their business model"
  },
  "social_signals": {
    "overall_tone": "Bullish/Cautious/Under Pressure",
    "key_themes": ["theme1", "theme2", "theme3"],
    "notable_post": {
      "author": "Name and title",
      "content_summary": "what they posted about",
      "significance": "why this matters for the sales rep"
    }
  },
  "top_talking_points": [
    "Specific, evidence-based talking point 1 — reference actual news or signals",
    "Specific, evidence-based talking point 2",
    "Specific, evidence-based talking point 3"
  ],
  "deal_risk_flags": [],
  "data_freshness": "News data: last 30 days",
  "generated_at": "${new Date().toISOString()}"
}`

  const userMessage = `Company: ${companyName}
Meeting context: ${meetingContext}
Sales rep role: ${yourRole}

${newsContext}

Based on this information and your knowledge of ${companyName}, generate a complete meeting brief.
Make the talking points specific and actionable — reference actual company news and signals.
Return only the JSON.`

  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userMessage }],
  })

  const rawText = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  // Strip markdown code fences if Claude added them
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/,      '')
    .replace(/\s*```$/,      '')
    .trim()

  // Inject real source URLs from NewsAPI into Claude's response
  const parsed = JSON.parse(cleaned)

  if (parsed.recent_news && newsData.articles.length > 0) {
    parsed.recent_news = parsed.recent_news.map(item => {
      // Try to match with real NewsAPI article
      const match = newsData.articles.find(a =>
        a.headline?.toLowerCase().includes(item.headline?.toLowerCase().slice(0, 20))
      )
      return {
        ...item,
        source_url: match?.source_url || item.source_url || '',
        source:     match?.source    || item.source    || '',
      }
    })
  }

  return parsed
}
