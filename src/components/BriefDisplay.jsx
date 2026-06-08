import { useState } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: "🏢" },
  { id: "news", label: "News", icon: "📰" },
  { id: "financial", label: "Financial", icon: "💰" },
  { id: "social", label: "Sentiment", icon: "📱" },
  { id: "talking", label: "Talk Points", icon: "🎯" },
];

export default function BriefDisplay({ brief, company, meeting, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const score = brief?.prep_score ?? 0;
  const scoreColor =
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  async function copyBrief() {
    const text = formatBriefAsText(brief, company, meeting);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-white hover:text-white/70 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          New Brief
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={copyBrief}
            className="flex items-center gap-2 text-white hover:text-white/70 border border-white/30 hover:border-teal-400 px-3 py-1.5 rounded-lg text-sm transition-all"
          >
            {copied ? "✅ Copied!" : "📋 Copy Brief"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-white hover:text-white/70 border border-white/30 hover:border-teal-400 px-3 py-1.5 rounded-lg text-sm transition-all"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800 border border-slate-600 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 border-b border-slate-600">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                BriefAI · Pre-Meeting Intelligence
              </div>
              <h1 className="text-white text-3xl font-extrabold">{company}</h1>
              {meeting && (
                <p className="text-white text-sm mt-1 opacity-90">{meeting}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-white text-xs opacity-90">
                  {brief?.data_freshness || "Claude AI knowledge"}
                </span>
              </div>
            </div>
            <PrepScore score={score} color={scoreColor} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-600 overflow-x-auto bg-slate-900/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "text-white/70 border-teal-400 bg-teal-500/10"
                  : "text-white/90 border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest">
                Company Overview
              </h2>
              <p className="text-white text-base leading-relaxed">
                {brief?.company_overview || "No overview available."}
              </p>
              {brief?.deal_risk_flags?.length > 0 && (
                <div className="p-4 bg-red-900/40 border border-red-400/50 rounded-2xl">
                  <p className="text-red-300 font-bold text-sm mb-2">⚠️ Deal Risk Flags</p>
                  {brief.deal_risk_flags.map((flag, i) => (
                    <p key={i} className="text-red-200 text-sm leading-relaxed">• {flag}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* News */}
          {activeTab === "news" && (
            <div className="animate-fade-in">
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                Recent News — Last 30 Days
              </h2>
              {!brief?.recent_news || brief.recent_news.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-white opacity-80">No significant news found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {brief.recent_news.map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-white font-semibold text-sm leading-snug">
                          {item.headline}
                        </p>
                        <span className="text-white/80 text-xs whitespace-nowrap flex-shrink-0">
                          {item.date}
                        </span>
                      </div>
                      {item.significance && (
                        <p className="text-amber-300 text-xs font-medium mb-2 leading-relaxed">
                          💡 {item.significance}
                        </p>
                      )}
                      {item.source_url ? (
                        
                          <a href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/70 text-xs hover:text-teal-300 transition-colors"
                        >
                          {item.source} ↗
                        </a>
                      ) : (
                        <span className="text-white/70 text-xs">{item.source}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial */}
          {activeTab === "financial" && (
            <div className="animate-fade-in">
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                Financial Signals
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["Funding Stage", brief?.financial_signals?.stage],
                  ["Last Funding", brief?.financial_signals?.last_funding],
                  ["Revenue Estimate", brief?.financial_signals?.revenue_estimate],
                  ["Growth Signal", brief?.financial_signals?.growth_signal],
                  ["Employees", brief?.financial_signals?.employees],
                  ["CEO", brief?.financial_signals?.ceo],
                ]
                  .filter(([, v]) => v && v !== "Unknown")
                  .map(([label, value]) => (
                    <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="text-white/80 text-xs uppercase tracking-wide mb-1">
                        {label}
                      </div>
                      <div className="text-white font-semibold text-sm">{value}</div>
                    </div>
                  ))}
              </div>
              {brief?.financial_signals?.description && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-white/80 text-xs uppercase tracking-wide mb-2">About</div>
                  <p className="text-white text-sm leading-relaxed">
                    {brief.financial_signals.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sentiment */}
          {activeTab === "social" && (
            <div className="animate-fade-in">
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                Social Sentiment
              </h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-white text-sm font-medium">Overall Tone:</span>
                <span
                  className={`font-bold text-sm px-4 py-1.5 rounded-full border ${
                    brief?.social_signals?.overall_tone === "Bullish"
                      ? "bg-green-500/20 text-green-300 border-green-400/50"
                      : brief?.social_signals?.overall_tone === "Under Pressure"
                      ? "bg-red-500/20 text-red-300 border-red-400/50"
                      : "bg-amber-500/20 text-amber-300 border-amber-400/50"
                  }`}
                >
                  {brief?.social_signals?.overall_tone || "Neutral"}
                </span>
              </div>
              {brief?.social_signals?.key_themes?.length > 0 && (
                <div className="mb-5">
                  <p className="text-white/80 text-xs uppercase tracking-wide mb-3">Key Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {brief.social_signals.key_themes.map((theme, i) => (
                      <span
                        key={i}
                        className="bg-white/10 border border-white/25 text-white text-xs px-3 py-1.5 rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {brief?.social_signals?.notable_post && (
                <div className="p-4 bg-teal-900/40 border border-teal-400/30 rounded-2xl">
                  <p className="text-teal-300 font-bold text-xs mb-2">
                    📌 Notable Activity — {brief.social_signals.notable_post.author}
                  </p>
                  <p className="text-white text-sm leading-relaxed mt-1">
                    {brief.social_signals.notable_post.content_summary}
                  </p>
                  {brief.social_signals.notable_post.significance && (
                    <p className="text-amber-300 text-xs mt-2 italic">
                      Why it matters: {brief.social_signals.notable_post.significance}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Talking Points */}
          {activeTab === "talking" && (
            <div className="animate-fade-in">
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                🎯 Top Talking Points
              </h2>
              <p className="text-white/80 text-xs mb-5">
                Use these to open strong — each based on real company signals.
              </p>
              {brief?.top_talking_points?.length > 0 ? (
                <div className="space-y-3">
                  {brief.top_talking_points.map((point, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-teal-900/30 border border-teal-400/25 rounded-2xl"
                    >
                      <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm">
                        {i + 1}
                      </div>
                      <p className="text-white text-sm leading-relaxed pt-1">{point}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/80 text-sm">No talking points generated.</p>
              )}
              <div className="mt-5 p-4 bg-amber-900/30 border border-amber-400/30 rounded-2xl">
                <p className="text-amber-300 text-xs leading-relaxed">
                  ⚡ <strong>Tip:</strong> Always verify critical data before the meeting. These are generated by Claude AI.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/10 flex items-center justify-between bg-slate-900/30">
          <p className="text-white/70 text-xs">
            Generated by BriefAI · {new Date().toLocaleTimeString("en-IN")}
          </p>
          <button
            onClick={onReset}
            className="text-white/70 hover:text-teal-300 text-xs font-semibold transition-colors"
          >
            + New Brief
          </button>
        </div>

      </div>
    </div>
  );
}

function PrepScore({ score, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#334155" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{score}</span>
        </div>
      </div>
      <span className="text-white/70 text-xs mt-1">Prep Score</span>
    </div>
  );
}

function formatBriefAsText(brief, company, meeting) {
  return [
    `BRIEFAI — ${company?.toUpperCase()}`,
    meeting ? `Meeting: ${meeting}` : "",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    `Prep Score: ${brief?.prep_score}/100`,
    "",
    "━━ COMPANY OVERVIEW ━━",
    brief?.company_overview || "",
    "",
    "━━ TOP TALKING POINTS ━━",
    ...(brief?.top_talking_points || []).map((p, i) => `${i + 1}. ${p}`),
    "",
    "━━ RECENT NEWS ━━",
    ...(brief?.recent_news || []).map(
      (n) => `• ${n.headline} (${n.source})\n  → ${n.significance}`
    ),
    "",
    "━━ FINANCIAL ━━",
    `Stage: ${brief?.financial_signals?.stage || "Unknown"}`,
    `Revenue: ${brief?.financial_signals?.revenue_estimate || "Unknown"}`,
    "",
    "Generated by BriefAI — PS4 Capstone | BITSoM × Masai School",
  ].join("\n");
}