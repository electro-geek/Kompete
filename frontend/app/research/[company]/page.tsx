'use client'

import { useParams } from 'next/navigation'
import ProgressTracker from '@/components/ProgressTracker'
import { useResearchStream } from '@/hooks/useResearchStream'

export default function ResearchPage() {
  const params = useParams()
  const company = decodeURIComponent((params?.company as string) || '')
  const displayName = company.charAt(0).toUpperCase() + company.slice(1)

  const { progress, error } = useResearchStream(company)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Researching in progress
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Analysing <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Four AI agents are browsing the web in parallel. This takes about 45–60 seconds.
          </p>
        </div>

        {/* Progress */}
        <ProgressTracker progress={progress} error={error} />

        {/* Animated progress bar */}
        <div className="mt-8 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500 rounded-full animate-progress-bar" />
        </div>
      </div>
    </main>
  )
}
