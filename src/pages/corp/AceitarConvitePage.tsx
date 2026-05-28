import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, Sparkles } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { aceitarConvite, getConvitePorToken } from '@/lib/api/corp'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/utils'

export function AceitarConvitePage() {
  const { token } = useParams<{ token: string }>()
  const nav = useNavigate()

  const [mode, setMode] = useState<'novo' | 'existente'>('novo')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')

  const { data: convite, isLoading } = useQuery({
    queryKey: ['convite', token],
    queryFn: () => getConvitePorToken(token!),
    enabled: !!token,
  })

  useEffect(() => {
    if (convite?.status === 'aceito') {
      toast.info('Este convite já foi utilizado')
    }
  }, [convite])

  const aceitar = useMutation({
    mutationFn: async () => {
      if (!convite || !token) throw new Error('Convite inválido')
      let userId: string | undefined
      if (mode === 'novo') {
        const { data, error } = await supabase.auth.signUp({
          email: convite.email,
          password: senha,
          options: { data: { name: nome, role: 'guest' } },
        })
        if (error) throw error
        userId = data.user?.id
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: convite.email,
          password: senha,
        })
        if (error) throw error
        userId = data.user?.id
      }
      if (!userId) throw new Error('Falha de autenticação')
      await aceitarConvite(token, userId)
    },
    onSuccess: () => {
      toast.success('Convite aceito! Bem-vindo ao LokVia.')
      localStorage.removeItem('corp_onboarded')
      nav(ROUTES.guestDashboard)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) {
    return <Center>Carregando convite…</Center>
  }
  if (!convite) {
    return (
      <Center>
        <h1 className="font-display text-2xl text-forest-900">Convite não encontrado</h1>
        <p className="text-sm text-forest-900/60">
          O link pode ter expirado ou ser inválido. Peça um novo convite ao RH.
        </p>
      </Center>
    )
  }
  if (convite.status !== 'pendente') {
    return (
      <Center>
        <h1 className="font-display text-2xl text-forest-900">Convite já utilizado</h1>
        <p className="text-sm text-forest-900/60">Faça login com seu email.</p>
        <Button asChild variant="lime" className="mt-4">
          <a href={ROUTES.login}>Entrar</a>
        </Button>
      </Center>
    )
  }

  const empresaNome =
    (convite.empresa as { nome_fantasia?: string } | null)?.nome_fantasia ?? 'sua empresa'

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-forest-900/10 bg-white">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <Logo variant="dark" size="md" />
        </div>
      </header>

      <main className="container max-w-xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-forest-900/60">
            <Building2 size={14} /> Convite corporativo
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl text-forest-900">
            Você foi convidado para a conta de {empresaNome}
          </h1>
          {convite.cargo && (
            <p className="text-sm text-forest-900/60">
              Cargo: {convite.cargo} {convite.departamento ? `· ${convite.departamento}` : ''}
            </p>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-lime-400/15 p-3 text-sm text-forest-900">
            <Sparkles size={16} className="mt-0.5 text-forest-700 shrink-0" />
            Suas viagens a trabalho passam a ser pagas pela empresa — sem reembolso por
            planilha.
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs">
            <button
              onClick={() => setMode('novo')}
              className={
                mode === 'novo'
                  ? 'rounded-full bg-forest-900 text-lime-400 px-3 py-1.5'
                  : 'rounded-full bg-white border border-forest-900/15 text-forest-900/70 px-3 py-1.5'
              }
            >
              Criar conta nova
            </button>
            <button
              onClick={() => setMode('existente')}
              className={
                mode === 'existente'
                  ? 'rounded-full bg-forest-900 text-lime-400 px-3 py-1.5'
                  : 'rounded-full bg-white border border-forest-900/15 text-forest-900/70 px-3 py-1.5'
              }
            >
              Já tenho conta
            </button>
          </div>

          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              aceitar.mutate()
            }}
          >
            <div>
              <label className="text-xs text-forest-900/70">Email</label>
              <Input value={convite.email} readOnly />
            </div>
            {mode === 'novo' && (
              <div>
                <label className="text-xs text-forest-900/70">Nome completo</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs text-forest-900/70">
                {mode === 'novo' ? 'Crie uma senha' : 'Sua senha'}
              </label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              variant="lime"
              className="w-full"
              disabled={aceitar.isPending}
            >
              {aceitar.isPending ? 'Processando…' : 'Aceitar e começar'}
            </Button>
          </form>
        </div>
      </main>
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
