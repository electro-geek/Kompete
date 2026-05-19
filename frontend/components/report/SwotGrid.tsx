import { SwotData } from '@/lib/types'

interface SwotGridProps {
  swot: SwotData
}

const QUADRANTS = [
  {
    key: 'strengths' as const,
    label: 'Strengths',
    icon: '💪',
    gradient: 'from-blue-500/15 to-cyan-500/5',
    border: 'border-blue-500/20',
    titleColor: 'text-blue-400',
    bulletColor: 'text-blue-500',
  },
  {
    key: 'weaknesses' as const,
    label: 'Weaknesses',
    icon: '⚠️',
    gradient: 'from-red-500/15 to-rose-500/5',
    border: 'border-red-500/20',
    titleColor: 'text-red-400',
    bulletColor: 'text-red-500',
  },
  {
    key: 'opportunities' as const,
    label: 'Opportunities',
    icon: '🚀',
    gradient: 'from-green-500/15 to-emerald-500/5',
    border: 'border-green-500/20',
    titleColor: 'text-green-400',
    bulletColor: 'text-green-500',
  },
  {
    key: 'threats' as const,
    label: 'Threats',
    icon: '🔥',
    gradient: 'from-orange-500/15 to-amber-500/5',
    border: 'border-orange-500/20',
    titleColor: 'text-orange-400',
    bulletColor: 'text-orange-500',
  },
]

export default function SwotGrid({ swot }: SwotGridProps) {
  const safeSwot = swot || {} as any
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📊</span>SWOT Analysis
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => {
          const items = Array.isArray(safeSwot[q.key]) ? safeSwot[q.key] : []
          return (
            <div
              key={q.key}
              className={`rounded-2xl p-5 bg-gradient-to-br ${q.gradient} border ${q.border} hover:-translate-y-0.5 transition-transform duration-200`}
            >
              <h3 className={`font-bold text-sm uppercase tracking-wider ${q.titleColor} mb-3 flex items-center gap-2`}>
                <span>{q.icon}</span>{q.label}
              </h3>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className={`${q.bulletColor} font-bold mt-0.5 flex-shrink-0`}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-slate-500 text-sm italic">No data available</li>
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
