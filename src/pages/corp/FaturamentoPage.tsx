import { useState } from 'react'
import { toast } from 'sonner'
import { CreditCard, FileText, Banknote } from 'lucide-react'
import { useActiveEmpresa } from '@/contexts/CorpContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'

interface FaturaMock {
  mes: string
  inicio: string
  fim: string
  valor: number
  status: 'paga' | 'pendente' | 'vencida'
}

export function FaturamentoPage() {
  const empresa = useActiveEmpresa()
  const [emailFin, setEmailFin] = useState(empresa?.email_financeiro ?? '')
  const [emailCont, setEmailCont] = useState(empresa?.email_contador ?? '')

  if (!empresa) return null

  const cartaoMask = empresa.cartao_token ? '•••• •••• •••• 4567' : null

  const faturas: FaturaMock[] = [
    {
      mes: 'Maio/2026',
      inicio: '2026-05-01',
      fim: '2026-05-31',
      valor: empresa.gasto_total,
      status: 'pendente',
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl text-forest-900">Faturamento</h1>
        <p className="text-sm text-forest-900/60">
          Pagamento, faturas e NF-e da sua conta corporativa.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Cartão corporativo" icon={<CreditCard size={16} />}>
          {cartaoMask ? (
            <>
              <div className="font-mono text-lg text-forest-900">{cartaoMask}</div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => toast('Em breve')}>
                  Trocar cartão
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toast('Em breve')}
                  className="text-rust-500"
                >
                  Remover
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-forest-900/60">
                Nenhum cartão cadastrado. As reservas vão para fatura mensal até você adicionar
                um cartão.
              </p>
              <div className="mt-3">
                <Button variant="lime" onClick={() => toast('Em breve')}>
                  Adicionar cartão
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card title="Fatura mensal" icon={<Banknote size={16} />}>
          <label className="flex items-center gap-2 text-sm text-forest-900">
            <input type="checkbox" defaultChecked={empresa.fatura_mensal} />
            Receber boleto consolidado todo dia 5
          </label>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-forest-900/70">Email do financeiro</label>
              <Input value={emailFin} onChange={(e) => setEmailFin(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-forest-900/70">Email do contador</label>
              <Input value={emailCont} onChange={(e) => setEmailCont(e.target.value)} />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Nota fiscal automática" icon={<FileText size={16} />}>
        <p className="text-sm text-forest-900/70">
          Toda reserva aprovada gera NF-e no CNPJ <strong>{empresa.cnpj}</strong> e é enviada
          para <strong>{empresa.email_contador}</strong> até o dia 10 de cada mês.
        </p>
        <div className="mt-3">
          <Button variant="outline" onClick={() => toast.success('Email de teste enviado')}>
            Testar envio
          </Button>
        </div>
      </Card>

      <div className="rounded-2xl bg-white border border-forest-900/8 shadow-card overflow-hidden">
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg text-forest-900">Histórico de faturas</h2>
        </div>
        <table className="w-full mt-3 text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wider text-forest-900/60">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Mês</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                Período
              </th>
              <th className="text-right px-4 py-3 font-medium">Valor</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {faturas.map((f) => (
              <tr key={f.mes} className="border-t border-forest-900/5">
                <td className="px-4 py-3 font-medium">{f.mes}</td>
                <td className="px-4 py-3 hidden md:table-cell text-forest-900/60">
                  {formatDate(f.inicio)} – {formatDate(f.fim)}
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(f.valor)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      f.status === 'paga'
                        ? 'inline-flex items-center gap-1 text-[11px] rounded-full bg-lime-400/20 text-forest-800 px-2 py-0.5'
                        : f.status === 'pendente'
                        ? 'inline-flex items-center gap-1 text-[11px] rounded-full bg-rust-50 text-rust-500 px-2 py-0.5'
                        : 'inline-flex items-center gap-1 text-[11px] rounded-full bg-rust-100 text-rust-600 px-2 py-0.5'
                    }
                  >
                    {f.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-forest-900 hover:underline">
                    Ver PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card">
      <div className="flex items-center gap-2 text-forest-900">
        {icon}
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}
