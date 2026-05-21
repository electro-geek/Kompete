'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchReport, getPdfDownloadUrl } from '@/lib/api'
import { ReportData } from '@/lib/types'
import ExecutiveSummary from '@/components/report/ExecutiveSummary'
import FinancialSnapshot from '@/components/report/FinancialSnapshot'
import SentimentScore from '@/components/report/SentimentScore'
import SwotGrid from '@/components/report/SwotGrid'
import InsightsList from '@/components/report/InsightsList'
import StrategicMoves from '@/components/report/StrategicMoves'
import Recommendations from '@/components/report/Recommendations'
import SourcesList from '@/components/report/SourcesList'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'

export default function ReportPage() {
  const params = useParams()
  const company = decodeURIComponent((params?.company as string) || '')
  const displayName = company.charAt(0).toUpperCase() + company.slice(1)
  const { user } = useAuth()
  const token = user?.token

  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company) return
    let cancelled = false
    let retries = 0
    const MAX_RETRIES = 10

    async function loadReport() {
      while (retries < MAX_RETRIES && !cancelled) {
        try {
          const data = await fetchReport(company, token)
          if (!cancelled) {
            setReport(data)
            setLoading(false)
          }
          return
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('still being generated')) {
            retries++
            await new Promise((r) => setTimeout(r, 3000))
            continue
          }
          if (!cancelled) {
            setError(msg)
            setLoading(false)
          }
          return
        }
      }
      if (!cancelled) {
        setError('Report generation timed out. Please try again.')
        setLoading(false)
      }
    }

    loadReport()
    return () => { cancelled = true }
  }, [company])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-slate-400">Loading report for <span className="text-white font-medium">{displayName}</span>…</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-red-500/20">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Report not available</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'No report found.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">
            ← Research another company
          </Link>
        </div>
      </div>
    )
  }

  const pdfUrl = getPdfDownloadUrl(company, token)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Home
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-white font-semibold">{report.company}</span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">Report ready</span>
          </div>
          <a
            href={pdfUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
          >
            📄 Download PDF
          </a>
        </div>
      </header>

      {/* Navigation anchors */}
      <div className="border-b border-slate-800/40 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav className="flex gap-1 py-2">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-medium whitespace-nowrap transition-all">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Report body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in">
        {/* Company title */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-4">
            🧠 AI Competitor Intelligence Report
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
            {report.company}
          </h1>
          <p className="text-slate-400 text-sm">Generated by Kompete · Powered by Gemini 2.5 Flash</p>
        </div>

        <div id="summary"><ExecutiveSummary summary={report.executive_summary} /></div>
        <div id="financials"><FinancialSnapshot snapshot={report.financial_snapshot} fundingHistory={report.funding_history} /></div>
        <div id="sentiment"><SentimentScore score={report.sentiment_score} /></div>
        <div id="swot"><SwotGrid swot={report.swot} /></div>
        <div id="moves"><StrategicMoves moves={report.strategic_moves} /></div>
        <div id="insights"><InsightsList insights={report.key_insights} /></div>
        <div id="recommendations"><Recommendations recommendations={report.strategic_recommendations} threats={report.competitive_threats} /></div>
        <div id="sources"><SourcesList sources={report.data_sources} /></div>
      </main>
    </div>
  )
}

const NAV_ITEMS = [
  { href: '#summary', label: '📋 Summary' },
  { href: '#financials', label: '💰 Financials' },
  { href: '#sentiment', label: '⭐ Sentiment' },
  { href: '#swot', label: '📊 SWOT' },
  { href: '#moves', label: '♟️ Moves' },
  { href: '#insights', label: '💡 Insights' },
  { href: '#recommendations', label: '🎯 Recommendations' },
  { href: '#sources', label: '🔗 Sources' },
]
