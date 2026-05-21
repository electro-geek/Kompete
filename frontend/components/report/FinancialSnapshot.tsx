import { FinancialSnapshot as FSnapshot, FundingRound } from '@/lib/types'

interface FinancialSnapshotProps {
  snapshot: FSnapshot
  fundingHistory?: FundingRound[]
}

const METRIC_CONFIG = [
  { key: 'revenue' as const, label: 'Revenue', icon: '💵', gradient: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  { key: 'valuation' as const, label: 'Valuation', icon: '📈', gradient: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  { key: 'growth' as const, label: 'Growth Rate', icon: '🚀', gradient: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  { key: 'funding' as const, label: 'Total Funding', icon: '💼', gradient: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
]

export default function FinancialSnapshot({ snapshot, fundingHistory }: FinancialSnapshotProps) {
  const finalSnapshot = snapshot || {} as any
  const hasHistory = fundingHistory && fundingHistory.length > 0

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💰</span>Financial Snapshot
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIC_CONFIG.map((m) => (
            <div
              key={m.key}
              className={`rounded-2xl p-5 bg-gradient-to-br ${m.gradient} border ${m.border} hover:-translate-y-1 transition-transform duration-200`}
            >
              <div className="text-2xl mb-3">{m.icon}</div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${m.text} mb-1`}>{m.label}</div>
              <div className="text-white font-bold text-lg leading-tight">{finalSnapshot[m.key] || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {hasHistory && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🤝</span>Funding Rounds & Lead Investors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fundingHistory.map((round, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 hover:border-brand-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full pointer-events-none group-hover:bg-brand-500/10 transition-colors" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {round.round}
                    </span>
                    <h4 className="text-white font-bold text-xl leading-none">{round.amount}</h4>
                  </div>
                  <span className="text-slate-400 text-xs font-medium bg-slate-800/40 px-2.5 py-1 rounded-md border border-slate-700/50">
                    {round.date}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4 border-t border-slate-800/60 pt-3">
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium block">Key Investors:</span>
                    <span className="text-white font-semibold text-sm block mt-0.5">{round.investors || 'N/A'}</span>
                  </div>
                  {round.details && (
                    <div className="text-xs">
                      <span className="text-slate-500 font-medium block">Strategic Purpose:</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{round.details}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

