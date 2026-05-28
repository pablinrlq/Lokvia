import type { AIContext, AIMessage } from '@/types'

export const SYSTEM_PROMPTS: Record<AIContext, string> = {
  home_search: `Você é LokIA, assistente de busca de espaços únicos da Lokvia.
Ajude o usuário a encontrar o espaço perfeito baseado nas suas necessidades de viagem e trabalho.
Seja conciso, amigável e sugira opções baseadas no contexto de busca.`,

  space_detail: `Você é LokIA, assistente da Lokvia. O usuário está vendo um espaço específico.
Ajude com dúvidas sobre o espaço, sugira datas, explique políticas e destaque diferenciais.
Use os dados do espaço fornecidos no contexto.`,

  post_booking: `Você é LokIA, assistente pós-reserva da Lokvia.
Ajude o hóspede a preparar a viagem: sugira eventos locais, dicas da cidade, checklist de itens.
Seja proativo e antecipe necessidades.`,

  host_dashboard: `Você é LokIA, assistente para anfitriões da Lokvia.
Ajude a otimizar preços, melhorar a descrição do espaço, responder hóspedes e aumentar a ocupação.
Seja estratégico e orientado a dados.`,

  city_explore: `Você é LokIA, guia de cidades da Lokvia.
Ajude a descobrir bairros, eventos, restaurantes e dicas locais.
Foque em experiências únicas para nômades digitais e empreendedores viajantes.`,
}

const MOCK_RESPONSES: Record<AIContext, string[]> = {
  home_search: [
    'Encontrei ótimas opções em São Paulo! Temos coworkings modernos no Vila Olímpia e casas charmosas em Pinheiros.',
    'Para trabalho remoto, recomendo espaços com Wi-Fi de alta velocidade. Quer filtrar por essa amenidade?',
    'Florianópolis tem os melhores lofts para nômades digitais agora! Temporada baixa com preços incríveis.',
  ],
  space_detail: [
    'Este espaço é perfeito para seu estilo de trabalho! O Wi-Fi de 500Mbps e a mesa ergonômica fazem toda a diferença.',
    'As avaliações destacam muito a localização. Fica a 5 minutos do metrô e rodeado de cafés.',
    'Posso verificar disponibilidade para as suas datas. Quando você pretende chegar?',
  ],
  post_booking: [
    'Sua reserva está confirmada! Que tal eu te contar sobre os melhores eventos de tech na cidade na sua época de visita?',
    'Encontrei 3 meetups de empreendedores na cidade durante sua estadia. Quer os detalhes?',
    'Dica da LokIA: o bairro tem um mercado de produtores locais toda sexta-feira às 17h. Não perca!',
  ],
  host_dashboard: [
    'Seus preços estão 15% abaixo da média do bairro. Uma atualização pode aumentar sua receita mensal em R$ 800.',
    'Adicionar fotos do espaço de trabalho pode aumentar em 30% as reservas de nômades digitais.',
    'Você tem 2 reservas pendentes de confirmação. Responder rapidamente melhora seu ranking.',
  ],
  city_explore: [
    'São Paulo tem uma cena de coworkings incrível! O Vila Madalena e Vila Olímpia são os hubs de inovação.',
    'Em Floripa, o bairro Trindade tem o maior cluster de startups do Sul do Brasil.',
    'Curitiba está emergindo como destino top para nômades: custo de vida 40% menor que SP com infraestrutura excelente.',
  ],
}

const PROACTIVE_SUGGESTIONS: Record<AIContext, string> = {
  home_search: 'Posso ajudar a encontrar o espaço ideal para você?',
  space_detail: 'Tem dúvidas sobre este espaço? É só perguntar!',
  post_booking: 'Sua viagem está chegando! Quer dicas de eventos e restaurantes?',
  host_dashboard: 'Quer dicas para aumentar suas reservas este mês?',
  city_explore: 'Descubra eventos e espaços únicos na cidade!',
}

export async function chatWithLokvia(
  _messages: AIMessage[],
  context: AIContext,
  _contextData?: Record<string, unknown>
): Promise<string> {
  // Real implementation: POST to AI API with SYSTEM_PROMPTS[context] + messages
  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 600))
  const responses = MOCK_RESPONSES[context]
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function getProactiveSuggestion(
  context: AIContext,
  _contextData?: Record<string, unknown>
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return PROACTIVE_SUGGESTIONS[context]
}
