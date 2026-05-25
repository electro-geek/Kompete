interface ExecutiveSummaryProps {
  summary: string
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <section>
      <h2 className="section-label">Executive Summary</h2>
      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: '0 12px 12px 0',
        padding: '22px 24px',
      }}>
        <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--fg-dim)', margin: 0 }}>
          {summary}
        </p>
      </div>
    </section>
  )
}
