/**
 * LokScore™ — engine de match perfil×espaço
 * Função pura, sem efeitos colaterais. Transparente e extensível.
 *
 * Regras:
 *  1. Cada WorkType tem pesos-base por categoria (silêncio, wifi, luz, ergonomia, networking).
 *  2. WorkSchedule ajusta esses pesos (ex.: night → +silêncio).
 *  3. WorkPriorities[] do usuário sobrescrevem pesos (priority recebe boost forte).
 *  4. Espaço é avaliado em cada categoria → score bruto 0..100.
 *  5. Score final = soma ponderada, normalizada 0..100.
 *  6. Devolve breakdown completo + reasons (frases prontas para UI).
 */
import type {
  Space,
  SpaceWorkInsights,
  WorkProfile,
  WorkPriority,
  WorkType,
  WorkSchedule,
  LokScoreResult,
  LokScoreBreakdown,
} from '@/types'

// ─── Pesos base por tipo de trabalho ──────────────────────────────────
type WeightMap = Record<string, number>

const BASE_WEIGHTS: Record<WorkType, WeightMap> = {
  dev:        { silence: 0.28, fast_wifi: 0.28, ergonomics: 0.18, natural_light: 0.10, networking: 0.04, coffee: 0.06, view: 0.03, kitchen: 0.03 },
  designer:   { silence: 0.14, fast_wifi: 0.22, ergonomics: 0.20, natural_light: 0.22, networking: 0.08, coffee: 0.06, view: 0.05, kitchen: 0.03 },
  writer:     { silence: 0.32, fast_wifi: 0.16, ergonomics: 0.18, natural_light: 0.18, networking: 0.02, coffee: 0.08, view: 0.04, kitchen: 0.02 },
  founder:    { silence: 0.14, fast_wifi: 0.22, ergonomics: 0.14, natural_light: 0.10, networking: 0.24, coffee: 0.06, view: 0.06, kitchen: 0.04 },
  consultant: { silence: 0.20, fast_wifi: 0.26, ergonomics: 0.16, natural_light: 0.10, networking: 0.14, coffee: 0.06, view: 0.04, kitchen: 0.04 },
  creator:    { silence: 0.12, fast_wifi: 0.22, ergonomics: 0.14, natural_light: 0.24, networking: 0.10, coffee: 0.06, view: 0.08, kitchen: 0.04 },
}

const SCHEDULE_NUDGE: Record<WorkSchedule, WeightMap> = {
  morning:  { natural_light: 1.2, coffee: 1.3 },
  business: { networking: 1.15, fast_wifi: 1.05 },
  flex:     {},
  night:    { silence: 1.4, natural_light: 0.7, fast_wifi: 1.05 },
}

// Priorities — usuário escolhe; cada uma multiplica peso 1.5× e força mínimo
const PRIORITY_BOOST = 1.5

// ─── Heurísticas de "score bruto" por categoria ──────────────────────
function scoreSilence(insights?: SpaceWorkInsights): number {
  if (!insights) return 50
  return (insights.silence_level / 5) * 100
}

function scoreWifi(insights?: SpaceWorkInsights, callsPerDay?: number): number {
  if (!insights) return 40
  const down = insights.wifi_mbps_down
  // baseline: 50Mbps = 60pts, 200Mbps = 90pts, 500+ = 100pts
  let s = Math.min(100, 40 + (down / 5))
  // se faz muitas calls, upload importa muito mais
  if (callsPerDay && callsPerDay >= 3) {
    s = s * 0.5 + Math.min(100, insights.wifi_mbps_up * 2) * 0.5
  }
  return Math.round(s)
}

function scoreErgonomics(insights?: SpaceWorkInsights, needsMonitor?: boolean): number {
  if (!insights) return 50
  let s = (insights.ergonomics / 5) * 100
  if (needsMonitor && insights.ergonomics < 4) s -= 15
  return Math.max(0, Math.round(s))
}

function scoreNaturalLight(insights?: SpaceWorkInsights): number {
  if (!insights) return 55
  return (insights.natural_light / 5) * 100
}

function scoreNetworking(space: Space): number {
  // proxy: coworkings > cafés > lofts > apartamentos > casas
  const typeScore: Record<Space['type'], number> = {
    coworking: 95, cafe: 80, loft: 55, studio: 45, apartment: 40, house: 35,
  }
  return typeScore[space.type] ?? 50
}

function scoreCoffee(space: Space): number {
  if (space.type === 'cafe') return 100
  if (space.amenities.includes('kitchen')) return 70
  return 40
}

function scoreView(space: Space): number {
  if (space.amenities.includes('pool')) return 85
  if (space.type === 'house' || space.type === 'loft') return 70
  return 50
}

function scoreKitchen(space: Space): number {
  return space.amenities.includes('kitchen') ? 90 : 30
}

function scorePetFriendly(space: Space): number {
  return space.amenities.includes('pet') ? 100 : 0
}

function scoreGym(space: Space): number {
  return space.amenities.includes('gym') ? 100 : 25
}

// ─── Labels & humanização ────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  silence: 'Silêncio',
  fast_wifi: 'Wi-Fi',
  ergonomics: 'Ergonomia',
  natural_light: 'Luz natural',
  networking: 'Networking',
  coffee: 'Café',
  view: 'Vista',
  kitchen: 'Cozinha',
  pet_friendly: 'Pet friendly',
  gym: 'Academia',
}

function labelFromScore(score: number): LokScoreResult['matchLabel'] {
  if (score >= 88) return 'perfect'
  if (score >= 76) return 'great'
  if (score >= 62) return 'good'
  if (score >= 45) return 'fair'
  return 'low'
}

function buildReasons(
  breakdown: LokScoreBreakdown[],
  insights: SpaceWorkInsights | undefined,
  space: Space,
): string[] {
  const top = [...breakdown].sort((a, b) => b.contribution - a.contribution).slice(0, 3)
  return top.map((b) => {
    switch (b.category) {
      case 'Wi-Fi':
        return insights
          ? `Wi-Fi ${insights.wifi_mbps_down}Mbps testado`
          : 'Wi-Fi compatível'
      case 'Silêncio':
        return insights ? `Silêncio ${insights.silence_level}/5` : 'Ambiente tranquilo'
      case 'Ergonomia':
        return insights ? `Ergonomia ${insights.ergonomics}/5` : 'Setup de trabalho'
      case 'Luz natural':
        return insights ? `Luz natural ${insights.natural_light}/5` : 'Boa iluminação'
      case 'Networking':
        return space.type === 'coworking' ? 'Coworking com comunidade ativa' : 'Bom para encontros'
      case 'Café':
        return space.type === 'cafe' ? 'Café especial no local' : 'Cozinha equipada'
      case 'Vista':
        return 'Vista privilegiada'
      case 'Cozinha':
        return 'Cozinha completa'
      default:
        return b.category
    }
  })
}

// ─── Cálculo principal ───────────────────────────────────────────────
function normalizeWeights(w: WeightMap): WeightMap {
  const total = Object.values(w).reduce((acc, v) => acc + v, 0)
  if (total === 0) return w
  const out: WeightMap = {}
  for (const k in w) out[k] = w[k] / total
  return out
}

function effectiveWeights(profile: WorkProfile): WeightMap {
  const base: WeightMap = { ...BASE_WEIGHTS[profile.type] }
  const nudge = SCHEDULE_NUDGE[profile.schedule] ?? {}
  for (const k in nudge) {
    base[k] = (base[k] ?? 0.05) * nudge[k]
  }
  // priorities boost
  for (const p of profile.priorities) {
    base[p] = Math.max(base[p] ?? 0, 0.1) * PRIORITY_BOOST
  }
  return normalizeWeights(base)
}

function rawScoreFor(
  category: WorkPriority | string,
  space: Space,
  insights: SpaceWorkInsights | undefined,
  profile: WorkProfile,
): number {
  switch (category) {
    case 'silence':       return scoreSilence(insights)
    case 'fast_wifi':     return scoreWifi(insights, profile.callsPerDay)
    case 'ergonomics':    return scoreErgonomics(insights, profile.needsExternalMonitor)
    case 'natural_light': return scoreNaturalLight(insights)
    case 'networking':    return scoreNetworking(space)
    case 'coffee':        return scoreCoffee(space)
    case 'view':          return scoreView(space)
    case 'kitchen':       return scoreKitchen(space)
    case 'pet_friendly':  return scorePetFriendly(space)
    case 'gym':           return scoreGym(space)
    default:              return 50
  }
}

export function computeLokScore(
  space: Space,
  profile: WorkProfile,
  insights?: SpaceWorkInsights,
): LokScoreResult {
  const weights = effectiveWeights(profile)
  const breakdown: LokScoreBreakdown[] = []
  let total = 0

  for (const category in weights) {
    const weight = weights[category]
    const raw = rawScoreFor(category, space, insights, profile)
    const contribution = raw * weight
    total += contribution
    breakdown.push({
      category: CATEGORY_LABELS[category] ?? category,
      weight,
      rawScore: raw,
      contribution,
    })
  }

  const score = Math.round(Math.max(0, Math.min(100, total)))
  return {
    spaceId: space.id,
    score,
    matchLabel: labelFromScore(score),
    reasons: buildReasons(breakdown, insights, space),
    breakdown: breakdown.sort((a, b) => b.contribution - a.contribution),
  }
}

export function rankSpacesByLokScore(
  spaces: Space[],
  profile: WorkProfile,
  insightsBySpaceId: Record<string, SpaceWorkInsights>,
): Array<{ space: Space; result: LokScoreResult }> {
  return spaces
    .map((space) => ({
      space,
      result: computeLokScore(space, profile, insightsBySpaceId[space.id]),
    }))
    .sort((a, b) => b.result.score - a.result.score)
}

// ─── Helpers UI ──────────────────────────────────────────────────────
export const MATCH_LABEL_TEXT: Record<LokScoreResult['matchLabel'], string> = {
  perfect: 'Match perfeito',
  great:   'Ótimo match',
  good:    'Bom match',
  fair:    'Match razoável',
  low:     'Match baixo',
}

export const MATCH_LABEL_COLOR: Record<LokScoreResult['matchLabel'], string> = {
  perfect: 'bg-lime-400 text-ink-600',
  great:   'bg-lime-300 text-ink-600',
  good:    'bg-rust-100 text-rust-600',
  fair:    'bg-ink-100 text-ink-500',
  low:     'bg-ink-200 text-ink-500',
}
