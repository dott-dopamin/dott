-- DOTT QR 셀프 대여 페이지: Supabase SQL Editor에서 1회 실행
create or replace function public.rental_form_options() returns jsonb language sql security definer set search_path=public as $$
select jsonb_build_object('games',coalesce((select jsonb_agg(jsonb_build_object('id',c.id::text,'name',c.name,'kind',c.kind,'status',c.status) order by c.name) from public.catalog_items c where coalesce(c.status,'') not in ('대여중','분실')),'[]'::jsonb),'members',coalesce((select jsonb_agg(a.name order by a.name) from public.attendance_members a where coalesce(a.member_status,'active')<>'left' and nullif(trim(a.name),'') is not null),'[]'::jsonb));$$;
create or replace function public.self_rent_game(p_catalog_item_id text,p_borrower text,p_rented_at date default current_date) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_game public.catalog_items%rowtype; v_ok boolean; v_id uuid;
begin
 if nullif(trim(p_catalog_item_id),'') is null then raise exception '게임을 선택해주세요.'; end if;
 if nullif(trim(p_borrower),'') is null then raise exception '대여자를 선택해주세요.'; end if;
 if p_rented_at is null then p_rented_at:=current_date; end if;
 select * into v_game from public.catalog_items where id::text=p_catalog_item_id for update;
 if not found then raise exception '게임을 찾을 수 없습니다.'; end if;
 if coalesce(v_game.status,'')='대여중' then raise exception '이미 대여중인 게임입니다.'; end if;
 if coalesce(v_game.status,'')='분실' then raise exception '대여할 수 없는 게임입니다.'; end if;
 select exists(select 1 from public.attendance_members a where a.name=trim(p_borrower) and coalesce(a.member_status,'active')<>'left') into v_ok;
 if not v_ok then raise exception '등록된 회원만 대여할 수 있습니다.'; end if;
 if exists(select 1 from public.rental_loans r where r.catalog_item_id=p_catalog_item_id and r.returned_at is null) then raise exception '이미 대여중인 게임입니다.'; end if;
 insert into public.rental_loans(catalog_item_id,game_name,borrower,rented_at,previous_status) values(p_catalog_item_id,v_game.name,trim(p_borrower),p_rented_at,coalesce(nullif(v_game.status,'대여중'),'도트')) returning id into v_id;
 update public.catalog_items set status='대여중',current_borrower=trim(p_borrower),current_rented_at=p_rented_at where id::text=p_catalog_item_id;
 return jsonb_build_object('ok',true,'loan_id',v_id,'game_name',v_game.name);
end;$$;
revoke all on function public.rental_form_options() from public;
revoke all on function public.self_rent_game(text,text,date) from public;
grant execute on function public.rental_form_options() to anon,authenticated;
grant execute on function public.self_rent_game(text,text,date) to anon,authenticated;
