interface ExecutiveSummaryProps {
  summary: string
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <section>
      <SectionTitle icon="📋" title="Executive Summary" />
      <div className="glass rounded-2xl p-6 border border-slate-800/60 border-l-4 border-l-brand-500">
        <p className="text-slate-300 leading-relaxed text-base">{summary}</p>
      </div>
    </section>
  )
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <span>{icon}</span>
      {title}
    </h2>
  )
}
