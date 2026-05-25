interface SourcesListProps { sources: string[] }

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null

  return (
    <section>
      <h2 className="section-label">Data Sources</h2>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '20px 22px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
          Sources consulted by the research agents
        </p>
        <div className="columns-1 sm:columns-2 gap-4" style={{ columnGap: '32px' }}>
          {sources.map((src, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '8px', breakInside: 'avoid' }}>
              <span style={{ color: 'var(--fg-subtle)', fontSize: '10px', lineHeight: '20px', flexShrink: 0 }}>—</span>
              {src.startsWith('http') ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: 'var(--fg-dim)', wordBreak: 'break-all', lineHeight: '1.5', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
                >
                  {src}
                </a>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--fg-dim)', lineHeight: '1.5' }}>{src}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
