import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, MapPin, Plane, CalendarRange, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NomadJourney } from '@/types'

const BBOX = { lat: [-34, 5], lng: [-74, -34] } as const
const VB_W = 600
const VB_H = 700

function project(lat: number, lng: number) {
  const x = ((lng - BBOX.lng[0]) / (BBOX.lng[1] - BBOX.lng[0])) * VB_W
  const y = VB_H - ((lat - BBOX.lat[0]) / (BBOX.lat[1] - BBOX.lat[0])) * VB_H
  return { x, y }
}

const LEVEL_LABEL: Record<NomadJourney['level'], string> = {
  explorer: 'Explorer',
  wanderer: 'Wanderer',
  nomad: 'Nomad',
  legend: 'Legend',
}

const LEVEL_COLOR: Record<NomadJourney['level'], string> = {
  explorer: 'bg-ink-200 text-ink-600',
  wanderer: 'bg-rust-200 text-rust-600',
  nomad: 'bg-rust-400 text-bone shadow-rust',
  legend: 'bg-gradient-to-br from-lime-400 to-rust-400 text-bone shadow-rust',
}

export function NomadTracker({ journey }: { journey: NomadJourney }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const pts = useMemo(() => journey.stops.map((s) => ({ stop: s, ...project(s.lat, s.lng) })), [journey.stops])
  const pathD = useMemo(() => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '), [pts])
  const totalLen = pts.length

  async function exportPNG() {
    const svg = svgRef.current
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = VB_W * scale
      canvas.height = VB_H * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#0D2B1E'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((b) => {
        if (!b) return
        const link = document.createElement('a')
        link.href = URL.createObjectURL(b)
        link.download = `nomad-tracker-${new Date().toISOString().split('T')[0]}.png`
        link.click()
        URL.revokeObjectURL(link.href)
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div className="rounded-3xl border border-ink-500/10 bg-white overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-ink-500/8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><Sparkles size={11} className="text-rust-400" /> Nomad Tracker</p>
          <h2 className="display-serif text-3xl text-ink-600 mt-1">Sua jornada</h2>
          <p className="text-sm text-ink-400 mt-1">{totalLen} paradas · {journey.states_visited.length} estados</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold', LEVEL_COLOR[journey.level])}>
            <Trophy size={12} /> {LEVEL_LABEL[journey.level]}
          </span>
          <button onClick={exportPNG} className="btn-outline text-xs py-2">
            <Download size={13} /> Exportar PNG
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-500/8">
        <Stat label="Nomad Score" value={`${journey.nomad_score}`} suffix="/100" highlight />
        <Stat label="Km rodados" value={journey.total_km.toLocaleString('pt-BR')} suffix="km" />
        <Stat label="Dias em movimento" value={`${journey.total_days_moving}`} suffix="dias" />
        <Stat label="Estados" value={`${journey.states_visited.length}`} suffix="/27" />
      </div>

      {/* Mapa */}
      <div className="relative bg-gradient-to-br from-ink-600 to-ink-700 noise">
        <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-[500px]" preserveAspectRatio="xMidYMid meet">
          {/* Silhueta */}
          <path
            d="M180,90 L260,80 L330,100 L390,140 L440,200 L470,280 L500,360 L490,440 L460,510 L410,560 L350,610 L290,640 L240,650 L200,610 L170,540 L150,460 L130,380 L120,310 L130,240 L150,170 Z"
            fill="rgba(196, 94, 47, 0.06)"
            stroke="rgba(200, 232, 106, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          {/* Rota */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#C8E86A"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          {/* Paradas */}
          {pts.map((p, i) => {
            const active = hover === i
            const isLast = i === pts.length - 1
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {(active || isLast) && (
                  <circle cx={p.x} cy={p.y} r={isLast ? 18 : 14}
                    fill="rgba(200,232,106,0.18)">
                    {isLast && <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />}
                  </circle>
                )}
                <circle cx={p.x} cy={p.y} r={isLast ? 8 : 6}
                  fill={isLast ? '#C8E86A' : '#C45E2F'} stroke="white" strokeWidth="2" className="cursor-pointer" />
                <text x={p.x + 12} y={p.y + 4} fontSize="11" fill="white" className="font-mono">
                  {p.stop.city}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 text-[10px] font-mono text-bone/70 uppercase tracking-wider">
          ●  paradas anteriores ·  <span className="text-lime-400">●</span>  cidade atual
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <p className="eyebrow mb-3">Timeline</p>
        <ol className="space-y-3">
          {journey.stops.map((s, i) => {
            const last = i === journey.stops.length - 1
            return (
              <motion.li
                key={`${s.city}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className={cn(
                  'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold',
                  last ? 'bg-lime-400 text-ink-600' : 'bg-rust-400/15 text-rust-500',
                )}>
                  {last ? <Plane size={14} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold text-ink-600">{s.city}, {s.state}</p>
                    <span className="text-xs font-mono text-ink-300">{s.nights} noites</span>
                  </div>
                  <p className="text-xs text-ink-300 flex items-center gap-1 mt-0.5">
                    <CalendarRange size={11} /> {s.arrived_at}{s.left_at ? ` → ${s.left_at}` : ' → agora'}
                  </p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function Stat({ label, value, suffix, highlight }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <div className={cn('p-5', highlight ? 'bg-gradient-to-br from-rust-50 to-bone' : 'bg-white')}>
      <p className="text-[10px] uppercase tracking-wider text-ink-400 flex items-center gap-1">
        <MapPin size={10} /> {label}
      </p>
      <p className={cn('font-display text-3xl font-bold mt-1', highlight ? 'text-rust-500' : 'text-ink-600')}>
        {value}<span className="text-sm font-mono text-ink-300 ml-1">{suffix}</span>
      </p>
    </div>
  )
}
