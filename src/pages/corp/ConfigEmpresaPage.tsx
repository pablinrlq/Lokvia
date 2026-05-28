import { useActiveEmpresa } from '@/contexts/CorpContext'
import { Input } from '@/components/ui/Input'

export function ConfigEmpresaPage() {
  const empresa = useActiveEmpresa()
  if (!empresa) return null
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl text-forest-900">Configurações</h1>
        <p className="text-sm text-forest-900/60">
          Dados cadastrais da empresa (somente leitura por enquanto).
        </p>
      </header>

      <div className="rounded-2xl bg-white border border-forest-900/8 p-5 shadow-card space-y-4">
        <Field label="Razão social" value={empresa.razao_social} />
        <Field label="Nome fantasia" value={empresa.nome_fantasia} />
        <Field label="CNPJ" value={empresa.cnpj} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email financeiro" value={empresa.email_financeiro} />
          <Field label="Email contador" value={empresa.email_contador} />
          <Field label="Email RH" value={empresa.email_rh} />
          <Field label="Telefone" value={empresa.telefone} />
        </div>
        <p className="text-xs text-forest-900/50">
          Edição de cadastro será habilitada na próxima versão.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-forest-900/70">{label}</label>
      <Input value={value} readOnly />
    </div>
  )
}
