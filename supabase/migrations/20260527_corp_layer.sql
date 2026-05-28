-- LokVia v2.1 — Camada corporativa B2B
-- Tabelas adicionais que se sobrepõem ao modelo B2C existente (users, spaces, bookings).
-- Um user é "viajante corporativo" se tem linha em viajantes_corp.
-- Um user é "admin de empresa" se aparece como admin_id de uma linha em empresas.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════
-- EMPRESAS
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.empresas (
  id                       uuid primary key default gen_random_uuid(),
  admin_id                 uuid not null references public.users(id) on delete restrict,

  nome_fantasia            text not null,
  razao_social             text not null,
  cnpj                     text not null unique,
  inscricao_estadual       text,
  segmento                 text,

  email_financeiro         text not null,
  email_contador           text not null,
  email_rh                 text not null,
  telefone                 text not null,

  cep                      text,
  logradouro               text,
  numero                   text,
  complemento              text,
  bairro                   text,
  cidade                   text,
  estado                   text,

  cartao_token             text,
  fatura_mensal            boolean not null default false,
  limite_mensal            numeric(10,2),

  status                   text not null default 'pendente_verificacao'
                             check (status in ('ativa','suspensa','pendente_verificacao')),
  verificada               boolean not null default false,
  plano                    text not null default 'starter'
                             check (plano in ('starter','business','enterprise')),

  total_viajantes          integer not null default 0,
  total_reservas           integer not null default 0,
  gasto_total              numeric(12,2) not null default 0,

  criado_em                timestamptz not null default now(),
  atualizado_em            timestamptz not null default now()
);

create index if not exists empresas_admin_idx on public.empresas(admin_id);

-- ═══════════════════════════════════════════════════════════════════════
-- POLÍTICAS DE VIAGEM
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.politicas_viagem (
  id                          uuid primary key default gen_random_uuid(),
  empresa_id                  uuid not null references public.empresas(id) on delete cascade,
  nome                        text not null,

  limite_diaria               numeric(10,2) not null default 350,
  limite_mensal_por_viajante  numeric(10,2),
  limite_viagem               numeric(10,2),

  tipos_permitidos            text[] not null default array['hotel','coworking','house','cafe','studio','apartment','loft'],
  categoria_hotel_max         text check (categoria_hotel_max in ('3_estrelas','4_estrelas','5_estrelas')),
  somente_apto_inteiro        boolean not null default false,

  cidades_permitidas          text[] not null default '{}',
  cidades_bloqueadas          text[] not null default '{}',

  antecedencia_minima_horas   integer not null default 0,
  antecedencia_maxima_dias    integer,

  requer_aprovacao            boolean not null default false,
  aprovadores                 uuid[] not null default '{}',
  auto_aprova_abaixo_de       numeric(10,2),

  notificar_gestor_email      boolean not null default true,
  notificar_whatsapp          boolean not null default false,

  ativa                       boolean not null default true,
  criado_em                   timestamptz not null default now()
);

create index if not exists politicas_empresa_idx on public.politicas_viagem(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════
-- VIAJANTES CORPORATIVOS
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.viajantes_corp (
  id               uuid primary key references public.users(id) on delete cascade,
  empresa_id       uuid not null references public.empresas(id) on delete cascade,
  politica_id      uuid not null references public.politicas_viagem(id),
  cargo            text,
  departamento     text,
  centro_de_custo  text,
  gestor_id        uuid references public.users(id),
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now()
);

create index if not exists viajantes_empresa_idx on public.viajantes_corp(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════
-- META CORPORATIVA DA RESERVA
-- (anexada 1:1 a public.bookings)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.reservas_corp_meta (
  booking_id         uuid primary key references public.bookings(id) on delete cascade,
  empresa_id         uuid not null references public.empresas(id),
  viajante_id        uuid not null references public.users(id),
  politica_id        uuid not null references public.politicas_viagem(id),
  centro_de_custo    text,
  motivo_viagem      text,

  status_aprovacao   text not null default 'pendente'
                       check (status_aprovacao in ('auto_aprovada','pendente','aprovada','recusada')),
  aprovador_id       uuid references public.users(id),
  aprovado_em        timestamptz,
  motivo_recusa      text,

  pago_por           text not null default 'cartao_corporativo'
                       check (pago_por in ('cartao_corporativo','fatura_mensal')),
  nf_emitida         boolean not null default false,
  nf_numero          text,
  nf_pdf_url         text,

  dentro_da_politica boolean not null default true,
  alertas_politica   text[] not null default '{}',

  criado_em          timestamptz not null default now()
);

create index if not exists reservas_corp_empresa_idx
  on public.reservas_corp_meta(empresa_id);
create index if not exists reservas_corp_pendentes_idx
  on public.reservas_corp_meta(status_aprovacao)
  where status_aprovacao = 'pendente';

-- ═══════════════════════════════════════════════════════════════════════
-- HOTÉIS (inventário externo)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.hoteis (
  id                       text primary key,
  source                   text not null default 'direto'
                             check (source in ('expedia','hotelbeds','omnibees','direto')),
  source_id                text,

  nome                     text not null,
  categoria                integer check (categoria between 1 and 5),
  descricao                text,

  cidade                   text not null,
  estado                   text not null,
  bairro                   text,
  endereco                 text,
  latitude                 numeric(10,7),
  longitude                numeric(10,7),

  preco_noite_base         numeric(10,2),
  preco_noite_min          numeric(10,2),
  preco_noite_max          numeric(10,2),

  fotos                    text[] not null default '{}',
  amenities                text[] not null default '{}',
  cafe_incluso             boolean not null default false,
  cancelamento_gratuito    boolean not null default true,
  politica_cancelamento    text,

  media_avaliacoes         numeric(3,2) not null default 0,
  total_avaliacoes         integer not null default 0,

  destaque                 boolean not null default false,
  ativo                    boolean not null default true,
  criado_em                timestamptz not null default now(),
  atualizado_em            timestamptz not null default now()
);

create index if not exists hoteis_cidade_idx on public.hoteis(cidade) where ativo;

-- ═══════════════════════════════════════════════════════════════════════
-- CONVITES DE VIAJANTES
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.convites_viajantes (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  email             text not null,
  cargo             text,
  departamento      text,
  centro_de_custo   text,
  politica_id       uuid references public.politicas_viagem(id),
  token             text not null unique default encode(gen_random_bytes(32),'hex'),
  status            text not null default 'pendente'
                      check (status in ('pendente','aceito','expirado')),
  expires_at        timestamptz not null default now() + interval '7 days',
  criado_em         timestamptz not null default now()
);

create index if not exists convites_token_idx on public.convites_viajantes(token);

-- ═══════════════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════════════
alter table public.empresas             enable row level security;
alter table public.politicas_viagem     enable row level security;
alter table public.viajantes_corp       enable row level security;
alter table public.reservas_corp_meta   enable row level security;
alter table public.hoteis               enable row level security;
alter table public.convites_viajantes   enable row level security;

-- Empresas: admin lê/escreve a sua; viajantes leem a empresa em que estão.
create policy empresas_admin_select on public.empresas
  for select using (
    admin_id = auth.uid()
    or exists (
      select 1 from public.viajantes_corp v
       where v.id = auth.uid() and v.empresa_id = empresas.id
    )
  );
create policy empresas_admin_insert on public.empresas
  for insert with check (admin_id = auth.uid());
create policy empresas_admin_update on public.empresas
  for update using (admin_id = auth.uid());

-- Políticas: visíveis para admin da empresa ou viajantes vinculados.
create policy politicas_select on public.politicas_viagem
  for select using (
    exists (
      select 1 from public.empresas e
       where e.id = politicas_viagem.empresa_id and e.admin_id = auth.uid()
    )
    or exists (
      select 1 from public.viajantes_corp v
       where v.id = auth.uid() and v.empresa_id = politicas_viagem.empresa_id
    )
  );
create policy politicas_admin_write on public.politicas_viagem
  for all using (
    exists (
      select 1 from public.empresas e
       where e.id = politicas_viagem.empresa_id and e.admin_id = auth.uid()
    )
  );

-- Viajantes: o próprio + admin da empresa
create policy viajantes_select on public.viajantes_corp
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.empresas e
       where e.id = viajantes_corp.empresa_id and e.admin_id = auth.uid()
    )
  );
create policy viajantes_admin_write on public.viajantes_corp
  for all using (
    exists (
      select 1 from public.empresas e
       where e.id = viajantes_corp.empresa_id and e.admin_id = auth.uid()
    )
  );

-- Meta corporativa: viajante envolvido, admin da empresa, ou aprovador designado
create policy reservas_corp_meta_select on public.reservas_corp_meta
  for select using (
    viajante_id = auth.uid()
    or aprovador_id = auth.uid()
    or exists (
      select 1 from public.empresas e
       where e.id = reservas_corp_meta.empresa_id and e.admin_id = auth.uid()
    )
  );
create policy reservas_corp_meta_insert on public.reservas_corp_meta
  for insert with check (viajante_id = auth.uid());
create policy reservas_corp_meta_update on public.reservas_corp_meta
  for update using (
    aprovador_id = auth.uid()
    or exists (
      select 1 from public.empresas e
       where e.id = reservas_corp_meta.empresa_id and e.admin_id = auth.uid()
    )
  );

-- Hotéis: leitura pública dos ativos
create policy hoteis_public_select on public.hoteis
  for select using (ativo = true);

-- Convites: admin da empresa gerencia
create policy convites_admin on public.convites_viajantes
  for all using (
    exists (
      select 1 from public.empresas e
       where e.id = convites_viajantes.empresa_id and e.admin_id = auth.uid()
    )
  );
-- (a página pública /aceitar-convite/:token consultará via Edge Function service-role)

-- ═══════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════

-- Mantém empresas.total_viajantes em dia
create or replace function public.fn_empresa_recount_viajantes()
returns trigger language plpgsql security definer as $$
declare alvo uuid;
begin
  alvo := coalesce(new.empresa_id, old.empresa_id);
  update public.empresas
     set total_viajantes = (
       select count(*) from public.viajantes_corp
        where empresa_id = alvo and ativo = true
     ),
     atualizado_em = now()
   where id = alvo;
  return new;
end $$;

drop trigger if exists trg_empresa_recount_viajantes on public.viajantes_corp;
create trigger trg_empresa_recount_viajantes
  after insert or update or delete on public.viajantes_corp
  for each row execute function public.fn_empresa_recount_viajantes();

-- Atualiza gasto_total + total_reservas quando uma meta corp é aprovada
create or replace function public.fn_empresa_acrescer_gasto()
returns trigger language plpgsql security definer as $$
declare valor numeric;
begin
  if (tg_op = 'UPDATE'
      and new.status_aprovacao = 'aprovada'
      and old.status_aprovacao is distinct from 'aprovada') then
    select total_amount into valor from public.bookings where id = new.booking_id;
    update public.empresas
       set total_reservas = total_reservas + 1,
           gasto_total    = gasto_total + coalesce(valor, 0),
           atualizado_em  = now()
     where id = new.empresa_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_empresa_acrescer_gasto on public.reservas_corp_meta;
create trigger trg_empresa_acrescer_gasto
  after update on public.reservas_corp_meta
  for each row execute function public.fn_empresa_acrescer_gasto();

-- Atualiza atualizado_em em empresas
create or replace function public.fn_set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists trg_empresas_touch on public.empresas;
create trigger trg_empresas_touch
  before update on public.empresas
  for each row execute function public.fn_set_atualizado_em();

drop trigger if exists trg_hoteis_touch on public.hoteis;
create trigger trg_hoteis_touch
  before update on public.hoteis
  for each row execute function public.fn_set_atualizado_em();
