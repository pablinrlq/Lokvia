import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { LokAI } from '@/components/ai/LokAI'
import { Toaster } from '@/components/ui/Toaster'
import { TooltipProvider } from '@/components/ui/Tooltip'

export function RootLayout() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <LokAI context="home_search" variant="floating" />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
