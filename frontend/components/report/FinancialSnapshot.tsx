import { FinancialSnapshot as FSnapshot, FundingRound } from '@/lib/types'

interface FinancialSnapshotProps {
  snapshot: FSnapshot
  fundingHistory?: FundingRound[]
}

const METRICS = [
  { key: 'revenue'   as const, label: 'Revenue',       accent: '#4ade80' },
  { key: 'valuation' as const, label: 'Valuation',     accent: '#60a5fa' },
  { key: 'growth'    as const, label: 'Growth Rate',   accent: '#a78bfa' },
  { key: 'funding'   as const, label: 'Total Funding', accent: '#fbbf24' },
]

export default function FinancialSnapshot({ snapshot, fundingHistory }: FinancialSnapshotProps) {
  const s = snapshot || {} as any

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 className="section-label">Financial Snapshot</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {METRICS.map((m) => (
            <div
              key={m.key}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '18px 20px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-subtle)', margin: '0 0 10px' }}>
                {m.label}
              </p>
              <p className="mono" style={{ fontSize: '18px', fontWeight: '600', color: m.accent, margin: 0, lineHeight: 1.2 }}>
                {s[m.key] || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {fundingHistory && fundingHistory.length > 0 && (
        <div>
          <h2 className="section-label">Funding Rounds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fundingHistory.map((round, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '18px 20px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
                  <div>
                    <span className="badge badge-accent" style={{ marginBottom: '8px', display: 'inline-flex' }}>
                      {round.round}
                    </span>
                    <p className="mono" style={{ fontSize: '22px', fontWeight: '600', color: 'var(--fg)', margin: 0, lineHeight: 1 }}>
                      {round.amount}
                    </p>
                  </div>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--fg-subtle)', flexShrink: 0 }}>
                    {round.date}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', margin: '0 0 3px', fontWeight: '500' }}>Key Investors</p>
                    <p style={{ fontSize: '13px', color: 'var(--fg)', margin: 0, fontWeight: '500' }}>{round.investors || 'N/A'}</p>
                  </div>
                  {round.details && (
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', margin: '0 0 3px', fontWeight: '500' }}>Strategic Purpose</p>
                      <p style={{ fontSize: '13px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.6' }}>{round.details}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
