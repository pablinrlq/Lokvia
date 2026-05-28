import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group bg-white border border-forest-900/10 rounded-xl shadow-card-hover font-sans text-forest-900',
          title: 'text-sm font-semibold',
          description: 'text-sm text-forest-900/60',
          actionButton: 'bg-forest-900 text-lime-400 rounded-lg text-xs font-medium px-3 py-1.5',
          cancelButton: 'bg-forest-900/5 text-forest-900 rounded-lg text-xs font-medium px-3 py-1.5',
          success: 'border-lime-400/30',
          error: 'border-red-300',
          info: 'border-forest-400/30',
        },
      }}
      offset={24}
      gap={8}
    />
  )
}
