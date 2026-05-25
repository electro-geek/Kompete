'use client'

import { useParams, useRouter } from 'next/navigation'
import ProgressTracker from '@/components/ProgressTracker'
import { useResearchStream } from '@/hooks/useResearchStream'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ResearchPage() {
  const params  = useParams()
  const router  = useRouter()
  const company = decodeURIComponent((params?.company as string) || '')
  const displayName = company.charAt(0).toUpperCase() + company.slice(1)

  const { progress, error } = useResearchStream(company)

  useEffect(() => {
    if (error === 'quota_exceeded') {
      router.push(`/?quota=true&company=${encodeURIComponent(company)}`)
    }
  }, [error, router, company])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto">
        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '13px', color: 'var(--fg-dim)', marginBottom: '36px',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to search
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-amber animate-fade-in" style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} className="animate-pulse" />
            Researching in progress
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '600', color: 'var(--fg)', margin: '0 0 8px', lineHeight: 1.2 }}>
            Analysing{' '}
            <span className="display italic" style={{ color: 'var(--accent-light)' }}>{displayName}</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.6' }}>
            Four AI agents are browsing the web. This takes about 45–60 seconds.
          </p>
        </div>

        {/* Progress */}
        <ProgressTracker progress={progress} error={error} />

        {/* Progress bar */}
        <div style={{ marginTop: '20px', height: '2px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            className="animate-progress-bar"
            style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px' }}
          />
        </div>
      </div>
    </main>
  )
}
