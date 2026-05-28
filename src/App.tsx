import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { CorpProvider } from '@/contexts/CorpContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AuthListener() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <CorpProvider>
        <RouterProvider router={router} />
      </CorpProvider>
    </QueryClientProvider>
  )
}
