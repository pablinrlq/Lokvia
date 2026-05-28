import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  Shield,
  Banknote,
  Settings,
  ExternalLink,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { cn, ROUTES } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useActiveEmpresa, useCorpLoading } from '@/contexts/CorpContext'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV: NavItem[] = [
  { to: ROUTES.empresa, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.empresaViajantes, label: 'Viajantes', icon: Users },
  { to: ROUTES.empresaReservas, label: 'Reservas', icon: CalendarCheck },
  { to: ROUTES.empresaRelatorios, label: 'Relatórios', icon: BarChart3 },
  { to: ROUTES.empresaPolitica, label: 'Política', icon: Shield },
  { to: ROUTES.empresaFaturamento, label: 'Faturamento', icon: Banknote },
  { to: ROUTES.empresaConfig, label: 'Configurações', icon: Settings },
]

const PLANO_LABEL: Record<string, string> = {
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
}

export function CorpLayout() {
  const empresa = useActiveEmpresa()
  const loading = useCorpLoading()
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-forest-900/60">
        Carregando…
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl text-forest-900">
          Você ainda não tem uma conta empresarial
        </h1>
        <p className="text-sm text-forest-900/60 max-w-sm">
          Cadastre sua empresa para acessar o painel corporativo.
        </p>
        <Button asChild variant="lime">
          <Link to={ROUTES.empresaCadastro}>Cadastrar empresa</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-forest-900/10 bg-white">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-forest-900/10">
          <Logo variant="dark" size="sm" />
          <span className="text-[10px] font-semibold tracking-wide uppercase rounded-md bg-lime-400/30 text-forest-900 px-1.5 py-0.5">
            Empresas
          </span>
        </div>
        <div className="px-5 py-4 border-b border-forest-900/10">
          <div className="text-sm font-semibold text-forest-900 truncate">
            {empresa.nome_fantasia}
          </div>
          <div className="mt-1 inline-flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-forest-900/5 text-forest-900/70 px-2 py-0.5">
              {PLANO_LABEL[empresa.plano]}
            </span>
            {empresa.verificada ? (
              <span className="rounded-full bg-lime-400/20 text-forest-800 px-2 py-0.5">
                ✓ Verificada
              </span>
            ) : (
              <span className="rounded-full bg-rust-100 text-rust-500 px-2 py-0.5">
                Pendente
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-forest-900 text-lime-400 font-medium'
                    : 'text-forest-900/80 hover:bg-forest-900/5',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-forest-900/10 p-3 space-y-1">
          <a
            href={ROUTES.guestDashboard}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-forest-900/60 hover:text-forest-900"
          >
            <ExternalLink size={12} />
            Portal do viajante
          </a>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="flex items-center gap-2 px-3 py-2 text-xs text-forest-900/60 hover:text-forest-900 w-full"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0">
        {/* Topbar mobile */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-forest-900/10 px-4 py-3">
          <Logo variant="dark" size="sm" />
          <span className="text-[10px] font-semibold tracking-wide uppercase rounded-md bg-lime-400/30 text-forest-900 px-1.5 py-0.5">
            Empresas
          </span>
          <div className="ml-auto text-xs text-forest-900/70 truncate">
            {empresa.nome_fantasia}
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <Outlet />
        </div>

        {/* BottomNav mobile */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-forest-900/10 grid grid-cols-5">
          {NAV.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px]',
                  isActive ? 'text-forest-900' : 'text-forest-900/50',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="h-16 lg:hidden" />
      </main>
    </div>
  )
}
