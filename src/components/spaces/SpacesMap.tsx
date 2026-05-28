import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { LokScoreResult, Space } from '@/types'
import { LokScoreBadge } from '@/components/lokscore/LokScoreBadge'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/utils'

/**
 * Mapa "low-fi" — projeção equirectangular dos espaços sobre um SVG
 * estilizado do Brasil. Suficiente pro MVP, sem custo de tiles externos.
 */

// Bounding-box conservadora do Brasil (sul→norte, oeste→leste)
const BBOX = { lat: [-34, 5], lng: [-74, -34] } as const

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - BBOX.lng[0]) / (BBOX.lng[1] - BBOX.lng[0])) * w
  const y = h - ((lat - BBOX.lat[0]) / (BBOX.lat[1] - BBOX.lat[0])) * h
  return { x, y }
}

interface SpacesMapProps {
  spaces: Space[]
  scoreById?: Record<string, LokScoreResult>
  selectedId?: string
  onHover?: (id: string | null) => void
}

export function SpacesMap({ spaces, scoreById, selectedId, onHover }: SpacesMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const points = useMemo(
    () => spaces.filter((s) => s.lat && s.lng).map((s) => ({ space: s, pos: project(s.lat!, s.lng!, 600, 700) })),
    [spaces],
  )

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-ink-700 to-ink-800 noise">
      <svg viewBox="0 0 600 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Silhueta esquemática do Brasil (aproximação de contorno) */}
        <path
          d="M180,90 L260,80 L330,100 L390,140 L440,200 L470,280 L500,360 L490,440 L460,510 L410,560 L350,610 L290,640 L240,650 L200,610 L170,540 L150,460 L130,380 L120,310 L130,240 L150,170 Z"
          fill="rgba(196, 94, 47, 0.08)"
          stroke="rgba(200, 232, 106, 0.25)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        {/* Linhas de latitude para dar contexto editorial */}
        {[150, 300, 450, 600].map((y) => (
          <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />
        ))}

        {points.map(({ space, pos }) => {
          const score = scoreById?.[space.id]
          const isActive = selectedId === space.id || hovered === space.id
          return (
            <g key={space.id}
               onMouseEnter={() => { setHovered(space.id); onHover?.(space.id) }}
               onMouseLeave={() => { setHovered(null); onHover?.(null) }}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r="22" fill="rgba(200,232,106,0.18)" />
              )}
              <circle cx={pos.x} cy={pos.y} r={isActive ? 9 : 6}
                fill={score && score.matchLabel === 'perfect' ? '#C8E86A' : '#C45E2F'}
                stroke="white" strokeWidth="2" className="cursor-pointer transition-all" />
              {isActive && (
                <text x={pos.x + 14} y={pos.y - 8} fontSize="11" fill="white" className="font-mono">
                  {space.city}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip flutuante */}
      <AnimatePresence>
        {hovered && (() => {
          const target = points.find((p) => p.space.id === hovered)
          if (!target) return null
          const score = scoreById?.[target.space.id]
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm"
            >
              <Link to={ROUTES.space(target.space.id)} className="block rounded-2xl bg-white/95 backdrop-blur p-3 shadow-card-hover">
                <div className="flex gap-3">
                  {target.space.photos[0] && (
                    <img src={target.space.photos[0]} className="w-20 h-20 rounded-xl object-cover" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm font-semibold text-ink-600 line-clamp-1">{target.space.title}</p>
                      {score && <LokScoreBadge result={score} size="sm" showLabel={false} />}
                    </div>
                    <p className="text-xs text-ink-300 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{target.space.city}
                    </p>
                    <p className="text-sm font-bold text-rust-500 mt-1">{formatCurrency(target.space.price_per_night)}<span className="text-[10px] font-normal text-ink-300"> /noite</span></p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <div className={cn('absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider', 'bg-bone/80 text-ink-500')}>
        {points.length} no mapa
      </div>
    </div>
  )
}
