import { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Star, Users, Wifi, Headphones, Sun, Armchair, ArrowRight,
  PartyPopper, CalendarDays, Quote, ShieldCheck,
} from 'lucide-react'
import { MOCK_SPACES, MOCK_WORK_INSIGHTS } from '@/lib/mock'
import { computeLokScore } from '@/lib/lokscore'
import { useWorkProfile } from '@/lib/store'
import { findEventMatches } from '@/lib/events'
import { cn, formatCurrency, nightsBetween, calcBookingAmounts, ROUTES, SPACE_TYPE_LABELS } from '@/lib/utils'
import { LokScoreBreakdown } from '@/components/lokscore/LokScoreBreakdown'
import { Badge } from '@/components/ui/Badge'

export function SpaceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const profile = useWorkProfile((s) => s.profile)
  const space = useMemo(() => MOCK_SPACES.find((s) => s.id === id), [id])
  const insights = MOCK_WORK_INSIGHTS[id]

  const [checkIn, setCheckIn] = useState('2026-06-14')
  const [checkOut, setCheckOut] = useState('2026-06-18')
  const [guests, setGuests] = useState(1)

  if (!space) {
    return (
      <div className="container-lokvia section text-center">
        <h1 className="display-serif text-3xl text-ink-600">Espaço não encontrado</h1>
        <Link to={ROUTES.search} className="btn-rust mt-6 inline-flex">Voltar para busca</Link>
      </div>
    )
  }

  const lokScore = computeLokScore(space, profile, insights)
  const matches = findEventMatches(space.city, checkIn, checkOut)

  const nights = nightsBetween(checkIn, checkOut) || 0
  const amounts = calcBookingAmounts(space.price_per_night, nights)

  return (
    <div className="bg-bone min-h-screen">
      {/* Galeria */}
      <section className="container-lokvia pt-8">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="eyebrow">{SPACE_TYPE_LABELS[space.type]} · {space.city}, {space.state}</p>
            <h1 className="display-serif text-4xl md:text-5xl text-ink-600 mt-1 max-w-3xl text-balance">{space.title}</h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-ink-400">
              <span className="flex items-center gap-1"><Star size={14} className="text-rust-400 fill-rust-400" /> {space.rating_avg.toFixed(1)} <span className="text-ink-300">({space.rating_count})</span></span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {space.address}</span>
              <span className="flex items-center gap-1"><Users size={14} /> até {space.max_guests}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-3xl overflow-hidden">
          <img src={space.photos[0]} alt="" className="col-span-2 row-span-2 w-full h-full object-cover" />
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={space.photos[i % space.photos.length]}
              alt=""
              className="w-full h-full object-cover hidden md:block"
            />
          ))}
        </div>
      </section>

      {/* Corpo: descrição + sidebar reserva */}
      <section className="container-lokvia mt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        {/* Coluna principal */}
        <div className="space-y-10">
          {/* Sobre */}
          <div>
            <h2 className="display-serif text-2xl text-ink-600">Sobre o espaço</h2>
            <p className="mt-3 text-ink-400 leading-relaxed text-pretty">{space.description}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {space.amenities.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </div>

          {/* EventMatch — destaque alto */}
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-lime-400/40 bg-gradient-to-br from-lime-400/15 to-rust-400/10 p-6 noise"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-ink-500 flex items-center justify-center">
                  <PartyPopper size={22} className="text-lime-400" />
                </div>
                <div className="flex-1">
                  <p className="eyebrow text-rust-500">EventMatch</p>
                  <h3 className="display-serif text-xl text-ink-600 mt-1">
                    {matches.length === 1
                      ? `Seu check-in coincide com 1 evento`
                      : `Sua estadia pega ${matches.length} eventos`}
                    {' '}🎉
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {matches.map((m) => (
                      <li key={m.event.id} className="rounded-xl bg-white/70 backdrop-blur p-3 flex items-center gap-3">
                        <CalendarDays size={16} className="text-rust-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-ink-600">{m.event.title}</p>
                          <p className="text-xs text-ink-300">{m.reason} · {m.event.date}{m.event.time && ` · ${m.event.time}`}</p>
                        </div>
                        {!m.event.is_free && m.event.price && (
                          <span className="text-xs font-mono text-rust-500">{formatCurrency(m.event.price)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Work Insights — diferencial v2.0 */}
          {insights && (
            <div className="rounded-2xl border border-ink-500/8 bg-white p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="eyebrow">Work Insights</p>
                  <h2 className="display-serif text-2xl text-ink-600">Como é trabalhar daqui</h2>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-300">
                  Testado em {insights.wifi_tested_at}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <InsightTile icon={Wifi} label="Download" value={`${insights.wifi_mbps_down}`} unit="Mbps" tone="rust" />
                <InsightTile icon={Wifi} label="Upload"   value={`${insights.wifi_mbps_up}`}   unit="Mbps" tone="ink" />
                <InsightTile icon={Headphones} label="Silêncio"     value={`${insights.silence_level}/5`} tone="ink" />
                <InsightTile icon={Sun}        label="Luz natural"  value={`${insights.natural_light}/5`} tone="ink" />
                <InsightTile icon={Armchair}   label="Ergonomia"    value={`${insights.ergonomics}/5`}    tone="ink" />
                <div className="col-span-2 md:col-span-3 rounded-xl border border-ink-500/8 bg-bone p-4">
                  <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">Melhor para</p>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.best_for.map((b) => (
                      <span key={b} className="badge-rust capitalize">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {insights.productivity_testimonials && insights.productivity_testimonials.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="eyebrow">Depoimentos de produtividade</p>
                  {insights.productivity_testimonials.map((t) => (
                    <figure key={t.author} className="rounded-xl bg-bone p-4 border border-ink-500/5">
                      <Quote size={14} className="text-rust-400" />
                      <blockquote className="mt-1 text-ink-500 italic leading-relaxed">"{t.quote}"</blockquote>
                      <figcaption className="mt-2 text-xs text-ink-300">— <strong className="text-ink-500">{t.author}</strong>, {t.role}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Avaliações (placeholder com nota sobre double-blind) */}
          <div className="rounded-2xl border border-ink-500/8 bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-rust-500" />
              <p className="eyebrow">Avaliações double-blind</p>
            </div>
            <h2 className="display-serif text-2xl text-ink-600 mt-1">{space.rating_avg.toFixed(1)} · {space.rating_count} reviews</h2>
            <p className="text-sm text-ink-400 mt-2 max-w-xl">
              Hóspedes e anfitriões avaliam às cegas. Reviews são reveladas só depois que os dois lados terminam — elimina retaliação.
            </p>
          </div>
        </div>

        {/* Sidebar reserva + LokScore */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-500/10 bg-white p-5 shadow-editorial">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-ink-600">{formatCurrency(space.price_per_night)}</span>
                <span className="text-sm text-ink-300"> /noite</span>
              </div>
              <span className="flex items-center gap-1 text-sm text-ink-400">
                <Star size={12} className="text-rust-400 fill-rust-400" /> {space.rating_avg.toFixed(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Check-in"><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input py-2" /></Field>
              <Field label="Check-out"><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input py-2" /></Field>
              <Field label="Hóspedes" className="col-span-2">
                <input type="number" min={1} max={space.max_guests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input py-2" />
              </Field>
            </div>

            {nights > 0 && (
              <dl className="mt-4 text-sm space-y-1.5 text-ink-500">
                <Row k={`${formatCurrency(space.price_per_night)} × ${nights} noites`} v={formatCurrency(amounts.subtotal)} />
                <Row k="Taxa de serviço" v={formatCurrency(amounts.platformFee)} muted />
                <div className="rule my-2" />
                <Row k="Total" v={formatCurrency(amounts.totalAmount)} bold />
              </dl>
            )}

            <button
              onClick={() => navigate(ROUTES.checkout(space.id))}
              disabled={nights <= 0}
              className={cn('btn-rust w-full mt-4', nights <= 0 && 'opacity-50 cursor-not-allowed')}
            >
              Reservar
              <ArrowRight size={14} />
            </button>
            <p className="text-[11px] text-ink-300 text-center mt-2">Você ainda não será cobrado.</p>
          </div>

          {/* LokScore breakdown */}
          <LokScoreBreakdown result={lokScore} />
        </aside>
      </section>

      <div className="h-20" />
    </div>
  )
}

function InsightTile({ icon: Icon, label, value, unit, tone }: { icon: typeof Wifi; label: string; value: string; unit?: string; tone: 'rust' | 'ink' }) {
  return (
    <div className={cn(
      'rounded-xl border p-3',
      tone === 'rust' ? 'bg-rust-50 border-rust-200/60' : 'bg-bone border-ink-500/8',
    )}>
      <Icon size={14} className={tone === 'rust' ? 'text-rust-500' : 'text-ink-400'} />
      <p className="text-[10px] uppercase tracking-wider text-ink-400 mt-2">{label}</p>
      <p className="font-display text-xl font-bold text-ink-600">
        {value}{unit && <span className="text-xs font-mono text-ink-300 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[10px] uppercase tracking-wider text-ink-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Row({ k, v, muted, bold }: { k: string; v: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={cn('flex justify-between', muted && 'text-ink-300', bold && 'font-display font-bold text-ink-600 text-base')}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}
