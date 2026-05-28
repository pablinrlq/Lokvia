/**
 * Helpers de evento — usados por EventMatch (SpaceDetailPage) e
 * Price Optimizer (HostDashboard).
 */
import type { EventMatch, PriceSuggestion, Space } from '@/types'
import { MOCK_EVENTS } from '@/lib/mock'

const DAY_MS = 1000 * 60 * 60 * 24

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS)
}

export function findEventMatches(city: string, checkIn?: string, checkOut?: string): EventMatch[] {
  if (!checkIn || !checkOut) return []
  const start = new Date(checkIn).getTime()
  const end = new Date(checkOut).getTime()
  return MOCK_EVENTS
    .filter((e) => e.city.toLowerCase() === city.toLowerCase())
    .filter((e) => {
      const d = new Date(e.date).getTime()
      return d >= start && d <= end
    })
    .map((event) => {
      const days = daysBetween(checkIn, event.date)
      const reason =
        days === 0 ? 'Acontece no dia do seu check-in!'
        : days === 1 ? 'No 2º dia da sua estadia'
        : `No dia +${days} da sua estadia`
      return { event, daysFromCheckIn: days, reason }
    })
    .sort((a, b) => a.daysFromCheckIn - b.daysFromCheckIn)
}

/**
 * Price Optimizer — heurística:
 *  - se há ≥2 eventos nos próximos 7 dias na cidade → sugere +15%
 *  - se há 1 evento "tech/business/networking" → +10%
 *  - se há 1 evento culture/outro → +5%
 *  - se há 0 → mantém preço
 */
export function suggestPriceForSpace(space: Space, today = new Date()): PriceSuggestion {
  const horizon = new Date(today.getTime() + 7 * DAY_MS)
  const nearby = MOCK_EVENTS
    .filter((e) => e.city.toLowerCase() === space.city.toLowerCase())
    .filter((e) => {
      const d = new Date(e.date)
      return d >= today && d <= horizon
    })

  let deltaPct = 0
  let confidence: PriceSuggestion['confidence'] = 'low'
  let context = 'Sem eventos relevantes nos próximos 7 dias.'

  if (nearby.length >= 2) {
    deltaPct = 15; confidence = 'high'
    context = `Há ${nearby.length} eventos nos próximos 7 dias em ${space.city}. Espaços similares cobram cerca de 15% mais nesse período.`
  } else if (nearby.length === 1) {
    const ev = nearby[0]
    if (ev.category === 'tech' || ev.category === 'business' || ev.category === 'networking') {
      deltaPct = 10; confidence = 'medium'
      context = `${ev.title} acontece em ${formatDateShort(ev.date)}. Demanda costuma subir nessa semana.`
    } else {
      deltaPct = 5; confidence = 'low'
      context = `${ev.title} pode atrair viajantes para ${space.city}.`
    }
  }

  const suggested = Math.round(space.price_per_night * (1 + deltaPct / 100))
  return {
    spaceId: space.id,
    current_price: space.price_per_night,
    suggested_price: suggested,
    delta_pct: deltaPct,
    context,
    events_nearby: nearby,
    confidence,
  }
}

function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}
