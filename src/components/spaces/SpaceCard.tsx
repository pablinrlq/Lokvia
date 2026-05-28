import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Users, Heart } from 'lucide-react'
import { cn, formatCurrency, ROUTES, SPACE_TYPE_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { LokScoreBadge } from '@/components/lokscore/LokScoreBadge'
import type { Space, LokScoreResult } from '@/types'

interface SpaceCardProps {
  space: Space
  className?: string
  lokScore?: LokScoreResult
  layout?: 'card' | 'row'
}

export function SpaceCard({ space, className, lokScore, layout = 'card' }: SpaceCardProps) {
  if (layout === 'row') {
    return (
      <Link
        to={ROUTES.space(space.id)}
        className={cn(
          'group flex gap-4 rounded-2xl border border-ink-500/8 bg-white p-3 shadow-editorial transition-all hover:shadow-card-hover hover:border-rust-400/30',
          className,
        )}
      >
        <div className="relative w-44 h-32 shrink-0 overflow-hidden rounded-xl bg-ink-500/5">
          {space.photos[0] && (
            <img src={space.photos[0]} alt={space.title} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          {lokScore && <div className="absolute top-2 left-2"><LokScoreBadge result={lokScore} size="sm" showLabel={false} /></div>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <Badge variant="default" className="mb-2 text-[10px]">{SPACE_TYPE_LABELS[space.type]}</Badge>
            <h3 className="font-display text-lg text-ink-600 leading-snug line-clamp-1">{space.title}</h3>
            <p className="mt-0.5 text-xs text-ink-300 flex items-center gap-1"><MapPin size={11} />{space.city}, {space.state}</p>
            {lokScore && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {lokScore.reasons.slice(0, 2).map((r) => (
                  <li key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bone text-ink-400 border border-ink-500/8">{r}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xl font-bold text-ink-600">{formatCurrency(space.price_per_night)}</span>
              <span className="text-xs text-ink-300"> /noite</span>
            </div>
            <div className="flex items-center gap-1 text-ink-300">
              <Star size={11} className="text-rust-400 fill-rust-400" />
              <span className="text-xs font-semibold">{space.rating_avg.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={ROUTES.space(space.id)}
      className={cn(
        'group block rounded-2xl border border-ink-500/8 bg-white shadow-editorial overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-rust-400/30',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-500/5">
        {space.photos[0] ? (
          <motion.img
            src={space.photos[0]}
            alt={space.title}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">🏠</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge variant="default" className="shadow-sm text-xs">{SPACE_TYPE_LABELS[space.type]}</Badge>
          {lokScore && <LokScoreBadge result={lokScore} size="sm" showLabel={false} />}
        </div>

        {space.rating_count > 0 && (
          <Badge variant="glass" className="absolute top-3 right-3 gap-1">
            <Star size={11} className="text-rust-400 fill-rust-400" />
            <span className="font-semibold">{space.rating_avg.toFixed(1)}</span>
          </Badge>
        )}

        <button
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/85 backdrop-blur-sm text-ink-300 hover:text-rust-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          aria-label="Salvar"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-ink-600 line-clamp-1 leading-snug group-hover:text-rust-500 transition-colors">
          {space.title}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-ink-300">
          <MapPin size={12} />
          <span className="text-xs">{space.city}, {space.state}</span>
        </div>

        {lokScore && lokScore.reasons.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {lokScore.reasons.slice(0, 2).map((r) => (
              <li key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rust-50 text-rust-500">
                {r}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-ink-600">{formatCurrency(space.price_per_night)}</span>
            <span className="text-xs text-ink-300"> /noite</span>
          </div>
          <div className="flex items-center gap-1 text-ink-300">
            <Users size={12} />
            <span className="text-xs">até {space.max_guests}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
