interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass rounded-2xl border border-slate-800/60 ${className}`}>
      {children}
    </div>
  )
}
