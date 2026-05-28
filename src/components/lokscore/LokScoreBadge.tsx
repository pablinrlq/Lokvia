import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MATCH_LABEL_COLOR, MATCH_LABEL_TEXT } from '@/lib/lokscore'
import type { LokScoreResult } from '@/types'

interface LokScoreBadgeProps {
  result: LokScoreResult
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function LokScoreBadge({ result, size = 'md', showLabel = true, className }: LokScoreBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-sm',
        MATCH_LABEL_COLOR[result.matchLabel],
        sizes[size],
        className,
      )}
    >
      <Sparkles size={size === 'lg' ? 14 : 11} className="opacity-80" />
      <span className="font-mono">{result.score}</span>
      {showLabel && (
        <span className="font-sans tracking-tight opacity-80">· {MATCH_LABEL_TEXT[result.matchLabel]}</span>
      )}
    </motion.div>
  )
}
