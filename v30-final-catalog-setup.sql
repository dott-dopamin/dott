-- DOTT v30 FINAL 게임리스트 안전 설정
-- 기존 catalog_items 데이터는 삭제하지 않습니다.
-- 테이블이 없으면 생성하고, 필요한 컬럼/권한만 보완합니다.

create extension if not exists pgcrypto;

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('boardgame','murder','deduction')),
  name text not null,
  min_players integer,
  max_players integer,
  playtime text,
  difficulty text,
  genre text,
  participation_condition integer,
  online_murder boolean not null default false,
  location text,
  status text not null default '보유',
  image_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_items add column if not exists difficulty text;
alter table public.catalog_items add column if not exists genre text;
alter table public.catalog_items add column if not exists participation_condition integer;
alter table public.catalog_items add column if not exists online_murder boolean not null default false;
alter table public.catalog_items add column if not exists status text not null default '보유';
alter table public.catalog_items add column if not exists note text;

alter table public.catalog_items enable row level security;

drop policy if exists "public read catalog" on public.catalog_items;
create policy "public read catalog"
  on public.catalog_items for select
  to anon, authenticated
  using (true);

drop policy if exists "auth insert catalog" on public.catalog_items;
create policy "auth insert catalog"
  on public.catalog_items for insert
  to authenticated
  with check (true);

drop policy if exists "auth update catalog" on public.catalog_items;
create policy "auth update catalog"
  on public.catalog_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth delete catalog" on public.catalog_items;
create policy "auth delete catalog"
  on public.catalog_items for delete
  to authenticated
  using (true);
