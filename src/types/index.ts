export type UserRole = 'guest' | 'host' | 'admin'
export type KycStatus = 'pending' | 'approved' | 'rejected'
export type SpaceType = 'house' | 'apartment' | 'coworking' | 'cafe' | 'studio' | 'loft'
export type SpaceStatus = 'draft' | 'active' | 'paused' | 'review'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentMethod = 'pix' | 'credit_card'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
export type EventCategory = 'tech' | 'business' | 'culture' | 'networking' | 'sport' | 'other'
export type ReviewTargetType = 'space' | 'guest'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  bio?: string
  kyc_status: KycStatus
  created_at: string
}

export interface Space {
  id: string
  host_id: string
  host?: User
  title: string
  description?: string
  type: SpaceType
  status: SpaceStatus
  city: string
  state: string
  address?: string
  lat?: number
  lng?: number
  price_per_night: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  area_sqm?: number
  photos: string[]
  amenities: string[]
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  guest_id: string
  guest?: User
  space_id: string
  space?: Space
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number
  platform_fee: number
  host_amount: number
  status: BookingStatus
  payment_id?: string
  notes?: string
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  pagarme_id?: string
  method?: PaymentMethod
  status: PaymentStatus
  amount: number
  split_host: number
  split_platform: number
  pix_qr_code?: string
  pix_expiry?: string
  created_at: string
}

export interface Event {
  id: string
  space_id?: string
  title: string
  description?: string
  city: string
  date: string
  time?: string
  category?: EventCategory
  external_url?: string
  image_url?: string
  is_free: boolean
  price?: number
  organizer?: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  author_id: string
  author?: User
  target_id: string
  target_type: ReviewTargetType
  rating: number
  comment?: string
  visible: boolean
  created_at: string
}

export interface SearchFilters {
  city?: string
  type?: SpaceType
  min_price?: number
  max_price?: number
  guests?: number
  amenities?: string[]
  check_in?: string
  check_out?: string
}

export type AIContext =
  | 'home_search'
  | 'space_detail'
  | 'post_booking'
  | 'host_dashboard'
  | 'city_explore'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AISuggestionContext {
  context: AIContext
  contextData?: Record<string, unknown>
  filters?: SearchFilters
  space?: Partial<Space>
  booking?: Partial<Booking>
  city?: string
  checkIn?: string
  checkOut?: string
}

// ─── v2.0 ──────────────────────────────────────────────────────────────
// LokScore™ — engine de match perfil×espaço
export type WorkType = 'dev' | 'designer' | 'writer' | 'founder' | 'consultant' | 'creator'
export type WorkSchedule = 'morning' | 'business' | 'flex' | 'night'
export type WorkPriority =
  | 'silence'
  | 'fast_wifi'
  | 'natural_light'
  | 'ergonomics'
  | 'networking'
  | 'coffee'
  | 'pet_friendly'
  | 'view'
  | 'kitchen'
  | 'gym'

export interface WorkProfile {
  type: WorkType
  schedule: WorkSchedule
  priorities: WorkPriority[]   // até 4
  callsPerDay?: number         // 0-10+
  needsExternalMonitor?: boolean
}

export interface SpaceWorkInsights {
  wifi_mbps_down: number
  wifi_mbps_up: number
  wifi_tested_at: string
  silence_level: 1 | 2 | 3 | 4 | 5   // 5 = totalmente silencioso
  natural_light: 1 | 2 | 3 | 4 | 5
  ergonomics: 1 | 2 | 3 | 4 | 5      // cadeira, mesa, monitor
  best_for: Array<'devs' | 'calls' | 'designers' | 'writers' | 'founders'>
  productivity_testimonials?: Array<{
    author: string
    role: string
    quote: string
    avatar_url?: string
  }>
}

export interface LokScoreBreakdown {
  category: string          // human label, p.ex. "Silêncio"
  weight: number            // 0..1
  rawScore: number          // 0..100 contribuição bruta
  contribution: number      // peso × raw, 0..100
}

export interface LokScoreResult {
  spaceId: string
  score: number             // 0..100 final
  matchLabel: 'perfect' | 'great' | 'good' | 'fair' | 'low'
  reasons: string[]         // 2-3 frases curtas (p.ex. "Wi-Fi 480Mbps testado", "Silêncio 5/5")
  breakdown: LokScoreBreakdown[]
}

// ─── Eventos × Reservas (EventMatch) ─────────────────────────────────
export interface EventMatch {
  event: Event
  daysFromCheckIn: number
  reason: string            // "Acontece no 2º dia da sua estadia"
}

// ─── Nomad Tracker ────────────────────────────────────────────────────
export interface NomadStop {
  city: string
  state: string
  lat: number
  lng: number
  arrived_at: string
  left_at?: string
  nights: number
}

export interface NomadJourney {
  user_id: string
  stops: NomadStop[]
  total_km: number
  total_days_moving: number
  states_visited: string[]
  nomad_score: number          // 0..100
  level: 'explorer' | 'wanderer' | 'nomad' | 'legend'
}

// ─── Price Optimizer ──────────────────────────────────────────────────
export interface PriceSuggestion {
  spaceId: string
  current_price: number
  suggested_price: number
  delta_pct: number            // ex.: +15
  context: string              // "Há 3 eventos na semana, espaços similares cobram 15% mais"
  events_nearby: Event[]
  confidence: 'low' | 'medium' | 'high'
}

// ─── Reviews (double-blind) ───────────────────────────────────────────
export interface ReviewExtended extends Review {
  released_at?: string          // momento da revelação simultânea
  counterpart_submitted: boolean
}

// ═══════════════════════════════════════════════════════════════════════
// v2.1 — Camada corporativa B2B
// Os tipos abaixo se sobrepõem ao modelo existente (User/Space/Booking).
// Não substituem: estendem. Um User vira "viajante corporativo" quando há
// linha em viajantes_corp; vira "admin de empresa" quando há linha em
// empresas com admin_id = user.id.
// ═══════════════════════════════════════════════════════════════════════

export type EmpresaStatus = 'ativa' | 'suspensa' | 'pendente_verificacao'
export type EmpresaPlano = 'starter' | 'business' | 'enterprise'

export interface Empresa {
  id: string
  admin_id: string                 // FK users.id

  nome_fantasia: string
  razao_social: string
  cnpj: string                     // XX.XXX.XXX/XXXX-XX
  inscricao_estadual?: string
  segmento?: string

  email_financeiro: string
  email_contador: string
  email_rh: string
  telefone: string

  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string

  cartao_token?: string            // token Pagar.me, nunca PAN
  fatura_mensal: boolean
  limite_mensal?: number

  status: EmpresaStatus
  verificada: boolean
  plano: EmpresaPlano

  total_viajantes: number
  total_reservas: number
  gasto_total: number

  criado_em: string
  atualizado_em: string
}

export type AccomodationType = SpaceType | 'hotel'
export type CategoriaHotelMax = '3_estrelas' | '4_estrelas' | '5_estrelas'

export interface PoliticaViagem {
  id: string
  empresa_id: string
  nome: string

  limite_diaria: number
  limite_mensal_por_viajante?: number
  limite_viagem?: number

  tipos_permitidos: AccomodationType[]
  categoria_hotel_max?: CategoriaHotelMax
  somente_apto_inteiro: boolean

  cidades_permitidas: string[]     // [] = todas
  cidades_bloqueadas: string[]

  antecedencia_minima_horas: number
  antecedencia_maxima_dias?: number

  requer_aprovacao: boolean
  aprovadores: string[]            // user IDs
  auto_aprova_abaixo_de?: number

  notificar_gestor_email: boolean
  notificar_whatsapp: boolean

  ativa: boolean
  criado_em: string
}

export interface ViajanteCorp {
  id: string                       // mesmo id de users
  empresa_id: string
  politica_id: string
  cargo?: string
  departamento?: string
  centro_de_custo?: string
  gestor_id?: string
  ativo: boolean
  criado_em: string
}

export type StatusAprovacao = 'auto_aprovada' | 'pendente' | 'aprovada' | 'recusada'
export type PagoPor = 'cartao_corporativo' | 'fatura_mensal'

export interface ReservaCorpMeta {
  booking_id: string               // FK bookings.id
  empresa_id: string
  viajante_id: string
  politica_id: string
  centro_de_custo?: string
  motivo_viagem?: string

  status_aprovacao: StatusAprovacao
  aprovador_id?: string
  aprovado_em?: string
  motivo_recusa?: string

  pago_por: PagoPor
  nf_emitida: boolean
  nf_numero?: string
  nf_pdf_url?: string

  dentro_da_politica: boolean
  alertas_politica: string[]

  criado_em: string
}

// ─── Hotel (inventário externo — mock no MVP, Expedia depois) ─────────
export interface Hotel {
  id: string                       // prefixo 'htl_'
  source: 'expedia' | 'hotelbeds' | 'omnibees' | 'direto'
  source_id: string

  nome: string
  categoria: 1 | 2 | 3 | 4 | 5
  tipo: 'hotel'                    // discriminador para union

  cidade: string
  estado: string
  bairro?: string
  endereco: string
  latitude: number
  longitude: number

  preco_noite_base: number
  preco_noite_min: number
  preco_noite_max: number
  moeda: 'BRL'

  descricao: string
  fotos: string[]
  amenities: string[]
  cafe_incluso: boolean
  cancelamento_gratuito: boolean
  politica_cancelamento: string

  media_avaliacoes: number
  total_avaliacoes: number
  fonte_avaliacao: 'expedia' | 'interno'

  destaque: boolean
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

// União busca: SpaceOrHotel. Discriminamos via type guard.
export type SpaceOrHotel = (Space & { kind: 'space' }) | (Hotel & { kind: 'hotel' })

export function isHotel(item: Space | Hotel): item is Hotel {
  return 'source' in item && (item as Hotel).tipo === 'hotel'
}
export function isSpace(item: Space | Hotel): item is Space {
  return !isHotel(item)
}

// Helper unificado: preço por noite
export function nightlyPrice(item: Space | Hotel): number {
  return isHotel(item) ? item.preco_noite_base : item.price_per_night
}

// Helper unificado: cidade
export function itemCity(item: Space | Hotel): string {
  return isHotel(item) ? item.cidade : item.city
}

// ─── Contexto corporativo (injetado via React Context) ───────────────
export interface CorpContextActive {
  isCorpUser: true
  isAdmin: boolean                 // true se é admin da empresa
  empresa: Empresa
  viajante: ViajanteCorp | null    // null se for admin não-viajante
  politica: PoliticaViagem | null  // null se for admin não-viajante
}

export type AppContextState =
  | { isCorpUser: false; isAdmin: false; empresa: null; viajante: null; politica: null }
  | CorpContextActive

// ─── Convite de viajante ─────────────────────────────────────────────
export type ConviteStatus = 'pendente' | 'aceito' | 'expirado'

export interface ConviteViajante {
  id: string
  empresa_id: string
  email: string
  cargo?: string
  departamento?: string
  centro_de_custo?: string
  politica_id: string
  token: string
  status: ConviteStatus
  expires_at: string
  criado_em: string
}

// ─── Relatório financeiro ─────────────────────────────────────────────
export interface RelatorioPeriodo { inicio: string; fim: string }

export interface RelatorioBucket {
  label: string
  gasto: number
  reservas: number
}

export interface RelatorioViajante {
  viajante_id: string
  nome: string
  gasto: number
  reservas: number
  media_diaria: number
  alertas: number
}

export interface RelatorioMes {
  mes: string                      // 'YYYY-MM'
  gasto: number
  reservas: number
}

export interface RelatorioFinanceiro {
  empresa_id: string
  periodo: RelatorioPeriodo
  total_gasto: number
  total_reservas: number
  total_viajantes: number
  media_por_viagem: number
  media_diaria: number
  cidades: RelatorioBucket[]
  departamentos: RelatorioBucket[]
  viajantes: RelatorioViajante[]
  evolucao_mensal: RelatorioMes[]
}
