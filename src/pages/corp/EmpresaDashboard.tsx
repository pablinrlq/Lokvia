import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Banknote,
  CalendarCheck,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import {
  getReservasDaEmpresa,
  getReservasPendentes,
  listarViajantes,
} from '@/lib/api/corp'
import { formatCurrency, ROUTES } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/features/corp/KpiCard'
import { GastoMensalChart } from '@/features/corp/GastoMensalChart'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function EmpresaDashboard() {
  const empresa = useActiveEmpresa()
  if (!empresa) return null

  const { data: pendentes = [] } = useQuery({
    queryKey: ['corp', 'pendentes', empresa.id],
    queryFn: () => getReservasPendentes(empresa.id),
  })

  const { data: reservasMes = [] } = useQuery({
    queryKey: ['corp', 'reservas-30d', empresa.id],
    queryFn: () => {
      const from = new Date()
      from.setDate(from.getDate() - 30)
      return getReservasDaEmpresa(empresa.id, { from })
    },
  })

  const { data: viajantes = [] } = useQuery({
    queryKey: ['corp', 'viajantes', empresa.id],
    queryFn: () => listarViajantes(empresa.id),
  })

  const gastoMes = reservasMes
    .filter((r: { status_aprovacao: string }) => r.status_aprovacao === 'aprovada')
    .reduce((sum: number, r) => sum + ((r as { booking?: { total_amount?: number } }).booking?.total_amount ?? 0), 0)

  const reservasCount = reservasMes.length
  const viajantesAtivos = viajantes.filter((v: { ativo: boolean }) => v.ativo).length

  const noitesTotais = reservasMes.reduce((sum: number, r) => {
    const b = (r as { booking?: { check_in: string; check_out: string } }).booking
    if (!b) return sum
    const n = Math.ceil(
      (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    return sum + n
  }, 0)
  const diariaMedia = noitesTotais > 0 ? gastoMes / noitesTotais : 0

  // Série de 6 meses (mockada parcialmente a partir das reservas reais)
  const hoje = new Date()
  const serie: { mes: string; gasto: number; orcamento?: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const key = monthKey(d)
    const gasto = reservasMes
      .filter(
        (r) =>
          (r as { booking?: { check_in: string } }).booking?.check_in?.startsWith(key) &&
          (r as { status_aprovacao: string }).status_aprovacao === 'aprovada',
      )
      .reduce(
        (s: number, r) =>
          s + ((r as { booking?: { total_amount?: number } }).booking?.total_amount ?? 0),
        0,
      )
    serie.push({
      mes: MESES[d.getMonth()],
      gasto,
      orcamento: empresa.limite_mensal ?? undefined,
    })
  }

  // Top 5 viajantes do período
  const porViajante = new Map<string, { nome: string; gasto: number; reservas: number }>()
  for (const r of reservasMes) {
    const rr = r as {
      viajante: { id: string; name: string }
      booking?: { total_amount?: number }
    }
    const cur = porViajante.get(rr.viajante.id) ?? {
      nome: rr.viajante.name,
      gasto: 0,
      reservas: 0,
    }
    cur.gasto += rr.booking?.total_amount ?? 0
    cur.reservas += 1
    porViajante.set(rr.viajante.id, cur)
  }
  const top5 = [...porViajante.values()].sort((a, b) => b.gasto - a.gasto).slice(0, 5)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl sm:text-3xl text-forest-900">
          Bem-vindo, {empresa.nome_fantasia}.
        </h1>
        <p className="text-sm text-forest-900/60">
          Aqui está o resumo de viagens corporativas dos últimos 30 dias.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Gasto do período"
          value={formatCurrency(gastoMes)}
          icon={<Banknote size={14} />}
          hint={empresa.limite_mensal ? `Limite: ${formatCurrency(empresa.limite_mensal)}` : null}
        />
        <KpiCard
          label="Reservas"
          value={reservasCount}
          icon={<CalendarCheck size={14} />}
          hint={`${pendentes.length} aguardando aprovação`}
        />
        <KpiCard
          label="Viajantes ativos"
          value={`${viajantesAtivos} / ${viajantes.length}`}
          icon={<Users size={14} />}
        />
        <KpiCard
          label="Diária média"
          value={formatCurrency(diariaMedia)}
          icon={<TrendingUp size={14} />}
          hint={`${noitesTotais} noites`}
        />
      </div>

      {pendentes.length > 0 && (
        <div className="rounded-2xl border border-rust-300 bg-rust-50 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-rust-500" />
            <h2 className="font-display text-lg text-forest-900">
              {pendentes.length} {pendentes.length === 1 ? 'reserva aguardando' : 'reservas aguardando'} sua aprovação
            </h2>
          </div>
          <ul className="mt-3 space-y-2">
            {pendentes.slice(0, 3).map((p) => {
              const pp = p as {
                booking_id: string
                viajante: { name: string }
                espaco: { title?: string } | null
                booking?: { total_amount?: number; check_in: string }
              }
              return (
                <li
                  key={pp.booking_id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">
                    <strong>{pp.viajante.name}</strong>{' '}
                    <span className="text-forest-900/60">
                      → {pp.espaco?.title ?? 'Espaço'} ·{' '}
                      {pp.booking ? formatCurrency(pp.booking.total_amount ?? 0) : '—'}
                    </span>
                  </span>
                  <Link
                    to={ROUTES.empresaReservas}
                    className="text-xs font-medium text-forest-900 hover:underline shrink-0"
                  >
                    Revisar →
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-3">
            <Button asChild variant="default" size="sm">
              <Link to={ROUTES.empresaReservas}>Ver todas pendentes</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest-900">Gasto mensal</h2>
            <Link
              to={ROUTES.empresaRelatorios}
              className="text-xs text-forest-900/60 hover:text-forest-900 flex items-center gap-1"
            >
              Relatórios <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4">
            <GastoMensalChart data={serie} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-forest-900/60">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-forest-700" /> Gasto
            </span>
            {empresa.limite_mensal && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-[2px] bg-lime-500" /> Orçamento
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
          <h2 className="font-display text-lg text-forest-900">Top 5 viajantes</h2>
          {top5.length === 0 ? (
            <p className="mt-4 text-sm text-forest-900/60">
              Sem reservas no período.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-forest-900/5">
              {top5.map((v, i) => (
                <li key={v.nome + i} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-900/5 text-forest-900/60 text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-forest-900 truncate">
                      {v.nome}
                    </div>
                    <div className="text-xs text-forest-900/60">
                      {v.reservas} {v.reservas === 1 ? 'reserva' : 'reservas'}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-forest-900">
                    {formatCurrency(v.gasto)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
