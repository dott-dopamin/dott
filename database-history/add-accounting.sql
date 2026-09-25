-- DOTT 회비 · 회계 기능 설치 SQL
-- Supabase > SQL Editor > New query 에 아래 전체를 그대로 붙여넣고 Run 하세요.
-- 기존 일정/출석/게임 데이터는 건드리지 않습니다.

create extension if not exists pgcrypto;

create table if not exists public.fee_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.attendance_members(id) on delete restrict,
  member_name text not null,
  fee_month date not null,
  status text not null default 'unpaid' check (status in ('paid','unpaid','exempt')),
  amount integer not null default 5000 check (amount >= 0),
  paid_at date,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_id, fee_month)
);

create table if not exists public.accounting_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  entry_type text not null check (entry_type in ('수입','지출','발생','지급')),
  category text not null check (category in ('회비','유지비','기타','미지급금','이자수익')),
  description text not null default '',
  party_name text not null default '',
  amount integer not null check (amount > 0),
  note text not null default '',
  receipt_path text,
  receipt_name text,
  receipt_type text,
  source_fee_id uuid unique references public.fee_records(id) on delete cascade,
  member_id uuid references public.attendance_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((category='미지급금' and entry_type in ('발생','지급')) or (category<>'미지급금' and entry_type in ('수입','지출'))),
  check ((category='회비' and source_fee_id is not null) or category<>'회비')
);

create table if not exists public.accounting_month_closures (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  closed_at timestamptz not null default now(),
  closed_by uuid default auth.uid()
);

alter table public.fee_records enable row level security;
alter table public.accounting_entries enable row level security;
alter table public.accounting_month_closures enable row level security;

-- 회계 데이터는 공개하지 않고 로그인한 관리자만 조회/수정합니다.
drop policy if exists "auth all fee records" on public.fee_records;
create policy "auth all fee records" on public.fee_records for all to authenticated using (true) with check (true);
drop policy if exists "auth all accounting entries" on public.accounting_entries;
create policy "auth all accounting entries" on public.accounting_entries for all to authenticated using (true) with check (true);
drop policy if exists "auth all accounting closures" on public.accounting_month_closures;
create policy "auth all accounting closures" on public.accounting_month_closures for all to authenticated using (true) with check (true);

-- 마감된 월은 DB 단계에서도 회비/장부 수정 방지
create or replace function public.dott_assert_accounting_month_open() returns trigger language plpgsql as $$
declare target_month date;
begin
  if tg_table_name='fee_records' then target_month := date_trunc('month', coalesce(new.fee_month, old.fee_month))::date;
  else target_month := date_trunc('month', coalesce(new.entry_date, old.entry_date))::date;
  end if;
  if exists(select 1 from public.accounting_month_closures where month=target_month) then
    raise exception '마감된 월은 수정할 수 없습니다. 먼저 월 마감을 해제해 주세요.';
  end if;
  return coalesce(new,old);
end $$;

drop trigger if exists fee_month_open_guard on public.fee_records;
create trigger fee_month_open_guard before insert or update or delete on public.fee_records for each row execute function public.dott_assert_accounting_month_open();
drop trigger if exists ledger_month_open_guard on public.accounting_entries;
create trigger ledger_month_open_guard before insert or update or delete on public.accounting_entries for each row execute function public.dott_assert_accounting_month_open();

-- 회비 납부완료 ↔ 회계장부 개인별 1건 자동 동기화
create or replace function public.dott_sync_fee_to_ledger() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='paid' then
    if new.paid_at is null then raise exception '납부완료에는 납부일이 필요합니다.'; end if;
    insert into public.accounting_entries(entry_date,entry_type,category,description,party_name,amount,note,source_fee_id,member_id,updated_at)
    values(new.paid_at,'수입','회비',to_char(new.fee_month,'MM')||'월 회비',new.member_name,new.amount,new.note,new.id,new.member_id,now())
    on conflict(source_fee_id) do update set entry_date=excluded.entry_date,party_name=excluded.party_name,amount=excluded.amount,note=excluded.note,member_id=excluded.member_id,updated_at=now();
  else
    delete from public.accounting_entries where source_fee_id=new.id;
  end if;
  return new;
end $$;

drop trigger if exists sync_fee_to_ledger on public.fee_records;
create trigger sync_fee_to_ledger after insert or update of status,amount,paid_at,note,member_name on public.fee_records for each row execute function public.dott_sync_fee_to_ledger();

-- 출석관리에서 이름을 바꾸면 회비/회계의 회원 이름도 같이 변경
create or replace function public.dott_sync_accounting_member_name() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.name is distinct from old.name then
    update public.fee_records f set member_name=new.name,updated_at=now() where f.member_id=new.id and not exists(select 1 from public.accounting_month_closures c where c.month=date_trunc('month',f.fee_month)::date);
    update public.accounting_entries a set party_name=new.name,updated_at=now() where a.member_id=new.id and not exists(select 1 from public.accounting_month_closures c where c.month=date_trunc('month',a.entry_date)::date);
  end if;
  return new;
end $$;
drop trigger if exists sync_accounting_member_name on public.attendance_members;
create trigger sync_accounting_member_name after update of name on public.attendance_members for each row execute function public.dott_sync_accounting_member_name();

-- 회계 영수증: 관리자 전용 비공개 Storage 버킷
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('accounting-receipts','accounting-receipts',false,10485760,array['image/jpeg','image/png','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','application/pdf'];

drop policy if exists "accounting receipt read" on storage.objects;
create policy "accounting receipt read" on storage.objects for select to authenticated using (bucket_id='accounting-receipts');
drop policy if exists "accounting receipt upload" on storage.objects;
create policy "accounting receipt upload" on storage.objects for insert to authenticated with check (bucket_id='accounting-receipts');
drop policy if exists "accounting receipt update" on storage.objects;
create policy "accounting receipt update" on storage.objects for update to authenticated using (bucket_id='accounting-receipts') with check (bucket_id='accounting-receipts');
drop policy if exists "accounting receipt delete" on storage.objects;
create policy "accounting receipt delete" on storage.objects for delete to authenticated using (bucket_id='accounting-receipts');
