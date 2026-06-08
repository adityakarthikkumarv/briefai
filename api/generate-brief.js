// api/generate-brief.js — Edge Runtime (25s timeout on Hobby plan)
import Anthropic from "@anthropic-ai/sdk";

// Edge runtime = 25s timeout vs Node.js 10s timeout
export const config = { runtime: "edge" };

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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY not set in Vercel Environment Variables",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
    });
  }

  const { companyName, meetingContext, yourRole } = body;
  if (!companyName?.trim()) {
    return new Response(JSON.stringify({ error: "Company name required" }), {
      status: 400,
    });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: `You are a sales intelligence analyst. Generate a meeting brief.
Return ONLY valid JSON. No markdown. No backticks. Just JSON.
{
  "company_overview": "2 sentences about the company",
  "prep_score": 75,
  "recent_news": [
    {"headline":"...","date":"2026-05","source":"...","source_url":"","significance":"..."},
    {"headline":"...","date":"2026-04","source":"...","source_url":"","significance":"..."},
    {"headline":"...","date":"2026-03","source":"...","source_url":"","significance":"..."}
  ],
  "financial_signals": {
    "stage":"Series B or Public etc",
    "last_funding":"amount and year",
    "revenue_estimate":"range",
    "growth_signal":"Positive",
    "employees":"500-1000",
    "ceo":"CEO Name",
    "description":"one sentence business model"
  },
  "social_signals": {
    "overall_tone":"Bullish",
    "key_themes":["theme1","theme2","theme3"],
    "notable_post":{"author":"Name, Title","content_summary":"...","significance":"..."}
  },
  "top_talking_points": [
    "Specific talking point 1",
    "Specific talking point 2",
    "Specific talking point 3"
  ],
  "deal_risk_flags": [],
  "data_freshness": "Claude training knowledge",
  "generated_at": "${new Date().toISOString()}"
}`,
      messages: [
        {
          role: "user",
          content: `Company: ${companyName.trim()}
Meeting: ${meetingContext || "Sales call"}
Role: ${yourRole || "Account Executive"}
Return JSON only.`,
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

    return new Response(JSON.stringify(brief), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[BriefAI]", err.message);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate brief" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
