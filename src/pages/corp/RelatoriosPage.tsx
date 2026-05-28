import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import { getRelatorioFinanceiro } from '@/lib/api/corp'
import { GastoMensalChart } from '@/features/corp/GastoMensalChart'
import { KpiCard } from '@/features/corp/KpiCard'
import { formatCurrency, formatDate } from '@/lib/utils'

type Periodo = '30d' | '90d' | 'ano'

const PERIODOS: { key: Periodo; label: string; dias: number }[] = [
  { key: '30d', label: 'Últimos 30 dias', dias: 30 },
  { key: '90d', label: 'Últimos 90 dias', dias: 90 },
  { key: 'ano', label: 'Últimos 12 meses', dias: 365 },
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
}

export function RelatoriosPage() {
  const empresa = useActiveEmpresa()
  const [periodo, setPeriodo] = useState<Periodo>('30d')

  const range = useMemo(() => {
    const fim = new Date()
    const inicio = new Date()
    const dias = PERIODOS.find((p) => p.key === periodo)?.dias ?? 30
    inicio.setDate(inicio.getDate() - dias)
    return { inicio, fim }
  }, [periodo])

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['corp', 'relatorio', empresa?.id, periodo],
    queryFn: () => getRelatorioFinanceiro(empresa!.id, range),
    enabled: !!empresa,
  })

  const aprovadas = rows.filter((r) => (r as { status_aprovacao: string }).status_aprovacao === 'aprovada')

  const totalGasto = aprovadas.reduce(
    (s, r) => s + ((r as { booking?: { total_amount?: number } }).booking?.total_amount ?? 0),
    0,
  )
  const totalReservas = aprovadas.length
  const ticketMedio = totalReservas > 0 ? totalGasto / totalReservas : 0
  const noites = aprovadas.reduce((s, r) => {
    const b = (r as { booking?: { check_in: string; check_out: string } }).booking
    if (!b) return s
    return (
      s +
      Math.ceil(
        (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    )
  }, 0)
  const viajantesUnicos = new Set(aprovadas.map((r) => (r as { viajante_id: string }).viajante_id)).size

  // Cidades
  const porCidade = new Map<string, { gasto: number; reservas: number }>()
  for (const r of aprovadas) {
    const rr = r as {
      booking?: { total_amount?: number }
      espaco?: { city?: string } | null
    }
    const cid = rr.espaco?.city ?? 'Desconhecida'
    const cur = porCidade.get(cid) ?? { gasto: 0, reservas: 0 }
    cur.gasto += rr.booking?.total_amount ?? 0
    cur.reservas += 1
    porCidade.set(cid, cur)
  }
  const cidades = [...porCidade.entries()]
    .map(([cidade, v]) => ({ cidade, ...v }))
    .sort((a, b) => b.gasto - a.gasto)

  // Evolução mensal
  const porMes = new Map<string, number>()
  for (const r of aprovadas) {
    const b = (r as { booking?: { check_in?: string; total_amount?: number } }).booking
    if (!b?.check_in) continue
    const d = new Date(b.check_in)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    porMes.set(key, (porMes.get(key) ?? 0) + (b.total_amount ?? 0))
  }
  const meses: { mes: string; gasto: number }[] = []
  const hoje = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    meses.push({ mes: MESES[d.getMonth()], gasto: porMes.get(key) ?? 0 })
  }

  function exportCSV() {
    const csvRows = aprovadas.map((r) => {
      const rr = r as {
        booking?: { check_in: string; check_out: string; total_amount?: number }
        viajante: { name: string }
        espaco?: { title?: string; city?: string } | null
        centro_de_custo?: string
        motivo_viagem?: string
        dentro_da_politica: boolean
      }
      return {
        data: rr.booking?.check_in ?? '',
        viajante: rr.viajante.name,
        destino: rr.espaco?.title ?? '',
        cidade: rr.espaco?.city ?? '',
        check_in: rr.booking?.check_in ?? '',
        check_out: rr.booking?.check_out ?? '',
        valor: rr.booking?.total_amount ?? 0,
        centro_de_custo: rr.centro_de_custo ?? '',
        motivo: rr.motivo_viagem ?? '',
        na_politica: rr.dentro_da_politica ? 'sim' : 'não',
      }
    })
    const csv = toCSV(csvRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lokvia-relatorio-${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!empresa) return null

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-forest-900">Relatórios</h1>
          <p className="text-sm text-forest-900/60">
            {formatDate(range.inicio)} → {formatDate(range.fim)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className="h-10 rounded-xl border border-forest-900/15 bg-white px-3 text-sm"
          >
            {PERIODOS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={exportCSV} disabled={aprovadas.length === 0}>
            <Download size={14} /> CSV
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="text-sm text-forest-900/60">Carregando…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard label="Total gasto" value={formatCurrency(totalGasto)} />
            <KpiCard label="Ticket médio" value={formatCurrency(ticketMedio)} />
            <KpiCard label="Noites totais" value={noites} />
            <KpiCard label="Viajantes únicos" value={viajantesUnicos} />
          </div>

          <div className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
            <h2 className="font-display text-lg text-forest-900">Evolução mensal</h2>
            <div className="mt-4">
              <GastoMensalChart data={meses} />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
            <h2 className="font-display text-lg text-forest-900">Por cidade</h2>
            {cidades.length === 0 ? (
              <p className="mt-3 text-sm text-forest-900/60">Sem dados.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {cidades.map((c) => {
                  const pct = totalGasto > 0 ? (c.gasto / totalGasto) * 100 : 0
                  return (
                    <li key={c.cidade}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-forest-900">{c.cidade}</span>
                        <span className="text-forest-900/70">
                          {formatCurrency(c.gasto)} · {c.reservas}{' '}
                          {c.reservas === 1 ? 'reserva' : 'reservas'}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-forest-900/5 overflow-hidden">
                        <div
                          className="h-full bg-forest-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card overflow-hidden">
            <div className="px-5 pt-5">
              <h2 className="font-display text-lg text-forest-900">
                Reservas detalhadas ({aprovadas.length})
              </h2>
            </div>
            <table className="w-full mt-3 text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wider text-forest-900/60">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Viajante</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Destino</th>
                  <th className="text-right px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Política</th>
                </tr>
              </thead>
              <tbody>
                {aprovadas.slice(0, 50).map((r) => {
                  const rr = r as {
                    booking_id: string
                    booking?: { check_in: string; total_amount?: number }
                    viajante: { name: string }
                    espaco?: { title?: string; city?: string } | null
                    dentro_da_politica: boolean
                  }
                  return (
                    <tr
                      key={rr.booking_id}
                      className="border-t border-forest-900/5"
                    >
                      <td className="px-4 py-3">
                        {rr.booking?.check_in ? formatDate(rr.booking.check_in) : '—'}
                      </td>
                      <td className="px-4 py-3">{rr.viajante.name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-forest-900/70">
                        {rr.espaco?.title} — {rr.espaco?.city}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(rr.booking?.total_amount ?? 0)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {rr.dentro_da_politica ? '✓' : '⚠'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
