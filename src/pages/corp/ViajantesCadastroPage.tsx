import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import { listarConvites, listarViajantes, setViajanteAtivo } from '@/lib/api/corp'
import { ConviteModal } from '@/features/corp/ConviteModal'
import { cn, formatDate, ROUTES } from '@/lib/utils'

export function ViajantesCadastroPage() {
  const empresa = useActiveEmpresa()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<'viajantes' | 'convites'>('viajantes')

  const { data: viajantes = [], isLoading } = useQuery({
    queryKey: ['corp', 'viajantes', empresa?.id],
    queryFn: () => listarViajantes(empresa!.id),
    enabled: !!empresa,
  })

  const { data: convites = [] } = useQuery({
    queryKey: ['corp', 'convites', empresa?.id],
    queryFn: () => listarConvites(empresa!.id),
    enabled: !!empresa,
  })

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      setViajanteAtivo(id, ativo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corp', 'viajantes', empresa?.id] })
      toast.success('Atualizado')
    },
  })

  if (!empresa) return null

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-forest-900">
            Viajantes
          </h1>
          <p className="text-sm text-forest-900/60">
            {viajantes.length} viajantes cadastrados · {convites.filter((c) => c.status === 'pendente').length}{' '}
            convites pendentes
          </p>
        </div>
        <Button variant="lime" onClick={() => setModalOpen(true)}>
          <UserPlus size={16} />
          Convidar viajante
        </Button>
      </header>

      <div className="flex gap-1 border-b border-forest-900/10">
        {(['viajantes', 'convites'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-forest-900 text-forest-900'
                : 'border-transparent text-forest-900/50 hover:text-forest-900',
            )}
          >
            {t === 'viajantes' ? `Cadastrados (${viajantes.length})` : `Convites (${convites.length})`}
          </button>
        ))}
      </div>

      {tab === 'viajantes' ? (
        <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-sm text-forest-900/60">Carregando…</div>
          ) : viajantes.length === 0 ? (
            <div className="p-8 text-sm text-forest-900/60 text-center">
              Nenhum viajante cadastrado ainda. Use o botão "Convidar viajante" acima.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wider text-forest-900/60">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Viajante</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Política</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {viajantes.map((v) => {
                  const vv = v as {
                    id: string
                    user: { name: string; email: string; avatar_url?: string }
                    cargo?: string
                    departamento?: string
                    politica: { nome: string }
                    ativo: boolean
                  }
                  return (
                    <tr
                      key={vv.id}
                      className="border-t border-forest-900/5 hover:bg-forest-900/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-forest-900/10 flex items-center justify-center text-xs font-medium text-forest-900 shrink-0">
                            {vv.user.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-forest-900 truncate">
                              {vv.user.name}
                            </div>
                            <div className="text-xs text-forest-900/60 truncate">
                              {vv.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-forest-900">{vv.cargo ?? '—'}</div>
                        <div className="text-xs text-forest-900/60">
                          {vv.departamento ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-forest-900/70">
                        {vv.politica.nome}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            toggleAtivo.mutate({ id: vv.id, ativo: !vv.ativo })
                          }
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1',
                            vv.ativo
                              ? 'bg-lime-400/20 text-forest-800'
                              : 'bg-forest-900/10 text-forest-900/60',
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              vv.ativo ? 'bg-lime-500' : 'bg-forest-900/40',
                            )}
                          />
                          {vv.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          aria-label="Mais"
                          className="text-forest-900/50 hover:text-forest-900"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card">
          {convites.length === 0 ? (
            <div className="p-8 text-sm text-forest-900/60 text-center">
              Sem convites pendentes.
            </div>
          ) : (
            <ul className="divide-y divide-forest-900/5">
              {convites.map((c) => {
                const url = `${window.location.origin}${ROUTES.aceitarConvite(c.token)}`
                return (
                  <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-forest-900 truncate">
                        {c.email}
                      </div>
                      <div className="text-xs text-forest-900/60">
                        Enviado em {formatDate(c.criado_em)} · {c.status}
                      </div>
                    </div>
                    <button
                      className="text-xs text-forest-900 hover:underline"
                      onClick={() => {
                        navigator.clipboard.writeText(url)
                        toast.success('Link copiado')
                      }}
                    >
                      Copiar link
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <ConviteModal empresaId={empresa.id} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
