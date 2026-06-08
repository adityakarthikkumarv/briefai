// api/generate-brief.js
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { companyName, meetingContext, yourRole } = body;

  if (!companyName?.trim()) {
    return new Response(JSON.stringify({ error: "companyName is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not set in Vercel Environment Variables.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // Fetch news with 5 second timeout
    const newsData = await fetchNewsWithTimeout(companyName, 5000);

    // Generate brief with Claude
    const brief = await generateBrief(
      companyName,
      meetingContext || "Sales meeting",
      yourRole || "Account Executive",
      newsData,
    );

    return new Response(JSON.stringify(brief), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[generate-brief] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Fetch news with a hard timeout so it never blocks Claude
async function fetchNewsWithTimeout(companyName, timeoutMs) {
  if (!process.env.NEWS_API_KEY) {
    return { articles: [], note: "No NewsAPI key" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", `"${companyName}"`);
    url.searchParams.set("from", fromDate);
    url.searchParams.set("sortBy", "relevancy");
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "5");
    url.searchParams.set("apiKey", process.env.NEWS_API_KEY);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();

    if (data.status !== "ok") return { articles: [], note: data.message };

    return {
      articles: (data.articles || []).map((a) => ({
        headline: a.title,
        date: a.publishedAt?.split("T")[0],
        source: a.source?.name,
        source_url: a.url,
        description: a.description,
      })),
    };
  } catch {
    return {
      articles: [],
      note: "News fetch timed out — using Claude knowledge",
    };
  }
}

// Generate brief with Claude
async function generateBrief(companyName, meetingContext, yourRole, newsData) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const newsContext =
    newsData.articles?.length > 0
      ? `Recent news (last 30 days):\n${newsData.articles
          .map(
            (a, i) =>
              `${i + 1}. ${a.headline} (${a.source}, ${a.date})\n   ${a.description || ""}`,
          )
          .join("\n\n")}`
      : `No live news available. Use your training knowledge about ${companyName}.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You are BriefAI, a sales intelligence analyst.
Generate a pre-meeting brief for a sales representative.
Return ONLY valid JSON. No markdown. No explanation. Just JSON.

Use this exact structure:
{
  "company_overview": "2-sentence summary",
  "prep_score": <50-95>,
  "recent_news": [
    {
      "headline": "...",
      "date": "YYYY-MM-DD",
      "source": "source name",
      "source_url": "",
      "significance": "why this matters for the sales rep"
    }
  ],
  "financial_signals": {
    "stage": "e.g. Private/Series B/Public",
    "last_funding": "amount and year or Unknown",
    "revenue_estimate": "range or Unknown",
    "growth_signal": "Positive or Neutral or Negative",
    "employees": "approximate number",
    "ceo": "CEO name",
    "description": "one sentence about business model"
  },
  "social_signals": {
    "overall_tone": "Bullish or Cautious or Under Pressure",
    "key_themes": ["theme1", "theme2", "theme3"],
    "notable_post": {
      "author": "Name, Title",
      "content_summary": "what they posted about",
      "significance": "why this matters for the sales rep"
    }
  },
  "top_talking_points": [
    "Evidence-based talking point 1",
    "Evidence-based talking point 2",
    "Evidence-based talking point 3"
  ],
  "deal_risk_flags": [],
  "data_freshness": "Last 30 days",
  "generated_at": "${new Date().toISOString()}"
}`,
    messages: [
      {
        role: "user",
        content: `Company: ${companyName}
Meeting: ${meetingContext}
My role: ${yourRole}

${newsContext}

Generate the meeting brief as JSON now.`,
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

  const parsed = JSON.parse(raw);

  // Inject real source URLs from NewsAPI
  if (parsed.recent_news && newsData.articles?.length > 0) {
    parsed.recent_news = parsed.recent_news.map((item) => {
      const match = newsData.articles.find((a) =>
        a.headline
          ?.toLowerCase()
          .includes(item.headline?.toLowerCase().slice(0, 20)),
      );
      return {
        ...item,
        source_url: match?.source_url || "",
        source: match?.source || item.source || "",
      };
    });
  }

  return parsed;
}
