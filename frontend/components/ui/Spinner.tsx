interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`${sizes[size]} ${className} relative mx-auto`}>
      <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
    </div>
  )
}
