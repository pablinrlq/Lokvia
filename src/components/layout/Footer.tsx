import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ROUTES } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="container-lokvia py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Logo variant="lime" size="lg" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Conectando empreendedores viajantes a espaços únicos pelo Brasil.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-white/40 hover:text-lime-400 transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-lime-400 transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-lime-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-lime-400 mb-4">Hóspedes</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={ROUTES.search} className="text-sm text-white/60 hover:text-white transition-colors">
                  Buscar espaços
                </Link>
              </li>
              <li>
                <Link to={ROUTES.events} className="text-sm text-white/60 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to={ROUTES.guestDashboard} className="text-sm text-white/60 hover:text-white transition-colors">
                  Minhas reservas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-lime-400 mb-4">Anfitriões</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={ROUTES.hostNewSpace} className="text-sm text-white/60 hover:text-white transition-colors">
                  Listar meu espaço
                </Link>
              </li>
              <li>
                <Link to={ROUTES.hostDashboard} className="text-sm text-white/60 hover:text-white transition-colors">
                  Painel do anfitrião
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-lime-400 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Termos de uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Lokvia. Todos os direitos reservados.
          </p>
          <p className="text-sm text-white/40">
            Feito com <span className="text-lime-400">&#9829;</span> para nômades digitais
          </p>
        </div>
      </div>
    </footer>
  )
}
