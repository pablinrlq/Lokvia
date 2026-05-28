import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import { aprovarReserva, getReservasDaEmpresa } from '@/lib/api/corp'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

type Tab = 'pendente' | 'aprovada' | 'recusada' | 'auto_aprovada'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pendente', label: 'Pendentes' },
  { key: 'aprovada', label: 'Aprovadas' },
  { key: 'recusada', label: 'Recusadas' },
  { key: 'auto_aprovada', label: 'Auto-aprovadas' },
]

export function ReservasCorpPage() {
  const empresa = useActiveEmpresa()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('pendente')

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['corp', 'reservas', empresa?.id, tab],
    queryFn: () => getReservasDaEmpresa(empresa!.id, { status: tab }),
    enabled: !!empresa,
  })

  const aprov = useMutation({
    mutationFn: (args: { bookingId: string; aprovar: boolean; motivo?: string }) =>
      aprovarReserva(args.bookingId, args.aprovar, args.motivo),
    onSuccess: (_, args) => {
      qc.invalidateQueries({ queryKey: ['corp', 'reservas', empresa?.id] })
      qc.invalidateQueries({ queryKey: ['corp', 'pendentes', empresa?.id] })
      toast.success(args.aprovar ? 'Reserva aprovada' : 'Reserva recusada')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!empresa) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl text-forest-900">
          Reservas corporativas
        </h1>
        <p className="text-sm text-forest-900/60">
          Aprove em 1 clique e mantenha o histórico financeiro auditável.
        </p>
      </header>

      <div className="flex gap-1 border-b border-forest-900/10 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              tab === t.key
                ? 'border-forest-900 text-forest-900'
                : 'border-transparent text-forest-900/50 hover:text-forest-900',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-forest-900/60">Carregando…</div>
      ) : reservas.length === 0 ? (
        <div className="rounded-2xl border border-forest-900/8 bg-white p-8 text-center text-sm text-forest-900/60">
          Nenhuma reserva neste status.
        </div>
      ) : (
        <ul className="space-y-3">
          {reservas.map((r) => {
            const rr = r as {
              booking_id: string
              motivo_viagem?: string
              centro_de_custo?: string
              dentro_da_politica: boolean
              alertas_politica: string[]
              motivo_recusa?: string
              viajante: { name: string }
              espaco: { title?: string; city?: string } | null
              booking?: {
                check_in: string
                check_out: string
                total_amount: number
                guests_count: number
              }
            }
            return (
              <li
                key={rr.booking_id}
                className="rounded-2xl bg-white border border-forest-900/8 shadow-card p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-forest-900/60">
                      <span>{rr.viajante.name}</span>
                      <span>·</span>
                      <span>
                        {rr.booking?.check_in ? formatDate(rr.booking.check_in) : '—'}
                        {' → '}
                        {rr.booking?.check_out ? formatDate(rr.booking.check_out) : '—'}
                      </span>
                    </div>
                    <div className="mt-1 font-display text-lg text-forest-900">
                      {rr.espaco?.title ?? 'Espaço'}{' '}
                      <span className="text-forest-900/60 text-base">
                        — {rr.espaco?.city ?? ''}
                      </span>
                    </div>
                    {rr.motivo_viagem && (
                      <p className="mt-1 text-sm text-forest-900/70">
                        <span className="text-forest-900/50">Motivo: </span>
                        {rr.motivo_viagem}
                      </p>
                    )}
                    {rr.centro_de_custo && (
                      <p className="text-xs text-forest-900/60">
                        Centro de custo: {rr.centro_de_custo}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rr.dentro_da_politica ? (
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-lime-400/20 text-forest-800 px-2 py-0.5">
                          <ShieldCheck size={11} /> Na política
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-rust-100 text-rust-500 px-2 py-0.5">
                          <ShieldAlert size={11} /> Fora da política
                        </span>
                      )}
                      {rr.alertas_politica.map((a, i) => (
                        <span
                          key={i}
                          className="text-[11px] rounded-full bg-rust-50 text-rust-500 px-2 py-0.5"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    {rr.motivo_recusa && (
                      <p className="mt-2 text-xs text-rust-500">
                        Recusada: {rr.motivo_recusa}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3">
                    <div className="text-right">
                      <div className="font-display text-xl text-forest-900">
                        {formatCurrency(rr.booking?.total_amount ?? 0)}
                      </div>
                      <div className="text-xs text-forest-900/60">
                        {rr.booking?.guests_count ?? 1}{' '}
                        {rr.booking?.guests_count === 1 ? 'hóspede' : 'hóspedes'}
                      </div>
                    </div>
                    {tab === 'pendente' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="lime"
                          onClick={() =>
                            aprov.mutate({ bookingId: rr.booking_id, aprovar: true })
                          }
                        >
                          <Check size={14} /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const motivo = prompt('Motivo da recusa (opcional):') ?? undefined
                            aprov.mutate({
                              bookingId: rr.booking_id,
                              aprovar: false,
                              motivo,
                            })
                          }}
                        >
                          <X size={14} /> Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
