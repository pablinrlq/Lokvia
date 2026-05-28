import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Filter, Map as MapIcon, LayoutList, Columns2, Sparkles, X, SlidersHorizontal } from 'lucide-react'
import { MOCK_SPACES, MOCK_WORK_INSIGHTS } from '@/lib/mock'
import { rankSpacesByLokScore } from '@/lib/lokscore'
import { useWorkProfile } from '@/lib/store'
import { AMENITIES, cn, SPACE_TYPE_LABELS } from '@/lib/utils'
import { SpaceCard } from '@/components/spaces/SpaceCard'
import { SpacesMap } from '@/components/spaces/SpacesMap'
import { WorkProfileEditor } from '@/components/lokscore/WorkProfileEditor'
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/Sheet'
import type { SpaceType } from '@/types'

type ViewMode = 'list' | 'split' | 'map'

const MODES: Array<{ value: ViewMode; label: string; icon: typeof MapIcon }> = [
  { value: 'list',  label: 'Lista', icon: LayoutList },
  { value: 'split', label: 'Split', icon: Columns2 },
  { value: 'map',   label: 'Mapa',  icon: MapIcon },
]

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const profile = useWorkProfile((s) => s.profile)

  const cityParam = params.get('cidade') ?? ''
  const typeParam = (params.get('tipo') as SpaceType | null) ?? ''
  const guestsParam = Number(params.get('hospedes')) || 0

  const [city, setCity] = useState(cityParam)
  const [type, setType] = useState<SpaceType | ''>(typeParam)
  const [guests, setGuests] = useState(guestsParam || 1)
  const [maxPrice, setMaxPrice] = useState(500)
  const [amenities, setAmenities] = useState<string[]>([])
  const [view, setView] = useState<ViewMode>('split')
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => { setCity(cityParam) }, [cityParam])

  function toggleAmenity(a: string) {
    setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]))
  }

  // Filtragem
  const filtered = useMemo(() => {
    return MOCK_SPACES.filter((s) => {
      if (city && !s.city.toLowerCase().includes(city.toLowerCase())) return false
      if (type && s.type !== type) return false
      if (guests && s.max_guests < guests) return false
      if (s.price_per_night > maxPrice) return false
      if (amenities.length && !amenities.every((a) => s.amenities.includes(a))) return false
      return true
    })
  }, [city, type, guests, maxPrice, amenities])

  // Ranking via LokScore
  const ranked = useMemo(() => rankSpacesByLokScore(filtered, profile, MOCK_WORK_INSIGHTS), [filtered, profile])
  const scoreMap = useMemo(() => Object.fromEntries(ranked.map((r) => [r.space.id, r.result])), [ranked])

  function persistQuery() {
    const p = new URLSearchParams()
    if (city) p.set('cidade', city)
    if (type) p.set('tipo', type)
    if (guests > 1) p.set('hospedes', String(guests))
    setParams(p, { replace: true })
  }
  useEffect(persistQuery, [city, type, guests]) // eslint-disable-line

  return (
    <div className="min-h-screen bg-bone">
      {/* Header / Toolbar */}
      <div className="sticky top-16 z-40 bg-bone/85 backdrop-blur border-b border-ink-500/8">
        <div className="container-lokvia py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <p className="eyebrow">Buscar</p>
            <h1 className="display-serif text-2xl text-ink-600 leading-tight">
              {ranked.length} {ranked.length === 1 ? 'espaço' : 'espaços'} para você
            </h1>
          </div>

          {/* WorkProfile chip */}
          <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
            <SheetTrigger asChild>
              <button className="hidden md:inline-flex items-center gap-2 rounded-full bg-ink-500 text-bone px-3.5 py-2 text-xs font-semibold shadow-rust hover:bg-ink-600 transition">
                <Sparkles size={13} className="text-lime-400" />
                Perfil: {profile.type} · {profile.schedule}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[420px] sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Seu perfil LokScore™</SheetTitle>
                <SheetDescription>
                  Quanto mais preciso, melhor o ranking dos espaços.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <WorkProfileEditor onSaved={() => setProfileSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Filtros (mobile) */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 rounded-full border border-ink-500/15 px-3.5 py-2 text-xs font-medium bg-white"
          >
            <SlidersHorizontal size={13} /> Filtros
          </button>

          {/* Toggle 3 modos com layoutId */}
          <LayoutGroup id="view-mode-toggle">
            <div className="inline-flex rounded-full border border-ink-500/12 bg-white p-1">
              {MODES.map((m) => {
                const active = view === m.value
                return (
                  <button
                    key={m.value}
                    onClick={() => setView(m.value)}
                    className={cn(
                      'relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      active ? 'text-bone' : 'text-ink-500 hover:text-ink-600',
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="view-mode-bg"
                        className="absolute inset-0 rounded-full bg-rust-400 shadow-rust"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <m.icon size={13} />{m.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Body grid: sidebar + content */}
      <div className="container-lokvia py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar filtros */}
        <aside className={cn('lg:block', filtersOpen ? 'block' : 'hidden')}>
          <FiltersPanel
            city={city} setCity={setCity}
            type={type} setType={setType}
            guests={guests} setGuests={setGuests}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            amenities={amenities} toggleAmenity={toggleAmenity}
            onClear={() => { setCity(''); setType(''); setGuests(1); setMaxPrice(500); setAmenities([]) }}
          />
        </aside>

        {/* Conteúdo dinâmico — animação entre modos com layoutId */}
        <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {ranked.map(({ space, result }) => (
                  <SpaceCard key={space.id} space={space} lokScore={result} layout="row" />
                ))}
                {ranked.length === 0 && <EmptyState />}
              </motion.div>
            )}

            {view === 'split' && (
              <motion.div
                key="split"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {ranked.map(({ space, result }) => (
                    <SpaceCard key={space.id} space={space} lokScore={result} />
                  ))}
                  {ranked.length === 0 && <EmptyState />}
                </div>
                <div className="hidden xl:block sticky top-36 h-[calc(100vh-10rem)]">
                  <SpacesMap spaces={ranked.map((r) => r.space)} scoreById={scoreMap} />
                </div>
              </motion.div>
            )}

            {view === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.3 }}
                className="h-[calc(100vh-10rem)]"
              >
                <SpacesMap spaces={ranked.map((r) => r.space)} scoreById={scoreMap} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar filtros ──────────────────────────────────────────────────
function FiltersPanel({
  city, setCity, type, setType, guests, setGuests, maxPrice, setMaxPrice,
  amenities, toggleAmenity, onClear,
}: {
  city: string; setCity: (v: string) => void
  type: SpaceType | ''; setType: (v: SpaceType | '') => void
  guests: number; setGuests: (n: number) => void
  maxPrice: number; setMaxPrice: (n: number) => void
  amenities: string[]; toggleAmenity: (a: string) => void
  onClear: () => void
}) {
  return (
    <div className="rounded-2xl border border-ink-500/8 bg-white p-5 sticky top-36">
      <div className="flex items-center justify-between mb-4">
        <p className="eyebrow flex items-center gap-1.5"><Filter size={11} /> Filtros</p>
        <button onClick={onClear} className="text-[10px] uppercase tracking-wider text-rust-500 hover:underline">
          Limpar
        </button>
      </div>

      <FieldLabel>Cidade</FieldLabel>
      <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Qualquer" />

      <FieldLabel className="mt-4">Tipo</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {(['', ...Object.keys(SPACE_TYPE_LABELS)] as Array<SpaceType | ''>).map((t) => {
          const active = type === t
          return (
            <button
              key={t || 'all'}
              onClick={() => setType(t)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition',
                active ? 'border-rust-400 bg-rust-400 text-bone' : 'border-ink-500/12 text-ink-500 hover:border-rust-400/40',
              )}
            >
              {t === '' ? 'Todos' : SPACE_TYPE_LABELS[t]}
            </button>
          )
        })}
      </div>

      <FieldLabel className="mt-4">Hóspedes</FieldLabel>
      <input type="number" min={1} max={20} className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />

      <FieldLabel className="mt-4">Preço máx/noite: <span className="text-rust-500 font-mono font-semibold">R$ {maxPrice}</span></FieldLabel>
      <input
        type="range" min={50} max={500} step={10} value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
        className="w-full accent-rust-400"
      />

      <FieldLabel className="mt-4">Comodidades</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {AMENITIES.map((a) => {
          const active = amenities.includes(a.id)
          return (
            <button
              key={a.id}
              onClick={() => toggleAmenity(a.id)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] transition',
                active ? 'border-ink-500 bg-ink-500 text-bone' : 'border-ink-500/12 text-ink-400 hover:border-ink-500/40',
              )}
            >
              {a.label}
            </button>
          )
        })}
      </div>

      {amenities.length > 0 && (
        <button onClick={() => amenities.forEach(toggleAmenity)} className="mt-4 inline-flex items-center gap-1 text-[11px] text-ink-300 hover:text-ink-500">
          <X size={11} /> Limpar comodidades
        </button>
      )}
    </div>
  )
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-[11px] uppercase tracking-wider text-ink-400 mb-1.5', className)}>{children}</p>
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-500/20 bg-white p-12 text-center">
      <p className="eyebrow">Sem resultados</p>
      <h3 className="display-serif text-xl text-ink-600 mt-1">Nada encontrado nesses filtros</h3>
      <p className="text-sm text-ink-300 mt-2">Tente afrouxar preço, cidade ou comodidades.</p>
    </div>
  )
}
