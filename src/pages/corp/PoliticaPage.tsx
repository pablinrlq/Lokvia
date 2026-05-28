import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Save } from 'lucide-react'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import { listarPoliticas, salvarPolitica } from '@/lib/api/corp'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, cn } from '@/lib/utils'
import type { AccomodationType, CategoriaHotelMax, PoliticaViagem } from '@/types'

const TIPOS: { id: AccomodationType; label: string }[] = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'coworking', label: 'Coworking' },
  { id: 'house', label: 'Casa' },
  { id: 'apartment', label: 'Apto' },
  { id: 'loft', label: 'Loft' },
  { id: 'studio', label: 'Studio' },
  { id: 'cafe', label: 'Café' },
]

const CIDADES_DISP = ['São Paulo', 'Florianópolis', 'Curitiba', 'Belo Horizonte']

const PADRAO: Omit<PoliticaViagem, 'id' | 'empresa_id' | 'criado_em'> = {
  nome: 'Nova política',
  limite_diaria: 350,
  tipos_permitidos: ['hotel', 'coworking', 'apartment', 'house'],
  somente_apto_inteiro: false,
  cidades_permitidas: [],
  cidades_bloqueadas: [],
  antecedencia_minima_horas: 0,
  requer_aprovacao: false,
  aprovadores: [],
  notificar_gestor_email: true,
  notificar_whatsapp: false,
  ativa: true,
}

export function PoliticaPage() {
  const empresa = useActiveEmpresa()
  const qc = useQueryClient()

  const { data: politicas = [] } = useQuery({
    queryKey: ['corp', 'politicas', empresa?.id],
    queryFn: () => listarPoliticas(empresa!.id),
    enabled: !!empresa,
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<PoliticaViagem>>(PADRAO)

  useEffect(() => {
    if (politicas.length > 0 && !selectedId) {
      setSelectedId(politicas[0].id)
    }
  }, [politicas, selectedId])

  useEffect(() => {
    if (!selectedId) {
      setDraft({ ...PADRAO, empresa_id: empresa?.id })
      return
    }
    const found = politicas.find((p) => p.id === selectedId)
    if (found) setDraft(found)
  }, [selectedId, politicas, empresa])

  const save = useMutation({
    mutationFn: () =>
      salvarPolitica({ ...(draft as PoliticaViagem), empresa_id: empresa!.id }),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['corp', 'politicas', empresa?.id] })
      setSelectedId(id)
      toast.success('Política salva')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const previewText = useMemo(() => {
    const tipos = (draft.tipos_permitidos ?? []).map(
      (t) => TIPOS.find((x) => x.id === t)?.label ?? t,
    )
    const cidades =
      draft.cidades_permitidas && draft.cidades_permitidas.length > 0
        ? draft.cidades_permitidas.join(', ')
        : 'todas as cidades'
    return `Viajantes podem reservar ${tipos.join(', ')} em ${cidades}, com diária até ${formatCurrency(draft.limite_diaria ?? 0)}.`
  }, [draft])

  function toggleTipo(t: AccomodationType) {
    const cur = draft.tipos_permitidos ?? []
    const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
    setDraft({ ...draft, tipos_permitidos: next })
  }
  function toggleCidade(c: string, lista: 'cidades_permitidas' | 'cidades_bloqueadas') {
    const cur = (draft[lista] as string[]) ?? []
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]
    setDraft({ ...draft, [lista]: next })
  }

  if (!empresa) return null

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-forest-900">
            Política de viagem
          </h1>
          <p className="text-sm text-forest-900/60">
            Regras aplicadas automaticamente na busca e na reserva dos viajantes.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedId(null)
            setDraft({ ...PADRAO, empresa_id: empresa.id })
          }}
        >
          <Plus size={14} /> Nova política
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-2">
          {politicas.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'w-full text-left rounded-xl border p-3 transition-colors',
                selectedId === p.id
                  ? 'border-forest-900 bg-forest-900 text-cream'
                  : 'border-forest-900/10 bg-white hover:bg-forest-900/5',
              )}
            >
              <div className="font-medium">{p.nome}</div>
              <div className="text-xs opacity-70">
                Diária máx: {formatCurrency(p.limite_diaria)}
              </div>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          <Section title="Identificação">
            <label className="text-xs font-medium text-forest-900/70">Nome</label>
            <Input
              value={draft.nome ?? ''}
              onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
              placeholder="Padrão / Diretoria / Estagiários"
            />
          </Section>

          <Section title="Limites financeiros">
            <label className="text-xs font-medium text-forest-900/70">
              Limite por noite: {formatCurrency(draft.limite_diaria ?? 0)}
            </label>
            <input
              type="range"
              min={100}
              max={1500}
              step={10}
              value={draft.limite_diaria ?? 350}
              onChange={(e) =>
                setDraft({ ...draft, limite_diaria: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-forest-900/70">
                  Auto-aprova abaixo de
                </label>
                <Input
                  type="number"
                  value={draft.auto_aprova_abaixo_de ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      auto_aprova_abaixo_de: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Limite por viagem</label>
                <Input
                  type="number"
                  value={draft.limite_viagem ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      limite_viagem: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </Section>

          <Section title="Tipos de acomodação permitidos">
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => {
                const active = (draft.tipos_permitidos ?? []).includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTipo(t.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs border transition-colors',
                      active
                        ? 'bg-forest-900 text-lime-400 border-forest-900'
                        : 'bg-white text-forest-900/70 border-forest-900/15 hover:bg-forest-900/5',
                    )}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-3">
              <label className="text-xs text-forest-900/70">
                Categoria máxima de hotel
              </label>
              <select
                value={draft.categoria_hotel_max ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    categoria_hotel_max:
                      (e.target.value as CategoriaHotelMax) || undefined,
                  })
                }
                className="mt-1 w-full h-10 rounded-xl border border-forest-900/15 bg-white px-3 text-sm"
              >
                <option value="">Sem limite</option>
                <option value="3_estrelas">Até 3★</option>
                <option value="4_estrelas">Até 4★</option>
                <option value="5_estrelas">Até 5★</option>
              </select>
            </div>
          </Section>

          <Section title="Destinos">
            <label className="text-xs font-medium text-forest-900/70">
              Cidades permitidas (vazio = todas)
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CIDADES_DISP.map((c) => {
                const on = (draft.cidades_permitidas ?? []).includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCidade(c, 'cidades_permitidas')}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs border transition-colors',
                      on
                        ? 'bg-lime-400 text-forest-900 border-lime-400'
                        : 'bg-white text-forest-900/70 border-forest-900/15 hover:bg-forest-900/5',
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="Aprovação">
            <label className="flex items-center gap-2 text-sm text-forest-900">
              <input
                type="checkbox"
                checked={draft.requer_aprovacao ?? false}
                onChange={(e) =>
                  setDraft({ ...draft, requer_aprovacao: e.target.checked })
                }
              />
              Requer aprovação do gestor
            </label>
            <label className="flex items-center gap-2 text-sm text-forest-900 mt-2">
              <input
                type="checkbox"
                checked={draft.notificar_gestor_email ?? false}
                onChange={(e) =>
                  setDraft({ ...draft, notificar_gestor_email: e.target.checked })
                }
              />
              Notificar gestor por email
            </label>
          </Section>

          <div className="rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4 text-sm text-forest-900">
            <div className="text-xs uppercase tracking-wider text-forest-900/60 mb-1">
              Preview
            </div>
            {previewText}
          </div>

          <div className="flex justify-end">
            <Button variant="lime" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save size={14} /> {save.isPending ? 'Salvando…' : 'Salvar política'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
      <h2 className="font-display text-lg text-forest-900 mb-3">{title}</h2>
      {children}
    </section>
  )
}
