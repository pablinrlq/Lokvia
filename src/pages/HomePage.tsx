import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import { Search, MapPin, Users, ArrowRight, Wifi, Zap, Globe, Shield } from 'lucide-react'
import { ROUTES } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { SpaceCard } from '@/components/spaces/SpaceCard'
import { MOCK_SPACES } from '@/lib/mock'
import type { SpaceType } from '@/types'

// --- Animated counter hook ---
function useAnimatedCounter(target: number, duration = 1.5) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) motionVal.set(target)
  }, [inView, motionVal, target])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplay(Math.round(v)))
    return unsubscribe
  }, [spring])

  return { ref, display }
}

// --- Stagger container ---
const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// --- Data ---
const CITIES = [
  { name: 'São Paulo', state: 'SP', count: 48, emoji: '🏙️', image: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=400&q=80' },
  { name: 'Florianópolis', state: 'SC', count: 23, emoji: '🏄', image: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=400&q=80' },
  { name: 'Curitiba', state: 'PR', count: 19, emoji: '🌿', image: 'https://images.unsplash.com/photo-1587653263995-422546a2abb3?w=400&q=80' },
  { name: 'Belo Horizonte', state: 'MG', count: 31, emoji: '⛰️', image: 'https://images.unsplash.com/photo-1567429284794-0a956d5f0ada?w=400&q=80' },
]

const DIFFERENTIALS = [
  { icon: Wifi, title: 'Espaços verificados', description: 'Wi-Fi de qualidade, mesa de trabalho e silêncio para focar — cada espaço inspecionado.' },
  { icon: Globe, title: 'Agenda de eventos', description: 'Meetups, conferências e networking integrados à sua agenda de viagem.' },
  { icon: Zap, title: 'Reserva instantânea', description: 'Reserve em segundos. Confirmação imediata, PIX ou cartão.' },
  { icon: Shield, title: 'Proteção total', description: 'Pagamentos seguros com split automático. Hóspedes e anfitriões protegidos.' },
]

const SPACE_TYPE_OPTIONS: Array<{ value: SpaceType | ''; label: string }> = [
  { value: '', label: 'Qualquer tipo' },
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'coworking', label: 'Coworking' },
  { value: 'cafe', label: 'Café' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
]

const FEATURED_SPACES = MOCK_SPACES.slice(0, 6)

// --- Stats component ---
function AnimatedStat({ value, suffix, label, decimals = 0 }: { value: number; suffix: string; label: string; decimals?: number }) {
  const { ref, display } = useAnimatedCounter(value)
  const formatted = decimals > 0
    ? (display / Math.pow(10, decimals)).toFixed(decimals)
    : display.toLocaleString('pt-BR')
  return (
    <div className="text-center" ref={ref}>
      <p className="font-display text-3xl font-bold text-lime-400">
        {suffix === 'R$' ? `R$ ${formatted}` : `${formatted}${suffix}`}
      </p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  )
}

// --- Page ---
export function HomePage() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [type, setType] = useState<SpaceType | ''>('')
  const [guests, setGuests] = useState('')

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const orbX = useTransform(mouseX, [0, 1], [-15, 15])
  const orbY = useTransform(mouseY, [0, 1], [-15, 15])
  const smoothOrbX = useSpring(orbX, { stiffness: 80, damping: 30 })
  const smoothOrbY = useSpring(orbY, { stiffness: 80, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('cidade', city)
    if (type) params.set('tipo', type)
    if (guests) params.set('hospedes', guests)
    navigate(`${ROUTES.search}?${params.toString()}`)
  }

  return (
    <div>
      {/* ─── Hero ─── */}
      <section
        className="relative min-h-[90vh] flex items-center bg-forest-900 overflow-hidden noise"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-lime-400/10 blur-[120px]"
            style={{ x: smoothOrbX, y: smoothOrbY }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-earth-400/10 blur-[100px]"
            style={{ x: useTransform(smoothOrbX, (v) => -v * 0.5), y: useTransform(smoothOrbY, (v) => -v * 0.5) }}
          />
        </div>

        <motion.div
          className="container-lokvia relative z-10 py-24"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <div className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1.5 text-xs font-medium text-lime-400 mb-8">
                ✦ Para empreendedores viajantes
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight"
            >
              Trabalhe em qualquer lugar.{' '}
              <span className="text-lime-400 relative">
                Viva a cidade.
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] bg-lime-400/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed"
            >
              Espaços únicos verificados para nômades digitais — com agenda de eventos integrada e IA
              para planejar sua estadia perfeita.
            </motion.p>
          </div>

          {/* Search bar */}
          <motion.div variants={fadeUp} className="mt-12">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-1 shadow-2xl shadow-black/30 max-w-3xl"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 md:border-r border-forest-900/10">
                <MapPin size={16} className="text-forest-900/30 shrink-0" />
                <input
                  type="text"
                  placeholder="Qual cidade?"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm outline-none text-forest-900 placeholder:text-forest-900/40 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 md:border-r border-forest-900/10">
                <span className="text-forest-900/30 text-sm shrink-0">Tipo</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SpaceType | '')}
                  className="text-sm outline-none text-forest-900/70 bg-transparent cursor-pointer"
                >
                  {SPACE_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5">
                <Users size={16} className="text-forest-900/30 shrink-0" />
                <input
                  type="number"
                  placeholder="Hóspedes"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-24 text-sm outline-none text-forest-900 placeholder:text-forest-900/40 bg-transparent"
                />
              </div>
              <Button type="submit" variant="lime" size="lg" className="shrink-0 rounded-xl">
                <Search size={15} />
                Buscar
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Cidades ─── */}
      <section className="section bg-cream">
        <div className="container-lokvia">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
              Destinos em alta
            </h2>
            <p className="mt-3 text-forest-900/50">Os melhores espaços em cada cidade</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {CITIES.map((c) => (
              <motion.button
                key={c.name}
                variants={fadeUp}
                onClick={() => navigate(`${ROUTES.search}?cidade=${c.name}`)}
                className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer ring-offset-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 text-white">
                  <p className="font-display font-bold text-lg leading-tight drop-shadow-md">{c.name}</p>
                  <p className="text-sm text-white/70 mt-0.5">{c.count} espaços</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Espaços em destaque ─── */}
      <section className="section bg-white">
        <div className="container-lokvia">
          <motion.div
            className="flex items-end justify-between mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
                Espaços em destaque
              </h2>
              <p className="mt-2 text-forest-900/50">Selecionados pela LokIA para você</p>
            </div>
            <Button variant="outline" className="hidden md:flex" onClick={() => navigate(ROUTES.search)}>
              Ver todos
              <ArrowRight size={14} />
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {FEATURED_SPACES.map((space) => (
              <motion.div key={space.id} variants={fadeUp}>
                <SpaceCard space={space} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 text-center md:hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" onClick={() => navigate(ROUTES.search)}>
              Ver todos os espaços
              <ArrowRight size={14} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Por que Lokvia ─── */}
      <section className="section bg-cream">
        <div className="container-lokvia">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
              Por que Lokvia?
            </h2>
            <p className="mt-3 text-forest-900/50 max-w-lg mx-auto">
              Mais que uma plataforma de aluguel — um ecossistema para quem trabalha em movimento
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {DIFFERENTIALS.map((diff) => (
              <motion.div
                key={diff.title}
                variants={fadeUp}
                className="group p-6 rounded-2xl border border-forest-900/8 hover:border-lime-400/40 bg-white hover:bg-lime-400/5 transition-all duration-300 cursor-default"
                whileHover={{ y: -2 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center mb-4"
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <diff.icon size={18} className="text-lime-400 group-hover:text-lime-300 transition-colors" />
                </motion.div>
                <h3 className="font-display font-semibold text-forest-900 mb-2">{diff.title}</h3>
                <p className="text-sm text-forest-900/55 leading-relaxed">{diff.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Anfitriões ─── */}
      <section className="section bg-forest-900 relative overflow-hidden noise">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-lime-400/8 blur-[120px]"
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-earth-400/8 blur-[100px]"
            animate={{ x: [0, -15, 0], y: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container-lokvia relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1.5 text-xs font-medium text-lime-400 mb-8">
                ✦ Para anfitriões
              </span>

              <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
                Seu espaço.{' '}
                <span className="text-lime-400">Sua renda.</span>
              </h2>

              <p className="mt-6 text-white/60 text-lg leading-relaxed">
                Monetize sua casa, coworking ou café com empreendedores selecionados. Gestão
                simplificada, pagamento automático e suporte 24h.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="lime" size="lg" onClick={() => navigate(ROUTES.register)}>
                  Cadastrar meu espaço
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(ROUTES.hostDashboard)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Saiba mais
                </Button>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 md:gap-12">
                <AnimatedStat value={2800} suffix="R$" label="Média/mês" />
                <div className="w-px h-12 bg-white/10" />
                <AnimatedStat value={48} suffix="★" label="Avaliação média" decimals={1} />
                <div className="w-px h-12 bg-white/10" />
                <AnimatedStat value={72} suffix="%" label="Ocupação" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
