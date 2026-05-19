interface SourcesListProps {
  sources: string[]
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🔗</span>Data Sources
      </h2>
      <div className="glass rounded-2xl p-5 border border-slate-800/60">
        <p className="text-slate-500 text-xs mb-4 uppercase tracking-wider font-medium">
          Sources consulted by the AI research agents
        </p>
        <div className="columns-1 sm:columns-2 gap-4 space-y-1">
          {sources.map((source, i) => (
            <div key={i} className="flex items-start gap-2 break-inside-avoid">
              <span className="text-slate-600 text-xs mt-0.5 flex-shrink-0">•</span>
              {source.startsWith('http') ? (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-brand-300 text-xs break-all transition-colors"
                >
                  {source}
                </a>
              ) : (
                <span className="text-slate-500 text-xs">{source}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
