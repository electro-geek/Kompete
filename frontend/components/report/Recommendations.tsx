interface RecommendationsProps {
  recommendations: string[]
  threats: string[]
}

export default function Recommendations({ recommendations, threats }: RecommendationsProps) {
  const safeRecs = Array.isArray(recommendations) ? recommendations : []
  const safeThreats = Array.isArray(threats) ? threats : []

  return (
    <section className="space-y-8">
      {/* Strategic Recommendations */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎯</span>Strategic Recommendations
        </h2>
        <div className="space-y-3">
          {safeRecs.map((rec, i) => (
            <div
              key={i}
              className="rounded-xl p-4 bg-gradient-to-r from-violet-500/15 to-purple-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-200 flex items-start gap-3"
            >
              <span className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
          {safeRecs.length === 0 && (
            <div className="rounded-xl p-4 bg-slate-900/40 border border-slate-800/60 text-slate-500 text-sm italic">
              No recommendations available.
            </div>
          )}
        </div>
      </div>

      {/* Competitive Threats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡</span>Competitive Threats
        </h2>
        <div className="space-y-3">
          {safeThreats.map((threat, i) => (
            <div
              key={i}
              className="rounded-xl p-4 bg-gradient-to-r from-orange-500/15 to-red-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-200 flex items-start gap-3"
            >
              <span className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 text-xs font-bold flex-shrink-0">
                ⚠
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{threat}</p>
            </div>
          ))}
          {safeThreats.length === 0 && (
            <div className="rounded-xl p-4 bg-slate-900/40 border border-slate-800/60 text-slate-500 text-sm italic">
              No competitive threats identified.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
