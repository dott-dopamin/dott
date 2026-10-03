-- DOTT 게임 대여 관리대장
-- Supabase SQL Editor에서 1회 실행하세요.

create table if not exists public.rental_loans (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id text not null,
  game_name text not null,
  borrower text not null,
  rented_at date not null default current_date,
  returned_at date,
  previous_status text not null default '도트',
  created_at timestamptz not null default now()
);

create index if not exists rental_loans_catalog_item_id_idx on public.rental_loans(catalog_item_id);
create index if not exists rental_loans_returned_at_idx on public.rental_loans(returned_at);

alter table public.rental_loans enable row level security;

drop policy if exists "rental_loans_admin_select" on public.rental_loans;
drop policy if exists "rental_loans_admin_insert" on public.rental_loans;
drop policy if exists "rental_loans_admin_update" on public.rental_loans;
drop policy if exists "rental_loans_admin_delete" on public.rental_loans;

create policy "rental_loans_admin_select" on public.rental_loans for select to authenticated using (true);
create policy "rental_loans_admin_insert" on public.rental_loans for insert to authenticated with check (true);
create policy "rental_loans_admin_update" on public.rental_loans for update to authenticated using (true) with check (true);
create policy "rental_loans_admin_delete" on public.rental_loans for delete to authenticated using (true);
