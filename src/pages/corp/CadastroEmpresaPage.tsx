import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/ui/Logo'
import { cn, ROUTES } from '@/lib/utils'
import { cadastrarEmpresa } from '@/lib/api/corp'
import { supabase } from '@/lib/supabase'

type Step = 1 | 2 | 3 | 4
type Plano = 'starter' | 'business' | 'enterprise'

function maskCNPJ(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

interface CnpjLookup {
  razao_social?: string
  nome_fantasia?: string
  atividade?: string
  endereco?: { logradouro?: string; municipio?: string; uf?: string }
}

export function CadastroEmpresaPage() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>(1)

  const [cnpj, setCnpj] = useState('')
  const [razao, setRazao] = useState('')
  const [fantasia, setFantasia] = useState('')
  const [segmento, setSegmento] = useState('')
  const [lookup, setLookup] = useState<CnpjLookup | null>(null)
  const [buscando, setBuscando] = useState(false)

  const [emailFin, setEmailFin] = useState('')
  const [emailCont, setEmailCont] = useState('')
  const [emailRH, setEmailRH] = useState('')
  const [telefone, setTelefone] = useState('')

  const [nome, setNome] = useState('')
  const [emailAdmin, setEmailAdmin] = useState('')
  const [senha, setSenha] = useState('')
  const [cargo, setCargo] = useState('CEO')

  const [plano, setPlano] = useState<Plano>('business')

  async function buscarCNPJ() {
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos')
      return
    }
    setBuscando(true)
    try {
      const r = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`)
      if (!r.ok) throw new Error('CNPJ não encontrado')
      const data = (await r.json()) as {
        razao_social?: string
        nome_fantasia?: string
        estabelecimento?: {
          atividade_principal?: { descricao?: string }
          logradouro?: string
          cidade?: { nome?: string }
          estado?: { sigla?: string }
        }
      }
      setLookup({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        atividade: data.estabelecimento?.atividade_principal?.descricao,
        endereco: {
          logradouro: data.estabelecimento?.logradouro,
          municipio: data.estabelecimento?.cidade?.nome,
          uf: data.estabelecimento?.estado?.sigla,
        },
      })
      if (data.razao_social) setRazao(data.razao_social)
      if (data.nome_fantasia) setFantasia(data.nome_fantasia)
    } catch {
      toast.error('Não consegui buscar esse CNPJ (continue manualmente)')
    } finally {
      setBuscando(false)
    }
  }

  const criar = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email: emailAdmin,
        password: senha,
        options: {
          data: { name: nome, role: 'admin', cargo },
        },
      })
      if (error) throw error
      const userId = data.user?.id
      if (!userId) throw new Error('Falha ao criar usuário')
      return cadastrarEmpresa({
        admin_id: userId,
        nome_fantasia: fantasia,
        razao_social: razao,
        cnpj,
        segmento,
        email_financeiro: emailFin,
        email_contador: emailCont,
        email_rh: emailRH,
        telefone,
        plano,
      })
    },
    onSuccess: () => {
      toast.success('Empresa criada! Bem-vindo ao LokVia.')
      nav(ROUTES.empresa)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const stepValid: Record<Step, boolean> = {
    1: cnpj.replace(/\D/g, '').length === 14 && !!fantasia && !!razao,
    2: !!emailFin && !!emailCont && !!emailRH && !!telefone,
    3: !!nome && !!emailAdmin && senha.length >= 6,
    4: !!plano,
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-forest-900/10 bg-white">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo variant="dark" size="md" />
          <span className="text-xs text-forest-900/60">Conta empresarial</span>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Stepper step={step} />

        <div className="mt-6 rounded-2xl bg-white border border-forest-900/8 shadow-card p-5 sm:p-7">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-forest-900">Dados da empresa</h2>
              <div>
                <label className="text-xs text-forest-900/70">CNPJ*</label>
                <div className="flex gap-2">
                  <Input
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={buscarCNPJ}
                    disabled={buscando}
                  >
                    <Search size={14} />
                    {buscando ? 'Buscando…' : 'Buscar'}
                  </Button>
                </div>
                {lookup && (
                  <p className="mt-1 text-xs text-forest-800">
                    ✓ {lookup.razao_social}
                    {lookup.endereco?.municipio
                      ? ` — ${lookup.endereco.municipio}/${lookup.endereco.uf}`
                      : ''}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Razão social*</label>
                <Input value={razao} onChange={(e) => setRazao(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Nome fantasia*</label>
                <Input value={fantasia} onChange={(e) => setFantasia(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Segmento</label>
                <select
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-forest-900/15 bg-white px-3 text-sm"
                >
                  <option value="">Selecione…</option>
                  <option>Tecnologia</option>
                  <option>Consultoria</option>
                  <option>Saúde</option>
                  <option>Educação</option>
                  <option>Varejo</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-forest-900">Contatos</h2>
              <div>
                <label className="text-xs text-forest-900/70">Email financeiro*</label>
                <Input
                  type="email"
                  value={emailFin}
                  onChange={(e) => setEmailFin(e.target.value)}
                  placeholder="financeiro@empresa.com"
                />
                <p className="text-xs text-forest-900/50 mt-1">
                  Recebe faturas e cobranças.
                </p>
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Email do contador*</label>
                <Input
                  type="email"
                  value={emailCont}
                  onChange={(e) => setEmailCont(e.target.value)}
                  placeholder="contador@empresa.com"
                />
                <p className="text-xs text-forest-900/50 mt-1">
                  Receberá as NF-e automaticamente.
                </p>
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Email do RH*</label>
                <Input
                  type="email"
                  value={emailRH}
                  onChange={(e) => setEmailRH(e.target.value)}
                  placeholder="rh@empresa.com"
                />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Telefone*</label>
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-forest-900">
                Primeiro usuário admin
              </h2>
              <div>
                <label className="text-xs text-forest-900/70">Nome completo*</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Email (será seu login)*</label>
                <Input
                  type="email"
                  value={emailAdmin}
                  onChange={(e) => setEmailAdmin(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">
                  Senha (mín. 6 caracteres)*
                </label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-forest-900/70">Cargo</label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-forest-900/15 bg-white px-3 text-sm"
                >
                  <option>CEO</option>
                  <option>Sócio</option>
                  <option>Gerente RH</option>
                  <option>Gerente Financeiro</option>
                  <option>Assistente</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-forest-900">Escolha o plano</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PlanoCard
                  active={plano === 'starter'}
                  onClick={() => setPlano('starter')}
                  nome="Starter"
                  preco="Grátis por 30 dias, depois R$99/mês"
                  bullets={[
                    'Até 10 viajantes',
                    'Política básica',
                    'Pagamento por cartão',
                    'Relatório mensal',
                  ]}
                />
                <PlanoCard
                  active={plano === 'business'}
                  onClick={() => setPlano('business')}
                  nome="Business"
                  preco="R$299/mês"
                  destaque
                  bullets={[
                    'Até 50 viajantes',
                    'Políticas múltiplas',
                    'Fatura mensal + cartão',
                    'NF automática',
                    'Aprovação rápida',
                  ]}
                />
                <PlanoCard
                  active={plano === 'enterprise'}
                  onClick={() => setPlano('enterprise')}
                  nome="Enterprise"
                  preco="Sob consulta"
                  bullets={[
                    'Viajantes ilimitados',
                    'SSO/SAML',
                    'API própria',
                    'SLA dedicado',
                  ]}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((step - 1) as Step)}
              disabled={step === 1}
            >
              Voltar
            </Button>
            {step < 4 ? (
              <Button
                variant="lime"
                disabled={!stepValid[step]}
                onClick={() => setStep((step + 1) as Step)}
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="lime"
                disabled={criar.isPending}
                onClick={() => criar.mutate()}
              >
                {criar.isPending ? 'Criando…' : 'Criar conta empresarial'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 text-xs text-forest-900/60">
      {[1, 2, 3, 4].map((n) => (
        <li key={n} className="flex items-center gap-2">
          <span
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
              n < step
                ? 'bg-forest-900 text-lime-400'
                : n === step
                ? 'bg-lime-400 text-forest-900'
                : 'bg-forest-900/10 text-forest-900/60',
            )}
          >
            {n < step ? <Check size={12} /> : n}
          </span>
          {n < 4 && <span className="w-6 h-px bg-forest-900/15" />}
        </li>
      ))}
    </ol>
  )
}

function PlanoCard({
  nome,
  preco,
  bullets,
  active,
  destaque,
  onClick,
}: {
  nome: string
  preco: string
  bullets: string[]
  active: boolean
  destaque?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left rounded-2xl border p-5 transition-all',
        active
          ? 'border-forest-900 ring-2 ring-forest-900/10 bg-white'
          : 'border-forest-900/10 bg-white hover:border-forest-900/30',
        destaque && !active && 'ring-1 ring-lime-400',
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-forest-900">{nome}</h3>
        {destaque && (
          <span className="text-[10px] uppercase tracking-wider bg-lime-400 text-forest-900 rounded-full px-2 py-0.5">
            Recomendado
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-forest-900 mt-1">{preco}</p>
      <ul className="mt-3 space-y-1.5 text-xs text-forest-900/70">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <Check size={12} className="mt-0.5 text-forest-700 shrink-0" /> {b}
          </li>
        ))}
      </ul>
    </button>
  )
}
