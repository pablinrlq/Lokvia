import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SpaceType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calcBookingAmounts(pricePerNight: number, nights: number) {
  const subtotal = pricePerNight * nights
  const platformFee = Math.round(subtotal * 0.1 * 100) / 100
  const hostAmount = subtotal - platformFee
  const totalAmount = subtotal + platformFee
  return { subtotal, platformFee, hostAmount, totalAmount }
}

export const ROUTES = {
  home: '/',
  search: '/buscar',
  space: (id: string) => `/espacos/${id}`,
  checkout: (id: string) => `/reservar/${id}`,
  events: '/eventos',
  login: '/entrar',
  register: '/cadastro',
  guestDashboard: '/painel/hospede',
  hostDashboard: '/painel/anfitriao',
  hostNewSpace: '/painel/anfitriao/espacos/novo',
  admin: '/admin',
  empresaCadastro: '/empresa/cadastrar',
  empresa: '/empresa',
  empresaViajantes: '/empresa/viajantes',
  empresaReservas: '/empresa/reservas',
  empresaRelatorios: '/empresa/relatorios',
  empresaPolitica: '/empresa/politica',
  empresaFaturamento: '/empresa/faturamento',
  empresaConfig: '/empresa/config',
  aceitarConvite: (token: string) => `/aceitar-convite/${token}`,
  aprovarReserva: (token: string) => `/aprovar/${token}`,
} as const

export const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'ac', label: 'Ar-condicionado' },
  { id: 'kitchen', label: 'Cozinha' },
  { id: 'parking', label: 'Estacionamento' },
  { id: 'tv', label: 'TV' },
  { id: 'pool', label: 'Piscina' },
  { id: 'gym', label: 'Academia' },
  { id: 'pet', label: 'Pet friendly' },
  { id: 'elevator', label: 'Elevador' },
  { id: 'security', label: 'Segurança 24h' },
] as const

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  coworking: 'Coworking',
  cafe: 'Café',
  studio: 'Studio',
  loft: 'Loft',
}
