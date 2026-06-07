import { useState } from 'react'

const TABS = [
  { id: 'overview',  label: 'Overview',    icon: '🏢' },
  { id: 'news',      label: 'News',        icon: '📰' },
  { id: 'financial', label: 'Financial',   icon: '💰' },
  { id: 'social',    label: 'Sentiment',   icon: '📱' },
  { id: 'talking',   label: 'Talk Points', icon: '🎯' },
]

export default function BriefDisplay({ brief, company, meeting, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied]       = useState(false)

  const score = brief?.prep_score ?? 0
  const scoreColor =
    score >= 80 ? '#10B981' :
    score >= 60 ? '#F59E0B' : '#EF4444'

  async function copyBrief() {
    const text = formatBriefAsText(brief, company, meeting)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          New Brief
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={copyBrief}
            className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg text-sm transition-all"
          >
            {copied ? '✅ Copied!' : '📋 Copy Brief'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-600 hover:border-slateack-400 px-3 py-1.5 rounded-lg text-sm transition-all"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 border-b border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                BriefAI · Pre-Meeting Intelligence
              </div>
              <h1 className="text-white text-3xl font-extrabold">{company}</h1>
              {meeting && (
                <p className="text-slate-400 text-sm mt-1">{meeting}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-teal-400 text-xs">
                  {brief?.data_freshness || 'Data from last 30 days'}
                </span>
              </div>
            </div>

            {/* Prep Score Gauge */}
            <div className="flex-shrink-0 text-center">
              <PrepScore score={score} color={scoreColor} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-teal-400 border-teal-400 bg-teal-500/5'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/30'
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
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <h2 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
                Company Overview
              </h2>
              <p className="text-slate-200 text-base leading-relaxed mb-6">
                {brief?.company_overview || 'No overview available.'}
              </p>

              {brief?.deal_risk_flags?.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <p className="text-red-400 font-semibold text-sm mb-2">⚠️ Deal Risk Flags</p>
                  {brief.deal_risk_flags.map((flag, i) => (
                    <p key={i} className="text-red-300 text-sm">• {flag}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* News */}
          {activeTab === 'news' && (
            <div className="animate-fade-in">
              <h2 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
                Recent News — Last 30 Days
              </h2>
              {(!brief?.recent_news || brief.recent_news.length === 0) ? (
                <div className="text-center py-8 text-slate-500">
                  <span className="text-4xl block mb-3">📭</span>
                  No significant news found in the last 30 days.
                </div>
              ) : (
                <div className="space-y-4">
                  {brief.recent_news.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-white font-semibold text-sm leading-snug">{item.headline}</p>
                        <span className="text-slate-500 text-xs whitespace-nowrap">{item.date}</span>
                      </div>
                      <p className="text-teal-400 text-xs font-medium mb-1">
                        💡 {item.significance}
                      </p>
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 text-xs hover:text-teal-400 transition-colors"
                        >
                          {item.source} ↗
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">{item.source}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial */}
          {activeTab === 'financial' && (
            <div className="animate-fade-in">
              <h2 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
                Financial Signals
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  ['Funding Stage',    brief?.financial_signals?.stage],
                  ['Last Funding',     brief?.financial_signals?.last_funding],
                  ['Revenue Estimate', brief?.financial_signals?.revenue_estimate],
                  ['Growth Signal',    brief?.financial_signals?.growth_signal],
                  ['Employees',        brief?.financial_signals?.employees],
                  ['CEO',              brief?.financial_signals?.ceo],
                ].filter(([, v]) => v && v !== 'Unknown').map(([label, value]) => (
                  <div key={label} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50">
                    <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</div>
                    <div className="text-white font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>
              {brief?.financial_signals?.description && (
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">About</div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {brief.financial_signals.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Social Sentiment */}
          {activeTab === 'social' && (
            <div className="animate-fade-in">
              <h2 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
                Social Sentiment
              </h2>

              {/* Tone */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-slate-400 text-sm">Overall Tone:</span>
                <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                  brief?.social_signals?.overall_tone === 'Bullish'
                    ? 'bg-green-500/20 text-green-400'
                    : brief?.social_signals?.overall_tone === 'Under Pressure'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {brief?.social_signals?.overall_tone || 'Neutral'}
                </span>
              </div>

              {/* Key Themes */}
              {brief?.social_signals?.key_themes?.length > 0 && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-3">Key Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {brief.social_signals.key_themes.map((theme, i) => (
                      <span key={i} className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs px-3 py-1.5 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Post */}
              {brief?.social_signals?.notable_post && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <p className="text-blue-400 font-semibold text-xs mb-1">
                    📌 Notable Activity — {brief.social_signals.notable_post.author}
                  </p>
                  <p className="text-slate-300 text-sm mt-2">
                    {brief.social_signals.notable_post.content_summary}
                  </p>
                  {brief.social_signals.notable_post.significance && (
                    <p className="text-teal-400 text-xs mt-2 italic">
                      Why it matters: {brief.social_signals.notable_post.significance}
                    </p>
                  )}
                </div>
              )}

              {!brief?.social_signals?.notable_post && (
                <p className="text-slate-500 text-sm">No notable social signals found recently.</p>
              )}
            </div>
          )}

          {/* Talking Points */}
          {activeTab === 'talking' && (
            <div className="animate-fade-in">
              <h2 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">
                🎯 Top Talking Points
              </h2>
              <p className="text-slate-500 text-xs mb-5">
                Use these to open strong — each is based on real, current company signals.
              </p>

              {brief?.top_talking_points?.length > 0 ? (
                <div className="space-y-3">
                  {brief.top_talking_points.map((point, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl">
                      <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm">
                        {i + 1}
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed pt-1">{point}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No talking points generated.</p>
              )}

              <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <p className="text-amber-400 text-xs">
                  ⚡ <strong>Tip:</strong> Always verify critical data before the meeting.
                  These talking points are generated from real news and financial data —
                  but confirm before referencing in a live conversation.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-600 text-xs">
            Generated by BriefAI · {new Date().toLocaleTimeString('en-IN')}
          </p>
          <button
            onClick={onReset}
            className="text-teal-400 hover:text-teal-300 text-xs font-semibold transition-colors"
          >
            + New Brief
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Prep Score Circular Widget ────────────────────────────────────────────────
function PrepScore({ score, color }) {
  const r   = 28
  const circ = 2 * Math.PI * r
  const fill = ((score || 0) / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#334155" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-xl leading-none">{score}</span>
        </div>
      </div>
      <span className="text-slate-500 text-xs mt-1">Prep Score</span>
    </div>
  )
}

// ── Format brief as plain text for copying ────────────────────────────────────
function formatBriefAsText(brief, company, meeting) {
  return [
    `BRIEFAI — ${company?.toUpperCase()}`,
    meeting ? `Meeting: ${meeting}` : '',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    `Prep Score: ${brief?.prep_score}/100`,
    '',
    '━━ COMPANY OVERVIEW ━━',
    brief?.company_overview || '',
    '',
    '━━ TOP TALKING POINTS ━━',
    ...(brief?.top_talking_points || []).map((p, i) => `${i + 1}. ${p}`),
    '',
    '━━ RECENT NEWS ━━',
    ...(brief?.recent_news || []).map(n => `• ${n.headline} (${n.source})\n  → ${n.significance}`),
    '',
    '━━ FINANCIAL SIGNALS ━━',
    `Stage: ${brief?.financial_signals?.stage || 'Unknown'}`,
    `Revenue: ${brief?.financial_signals?.revenue_estimate || 'Unknown'}`,
    `Growth: ${brief?.financial_signals?.growth_signal || 'Unknown'}`,
    '',
    '━━ SOCIAL SENTIMENT ━━',
    `Overall Tone: ${brief?.social_signals?.overall_tone || 'Unknown'}`,
    '',
    'Generated by BriefAI — PS4 Capstone | BITSoM × Masai School',
  ].filter(line => line !== null && line !== undefined).join('\n')
}
