import {
  isHotel,
  itemCity,
  nightlyPrice,
  type AccomodationType,
  type Hotel,
  type PoliticaViagem,
  type SearchFilters,
  type Space,
} from '@/types'

export interface PoliticaCheck {
  permitido: boolean
  alertas: string[]
  bloqueios: string[]
  dentro_da_politica: boolean
}

const HOTEL_CATEGORIA_MAX: Record<NonNullable<PoliticaViagem['categoria_hotel_max']>, number> = {
  '3_estrelas': 3,
  '4_estrelas': 4,
  '5_estrelas': 5,
}

function itemTipo(item: Space | Hotel): AccomodationType {
  return isHotel(item) ? 'hotel' : item.type
}

export function checkItemContraPolitica(
  item: Space | Hotel,
  politica: PoliticaViagem,
  dataCheckIn: Date,
  _noites: number,
): PoliticaCheck {
  const alertas: string[] = []
  const bloqueios: string[] = []

  const preco = nightlyPrice(item)
  const cidade = itemCity(item)
  const tipo = itemTipo(item)

  // 1. Limite de diária
  if (preco > politica.limite_diaria) {
    bloqueios.push(
      `Diária R$${preco.toFixed(2)} acima do limite de R$${politica.limite_diaria.toFixed(2)}`,
    )
  } else if (preco > politica.limite_diaria * 0.9) {
    alertas.push(
      `Diária próxima ao limite (${Math.round((preco / politica.limite_diaria) * 100)}%)`,
    )
  }

  // 2. Tipo permitido
  if (!politica.tipos_permitidos.includes(tipo)) {
    bloqueios.push(`Tipo "${tipo}" não permitido pela política`)
  }

  // 3. Cidade bloqueada
  if (politica.cidades_bloqueadas.includes(cidade)) {
    bloqueios.push(`Cidade "${cidade}" bloqueada pela política`)
  }

  // 4. Cidade permitida (se lista restritiva)
  if (
    politica.cidades_permitidas.length > 0 &&
    !politica.cidades_permitidas.includes(cidade)
  ) {
    bloqueios.push(`Cidade "${cidade}" fora das cidades permitidas`)
  }

  // 5. Antecedência mínima
  const horasAteCheckIn = (dataCheckIn.getTime() - Date.now()) / 36e5
  if (horasAteCheckIn < politica.antecedencia_minima_horas) {
    bloqueios.push(
      `Reserva com menos de ${politica.antecedencia_minima_horas}h de antecedência`,
    )
  }
  if (politica.antecedencia_maxima_dias) {
    const dias = horasAteCheckIn / 24
    if (dias > politica.antecedencia_maxima_dias) {
      bloqueios.push(
        `Reserva com mais de ${politica.antecedencia_maxima_dias} dias de antecedência`,
      )
    }
  }

  // 6. Categoria de hotel
  if (isHotel(item) && politica.categoria_hotel_max) {
    const max = HOTEL_CATEGORIA_MAX[politica.categoria_hotel_max]
    if (item.categoria > max) {
      bloqueios.push(`Hotel ${item.categoria}★ acima do máximo permitido (${max}★)`)
    }
  }

  const permitido = bloqueios.length === 0
  return { permitido, alertas, bloqueios, dentro_da_politica: permitido }
}

// Aplica política como filtro de busca: força tetos/tipos/cidades.
export function aplicarPoliticaAosFiltros(
  filters: SearchFilters,
  politica: PoliticaViagem,
): SearchFilters {
  const refined: SearchFilters = { ...filters }

  if (!refined.max_price || refined.max_price > politica.limite_diaria) {
    refined.max_price = politica.limite_diaria
  }

  // Tipo único na busca atual: se está fora dos permitidos, descarta.
  if (refined.type && !politica.tipos_permitidos.includes(refined.type)) {
    delete refined.type
  }

  if (
    politica.cidades_permitidas.length > 0 &&
    refined.city &&
    !politica.cidades_permitidas.includes(refined.city)
  ) {
    refined.city = politica.cidades_permitidas[0]
  }

  return refined
}

export function precisaAprovacao(total: number, politica: PoliticaViagem): boolean {
  if (!politica.requer_aprovacao) return false
  if (politica.auto_aprova_abaixo_de && total <= politica.auto_aprova_abaixo_de) return false
  return true
}
