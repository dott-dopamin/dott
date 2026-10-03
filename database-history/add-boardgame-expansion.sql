-- DOTT v45: 보드게임 확장 여부
-- Supabase SQL Editor에서 1회 실행

alter table public.catalog_items
  add column if not exists is_expansion boolean not null default false;

notify pgrst, 'reload schema';
