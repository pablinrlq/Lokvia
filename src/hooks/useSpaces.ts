import { useQuery } from '@tanstack/react-query'
import { MOCK_SPACES } from '@/lib/mock'
import type { Space, SearchFilters } from '@/types'

function filterSpaces(spaces: Space[], filters: SearchFilters): Space[] {
  return spaces.filter((space) => {
    if (filters.city && !space.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false
    }
    if (filters.type && space.type !== filters.type) {
      return false
    }
    if (filters.min_price && space.price_per_night < filters.min_price) {
      return false
    }
    if (filters.max_price && space.price_per_night > filters.max_price) {
      return false
    }
    if (filters.guests && space.max_guests < filters.guests) {
      return false
    }
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAll = filters.amenities.every((a) => space.amenities.includes(a))
      if (!hasAll) return false
    }
    return true
  })
}

export function useSpaces(filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['spaces', filters],
    queryFn: async (): Promise<Space[]> => {
      // Swap this for a real Supabase query when the backend is ready
      await new Promise((resolve) => setTimeout(resolve, 300))
      return filterSpaces(MOCK_SPACES, filters)
    },
  })
}
