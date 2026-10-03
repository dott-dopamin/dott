-- DOTT 출석관리: 운영진 상단 고정 기능 추가
-- 기존 출석 데이터는 유지됩니다.

alter table public.attendance_members
  add column if not exists is_staff boolean not null default false;

notify pgrst, 'reload schema';
