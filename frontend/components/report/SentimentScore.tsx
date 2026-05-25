interface SentimentScoreProps { score: number }

function meta(score: number) {
  if (score >= 9) return { label: 'Exceptional',     color: '#4ade80', bar: '#22c55e' }
  if (score >= 8) return { label: 'Very Positive',   color: '#4ade80', bar: '#22c55e' }
  if (score >= 7) return { label: 'Positive',        color: '#86efac', bar: '#4ade80' }
  if (score >= 6) return { label: 'Mostly Positive', color: '#fbbf24', bar: '#f59e0b' }
  if (score >= 5) return { label: 'Mixed',           color: '#fbbf24', bar: '#f59e0b' }
  if (score >= 4) return { label: 'Mostly Negative', color: '#fb923c', bar: '#f97316' }
  return           { label: 'Negative',              color: '#f87171', bar: '#ef4444' }
}

export default function SentimentScore({ score }: SentimentScoreProps) {
  const s   = typeof score === 'number' ? Math.min(10, Math.max(0, score)) : 5
  const pct = (s / 10) * 100
  const m   = meta(s)

  return (
    <section>
      <h2 className="section-label">Customer Sentiment</h2>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <span className="mono" style={{ fontSize: '52px', fontWeight: '700', color: m.color, lineHeight: 1, letterSpacing: '-2px' }}>
            {s}
            <span style={{ fontSize: '22px', color: 'var(--fg-subtle)', fontWeight: '400', letterSpacing: 0 }}>/10</span>
          </span>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: m.color, margin: '0 0 4px' }}>{m.label}</p>
            <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', margin: 0 }}>
              Based on G2, Trustpilot, Glassdoor & Reddit
            </p>
          </div>
        </div>

        {/* Bar */}
        <div style={{ height: '6px', background: 'var(--elevated)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: m.bar, borderRadius: '6px',
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}>0 — Poor</span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}>10 — Exceptional</span>
        </div>
      </div>
    </section>
  )
}
