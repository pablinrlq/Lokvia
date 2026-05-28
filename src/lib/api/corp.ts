import { supabase } from '@/lib/supabase'
import { checkItemContraPolitica, precisaAprovacao } from '@/lib/politica-engine'
import { getMockHotelById } from '@/lib/mock-hoteis'
import { calcBookingAmounts, nightsBetween } from '@/lib/utils'
import type {
  Empresa,
  Hotel,
  PoliticaViagem,
  ReservaCorpMeta,
  Space,
  ViajanteCorp,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────
// Tipos auxiliares de joins
// ─────────────────────────────────────────────────────────────────────
export interface ViajanteCorpComEmpresa extends ViajanteCorp {
  empresa: Empresa
  politica: PoliticaViagem
}

export interface ReservaCorpComJoin extends ReservaCorpMeta {
  booking: {
    id: string
    check_in: string
    check_out: string
    guests_count: number
    total_amount: number
    space_id: string
    status: string
  }
  viajante: { id: string; name: string; avatar_url?: string }
  espaco: Space | null
  hotel: Hotel | null
}

// ─────────────────────────────────────────────────────────────────────
// Contexto corporativo
// ─────────────────────────────────────────────────────────────────────

export async function getEmpresaByAdmin(userId: string): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('admin_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as Empresa | null) ?? null
}

export async function getViajanteContext(
  userId: string,
): Promise<ViajanteCorpComEmpresa | null> {
  const { data, error } = await supabase
    .from('viajantes_corp')
    .select('*, empresa:empresas(*), politica:politicas_viagem(*)')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as ViajanteCorpComEmpresa | null) ?? null
}

// ─────────────────────────────────────────────────────────────────────
// Solicitação de reserva corporativa
// ─────────────────────────────────────────────────────────────────────

export interface SolicitarReservaInput {
  espacoId?: string
  hotelId?: string
  checkIn: Date
  checkOut: Date
  numHospedes: number
  motivoViagem: string
  centroDeCusto?: string
}

export interface SolicitarReservaResult {
  bookingId: string
  precisaAprovacao: boolean
  dentro_da_politica: boolean
  alertas: string[]
}

export async function solicitarReservaCorp(
  input: SolicitarReservaInput,
): Promise<SolicitarReservaResult> {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error('Não autenticado')

  const ctx = await getViajanteContext(user.id)
  if (!ctx) throw new Error('Usuário não é viajante corporativo')

  // Item alvo: espaço próprio ou hotel mock
  let item: Space | Hotel
  let hostId: string | null = null
  let pricePerNight = 0

  if (input.espacoId) {
    const { data: space, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', input.espacoId)
      .single()
    if (error || !space) throw new Error('Espaço não encontrado')
    item = space as Space
    hostId = space.host_id
    pricePerNight = space.price_per_night
  } else if (input.hotelId) {
    const hotel = getMockHotelById(input.hotelId)
    if (!hotel) throw new Error('Hotel não encontrado')
    item = hotel
    pricePerNight = hotel.preco_noite_base
  } else {
    throw new Error('Informe espacoId ou hotelId')
  }

  const noites = nightsBetween(input.checkIn.toISOString(), input.checkOut.toISOString())
  const { subtotal, platformFee, hostAmount, totalAmount } = calcBookingAmounts(
    pricePerNight,
    noites,
  )

  const check = checkItemContraPolitica(item, ctx.politica, input.checkIn, noites)
  if (check.bloqueios.length > 0) {
    throw new Error(`Reserva fora da política: ${check.bloqueios.join('; ')}`)
  }
  const precisaApr = precisaAprovacao(totalAmount, ctx.politica)

  // bookings exige space_id NOT NULL — para hotéis, registramos no campo notes.
  // (na versão final, criar tabela bookings_hotel ou tornar space_id nullable)
  if (!input.espacoId) {
    throw new Error(
      'Reserva de hotel será habilitada após migração para tornar bookings.space_id opcional',
    )
  }

  const bookingStatus = precisaApr ? 'pending' : 'confirmed'
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      guest_id: user.id,
      space_id: input.espacoId,
      check_in: input.checkIn.toISOString(),
      check_out: input.checkOut.toISOString(),
      guests_count: input.numHospedes,
      total_amount: totalAmount,
      platform_fee: platformFee,
      host_amount: hostAmount,
      status: bookingStatus,
      notes: `[CORP] ${input.motivoViagem}${hostId ? '' : ''}`,
    })
    .select('id')
    .single()
  if (bookingErr || !booking) throw bookingErr ?? new Error('Falha ao criar reserva')

  const statusAprov = precisaApr ? 'pendente' : 'auto_aprovada'

  const { error: metaErr } = await supabase.from('reservas_corp_meta').insert({
    booking_id: booking.id,
    empresa_id: ctx.empresa_id,
    viajante_id: user.id,
    politica_id: ctx.politica_id,
    motivo_viagem: input.motivoViagem,
    centro_de_custo: input.centroDeCusto ?? ctx.centro_de_custo,
    status_aprovacao: statusAprov,
    pago_por: ctx.empresa.fatura_mensal ? 'fatura_mensal' : 'cartao_corporativo',
    dentro_da_politica: check.dentro_da_politica,
    alertas_politica: check.alertas,
  })
  if (metaErr) throw metaErr

  // Subtotal e hostAmount são calculados no booking; mantemos compat com o helper.
  void subtotal

  return {
    bookingId: booking.id,
    precisaAprovacao: precisaApr,
    dentro_da_politica: check.dentro_da_politica,
    alertas: check.alertas,
  }
}

// ─────────────────────────────────────────────────────────────────────
// Aprovação
// ─────────────────────────────────────────────────────────────────────

export async function aprovarReserva(
  bookingId: string,
  aprovar: boolean,
  motivo?: string,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error('Não autenticado')

  const { error: metaErr } = await supabase
    .from('reservas_corp_meta')
    .update({
      status_aprovacao: aprovar ? 'aprovada' : 'recusada',
      aprovador_id: user.id,
      aprovado_em: new Date().toISOString(),
      motivo_recusa: motivo ?? null,
    })
    .eq('booking_id', bookingId)
  if (metaErr) throw metaErr

  const { error: bookingErr } = await supabase
    .from('bookings')
    .update({ status: aprovar ? 'confirmed' : 'cancelled' })
    .eq('id', bookingId)
  if (bookingErr) throw bookingErr
}

// Aprovação via link público (sem login) — usa um token de aprovação.
// No MVP, o "token" é o próprio booking_id; em produção, deve ser
// uma string aleatória armazenada em coluna separada.
export async function aprovarReservaPorToken(
  token: string,
  aprovar: boolean,
  motivo?: string,
): Promise<void> {
  // Em MVP: token = booking_id. Em prod, mover para coluna aprovacao_token.
  const { error } = await supabase
    .from('reservas_corp_meta')
    .update({
      status_aprovacao: aprovar ? 'aprovada' : 'recusada',
      aprovado_em: new Date().toISOString(),
      motivo_recusa: motivo ?? null,
    })
    .eq('booking_id', token)
  if (error) throw error

  await supabase
    .from('bookings')
    .update({ status: aprovar ? 'confirmed' : 'cancelled' })
    .eq('id', token)
}

// ─────────────────────────────────────────────────────────────────────
// Listas
// ─────────────────────────────────────────────────────────────────────

export async function getReservasPendentes(empresaId: string) {
  const { data, error } = await supabase
    .from('reservas_corp_meta')
    .select(
      `*,
        booking:bookings(id,check_in,check_out,guests_count,total_amount,space_id,status),
        viajante:users!viajante_id(id,name,avatar_url),
        espaco:spaces(*)`,
    )
    .eq('empresa_id', empresaId)
    .eq('status_aprovacao', 'pendente')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getReservasDaEmpresa(
  empresaId: string,
  opts: { status?: string; from?: Date; to?: Date } = {},
) {
  let q = supabase
    .from('reservas_corp_meta')
    .select(
      `*,
        booking:bookings(id,check_in,check_out,guests_count,total_amount,space_id,status),
        viajante:users!viajante_id(id,name,avatar_url),
        espaco:spaces(id,title,city,photos)`,
    )
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })

  if (opts.status) q = q.eq('status_aprovacao', opts.status)
  if (opts.from) q = q.gte('criado_em', opts.from.toISOString())
  if (opts.to) q = q.lte('criado_em', opts.to.toISOString())

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────
// Viajantes
// ─────────────────────────────────────────────────────────────────────

export async function listarViajantes(empresaId: string) {
  const { data, error } = await supabase
    .from('viajantes_corp')
    .select('*, user:users!id(id,name,email,avatar_url), politica:politicas_viagem(id,nome)')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function setViajanteAtivo(viajanteId: string, ativo: boolean) {
  const { error } = await supabase
    .from('viajantes_corp')
    .update({ ativo })
    .eq('id', viajanteId)
  if (error) throw error
}

// ─────────────────────────────────────────────────────────────────────
// Convites
// ─────────────────────────────────────────────────────────────────────

export interface ConvidarInput {
  empresaId: string
  email: string
  cargo?: string
  departamento?: string
  centroDeCusto?: string
  politicaId: string
}

export async function convidarViajante(input: ConvidarInput) {
  const { data, error } = await supabase
    .from('convites_viajantes')
    .insert({
      empresa_id: input.empresaId,
      email: input.email,
      cargo: input.cargo ?? null,
      departamento: input.departamento ?? null,
      centro_de_custo: input.centroDeCusto ?? null,
      politica_id: input.politicaId,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function listarConvites(empresaId: string) {
  const { data, error } = await supabase
    .from('convites_viajantes')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getConvitePorToken(token: string) {
  const { data, error } = await supabase
    .from('convites_viajantes')
    .select('*, empresa:empresas(nome_fantasia,razao_social), politica:politicas_viagem(*)')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function aceitarConvite(token: string, userId: string) {
  const convite = await getConvitePorToken(token)
  if (!convite) throw new Error('Convite não encontrado')
  if (convite.status !== 'pendente') throw new Error('Convite já utilizado ou expirado')

  await supabase.from('viajantes_corp').insert({
    id: userId,
    empresa_id: convite.empresa_id,
    politica_id: convite.politica_id,
    cargo: convite.cargo,
    departamento: convite.departamento,
    centro_de_custo: convite.centro_de_custo,
  })

  await supabase
    .from('convites_viajantes')
    .update({ status: 'aceito' })
    .eq('id', convite.id)
}

// ─────────────────────────────────────────────────────────────────────
// Políticas (CRUD)
// ─────────────────────────────────────────────────────────────────────

export async function listarPoliticas(empresaId: string) {
  const { data, error } = await supabase
    .from('politicas_viagem')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: true })
  if (error) throw error
  return (data ?? []) as PoliticaViagem[]
}

export async function salvarPolitica(p: Partial<PoliticaViagem> & { empresa_id: string }) {
  if (p.id) {
    const { id, ...rest } = p
    const { error } = await supabase.from('politicas_viagem').update(rest).eq('id', id)
    if (error) throw error
    return id
  } else {
    const { data, error } = await supabase
      .from('politicas_viagem')
      .insert(p)
      .select('id')
      .single()
    if (error) throw error
    return data.id as string
  }
}

// ─────────────────────────────────────────────────────────────────────
// Empresa (cadastro)
// ─────────────────────────────────────────────────────────────────────

export interface CadastrarEmpresaInput {
  admin_id: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  segmento?: string
  email_financeiro: string
  email_contador: string
  email_rh: string
  telefone: string
  plano: 'starter' | 'business' | 'enterprise'
}

export async function cadastrarEmpresa(input: CadastrarEmpresaInput): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .insert({ ...input, fatura_mensal: false })
    .select('*')
    .single()
  if (error) throw error

  // Cria política padrão
  await supabase.from('politicas_viagem').insert({
    empresa_id: data.id,
    nome: 'Política Padrão',
  })

  return data as Empresa
}

// ─────────────────────────────────────────────────────────────────────
// Relatórios (cálculos)
// ─────────────────────────────────────────────────────────────────────

export async function getRelatorioFinanceiro(
  empresaId: string,
  periodo: { inicio: Date; fim: Date },
) {
  const { data, error } = await supabase
    .from('reservas_corp_meta')
    .select(
      `*,
        booking:bookings(check_in,check_out,total_amount),
        viajante:users!viajante_id(id,name),
        espaco:spaces(city,type)`,
    )
    .eq('empresa_id', empresaId)
    .gte('criado_em', periodo.inicio.toISOString())
    .lte('criado_em', periodo.fim.toISOString())
  if (error) throw error
  return data ?? []
}
