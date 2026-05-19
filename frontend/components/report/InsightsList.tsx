interface InsightsListProps {
  insights: string[]
}

export default function InsightsList({ insights }: InsightsListProps) {
  const items = Array.isArray(insights) ? insights : []
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>💡</span>Key Insights
      </h2>
      <div className="space-y-3">
        {items.map((insight, i) => (
          <div
            key={i}
            className="glass rounded-xl p-4 border border-slate-800/60 hover:border-brand-500/30 transition-all duration-200 hover:-translate-x-1 flex items-start gap-3"
          >
            <span className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="glass rounded-xl p-4 border border-slate-800/60 text-slate-500 text-sm italic">
            No insights available.
          </div>
        )}
      </div>
    </section>
  )
}
