import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { convidarViajante, listarPoliticas } from '@/lib/api/corp'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { ROUTES } from '@/lib/utils'

interface Props {
  empresaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConviteModal({ empresaId, open, onOpenChange }: Props) {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [centroCusto, setCentroCusto] = useState('')
  const [politicaId, setPoliticaId] = useState<string>('')
  const [link, setLink] = useState<string | null>(null)

  const { data: politicas = [] } = useQuery({
    queryKey: ['corp', 'politicas', empresaId],
    queryFn: () => listarPoliticas(empresaId),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () =>
      convidarViajante({
        empresaId,
        email,
        cargo,
        departamento,
        centroDeCusto: centroCusto,
        politicaId: politicaId || politicas[0]?.id,
      }),
    onSuccess: (convite) => {
      qc.invalidateQueries({ queryKey: ['corp', 'convites', empresaId] })
      const url = `${window.location.origin}${ROUTES.aceitarConvite(convite.token)}`
      setLink(url)
      toast.success('Convite criado. Copie o link para enviar.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar viajante</DialogTitle>
          <DialogDescription>
            Envie o link para o funcionário se cadastrar e ficar vinculado à empresa.
          </DialogDescription>
        </DialogHeader>

        {link ? (
          <div className="space-y-3">
            <p className="text-sm text-forest-900/70">
              Link gerado — copie e envie por email/WhatsApp:
            </p>
            <div className="rounded-xl border border-forest-900/10 bg-cream p-3 text-xs break-all font-mono">
              {link}
            </div>
            <div className="flex gap-2">
              <Button
                variant="lime"
                onClick={() => {
                  navigator.clipboard.writeText(link)
                  toast.success('Link copiado')
                }}
              >
                Copiar link
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setLink(null)
                  setEmail('')
                  onOpenChange(false)
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs font-medium text-forest-900/70">Email*</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="funcionario@empresa.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-forest-900/70">Cargo</label>
                <Input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Comercial"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-forest-900/70">Departamento</label>
                <Input
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Vendas"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-forest-900/70">
                Centro de custo
              </label>
              <Input
                value={centroCusto}
                onChange={(e) => setCentroCusto(e.target.value)}
                placeholder="CC-2026"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-forest-900/70">Política</label>
              <select
                value={politicaId}
                onChange={(e) => setPoliticaId(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-forest-900/15 bg-white px-3 text-sm"
              >
                {politicas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="lime" disabled={mutation.isPending}>
                {mutation.isPending ? 'Enviando…' : 'Gerar convite'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
