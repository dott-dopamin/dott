-- DOTT 회계 영수증 다중 첨부
-- Supabase > SQL Editor 에서 전체 실행 1회
-- 기존 영수증 1장 데이터도 자동으로 1번 영수증으로 이전합니다.

create extension if not exists pgcrypto;

create table if not exists public.accounting_receipts (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.accounting_entries(id) on delete cascade,
  receipt_path text not null,
  receipt_name text not null default '',
  receipt_type text not null default 'application/octet-stream',
  sort_order integer not null default 1 check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique(entry_id, sort_order)
);

create index if not exists accounting_receipts_entry_idx
  on public.accounting_receipts(entry_id, sort_order);

alter table public.accounting_receipts enable row level security;

drop policy if exists "auth all accounting receipts" on public.accounting_receipts;
create policy "auth all accounting receipts"
  on public.accounting_receipts
  for all
  to authenticated
  using (true)
  with check (true);

-- 마감된 월에는 증빙자료도 추가/수정/삭제할 수 없도록 보호합니다.
create or replace function public.dott_assert_accounting_receipt_month_open()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry_id uuid := coalesce(new.entry_id, old.entry_id);
  v_month date;
begin
  select date_trunc('month', a.entry_date)::date
    into v_month
  from public.accounting_entries a
  where a.id = v_entry_id;

  if v_month is not null
     and exists(
       select 1
       from public.accounting_month_closures c
       where c.month = v_month
     ) then
    raise exception '마감된 월의 영수증은 수정할 수 없습니다. 먼저 월 마감을 해제해 주세요.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists accounting_receipt_month_open_guard on public.accounting_receipts;
create trigger accounting_receipt_month_open_guard
before insert or update or delete on public.accounting_receipts
for each row execute function public.dott_assert_accounting_receipt_month_open();

-- 기존 accounting_entries.receipt_* 1장 데이터를 새 테이블의 1번 영수증으로 이전
insert into public.accounting_receipts(
  entry_id, receipt_path, receipt_name, receipt_type, sort_order
)
select
  a.id,
  a.receipt_path,
  coalesce(a.receipt_name, 'receipt'),
  coalesce(a.receipt_type, 'application/octet-stream'),
  1
from public.accounting_entries a
where a.receipt_path is not null
  and nullif(trim(a.receipt_path),'') is not null
  and not exists(
    select 1
    from public.accounting_receipts r
    where r.entry_id = a.id
      and r.receipt_path = a.receipt_path
  )
on conflict(entry_id, sort_order) do nothing;
