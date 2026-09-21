-- 기존 DOTT DB에 보드게임/머더미스터리/추리게임 페이지 설명 편집 기능을 추가합니다.
-- 기존 일정/공지/게임 데이터는 삭제하지 않습니다.
-- Supabase > SQL Editor > New query 에 전체 붙여넣고 Run 하세요.

alter table public.site_settings
  add column if not exists boardgame_description text not null default '도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.',
  add column if not exists murder_description text not null default '보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.',
  add column if not exists deduction_description text not null default '추리·사건 해결형 게임 보유 목록을 확인하세요.';
