import { useState, useEffect } from 'react'

const STEPS = [
  { icon: '📰', label: 'Searching recent news...', detail: 'Fetching last 30 days of company news' },
  { icon: '💰', label: 'Pulling financial data...', detail: 'Revenue, funding stage, growth signals' },
  { icon: '💼', label: 'Scanning LinkedIn activity...', detail: 'Executive posts and company updates' },
  { icon: '🤖', label: 'Claude AI is writing your brief...', detail: 'Synthesising all data into talking points' },
  { icon: '✅', label: 'Brief ready!', detail: 'Your meeting prep is complete' },
]

export default function LoadingState({ company }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots]             = useState('')

  useEffect(() => {
    // Advance steps every 2.5 seconds
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }, 2500)

    // Animate dots
    const dotTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    return () => { clearInterval(stepTimer); clearInterval(dotTimer) }
  }, [])

  return (
    <div className="animate-fade-in max-w-xl mx-auto text-center">
      {/* Pulsing logo */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-teal-500/20 rounded-full animate-pulse-ring flex items-center justify-center">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/40">
              <span className="text-white font-extrabold text-3xl">B</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-white text-2xl font-bold mb-2">
        Researching {company}{dots}
      </h2>
      <p className="text-slate-400 text-sm mb-10">
        Claude AI is searching real news and financial data — this takes about 10 seconds
      </p>

      {/* Steps */}
      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => {
          const done    = i < currentStep
          const active  = i === currentStep
          const pending = i > currentStep

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                done    ? 'bg-teal-500/10 border-teal-500/30' :
                active  ? 'bg-slate-800 border-teal-500/60 shadow-lg shadow-teal-500/10' :
                          'bg-slate-800/30 border-slate-700/40 opacity-40'
              }`}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
                {done ? (
                  <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : active ? (
                  <div className="text-2xl animate-bounce">{step.icon}</div>
                ) : (
                  <div className="text-2xl opacity-50">{step.icon}</div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${done || active ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                {(done || active) && (
                  <div className="text-slate-400 text-xs mt-0.5">{step.detail}</div>
                )}
              </div>

              {/* Active spinner */}
              {active && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-8">
        Powered by Anthropic Claude claude-sonnet-4-20250514 + NewsAPI
      </p>
    </div>
  )
}
