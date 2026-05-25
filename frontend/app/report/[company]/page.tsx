'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchReport, getPdfDownloadUrl } from '@/lib/api'
import { ReportData } from '@/lib/types'
import ExecutiveSummary     from '@/components/report/ExecutiveSummary'
import FinancialSnapshot    from '@/components/report/FinancialSnapshot'
import SentimentScore       from '@/components/report/SentimentScore'
import SwotGrid             from '@/components/report/SwotGrid'
import InsightsList         from '@/components/report/InsightsList'
import StrategicMoves       from '@/components/report/StrategicMoves'
import Recommendations      from '@/components/report/Recommendations'
import SourcesList          from '@/components/report/SourcesList'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { href: '#summary',         label: 'Summary' },
  { href: '#financials',      label: 'Financials' },
  { href: '#sentiment',       label: 'Sentiment' },
  { href: '#swot',            label: 'SWOT' },
  { href: '#moves',           label: 'Moves' },
  { href: '#insights',        label: 'Insights' },
  { href: '#recommendations', label: 'Recommendations' },
  { href: '#sources',         label: 'Sources' },
]

export default function ReportPage() {
  const params      = useParams()
  const company     = decodeURIComponent((params?.company as string) || '')
  const displayName = company.charAt(0).toUpperCase() + company.slice(1)
  const { user }    = useAuth()
  const token       = user?.token

  const [report,  setReport]  = useState<ReportData | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company) return
    let cancelled = false
    let retries = 0
    const MAX = 10

    async function load() {
      while (retries < MAX && !cancelled) {
        try {
          const data = await fetchReport(company, token)
          if (!cancelled) { setReport(data); setLoading(false) }
          return
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('still being generated')) { retries++; await new Promise(r => setTimeout(r, 3000)); continue }
          if (!cancelled) { setError(msg); setLoading(false) }
          return
        }
      }
      if (!cancelled) { setError('Report generation timed out. Please try again.'); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [company, token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin-slow mx-auto mb-5" width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.15 }} />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0 }}>
          Loading report for{' '}
          <span style={{ color: 'var(--fg)', fontWeight: '500' }}>{displayName}</span>…
        </p>
      </div>
    </div>
  )

  if (error || !report) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--red-border)',
        borderRadius: '16px', padding: '40px 32px', maxWidth: '400px', width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠</div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg)', margin: '0 0 8px' }}>Report not available</h2>
        <p style={{ fontSize: '13px', color: 'var(--fg-dim)', margin: '0 0 24px', lineHeight: '1.6' }}>{error || 'No report found.'}</p>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 18px', borderRadius: '9px',
          background: 'var(--accent)', color: 'white',
          fontSize: '13px', fontWeight: '500', textDecoration: 'none',
        }}>
          ← Research another company
        </Link>
      </div>
    </div>
  )

  const pdfUrl = getPdfDownloadUrl(company, token)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sticky top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,12,0.9)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: '52px', display: 'flex', alignItems: 'center',
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/"
              style={{ fontSize: '13px', color: 'var(--fg-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Home
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '18px', lineHeight: 1 }}>›</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--fg)' }}>{report.company}</span>
            <span className="badge badge-green">Ready</span>
          </div>
          <a
            href={pdfUrl}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              background: 'var(--elevated)', border: '1px solid var(--border)',
              color: 'var(--fg)', fontSize: '13px', fontWeight: '500',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PDF
          </a>
        </div>
      </header>

      {/* Section nav */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav style={{ display: 'flex', gap: '2px', padding: '7px 0' }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '5px 11px', borderRadius: '6px',
                  fontSize: '12px', fontWeight: '500',
                  color: 'var(--fg-dim)', textDecoration: 'none',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-dim)'; e.currentTarget.style.background = 'none'; }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in" style={{ paddingTop: '48px', paddingBottom: '80px' }}>

        {/* Report title */}
        <div style={{ marginBottom: '56px' }}>
          <p className="section-label">Competitive Intelligence Report</p>
          <h1 className="display" style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '400',
            color: 'var(--fg)', lineHeight: 1.05,
            margin: '0 0 10px', letterSpacing: '-0.01em',
          }}>
            {report.company}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', margin: 0 }}>
            Generated by Kompete · Powered by Gemini 2.5 Flash
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <div id="summary"><ExecutiveSummary summary={report.executive_summary} /></div>
          <div id="financials"><FinancialSnapshot snapshot={report.financial_snapshot} fundingHistory={report.funding_history} /></div>
          <div id="sentiment"><SentimentScore score={report.sentiment_score} /></div>
          <div id="swot"><SwotGrid swot={report.swot} /></div>
          <div id="moves"><StrategicMoves moves={report.strategic_moves} /></div>
          <div id="insights"><InsightsList insights={report.key_insights} /></div>
          <div id="recommendations"><Recommendations recommendations={report.strategic_recommendations} threats={report.competitive_threats} /></div>
          <div id="sources"><SourcesList sources={report.data_sources} /></div>
        </div>
      </main>
    </div>
  )
}
