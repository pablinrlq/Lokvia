import { useQuery } from '@tanstack/react-query'
import { MOCK_SPACES } from '@/lib/mock'
import type { Space } from '@/types'

export function useSpace(id: string | undefined) {
  return useQuery({
    queryKey: ['space', id],
    queryFn: async (): Promise<Space | null> => {
      if (!id) return null
      await new Promise((resolve) => setTimeout(resolve, 200))
      return MOCK_SPACES.find((s) => s.id === id) ?? null
    },
    enabled: !!id,
  })
}
