// api/generate-brief.js — Fast version (Claude only, no NewsAPI timeout)
import Anthropic from "@anthropic-ai/sdk";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!process.env.ANTHROPIC_API_KEY) {
    return json(
      { error: "ANTHROPIC_API_KEY not set in Vercel Environment Variables" },
      500,
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const { companyName, meetingContext, yourRole } = body;
  if (!companyName?.trim())
    return json({ error: "Company name is required" }, 400);

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are BriefAI, a sales intelligence analyst.
Generate a pre-meeting brief for a sales representative.
Use your knowledge about the company to fill all fields.
Return ONLY valid JSON — no markdown, no backticks, no explanation.

Use exactly this structure:
{
  "company_overview": "2-sentence summary of what the company does and current state",
  "prep_score": 78,
  "recent_news": [
    { "headline": "...", "date": "2026-05", "source": "...", "source_url": "", "significance": "why this matters for the sales rep" },
    { "headline": "...", "date": "2026-04", "source": "...", "source_url": "", "significance": "..." },
    { "headline": "...", "date": "2026-03", "source": "...", "source_url": "", "significance": "..." }
  ],
  "financial_signals": {
    "stage": "e.g. Series B / Public / Private",
    "last_funding": "amount and year or Unknown",
    "revenue_estimate": "range or Unknown",
    "growth_signal": "Positive or Neutral or Negative",
    "employees": "approximate headcount",
    "ceo": "CEO full name",
    "description": "one sentence about their business model"
  },
  "social_signals": {
    "overall_tone": "Bullish or Cautious or Under Pressure",
    "key_themes": ["theme1", "theme2", "theme3"],
    "notable_post": {
      "author": "Executive Name, Title",
      "content_summary": "what they have been talking about publicly",
      "significance": "why this matters for the sales rep"
    }
  },
  "top_talking_points": [
    "Specific opening line referencing a real company signal",
    "Second specific evidence-based talking point",
    "Third specific talking point tied to their current priorities"
  ],
  "deal_risk_flags": [],
  "data_freshness": "Based on Claude training knowledge",
  "generated_at": "${new Date().toISOString()}"
}`,
      messages: [
        {
          role: "user",
          content: `Generate a meeting brief for:
Company: ${companyName.trim()}
Meeting: ${meetingContext || "Sales discovery call"}
My role: ${yourRole || "Account Executive"}

Return only the JSON.`,
        },
      ],
    });

    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    const brief = JSON.parse(raw);
    return json(brief);
  } catch (err) {
    console.error("[BriefAI Error]", err.message);
    return json(
      { error: err.message || "Failed to generate brief. Please try again." },
      500,
    );
  }
}
