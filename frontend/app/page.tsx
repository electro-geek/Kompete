'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startResearch, fetchUserReports, getPdfDownloadUrl } from '@/lib/api'
import SearchBar from '@/components/SearchBar'
import Header from '@/components/Header'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Spinner from '@/components/ui/Spinner'

const DEMO_COMPANIES = ['Notion', 'Linear', 'Figma', 'Vercel', 'Stripe', 'Airtable']

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // User history state
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Fetch history when user logins
  useEffect(() => {
    if (user?.token) {
      setHistoryLoading(true)
      fetchUserReports(user.token)
        .then((data) => {
          setHistory(data)
        })
        .catch((err) => {
          console.error('Failed to load user reports history:', err)
        })
        .finally(() => {
          setHistoryLoading(false)
        })
    } else {
      setHistory([])
    }
  }, [user])

  const handleSearch = async (company: string) => {
    if (!company.trim()) return
    setLoading(true)
    setError(null)

    try {
      await startResearch(company.trim(), user?.token)
      router.push(`/research/${encodeURIComponent(company.trim().toLowerCase())}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start research')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden px-4 pt-28 pb-16">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center animate-fade-in mt-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Powered by Gemini 2.5 Flash · Google Search
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Competitor intel,</span>
            <br />
            <span className="gradient-text">boardroom-ready.</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Type any company name. Four AI agents browse the web in parallel — news, financials, reviews, social — and synthesise it into a SWOT report in under 60 seconds.
          </p>

          {/* Search */}
          <SearchBar onSearch={handleSearch} loading={loading} />

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Demo chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="text-slate-500 text-sm mr-1 self-center">Try:</span>
            {DEMO_COMPANIES.map((c) => (
              <button
                key={c}
                onClick={() => handleSearch(c)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 text-sm hover:border-brand-500/50 hover:text-brand-300 hover:bg-brand-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Optional Personalized Report History Dashboard ────────────────────── */}
        {user && (
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-20 px-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📚</span>My Research Library
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Access your previously generated competitive intelligence dossiers.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {history.length} Saved {history.length === 1 ? 'Report' : 'Reports'}
              </span>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center p-12 glass rounded-2xl border border-slate-800/60 space-y-3">
                <Spinner size="lg" />
                <span className="text-slate-500 text-xs">Loading dossiers...</span>
              </div>
            ) : history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => {
                  const companyName = item.company.charAt(0).toUpperCase() + item.company.slice(1);
                  const sentiment = item.report?.sentiment_score ?? 5;
                  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div 
                      key={item.company}
                      className="glass rounded-2xl border border-slate-800/60 hover:border-brand-500/30 p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-brand-300">
                            {companyName}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dateStr}
                          </span>
                        </div>

                        {/* Sentiment and SWOT snippet */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">Sentiment:</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              sentiment >= 7 ? 'bg-green-500/10 text-green-400' :
                              sentiment <= 4 ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {sentiment}/10
                            </span>
                          </div>
                        </div>

                        {item.report?.executive_summary && (
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                            {item.report.executive_summary}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 mt-auto">
                        <Link
                          href={`/report/${encodeURIComponent(item.company)}`}
                          className="flex-1 text-center py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 font-semibold text-xs border border-brand-500/20 transition-colors duration-150"
                        >
                          View Report
                        </Link>
                        <a
                          href={getPdfDownloadUrl(item.company, user.token)}
                          download
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors duration-150 flex items-center justify-center border border-slate-700/60"
                          title="Download PDF"
                        >
                          📥
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-12 glass rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center">
                <span className="text-3xl mb-3">📁</span>
                <h4 className="text-sm font-semibold text-slate-300">Your library is currently empty</h4>
                <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                  Start your first competitor research above to auto-save and build your personal intelligence dashboard library.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feature cards */}
        <div className="relative z-10 w-full max-w-4xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-xl p-5 border border-slate-800/60 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 mt-16 text-slate-600 text-xs text-center">
          Built for Milan AI Week · AI Agent Olympics Hackathon 2026
        </p>
      </main>
    </>
  )
}

const FEATURES = [
  {
    icon: '🔎',
    title: '4 Parallel Agents',
    desc: 'News, financials, reviews, and social signals agents run simultaneously.',
  },
  {
    icon: '⚡',
    title: 'Under 60 Seconds',
    desc: 'Parallel asyncio execution cuts research time from 2 min to under 1 min.',
  },
  {
    icon: '📊',
    title: 'SWOT Analysis',
    desc: 'Evidence-backed strengths, weaknesses, opportunities, and threats.',
  },
  {
    icon: '📄',
    title: 'PDF Export',
    desc: 'One-click download of a polished, print-ready boardroom report.',
  },
]
