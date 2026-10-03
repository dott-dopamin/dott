-- DOTT 일정에 "장소 이동 가능" 체크 추가
-- 기존 일정 데이터는 그대로 유지됩니다.

alter table public.schedules
  add column if not exists venue_flexible boolean not null default false;
