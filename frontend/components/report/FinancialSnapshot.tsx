import { FinancialSnapshot as FSnapshot } from '@/lib/types'

interface FinancialSnapshotProps {
  snapshot: FSnapshot
}

const METRIC_CONFIG = [
  { key: 'revenue' as const, label: 'Revenue', icon: '💵', gradient: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  { key: 'valuation' as const, label: 'Valuation', icon: '📈', gradient: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  { key: 'growth' as const, label: 'Growth Rate', icon: '🚀', gradient: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  { key: 'funding' as const, label: 'Total Funding', icon: '💼', gradient: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
]

export default function FinancialSnapshot({ snapshot }: FinancialSnapshotProps) {
  const finalSnapshot = snapshot || {} as any
  return (
    <section>
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
    </section>
  )
}
