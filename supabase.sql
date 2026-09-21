-- DOTT 운영용 DB 설치 스크립트
-- Supabase > SQL Editor > New query 에 전체 붙여넣고 Run 하세요.

create extension if not exists pgcrypto;

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  event_time time not null,
  category text not null default 'other',
  title text not null,
  people integer,
  manager text,
  note text,
  status text not null default '예약',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('boardgame','murder','deduction')),
  name text not null,
  min_players integer,
  max_players integer,
  playtime text,
  difficulty text,
  genre text,
  location text,
  status text not null default '보유',
  image_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.schedules enable row level security;
alter table public.notices enable row level security;
alter table public.catalog_items enable row level security;

create table if not exists public.site_settings (
  id text primary key default 'main',
  hero_badge text not null default '◎ 전체 공개 일정',
  hero_title text not null default E'우리의 모든 일정을\n한눈에 확인하세요',
  hero_description text not null default '월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.',
  boardgame_description text not null default '도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.',
  murder_description text not null default '보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.',
  deduction_description text not null default '추리·사건 해결형 게임 보유 목록을 확인하세요.',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- 공개 페이지: 누구나 조회 가능
drop policy if exists "public read schedules" on public.schedules;
create policy "public read schedules" on public.schedules for select to anon, authenticated using (true);
drop policy if exists "public read notices" on public.notices;
create policy "public read notices" on public.notices for select to anon, authenticated using (true);
drop policy if exists "public read catalog" on public.catalog_items;
create policy "public read catalog" on public.catalog_items for select to anon, authenticated using (true);

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "auth insert site settings" on public.site_settings;
create policy "auth insert site settings" on public.site_settings for insert to authenticated with check (true);
drop policy if exists "auth update site settings" on public.site_settings;
create policy "auth update site settings" on public.site_settings for update to authenticated using (true) with check (true);

insert into public.site_settings (id, hero_badge, hero_title, hero_description)
values ('main','◎ 전체 공개 일정',E'우리의 모든 일정을\n한눈에 확인하세요','월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.')
on conflict (id) do nothing;

-- 관리자: 로그인한 사용자만 쓰기 가능
-- 실제 운영에서는 Supabase Auth의 신규 가입을 꺼두고 관리자 계정만 직접 생성하세요.
drop policy if exists "auth insert schedules" on public.schedules;
create policy "auth insert schedules" on public.schedules for insert to authenticated with check (true);
drop policy if exists "auth update schedules" on public.schedules;
create policy "auth update schedules" on public.schedules for update to authenticated using (true) with check (true);
drop policy if exists "auth delete schedules" on public.schedules;
create policy "auth delete schedules" on public.schedules for delete to authenticated using (true);

drop policy if exists "auth insert notices" on public.notices;
create policy "auth insert notices" on public.notices for insert to authenticated with check (true);
drop policy if exists "auth update notices" on public.notices;
create policy "auth update notices" on public.notices for update to authenticated using (true) with check (true);
drop policy if exists "auth delete notices" on public.notices;
create policy "auth delete notices" on public.notices for delete to authenticated using (true);

drop policy if exists "auth insert catalog" on public.catalog_items;
create policy "auth insert catalog" on public.catalog_items for insert to authenticated with check (true);
drop policy if exists "auth update catalog" on public.catalog_items;
create policy "auth update catalog" on public.catalog_items for update to authenticated using (true) with check (true);
drop policy if exists "auth delete catalog" on public.catalog_items;
create policy "auth delete catalog" on public.catalog_items for delete to authenticated using (true);

-- 보유게임 이미지용 공개 Storage 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images','catalog-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=5242880;

drop policy if exists "catalog image upload" on storage.objects;
create policy "catalog image upload" on storage.objects for insert to authenticated with check (bucket_id='catalog-images');
drop policy if exists "catalog image update" on storage.objects;
create policy "catalog image update" on storage.objects for update to authenticated using (bucket_id='catalog-images') with check (bucket_id='catalog-images');
drop policy if exists "catalog image delete" on storage.objects;
create policy "catalog image delete" on storage.objects for delete to authenticated using (bucket_id='catalog-images');
