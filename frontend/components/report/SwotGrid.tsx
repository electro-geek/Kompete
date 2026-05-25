import { SwotData } from '@/lib/types'

interface SwotGridProps { swot: SwotData }

const QUADRANTS = [
  { key: 'strengths'    as const, label: 'Strengths',     letter: 'S', color: '#4ade80', bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.15)' },
  { key: 'weaknesses'   as const, label: 'Weaknesses',    letter: 'W', color: '#f87171', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.15)' },
  { key: 'opportunities'as const, label: 'Opportunities', letter: 'O', color: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.15)' },
  { key: 'threats'      as const, label: 'Threats',       letter: 'T', color: '#fbbf24', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
]

export default function SwotGrid({ swot }: SwotGridProps) {
  const s = swot || {} as any

  return (
    <section>
      <h2 className="section-label">SWOT Analysis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUADRANTS.map((q) => {
          const items: string[] = Array.isArray(s[q.key]) ? s[q.key] : []
          return (
            <div
              key={q.key}
              style={{
                background: q.bg, border: `1px solid ${q.border}`,
                borderRadius: '14px', padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span className="mono" style={{
                  fontSize: '13px', fontWeight: '700', color: q.color,
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: `${q.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{q.letter}</span>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: q.color, margin: 0, letterSpacing: '0.02em' }}>
                  {q.label}
                </h3>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: q.color, flexShrink: 0, lineHeight: '20px', fontSize: '10px', marginTop: '1px' }}>◆</span>
                    <span style={{ fontSize: '13px', color: 'var(--fg-dim)', lineHeight: '1.6' }}>{item}</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li style={{ fontSize: '12px', color: 'var(--fg-subtle)', fontStyle: 'italic' }}>No data available</li>
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
