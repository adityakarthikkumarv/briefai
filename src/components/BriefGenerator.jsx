import { useState } from 'react'

const DEMO_EXAMPLES = [
  { company: 'Anthropic', context: 'Enterprise AI tools sales pitch' },
  { company: 'Zepto', context: 'Partnership and integration discussion' },
  { company: 'Razorpay', context: 'Fintech SaaS solution demo' },
  { company: 'Freshworks', context: 'CRM integration upsell call' },
]

export default function BriefGenerator({ onGenerate, error }) {
  const [companyName, setCompanyName] = useState('')
  const [meetingContext, setMeetingContext] = useState('')
  const [yourRole, setYourRole] = useState('')
  const [loading, setLoading] = useState(false)

  function handleDemo(example) {
    setCompanyName(example.company)
    setMeetingContext(example.context)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!companyName.trim()) return
    setLoading(true)
    await onGenerate({
      companyName: companyName.trim(),
      meetingContext: meetingContext.trim() || 'Sales meeting',
      yourRole: yourRole.trim() || 'Account Executive',
    })
    setLoading(false)
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-2 mb-6">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
          <span className="text-teal-400 text-sm font-medium">AI Agent Running — Powered by Claude + NewsAPI</span>
        </div>

        <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          Walk into every meeting
          <br />
          <span className="text-teal-400">knowing everything.</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Enter a company name. BriefAI researches it from live news and financial data,
          then Claude AI generates your 1-page meeting brief in seconds.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
        {[
          { num: '42%', label: 'reps underprepared', color: 'text-red-400' },
          { num: '2-4h', label: 'manual research/meeting', color: 'text-amber-400' },
          { num: '0 min', label: 'with BriefAI', color: 'text-teal-400' },
        ].map(({ num, label, color }) => (
          <div key={num} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{num}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center text-sm">1</span>
            Generate Your Meeting Brief
          </h2>

          {/* Company Name */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Company Name <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Anthropic, Zepto, Razorpay"
              required
              className="w-full bg-slate-900/80 border border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Meeting Context */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              What is this meeting about?
            </label>
            <input
              type="text"
              value={meetingContext}
              onChange={e => setMeetingContext(e.target.value)}
              placeholder="e.g. Enterprise SaaS sales pitch, Partnership discussion"
              className="w-full bg-slate-900/80 border border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Your Role */}
          <div className="mb-7">
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Your Role
            </label>
            <input
              type="text"
              value={yourRole}
              onChange={e => setYourRole(e.target.value)}
              placeholder="e.g. Account Executive, SDR, Founder"
              className="w-full bg-slate-900/80 border border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!companyName.trim() || loading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <span>🚀</span>
                Generate My Meeting Brief
              </>
            )}
          </button>

          <p className="text-slate-500 text-xs text-center mt-4">
            Searches real news + financial data · Powered by Claude AI · Takes ~10 seconds
          </p>
        </form>

        {/* Try Examples */}
        <div className="mt-6">
          <p className="text-slate-500 text-sm text-center mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_EXAMPLES.map(ex => (
              <button
                key={ex.company}
                onClick={() => handleDemo(ex)}
                className="bg-slate-800/60 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-700/60 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-all"
              >
                {ex.company}
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { icon: '🔍', step: '1', title: 'AI Searches', desc: 'Fetches real news from last 30 days + financial data' },
            { icon: '🤖', step: '2', title: 'Claude Analyses', desc: 'Synthesises data into structured brief with talking points' },
            { icon: '📋', step: '3', title: 'You Get Ready', desc: 'Read in 60 seconds. Walk in knowing everything.' },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-white font-semibold text-sm">{title}</div>
              <div className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
