interface SentimentScoreProps {
  score: number
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400'
  if (score >= 6) return 'text-yellow-400'
  if (score >= 4) return 'text-orange-400'
  return 'text-red-400'
}

function getBarColor(score: number): string {
  if (score >= 8) return 'from-green-500 to-emerald-400'
  if (score >= 6) return 'from-yellow-500 to-amber-400'
  if (score >= 4) return 'from-orange-500 to-amber-400'
  return 'from-red-500 to-rose-400'
}

function getLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Very Positive'
  if (score >= 7) return 'Positive'
  if (score >= 6) return 'Mostly Positive'
  if (score >= 5) return 'Mixed'
  if (score >= 4) return 'Mostly Negative'
  return 'Negative'
}

export default function SentimentScore({ score }: SentimentScoreProps) {
  const safeScore = typeof score === 'number' ? score : 5
  const percentage = (safeScore / 10) * 100
  const colorClass = getScoreColor(safeScore)
  const barGradient = getBarColor(safeScore)
  const label = getLabel(safeScore)

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⭐</span>Customer Sentiment Score
      </h2>
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex items-center gap-6 mb-4">
          <div className={`text-6xl font-extrabold ${colorClass} tabular-nums`}>
            {safeScore}
            <span className="text-2xl text-slate-600 font-normal">/10</span>
          </div>
          <div>
            <div className={`text-lg font-bold ${colorClass}`}>{label}</div>
            <div className="text-slate-500 text-sm">Based on G2, Trustpilot, Glassdoor & Reddit</div>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-1000`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0 — Terrible</span>
          <span>10 — Exceptional</span>
        </div>
      </div>
    </section>
  )
}
