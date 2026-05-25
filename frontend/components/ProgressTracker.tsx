'use client'

import { ResearchProgress } from '@/lib/types'

interface ProgressTrackerProps {
  progress: ResearchProgress
  error: string | null
}

const STEPS = [
  { key: 'started',          label: 'Research started',              desc: 'Initialising agent pipeline' },
  { key: 'news_done',        label: 'News agent complete',           desc: 'Headlines, launches & controversies collected' },
  { key: 'financials_done',  label: 'Financials agent complete',     desc: 'Revenue, valuation & funding gathered' },
  { key: 'reviews_done',     label: 'Reviews agent complete',        desc: 'G2, Trustpilot & Reddit sentiment analysed' },
  { key: 'social_done',      label: 'Social signals agent complete', desc: 'LinkedIn & Twitter brand signals mapped' },
  { key: 'synthesizing',     label: 'Synthesising report',           desc: 'Combining all research into your SWOT' },
  { key: 'synthesis_done',   label: 'Report ready',                  desc: 'Redirecting to your report…' },
] as const

export default function ProgressTracker({ progress, error }: ProgressTrackerProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{ padding: '24px 24px 20px' }}>
        {STEPS.map((step, i) => {
          const done     = progress[step.key as keyof ResearchProgress]
          const isActive = !done && (i === 0 || progress[STEPS[i - 1].key as keyof ResearchProgress])
          const isLast   = i === STEPS.length - 1

          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingBottom: isLast ? 0 : '20px' }}>
              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '22px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'var(--green-bg)' : isActive ? 'var(--accent-bg)' : 'var(--elevated)',
                  border: `1px solid ${done ? 'var(--green-border)' : isActive ? 'var(--accent-border)' : 'var(--border)'}`,
                  transition: 'all 0.3s',
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isActive ? (
                    <svg className="animate-spin-slow" width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="var(--accent-border)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent-light)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--border)' }} />
                  )}
                </div>
                {!isLast && (
                  <div style={{
                    width: '1px', minHeight: '16px', flex: 1, marginTop: '3px', marginBottom: '3px',
                    background: done ? 'var(--green-border)' : 'var(--border)',
                    transition: 'background 0.4s',
                  }} />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, paddingTop: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? '500' : '400',
                    color: done ? 'var(--fg-subtle)' : isActive ? 'var(--fg)' : 'var(--fg-subtle)',
                    transition: 'color 0.3s',
                  }}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 7px' }}>
                      active
                    </span>
                  )}
                  {done && step.key === 'synthesis_done' && (
                    <span className="badge badge-green" style={{ fontSize: '10px', padding: '1px 7px' }}>
                      done
                    </span>
                  )}
                </div>
                {(done || isActive) && (
                  <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', margin: '2px 0 0', lineHeight: '1.5' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{
          margin: '0 16px 16px',
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#f87171', margin: '0 0 2px' }}>Pipeline error</p>
          <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0, lineHeight: '1.5' }}>{error}</p>
        </div>
      )}
    </div>
  )
}
