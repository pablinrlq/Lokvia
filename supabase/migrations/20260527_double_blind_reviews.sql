-- LokVia v2.0 — Double-blind reviews
-- Hospede e Anfitriao avaliam às cegas. Reviews só ficam visíveis quando
-- AMBOS os lados tiverem submetido — revelação simultânea via trigger.
-- Janela máxima de 14 dias após o checkout: passa disso, reviews já enviadas
-- são reveladas unilateralmente (anti-deadlock).

create extension if not exists "pgcrypto";

-- ─── Tabela base ─────────────────────────────────────────────────────
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  author_id       uuid not null references public.users(id)    on delete cascade,
  target_id       uuid not null,
  target_type     text not null check (target_type in ('space','guest')),
  rating          smallint not null check (rating between 1 and 5),
  comment         text,
  visible         boolean not null default false,
  released_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (booking_id, author_id, target_type)
);

create index if not exists reviews_booking_idx on public.reviews(booking_id);
create index if not exists reviews_target_idx  on public.reviews(target_id, target_type) where visible;

-- ─── Trigger: revelação simultânea ───────────────────────────────────
create or replace function public.fn_release_double_blind_reviews()
returns trigger
language plpgsql
security definer
as $$
declare
  guest_review_id  uuid;
  host_review_id   uuid;
  release_ts       timestamptz := now();
begin
  -- localiza reviews dos dois lados desta reserva
  select id into guest_review_id
    from public.reviews
   where booking_id = new.booking_id
     and target_type = 'space'   -- guest avaliou o espaço
   limit 1;

  select id into host_review_id
    from public.reviews
   where booking_id = new.booking_id
     and target_type = 'guest'   -- host avaliou o guest
   limit 1;

  -- Se ambas existem → revela as duas simultaneamente
  if guest_review_id is not null and host_review_id is not null then
    update public.reviews
       set visible = true,
           released_at = release_ts
     where id in (guest_review_id, host_review_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_release_reviews on public.reviews;
create trigger trg_release_reviews
  after insert on public.reviews
  for each row
  execute function public.fn_release_double_blind_reviews();

-- ─── Anti-deadlock: revela reviews "órfãs" após 14 dias do checkout ──
-- Roda via pg_cron diariamente, ou pode ser chamado por edge function.
create or replace function public.fn_release_orphan_reviews()
returns void
language plpgsql
security definer
as $$
begin
  update public.reviews r
     set visible = true,
         released_at = now()
    from public.bookings b
   where r.booking_id = b.id
     and r.visible = false
     and b.check_out < (now() - interval '14 days');
end;
$$;

-- Agenda: descomente se pg_cron estiver disponível
-- select cron.schedule('release-orphan-reviews', '0 4 * * *',
--   $$ select public.fn_release_orphan_reviews(); $$);

-- ─── RLS: oculta reviews invisíveis para terceiros ──────────────────
alter table public.reviews enable row level security;

-- O autor SEMPRE vê sua própria review (mesmo que invisível)
create policy reviews_author_select on public.reviews
  for select using (auth.uid() = author_id);

-- Reviews visíveis: todos podem ler
create policy reviews_public_select on public.reviews
  for select using (visible = true);

-- Apenas o autor pode inserir
create policy reviews_author_insert on public.reviews
  for insert with check (auth.uid() = author_id);

-- Updates só pelo autor enquanto invisível (permite editar antes da revelação)
create policy reviews_author_update on public.reviews
  for update using (auth.uid() = author_id and visible = false);
