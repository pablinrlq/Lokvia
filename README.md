<div align="center">

# Lokvia

**Marketplace de espaços para quem trabalha viajando.**

Casas, coworkings e cafés verificados para nômades digitais, com agenda de eventos,
reputação de trabalho e uma camada corporativa para empresas que mandam gente para a estrada.

![React](https://img.shields.io/badge/React-18-20232a?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

## A ideia

Quem trabalha remoto e vive mudando de cidade sofre com a mesma coisa: anúncio de aluguel
não diz se a internet aguenta uma call, se tem mesa decente ou se dá pra trabalhar em paz.
A Lokvia junta hóspede e anfitrião em volta disso. Cada espaço é avaliado pelo que importa
para trabalhar, e a plataforma ajuda tanto o viajante a escolher quanto o anfitrião a
precificar.

## O que dá pra fazer

**Viajante**
- Buscar espaços por cidade, datas e tipo (casa, coworking, café), com mapa
- Ver a ficha completa do espaço e reservar
- Acompanhar a agenda de eventos da cidade
- Montar o perfil de trabalho que alimenta o **LokScore**, a reputação dentro da plataforma
- Registrar a rota de viagem no **Nomad Tracker**

**Anfitrião**
- Cadastrar espaços e gerenciar reservas no painel
- Receber sugestão de preço pelo **Price Optimizer**
- Receber avaliações *double-blind*: nenhum lado vê a nota do outro antes de avaliar

**Empresa (B2B)**
- Cadastrar a empresa e convidar viajantes da equipe
- Definir política de viagem (limites, aprovação obrigatória)
- Aprovar reservas por link, acompanhar gastos, relatórios e faturamento

## Stack

| Camada | Ferramentas |
| --- | --- |
| Front-end | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion |
| Dados e estado | TanStack Query, React Hook Form + Zod |
| Back-end | Supabase (Postgres, Auth, Row Level Security, migrations em SQL) |
| Mapas e pagamento | Leaflet, Google Maps, Pagar.me |

## Rodando localmente

Precisa do Node 20+ e de um projeto no [Supabase](https://supabase.com).

```bash
git clone https://github.com/pablinrlq/Lokvia.git
cd Lokvia
npm install
cp .env.example .env   # preencha as chaves do Supabase, Pagar.me e Google Maps
npm run dev
```

As tabelas ficam em `supabase/migrations`. Rode os arquivos no SQL Editor do Supabase,
na ordem do nome.

## Estrutura

```
src/
├── pages/           telas (busca, espaço, painéis de hóspede e anfitrião)
│   └── corp/        área da empresa: viajantes, política, reservas, faturamento
├── components/      UI e blocos de negócio (lokscore, nomad, host, spaces)
├── features/corp/   gráficos e KPIs do painel corporativo
├── contexts/        sessão e autenticação
└── lib/             cliente do Supabase e utilitários
supabase/migrations/ schema do banco
```

## O que aprendi

- Modelar um marketplace com três tipos de usuário e permissões diferentes usando RLS no Postgres
- Separar a camada B2C da B2B sem duplicar regra de negócio
- Avaliação *double-blind* para evitar nota de retaliação
- Organizar um projeto React grande por domínio, não por tipo de arquivo

---

<div align="center">
<sub>Feito por <a href="https://github.com/pablinrlq">Pablo Moises</a></sub>
</div>
