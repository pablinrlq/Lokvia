import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '@/lib/utils'

function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="section container-lokvia">
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-forest-900/8 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🚧</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-forest-900 mb-3">{title}</h1>
        <p className="text-forest-900/55 mb-8 leading-relaxed">
          {description ?? 'Esta página está sendo construída. Volte em breve!'}
        </p>
        <Link to={ROUTES.home} className="btn-primary">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { id } = useParams()
  return <PlaceholderPage title="Checkout" description={`Reserva ${id ?? ''} — PIX, cartão e integração Pagar.me em breve.`} />
}

export function EventsPage() {
  return <PlaceholderPage title="Eventos" description="Em breve: agenda completa de eventos por cidade e categoria." />
}

export function LoginPage() {
  return <PlaceholderPage title="Entrar" description="Autenticação com Supabase em breve." />
}

export function RegisterPage() {
  return <PlaceholderPage title="Cadastrar" description="Crie sua conta como hóspede ou anfitrião." />
}

export function HostNewSpacePage() {
  return <PlaceholderPage title="Cadastrar Novo Espaço" description="Formulário multi-step com fotos, localização e preço." />
}

export function AdminPage() {
  return <PlaceholderPage title="Admin" description="Área administrativa restrita." />
}
