-- DOTT 일정 대기 시스템
-- 적용일: 2026-11-24
-- 실제 Supabase 프로젝트에는 이미 적용된 이력 파일입니다.

alter table public.schedules
  add column if not exists wait_allowed boolean not null default false;

create table if not exists public.schedule_waits (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  category text not null check (category in ('boardgame','strategy')),
  requester_name text not null check (char_length(btrim(requester_name)) between 1 and 30),
  people integer not null check (people between 1 and 30),
  requested_time time without time zone not null,
  response text null check (response in ('ok','no')),
  created_at timestamptz not null default now(),
  responded_at timestamptz null,
  updated_at timestamptz not null default now()
);

create index if not exists schedule_waits_schedule_id_idx
  on public.schedule_waits(schedule_id);

create index if not exists schedule_waits_created_at_idx
  on public.schedule_waits(created_at);

alter table public.schedule_waits enable row level security;

grant select, insert on table public.schedule_waits to anon;
grant select, insert, update, delete on table public.schedule_waits to authenticated;

drop policy if exists "public read schedule waits" on public.schedule_waits;
create policy "public read schedule waits"
  on public.schedule_waits
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public create schedule waits" on public.schedule_waits;
create policy "public create schedule waits"
  on public.schedule_waits
  for insert
  to anon, authenticated
  with check (
    response is null
    and responded_at is null
    and exists (
      select 1
      from public.schedules s
      where s.id = schedule_id
        and s.wait_allowed = true
        and lower(coalesce(s.status,'')) not in ('취소','cancelled','canceled')
    )
  );

drop policy if exists "admin update schedule waits" on public.schedule_waits;
create policy "admin update schedule waits"
  on public.schedule_waits
  for update
  to authenticated
  using ((select dott_private.is_admin()))
  with check (
    (select dott_private.is_admin())
    and response in ('ok','no')
  );

drop policy if exists "admin delete schedule waits" on public.schedule_waits;
create policy "admin delete schedule waits"
  on public.schedule_waits
  for delete
  to authenticated
  using ((select dott_private.is_admin()));
