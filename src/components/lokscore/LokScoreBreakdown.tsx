import { motion } from 'framer-motion'
import type { LokScoreResult } from '@/types'
import { MATCH_LABEL_TEXT } from '@/lib/lokscore'

export function LokScoreBreakdown({ result }: { result: LokScoreResult }) {
  return (
    <div className="rounded-2xl border border-ink-500/10 bg-bone p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow">LokScore™</p>
          <h3 className="display-serif text-2xl text-ink-600">{MATCH_LABEL_TEXT[result.matchLabel]}</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-4xl font-bold text-rust-500 leading-none">{result.score}</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-300 mt-1">de 100</p>
        </div>
      </div>

      <div className="rule my-4" />

      <ul className="space-y-2.5">
        {result.breakdown.slice(0, 6).map((b) => (
          <li key={b.category} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
            <div>
              <div className="flex items-center justify-between text-ink-500">
                <span>{b.category}</span>
                <span className="font-mono text-xs text-ink-300">{Math.round(b.rawScore)}/100</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ink-500/8 overflow-hidden">
                <motion.div
                  className="h-full bg-rust-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${b.rawScore}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="text-[10px] font-mono text-ink-300 uppercase">×{(b.weight * 100).toFixed(0)}%</div>
          </li>
        ))}
      </ul>

      {result.reasons.length > 0 && (
        <>
          <div className="rule my-4" />
          <ul className="flex flex-wrap gap-1.5">
            {result.reasons.map((r) => (
              <li key={r} className="badge-rust">{r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
