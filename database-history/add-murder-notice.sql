-- DOTT v36: 머더미스터리 전용 이용수칙/공지 팝업 내용 저장 필드
-- Supabase SQL Editor에서 한 번만 실행하면 됩니다.

alter table public.site_settings
  add column if not exists murder_notice text;

update public.site_settings
set murder_notice = coalesce(murder_notice, '')
where id = 'main';
