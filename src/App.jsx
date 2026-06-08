import { useState } from 'react'
import BriefGenerator from './components/BriefGenerator.jsx'
import BriefDisplay from './components/BriefDisplay.jsx'
import LoadingState from './components/LoadingState.jsx'

export default function App() {
  const [stage, setStage] = useState('home')   // home | loading | result
  const [brief, setBrief] = useState(null)
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState(null)

  async function handleGenerate(data) {
    setFormData(data);
    setStage("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Read response as text first
      const text = await res.text();

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        // Response was not JSON — show the raw error
        console.error("Raw API response:", text);
        throw new Error(
          text.includes("ANTHROPIC_API_KEY")
            ? "API key not configured. Please add ANTHROPIC_API_KEY in Vercel Environment Variables."
            : text.length > 200
              ? "API error — check Vercel function logs for details."
              : text || "Unknown error from server.",
        );
      }

      if (!res.ok) {
        throw new Error(result?.error || `Server error: ${res.status}`);
      }

      setBrief(result);
      setStage("result");
    } catch (err) {
      setError(err.message);
      setStage("home");
    }
  }

  function handleReset() {
    setStage('home')
    setBrief(null)
    setError(null)
    setFormData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg">BriefAI</span>
              <span className="text-slate-400 text-xs block leading-none">Sales Intelligence</span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              Powered by Claude AI
            </span>
            <a
              href="https://github.com/adityakarthik/briefai-demo"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors text-sm border border-slate-600 px-3 py-1.5 rounded-lg hover:border-slate-400"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {stage === 'home' && (
          <BriefGenerator onGenerate={handleGenerate} error={error} />
        )}
        {stage === 'loading' && (
          <LoadingState company={formData?.companyName} />
        )}
        {stage === 'result' && brief && (
          <BriefDisplay
            brief={brief}
            company={formData?.companyName}
            meeting={formData?.meetingContext}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-slate-500 text-sm">
          <p>
            BriefAI — PS4 Capstone Project | BITSoM × Masai School | Batch 2
          </p>
          <p className="mt-1 text-xs">
            Built with{' '}
            <a href="https://anthropic.com" className="text-teal-400 hover:underline">Anthropic Claude</a>
            {' '}· Deployed on{' '}
            <a href="https://vercel.com" className="text-teal-400 hover:underline">Vercel</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
