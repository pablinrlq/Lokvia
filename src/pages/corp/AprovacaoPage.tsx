import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, X, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { aprovarReservaPorToken } from '@/lib/api/corp'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReservaPublic {
  booking_id: string
  motivo_viagem?: string
  centro_de_custo?: string
  dentro_da_politica: boolean
  alertas_politica: string[]
  status_aprovacao: string
  booking: { check_in: string; check_out: string; total_amount: number; guests_count: number }
  espaco: { title?: string; city?: string } | null
  viajante: { name: string }
}

export function AprovacaoPage() {
  const { token } = useParams<{ token: string }>()
  const [done, setDone] = useState<'aprovada' | 'recusada' | null>(null)
  const [motivo, setMotivo] = useState('')
  const [showMotivo, setShowMotivo] = useState(false)

  // Token = booking_id no MVP (ver TODO em corp.ts)
  const { data: reserva, isLoading } = useQuery({
    queryKey: ['aprovacao', token],
    queryFn: async (): Promise<ReservaPublic | null> => {
      const { data, error } = await supabase
        .from('reservas_corp_meta')
        .select(
          `*,
            booking:bookings(check_in,check_out,total_amount,guests_count),
            espaco:spaces(title,city),
            viajante:users!viajante_id(name)`,
        )
        .eq('booking_id', token!)
        .maybeSingle()
      if (error) throw error
      return data as ReservaPublic | null
    },
    enabled: !!token,
  })

  const mutation = useMutation({
    mutationFn: (args: { aprovar: boolean; motivo?: string }) =>
      aprovarReservaPorToken(token!, args.aprovar, args.motivo),
    onSuccess: (_, args) => {
      setDone(args.aprovar ? 'aprovada' : 'recusada')
      toast.success(args.aprovar ? 'Reserva aprovada' : 'Reserva recusada')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) return <Center>Carregando…</Center>
  if (!reserva) {
    return (
      <Center>
        <h1 className="font-display text-2xl text-forest-900">Solicitação não encontrada</h1>
        <p className="text-sm text-forest-900/60">O link pode estar expirado.</p>
      </Center>
    )
  }
  if (reserva.status_aprovacao !== 'pendente' && !done) {
    return (
      <Center>
        <h1 className="font-display text-2xl text-forest-900">Já decidida</h1>
        <p className="text-sm text-forest-900/60">
          Esta reserva já foi {reserva.status_aprovacao}.
        </p>
      </Center>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-forest-900/10 bg-white">
        <div className="container max-w-xl mx-auto px-4 py-4">
          <Logo variant="dark" size="md" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card p-6 sm:p-7">
          <h1 className="font-display text-2xl text-forest-900">
            ✈️ Solicitação de reserva
          </h1>
          <p className="text-sm text-forest-900/60">
            Por <strong>{reserva.viajante.name}</strong>
          </p>

          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Destino" value={`${reserva.espaco?.title ?? 'Espaço'} — ${reserva.espaco?.city ?? ''}`} />
            <Row
              label="Datas"
              value={`${formatDate(reserva.booking.check_in)} → ${formatDate(reserva.booking.check_out)}`}
            />
            <Row label="Hóspedes" value={`${reserva.booking.guests_count}`} />
            {reserva.motivo_viagem && (
              <Row label="Motivo" value={reserva.motivo_viagem} />
            )}
            {reserva.centro_de_custo && (
              <Row label="Centro de custo" value={reserva.centro_de_custo} />
            )}
            <div className="flex items-center justify-between pt-2 border-t border-forest-900/8">
              <dt className="text-forest-900/60">Total</dt>
              <dd className="font-display text-2xl text-forest-900">
                {formatCurrency(reserva.booking.total_amount)}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            {reserva.dentro_da_politica ? (
              <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-lime-400/20 text-forest-800 px-2.5 py-1">
                <ShieldCheck size={12} /> Dentro da política
              </div>
            ) : (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-rust-100 text-rust-500 px-2.5 py-1">
                  <ShieldAlert size={12} /> Fora da política
                </div>
                {reserva.alertas_politica.map((a, i) => (
                  <p key={i} className="text-xs text-rust-500">
                    • {a}
                  </p>
                ))}
              </div>
            )}
          </div>

          {done ? (
            <div className="mt-6 rounded-xl bg-forest-900 text-cream p-4 text-sm">
              {done === 'aprovada'
                ? 'Reserva aprovada! O viajante foi notificado.'
                : 'Reserva recusada. O viajante foi notificado.'}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Button
                variant="lime"
                className="w-full"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ aprovar: true })}
              >
                <Check size={14} /> Aprovar reserva
              </Button>
              {!showMotivo ? (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowMotivo(true)}
                >
                  <X size={14} /> Recusar
                </Button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo da recusa (opcional)"
                    className="w-full rounded-xl border border-forest-900/15 p-3 text-sm"
                    rows={3}
                  />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => mutation.mutate({ aprovar: false, motivo })}
                  >
                    Confirmar recusa
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-forest-900/60 shrink-0">{label}</dt>
      <dd className="text-forest-900 text-right">{value}</dd>
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 text-center p-6">
      {children}
    </div>
  )
}
