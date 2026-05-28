import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, ArrowRight } from 'lucide-react'
import { cn, ROUTES } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/Sheet'
import { Separator } from '@/components/ui/Separator'

export function Navbar() {
  const location = useLocation()
  const { user, signOut } = useAuthStore()

  const isHome = location.pathname === '/'

  const linkClass = cn(
    'text-sm font-medium transition-opacity hover:opacity-70',
    isHome ? 'text-white' : 'text-forest-900'
  )

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        isHome
          ? 'bg-forest-900/95 backdrop-blur-md border-white/10'
          : 'bg-cream/95 backdrop-blur-md border-forest-900/8'
      )}
    >
      <div className="container-lokvia">
        <div className="flex h-16 items-center justify-between">
          <Link to={ROUTES.home} className="shrink-0">
            <Logo variant={isHome ? 'lime' : 'dark'} size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to={ROUTES.search} className={linkClass}>
              Explorar
            </Link>
            <Link to={ROUTES.events} className={linkClass}>
              Eventos
            </Link>
            {user?.role === 'host' && (
              <Link to={ROUTES.hostDashboard} className={linkClass}>
                Painel
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant={isHome ? 'outline' : 'ghost'} asChild className={isHome ? 'border-white/20 text-white hover:bg-white/10' : ''}>
                  <Link to={user.role === 'host' ? ROUTES.hostDashboard : ROUTES.guestDashboard}>
                    Meu painel
                  </Link>
                </Button>
                <Button variant="ghost" onClick={signOut} className={isHome ? 'text-white hover:bg-white/10' : ''}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant={isHome ? 'outline' : 'ghost'} asChild className={isHome ? 'border-white/20 text-white hover:bg-white/10' : ''}>
                  <Link to={ROUTES.login}>Entrar</Link>
                </Button>
                <Button variant={isHome ? 'lime' : 'default'} asChild>
                  <Link to={ROUTES.register}>Cadastrar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('md:hidden', isHome ? 'text-white hover:bg-white/10' : '')}
                aria-label="Menu"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo variant="dark" size="md" />
                </SheetTitle>
                <SheetDescription>Navegação</SheetDescription>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-1">
                <SheetClose asChild>
                  <Link
                    to={ROUTES.search}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-forest-900 hover:bg-forest-900/5 transition-colors"
                  >
                    <Search size={16} className="text-forest-900/40" />
                    Explorar espaços
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to={ROUTES.events}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-forest-900 hover:bg-forest-900/5 transition-colors"
                  >
                    <ArrowRight size={16} className="text-forest-900/40" />
                    Eventos
                  </Link>
                </SheetClose>

                <Separator className="my-3" />

                <div className="flex flex-col gap-2 px-1">
                  <SheetClose asChild>
                    <Button variant="outline" asChild className="w-full justify-center">
                      <Link to={ROUTES.login}>Entrar</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="default" asChild className="w-full justify-center">
                      <Link to={ROUTES.register}>Cadastrar</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
