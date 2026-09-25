-- DOTT v37: 머더미스터리 공지 버튼 이름 저장 필드
-- Supabase SQL Editor에서 한 번만 실행하면 됩니다.

alter table public.site_settings
  add column if not exists murder_notice_button_label text;

update public.site_settings
set murder_notice_button_label = coalesce(nullif(trim(murder_notice_button_label), ''), '이용수칙 · 공지 보기')
where id = 'main';
