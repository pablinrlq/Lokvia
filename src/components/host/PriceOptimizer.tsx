import { motion } from 'framer-motion'
import { TrendingUp, CalendarDays, Sparkles, Check } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { PriceSuggestion } from '@/types'

const CONFIDENCE_COLOR: Record<PriceSuggestion['confidence'], string> = {
  low: 'bg-ink-100 text-ink-500',
  medium: 'bg-rust-100 text-rust-600',
  high: 'bg-lime-400 text-ink-600',
}

const CONFIDENCE_LABEL: Record<PriceSuggestion['confidence'], string> = {
  low: 'Confiança baixa',
  medium: 'Confiança média',
  high: 'Confiança alta',
}

export function PriceOptimizer({ suggestion, spaceTitle, onApply }: { suggestion: PriceSuggestion; spaceTitle: string; onApply?: () => void }) {
  const positive = suggestion.delta_pct > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-ink-500/10 bg-white overflow-hidden"
    >
      <header className="p-5 flex items-baseline justify-between gap-2">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><Sparkles size={11} className="text-rust-400" /> Price Optimizer</p>
          <h3 className="display-serif text-lg text-ink-600 mt-0.5 line-clamp-1">{spaceTitle}</h3>
        </div>
        <span className={cn('text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full', CONFIDENCE_COLOR[suggestion.confidence])}>
          {CONFIDENCE_LABEL[suggestion.confidence]}
        </span>
      </header>

      <div className="px-5 pb-5">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-300">Atual</p>
            <p className="font-display text-2xl text-ink-500 line-through">{formatCurrency(suggestion.current_price)}</p>
          </div>
          <TrendingUp size={20} className={positive ? 'text-lime-500' : 'text-ink-300'} />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-rust-500">Sugerido</p>
            <p className="font-display text-3xl font-bold text-rust-500">
              {formatCurrency(suggestion.suggested_price)}
              {positive && <span className="text-sm font-mono text-lime-600 ml-2">+{suggestion.delta_pct}%</span>}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-400 leading-relaxed text-pretty">{suggestion.context}</p>

        {suggestion.events_nearby.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {suggestion.events_nearby.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-xs text-ink-500">
                <CalendarDays size={12} className="text-rust-400 shrink-0" />
                <span className="flex-1 truncate">{e.title}</span>
                <span className="font-mono text-ink-300">{e.date}</span>
              </li>
            ))}
          </ul>
        )}

        {positive && (
          <button onClick={onApply} className="btn-rust w-full mt-5 text-sm">
            <Check size={13} /> Aplicar sugestão
          </button>
        )}
      </div>
    </motion.div>
  )
}
