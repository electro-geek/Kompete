interface InsightsListProps { insights: string[] }

export default function InsightsList({ insights }: InsightsListProps) {
  const items = Array.isArray(insights) ? insights : []

  return (
    <section>
      <h2 className="section-label">Key Insights</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((insight, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span className="mono" style={{
              fontSize: '11px', fontWeight: '600', color: 'var(--accent-light)',
              width: '22px', height: '22px', borderRadius: '6px',
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '1px',
            }}>
              {i + 1}
            </span>
            <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.7', flex: 1 }}>
              {insight}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontStyle: 'italic', margin: 0 }}>No insights available.</p>
          </div>
        )}
      </div>
    </section>
  )
}
