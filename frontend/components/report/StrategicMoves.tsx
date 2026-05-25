interface StrategicMovesProps { moves?: string[] }

export default function StrategicMoves({ moves }: StrategicMovesProps) {
  const items = Array.isArray(moves) ? moves : []

  return (
    <section>
      <h2 className="section-label">Strategic Moves</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((move, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span className="mono" style={{
              fontSize: '11px', fontWeight: '600', color: '#a78bfa',
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '1px',
            }}>
              {i + 1}
            </span>
            <p style={{ fontSize: '14px', color: 'var(--fg-dim)', margin: 0, lineHeight: '1.7', flex: 1 }}>
              {move}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontStyle: 'italic', margin: 0 }}>No recent strategic moves identified.</p>
          </div>
        )}
      </div>
    </section>
  )
}
