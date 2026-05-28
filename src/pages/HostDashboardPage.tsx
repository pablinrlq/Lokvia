import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Home, TrendingUp, ShieldCheck, ArrowRight, Star } from 'lucide-react'
import { MOCK_SPACES } from '@/lib/mock'
import { suggestPriceForSpace } from '@/lib/events'
import { cn, formatCurrency, ROUTES } from '@/lib/utils'
import { PriceOptimizer } from '@/components/host/PriceOptimizer'

export function HostDashboardPage() {
  // Mock: "minhas listagens" = primeiros 3 espaços
  const mySpaces = useMemo(() => MOCK_SPACES.slice(0, 3), [])
  const suggestions = useMemo(
    () => mySpaces.map((s) => ({ space: s, suggestion: suggestPriceForSpace(s, new Date('2026-06-09')) })),
    [mySpaces],
  )

  const monthlyRevenue = 12480
  const occupancy = 72
  const rating = 4.8

  return (
    <div className="bg-bone min-h-screen">
      <header className="container-lokvia pt-10 pb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Painel do anfitrião</p>
          <h1 className="display-serif text-4xl md:text-5xl text-ink-600 mt-1">
            Suas listagens
          </h1>
          <p className="text-ink-400 mt-2 max-w-xl">
            Gerencie espaços, acompanhe métricas e otimize preço com base em eventos locais.
          </p>
        </div>
        <Link to={ROUTES.hostNewSpace} className="btn-rust">
          <Plus size={14} /> Novo espaço
        </Link>
      </header>

      <main className="container-lokvia pb-20 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Coluna principal */}
        <div className="space-y-8">
          {/* Stats */}
          <section className="grid grid-cols-3 rounded-2xl border border-ink-500/8 bg-white overflow-hidden">
            <Stat label="Receita do mês" value={formatCurrency(monthlyRevenue)} icon={TrendingUp} highlight />
            <Stat label="Ocupação" value={`${occupancy}%`} icon={Home} />
            <Stat label="Avaliação" value={rating.toFixed(1)} icon={Star} />
          </section>

          {/* Price Optimizer */}
          <section>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="eyebrow flex items-center gap-1.5"><TrendingUp size={11} className="text-rust-400" /> Price Optimizer</p>
                <h2 className="display-serif text-2xl text-ink-600">Eventos nos próximos 7 dias</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map(({ space, suggestion }) => (
                <PriceOptimizer
                  key={space.id}
                  suggestion={suggestion}
                  spaceTitle={space.title}
                  onApply={() => alert(`Preço atualizado para ${formatCurrency(suggestion.suggested_price)}`)}
                />
              ))}
            </div>
          </section>

          {/* Listagens */}
          <section>
            <p className="eyebrow mb-3">Minhas listagens</p>
            <ul className="space-y-2">
              {mySpaces.map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-ink-500/8 bg-white p-3"
                >
                  <img src={s.photos[0]} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink-600 line-clamp-1">{s.title}</p>
                    <p className="text-xs text-ink-300">{s.city}, {s.state}</p>
                    <p className="text-sm font-bold text-rust-500 mt-1">{formatCurrency(s.price_per_night)}<span className="text-[10px] font-normal text-ink-300"> /noite</span></p>
                  </div>
                  <Link to={ROUTES.space(s.id)} className="btn-outline text-xs py-1.5">
                    Ver <ArrowRight size={11} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-ink-500/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-rust-500" />
              <p className="eyebrow">Double-blind reviews</p>
            </div>
            <h3 className="display-serif text-lg text-ink-600 mt-1">3 reviews pendentes</h3>
            <p className="text-sm text-ink-400 mt-2">
              Suas avaliações ficam ocultas até você avaliar os hóspedes — e vice-versa. Sem retaliação.
            </p>
            <button className="btn-primary w-full mt-4 text-sm">Avaliar hóspedes agora</button>
          </div>

          <div className="rounded-2xl border border-ink-500/8 bg-gradient-to-br from-ink-500 to-ink-600 text-bone p-5 noise">
            <p className="eyebrow text-lime-400">Insights de IA</p>
            <h3 className="display-serif text-lg text-bone mt-1">Diversifique seu calendário</h3>
            <p className="text-sm text-bone/70 mt-2 leading-relaxed">
              Reservas longas (5+ noites) crescem em média 22% no inverno. Considere oferecer desconto progressivo.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

function Stat({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: typeof Home; highlight?: boolean }) {
  return (
    <div className={cn('p-5 border-r last:border-r-0 border-ink-500/8', highlight && 'bg-gradient-to-br from-rust-50 to-bone')}>
      <Icon size={14} className={highlight ? 'text-rust-500' : 'text-ink-300'} />
      <p className="text-[10px] uppercase tracking-wider text-ink-400 mt-2">{label}</p>
      <p className={cn('font-display text-2xl font-bold mt-1', highlight ? 'text-rust-500' : 'text-ink-600')}>{value}</p>
    </div>
  )
}
