-- DOTT 회비 납부처리 안정화
-- Supabase > SQL Editor 에서 전체 실행 1회
-- 회비 상태 저장과 회계장부 자동등록을 하나의 DB 트랜잭션으로 처리합니다.

create or replace function public.dott_save_fee(
  p_member_id uuid,
  p_member_name text,
  p_fee_month date,
  p_status text,
  p_amount integer,
  p_paid_at date,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fee public.fee_records%rowtype;
  v_fee_month date := date_trunc('month', p_fee_month)::date;
  v_paid_month date;
begin
  if auth.uid() is null then
    raise exception '관리자 로그인이 필요합니다.';
  end if;

  if p_status not in ('paid','unpaid','exempt') then
    raise exception '올바르지 않은 회비 상태입니다.';
  end if;

  if coalesce(p_amount,0) < 0 then
    raise exception '회비 금액을 확인해 주세요.';
  end if;

  if exists(
    select 1 from public.accounting_month_closures
    where month = v_fee_month
  ) then
    raise exception '%년 %월 장부는 이미 마감되었습니다.',
      extract(year from v_fee_month)::int,
      extract(month from v_fee_month)::int;
  end if;

  if p_status='paid' then
    if p_paid_at is null then
      raise exception '납부완료에는 납부일이 필요합니다.';
    end if;

    v_paid_month := date_trunc('month', p_paid_at)::date;

    if exists(
      select 1 from public.accounting_month_closures
      where month = v_paid_month
    ) then
      raise exception '납부일이 마감된 장부에 해당합니다. 납부일을 확인해 주세요.';
    end if;
  end if;

  insert into public.fee_records(
    member_id, member_name, fee_month, status, amount, paid_at, note, updated_at
  )
  values(
    p_member_id,
    p_member_name,
    v_fee_month,
    p_status,
    coalesce(p_amount,5000),
    case when p_status='paid' then p_paid_at else null end,
    coalesce(p_note,''),
    now()
  )
  on conflict(member_id, fee_month)
  do update set
    member_name = excluded.member_name,
    status = excluded.status,
    amount = excluded.amount,
    paid_at = excluded.paid_at,
    note = excluded.note,
    updated_at = now()
  returning * into v_fee;

  if p_status='paid' then
    insert into public.accounting_entries(
      entry_date, entry_type, category, description, party_name,
      amount, note, source_fee_id, member_id, updated_at
    )
    values(
      p_paid_at, '수입', '회비',
      to_char(v_fee_month,'MM')||'월 회비',
      p_member_name,
      coalesce(p_amount,5000),
      coalesce(p_note,''),
      v_fee.id,
      p_member_id,
      now()
    )
    on conflict(source_fee_id)
    do update set
      entry_date = excluded.entry_date,
      entry_type = '수입',
      category = '회비',
      description = excluded.description,
      party_name = excluded.party_name,
      amount = excluded.amount,
      note = excluded.note,
      member_id = excluded.member_id,
      updated_at = now();
  else
    delete from public.accounting_entries
    where source_fee_id = v_fee.id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'fee_id', v_fee.id,
    'status', v_fee.status,
    'fee_month', v_fee.fee_month,
    'paid_at', v_fee.paid_at
  );
end;
$$;

-- 기존 자동 동기화 트리거는 RPC와 중복 실행되지 않도록 제거합니다.
drop trigger if exists sync_fee_to_ledger on public.fee_records;

revoke all on function public.dott_save_fee(uuid,text,date,text,integer,date,text) from public;
grant execute on function public.dott_save_fee(uuid,text,date,text,integer,date,text) to authenticated;

-- 혹시 기존에 '납부완료'인데 장부에 빠진 열린 월 데이터가 있다면 보정
insert into public.accounting_entries(
  entry_date, entry_type, category, description, party_name,
  amount, note, source_fee_id, member_id, updated_at
)
select
  f.paid_at, '수입', '회비',
  to_char(f.fee_month,'MM')||'월 회비',
  f.member_name, f.amount, f.note, f.id, f.member_id, now()
from public.fee_records f
where f.status='paid'
  and f.paid_at is not null
  and not exists (
    select 1 from public.accounting_entries a
    where a.source_fee_id=f.id
  )
  and not exists (
    select 1 from public.accounting_month_closures c
    where c.month=date_trunc('month',f.paid_at)::date
  )
on conflict(source_fee_id) do nothing;
