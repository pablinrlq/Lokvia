import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: ReactNode
  hint?: ReactNode
  trend?: { value: number; positive?: boolean } // % vs período anterior
  icon?: ReactNode
  className?: string
}

export function KpiCard({ label, value, hint, trend, icon, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-forest-900/8 bg-white p-5 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs text-forest-900/60">
        <span className="uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="mt-2 font-display text-2xl text-forest-900">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-forest-900/60">
        {trend && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              trend.positive
                ? 'bg-lime-400/20 text-forest-800'
                : 'bg-rust-100 text-rust-500',
            )}
          >
            {trend.positive ? '+' : ''}
            {trend.value}%
          </span>
        )}
        {hint}
      </div>
    </div>
  )
}
