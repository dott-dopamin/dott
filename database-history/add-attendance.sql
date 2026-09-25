-- DOTT 출석관리 기능 추가
-- Supabase > SQL Editor > + 새 쿼리 > 전체 붙여넣기 > Run
-- 기존 일정/공지/게임 데이터는 건드리지 않습니다.

create extension if not exists pgcrypto;

create table if not exists public.attendance_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  joined_at date not null default current_date,
  last_attended_at date,
  grace boolean not null default false,
  grace_reason text not null default '',
  member_status text not null default 'active' check (member_status in ('active','left')),
  is_staff boolean not null default false,
  left_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attendance_members enable row level security;

-- 출석 명단은 운영진 전용: 로그인한 관리자만 조회 가능
drop policy if exists "auth read attendance" on public.attendance_members;
create policy "auth read attendance" on public.attendance_members
  for select to authenticated using (true);

drop policy if exists "auth insert attendance" on public.attendance_members;
create policy "auth insert attendance" on public.attendance_members
  for insert to authenticated with check (true);

drop policy if exists "auth update attendance" on public.attendance_members;
create policy "auth update attendance" on public.attendance_members
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete attendance" on public.attendance_members;
create policy "auth delete attendance" on public.attendance_members
  for delete to authenticated using (true);

create index if not exists attendance_members_name_idx on public.attendance_members (name);
