-- 기존 DOTT DB에 "메인 화면 문구 편집" 기능만 추가하는 안전한 패치입니다.
-- 기존 일정/공지/게임 데이터는 삭제하지 않습니다.
-- Supabase > SQL Editor > New query 에 전체 붙여넣고 Run 하세요.

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

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "auth insert site settings" on public.site_settings;
create policy "auth insert site settings"
on public.site_settings for insert
to authenticated
with check (true);

drop policy if exists "auth update site settings" on public.site_settings;
create policy "auth update site settings"
on public.site_settings for update
to authenticated
using (true)
with check (true);

insert into public.site_settings (id, hero_badge, hero_title, hero_description)
values (
  'main',
  '◎ 전체 공개 일정',
  E'우리의 모든 일정을\n한눈에 확인하세요',
  '월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.'
)
on conflict (id) do nothing;
