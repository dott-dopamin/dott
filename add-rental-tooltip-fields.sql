-- DOTT PC 대여중 말풍선용 현재 대여 정보
-- 기존 대여관리 SQL 실행 후, Supabase SQL Editor에서 1회 실행하세요.

alter table public.catalog_items
  add column if not exists current_borrower text,
  add column if not exists current_rented_at date;

-- 이미 대여중인 항목도 현재 대여자/대여일을 자동 반영
update public.catalog_items c
set current_borrower = r.borrower,
    current_rented_at = r.rented_at
from public.rental_loans r
where r.catalog_item_id = c.id::text
  and r.returned_at is null;
