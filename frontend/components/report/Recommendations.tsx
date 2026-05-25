interface RecommendationsProps {
  recommendations: string[]
  threats: string[]
}

export default function Recommendations({ recommendations, threats }: RecommendationsProps) {
  const recs   = Array.isArray(recommendations) ? recommendations : []
  const thrts  = Array.isArray(threats) ? threats : []

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Strategic Recommendations */}
      <div>
        <h2 className="section-label">Strategic Recommendations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recs.map((rec, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                background: 'rgba(96,165,250,0.05)',
                border: '1px solid rgba(96,165,250,0.15)',
                borderRadius: '12px', padding: '16px 18px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)')}
            >
              <span className="mono" style={{
                fontSize: '11px', fontWeight: '600', color: '#60a5fa',
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.7', flex: 1 }}>{rec}</p>
            </div>
          ))}
          {recs.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontStyle: 'italic', margin: 0 }}>No recommendations available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitive Threats */}
      <div>
        <h2 className="section-label">Competitive Threats</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {thrts.map((threat, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                background: 'var(--red-bg)',
                border: '1px solid var(--red-border)',
                borderRadius: '12px', padding: '16px 18px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--red-border)')}
            >
              <span style={{
                fontSize: '14px', color: '#f87171',
                width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px',
              }}>
                ⚠
              </span>
              <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.7', flex: 1 }}>{threat}</p>
            </div>
          ))}
          {thrts.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontStyle: 'italic', margin: 0 }}>No threats identified.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
