import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/lib/store'
import { getEmpresaByAdmin, getViajanteContext } from '@/lib/api/corp'
import type { AppContextState, CorpContextActive } from '@/types'

const DEFAULT_STATE: AppContextState = {
  isCorpUser: false,
  isAdmin: false,
  empresa: null,
  viajante: null,
  politica: null,
}

const Ctx = createContext<{ state: AppContextState; loading: boolean }>({
  state: DEFAULT_STATE,
  loading: true,
})

export function CorpProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const [state, setState] = useState<AppContextState>(DEFAULT_STATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) {
        if (!cancelled) {
          setState(DEFAULT_STATE)
          setLoading(false)
        }
        return
      }
      setLoading(true)
      try {
        // Tenta viajante primeiro (caso comum); admin é fallback
        const viajanteCtx = await getViajanteContext(user.id)
        if (viajanteCtx) {
          const next: CorpContextActive = {
            isCorpUser: true,
            isAdmin: false,
            empresa: viajanteCtx.empresa,
            viajante: viajanteCtx,
            politica: viajanteCtx.politica,
          }
          if (!cancelled) setState(next)
        } else {
          const empresa = await getEmpresaByAdmin(user.id)
          if (empresa) {
            const next: CorpContextActive = {
              isCorpUser: true,
              isAdmin: true,
              empresa,
              viajante: null,
              politica: null,
            }
            if (!cancelled) setState(next)
          } else if (!cancelled) {
            setState(DEFAULT_STATE)
          }
        }
      } catch {
        if (!cancelled) setState(DEFAULT_STATE)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return <Ctx.Provider value={{ state, loading }}>{children}</Ctx.Provider>
}

export function useCorpContext() {
  return useContext(Ctx).state
}

export function useCorpLoading() {
  return useContext(Ctx).loading
}

export function useActivePolitica() {
  const state = useCorpContext()
  return state.isCorpUser ? state.politica : null
}

export function useActiveEmpresa() {
  const state = useCorpContext()
  return state.isCorpUser ? state.empresa : null
}
