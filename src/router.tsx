import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { SpaceDetailPage } from '@/pages/SpaceDetailPage'
import { GuestDashboardPage } from '@/pages/GuestDashboardPage'
import { HostDashboardPage } from '@/pages/HostDashboardPage'
import {
  CheckoutPage,
  EventsPage,
  LoginPage,
  RegisterPage,
  HostNewSpacePage,
  AdminPage,
} from '@/pages/PlaceholderPages'
import { CorpLayout } from '@/features/corp/CorpLayout'
import { CadastroEmpresaPage } from '@/pages/corp/CadastroEmpresaPage'
import { EmpresaDashboard } from '@/pages/corp/EmpresaDashboard'
import { ViajantesCadastroPage } from '@/pages/corp/ViajantesCadastroPage'
import { ReservasCorpPage } from '@/pages/corp/ReservasCorpPage'
import { RelatoriosPage } from '@/pages/corp/RelatoriosPage'
import { PoliticaPage } from '@/pages/corp/PoliticaPage'
import { FaturamentoPage } from '@/pages/corp/FaturamentoPage'
import { ConfigEmpresaPage } from '@/pages/corp/ConfigEmpresaPage'
import { AceitarConvitePage } from '@/pages/corp/AceitarConvitePage'
import { AprovacaoPage } from '@/pages/corp/AprovacaoPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/buscar', element: <SearchPage /> },
      { path: '/espacos/:id', element: <SpaceDetailPage /> },
      { path: '/reservar/:id', element: <CheckoutPage /> },
      { path: '/eventos', element: <EventsPage /> },
      { path: '/entrar', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
      { path: '/painel/hospede', element: <GuestDashboardPage /> },
      { path: '/painel/anfitriao', element: <HostDashboardPage /> },
      { path: '/painel/anfitriao/espacos/novo', element: <HostNewSpacePage /> },
      { path: '/admin', element: <AdminPage /> },
    ],
  },

  // Fluxos públicos corporativos (sem RootLayout — layout próprio)
  { path: '/empresa/cadastrar', element: <CadastroEmpresaPage /> },
  { path: '/aceitar-convite/:token', element: <AceitarConvitePage /> },
  { path: '/aprovar/:token', element: <AprovacaoPage /> },

  // Dashboard corporativo (admin da empresa)
  {
    path: '/empresa',
    element: <CorpLayout />,
    children: [
      { index: true, element: <EmpresaDashboard /> },
      { path: 'viajantes', element: <ViajantesCadastroPage /> },
      { path: 'reservas', element: <ReservasCorpPage /> },
      { path: 'relatorios', element: <RelatoriosPage /> },
      { path: 'politica', element: <PoliticaPage /> },
      { path: 'faturamento', element: <FaturamentoPage /> },
      { path: 'config', element: <ConfigEmpresaPage /> },
    ],
  },
])
