import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { MOCK_NOMAD_JOURNEY, MOCK_SPACES, MOCK_WORK_INSIGHTS } from '@/lib/mock'
import { useWorkProfile } from '@/lib/store'
import { rankSpacesByLokScore } from '@/lib/lokscore'
import { NomadTracker } from '@/components/nomad/NomadTracker'
import { SpaceCard } from '@/components/spaces/SpaceCard'
import { ROUTES } from '@/lib/utils'

export function GuestDashboardPage() {
  const profile = useWorkProfile((s) => s.profile)
  const recommended = rankSpacesByLokScore(MOCK_SPACES, profile, MOCK_WORK_INSIGHTS).slice(0, 3)

  return (
    <div className="bg-bone min-h-screen">
      <header className="container-lokvia pt-10 pb-6">
        <p className="eyebrow">Painel do hóspede</p>
        <h1 className="display-serif text-4xl md:text-5xl text-ink-600 mt-1 text-balance">
          Olá, viajante.
        </h1>
        <p className="text-ink-400 mt-2 max-w-xl">
          Acompanhe sua jornada nômade, suas reservas e descubra espaços compatíveis com seu perfil LokScore™.
        </p>
      </header>

      <main className="container-lokvia pb-20 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-8">
          {/* Nomad Tracker — destaque */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <NomadTracker journey={MOCK_NOMAD_JOURNEY} />
          </motion.div>

          {/* Recomendações via LokScore */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="eyebrow flex items-center gap-1.5"><Sparkles size={11} className="text-rust-400" /> LokScore™</p>
                <h2 className="display-serif text-2xl text-ink-600">Para o seu próximo destino</h2>
              </div>
              <Link to={ROUTES.search} className="text-xs text-rust-500 hover:underline inline-flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommended.map(({ space, result }) => (
                <SpaceCard key={space.id} space={space} lokScore={result} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <SidePanel title="Próximas reservas" icon={Calendar}>
            <EmptyLine text="Nenhuma reserva confirmada." cta="Buscar espaços" to={ROUTES.search} />
          </SidePanel>

          <SidePanel title="Favoritos" icon={Heart}>
            <EmptyLine text="Sem favoritos ainda." cta="Explorar" to={ROUTES.search} />
          </SidePanel>

          <div className="rounded-2xl border border-rust-400/30 bg-gradient-to-br from-rust-50 to-bone p-5">
            <p className="eyebrow text-rust-500">Perfil ativo</p>
            <p className="display-serif text-lg text-ink-600 mt-1 capitalize">
              {profile.type} · {profile.schedule}
            </p>
            <p className="text-xs text-ink-400 mt-2">
              Suas prioridades: {profile.priorities.join(', ')}
            </p>
            <Link to={ROUTES.search} className="btn-rust w-full mt-4 text-xs">
              Editar perfil na busca
            </Link>
          </div>
        </aside>
      </main>
    </div>
  )
}

function SidePanel({ title, icon: Icon, children }: { title: string; icon: typeof Calendar; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-500/8 bg-white p-5">
      <p className="eyebrow flex items-center gap-1.5"><Icon size={11} /> {title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function EmptyLine({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="text-sm text-ink-400">
      <p>{text}</p>
      <Link to={to} className="text-rust-500 text-xs font-semibold inline-flex items-center gap-1 mt-2">
        {cta} <ArrowRight size={11} />
      </Link>
    </div>
  )
}
