interface StrategicMovesProps {
  moves?: string[]
}

export default function StrategicMoves({ moves }: StrategicMovesProps) {
  const items = Array.isArray(moves) ? moves : []
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>♟️</span>Strategic Moves
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((move, i) => (
          <div
            key={i}
            className="glass rounded-xl p-5 border border-slate-800/60 hover:border-purple-500/30 transition-all duration-300 flex items-start gap-3 bg-gradient-to-br from-slate-900/50 to-slate-900/20"
          >
            <span className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-slate-300 text-sm leading-relaxed">{move}</p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="glass col-span-full rounded-xl p-4 border border-slate-800/60 text-slate-500 text-sm italic">
            No recent strategic moves identified.
          </div>
        )}
      </div>
    </section>
  )
}
