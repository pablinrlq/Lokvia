import { useQuery } from '@tanstack/react-query'
import { useActivePolitica } from '@/contexts/CorpContext'
import { aplicarPoliticaAosFiltros } from '@/lib/politica-engine'
import { getMockHoteis } from '@/lib/mock-hoteis'
import { supabase } from '@/lib/supabase'
import type { Hotel, SearchFilters, Space } from '@/types'

export interface UnifiedSearchResult {
  spaces: Space[]
  hoteis: Hotel[]
  total: number
  filtroPolitica: boolean
}

async function fetchSpaces(filters: SearchFilters): Promise<Space[]> {
  let q = supabase.from('spaces').select('*').eq('status', 'active')
  if (filters.city) q = q.eq('city', filters.city)
  if (filters.type) q = q.eq('type', filters.type)
  if (filters.min_price) q = q.gte('price_per_night', filters.min_price)
  if (filters.max_price) q = q.lte('price_per_night', filters.max_price)
  if (filters.guests) q = q.gte('max_guests', filters.guests)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Space[]
}

export function useUnifiedSearch(filters: SearchFilters) {
  const politica = useActivePolitica()
  const effective = politica ? aplicarPoliticaAosFiltros(filters, politica) : filters

  return useQuery<UnifiedSearchResult>({
    queryKey: ['unified-search', effective, !!politica],
    queryFn: async () => {
      const [spaces, hoteisRaw] = await Promise.all([
        fetchSpaces(effective).catch(() => [] as Space[]),
        Promise.resolve(getMockHoteis(effective.city)),
      ])

      const hoteis = hoteisRaw.filter((h) => {
        if (effective.max_price && h.preco_noite_base > effective.max_price) return false
        return true
      })

      return {
        spaces,
        hoteis,
        total: spaces.length + hoteis.length,
        filtroPolitica: !!politica,
      }
    },
    staleTime: 3 * 60 * 1000,
  })
}
