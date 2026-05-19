'use client'

import { ResearchProgress } from '@/lib/types'

interface ProgressTrackerProps {
  progress: ResearchProgress
  error: string | null
}

const STEPS = [
  { key: 'started', icon: '🚀', label: 'Research started', description: 'Initialising parallel agent tasks...' },
  { key: 'news_done', icon: '📰', label: 'News agent complete', description: 'Headlines, launches & controversies collected.' },
  { key: 'financials_done', icon: '💰', label: 'Financials agent complete', description: 'Revenue, valuation & funding data gathered.' },
  { key: 'reviews_done', icon: '⭐', label: 'Reviews agent complete', description: 'G2, Trustpilot & Reddit sentiment analysed.' },
  { key: 'social_done', icon: '📣', label: 'Social signals agent complete', description: 'LinkedIn, Twitter & brand perception mapped.' },
  { key: 'synthesizing', icon: '🧠', label: 'Synthesising SWOT analysis', description: 'AI is combining all research into your report...' },
  { key: 'synthesis_done', icon: '✅', label: 'Report ready!', description: 'Redirecting to your dossier...' },
] as const

export default function ProgressTracker({ progress, error }: ProgressTrackerProps) {
  return (
    <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl relative">
      {/* Dynamic glow effect that matches loading progress */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500 animate-shimmer" />
      
      <div className="p-7 space-y-0">
        {STEPS.map((step, i) => {
          const done = progress[step.key as keyof ResearchProgress]
          const isNext = !done && (i === 0 || progress[STEPS[i - 1].key as keyof ResearchProgress])

          return (
            <div key={step.key} className="flex items-start gap-4 group">
              {/* Connector line and avatar */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all duration-500 ${
                    done
                      ? 'bg-green-500/10 border border-green-500/40 text-green-400 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                      : isNext
                      ? 'bg-brand-500/10 border border-brand-500/50 text-brand-300 scale-110 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-2 ring-brand-500/20'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-600'
                  }`}
                >
                  {done ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isNext ? (
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <svg className="animate-spin w-full h-full text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-sm grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">{step.icon}</span>
                  )}
                </div>
                
                {/* Visual Connector Lines */}
                {i < STEPS.length - 1 && (
                  <div 
                    className={`w-[2px] flex-1 my-1 min-h-[24px] rounded-full transition-all duration-500 ${
                      done 
                        ? 'bg-gradient-to-b from-green-500/50 to-green-500/20' 
                        : isNext 
                        ? 'bg-gradient-to-b from-brand-500/50 to-slate-800 animate-pulse-slow' 
                        : 'bg-slate-800/40'
                    }`} 
                  />
                )}
              </div>

              {/* Step Descriptions and labels */}
              <div className={`pb-6 transition-all duration-300 flex-1 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <p 
                    className={`font-bold text-sm tracking-wide transition-colors duration-300 ${
                      done 
                        ? 'text-green-400' 
                        : isNext 
                        ? 'text-brand-200 text-[15px]' 
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isNext && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                {(done || isNext) && (
                  <p 
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      done 
                        ? 'text-slate-400' 
                        : 'text-slate-300 font-medium'
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="m-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 shadow-inner">
          <span className="text-base flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-xs text-red-300 uppercase tracking-wider mb-0.5">Pipeline Failure</p>
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
