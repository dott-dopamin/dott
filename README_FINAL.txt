DOTT FINAL CLEAN VERSION
========================
Build: 2026-09-24 FINAL CLEAN

목적
- 기존 v33/v35/v61 등으로 흩어진 런타임 파일명을 하나로 통일
- 실제로 사용하는 JS/CSS만 루트에 유지
- 공개/관리자 페이지가 같은 bootstrap/config/store/common/styles 체계를 사용
- database-history는 실행 파일이 아니라 Supabase 변경 이력 보관용으로 유지

현재 루트 런타임 파일
- index.html              예약 캘린더
- boardgames.html         보드게임 공개 페이지
- murder.html             머더미스터리 공개 페이지
- deduction.html          추리게임 공개 페이지
- admin.html              관리자 페이지
- styles.css              공개 + 관리자 공통 스타일
- bootstrap.js           공통 로더
- config.js              공통 설정
- store.js               Supabase/API 데이터 계층
- common.js              공통 UI 함수
- calendar.js            예약 캘린더 기능
- catalog.js             보드게임/추리게임 기능
- admin.js               관리자 기능

정리하면서 제거한 중복 런타임
- bootstrap-v33.js / bootstrap-v35.js
- styles-v33.css / styles-v35.css
- config-v35.js
- store-v33.js / store-v35.js
- common-v35.js 및 구 common.js 중복
- catalog-v33.js / catalog-v61.js
- admin-v35.js

배포 방법
1) GitHub 저장소의 기존 사이트 파일을 안전하게 백업합니다.
2) 이 폴더의 루트 파일들을 저장소 루트에 업로드합니다.
3) 기존의 버전 파일(v33/v35/v61 등)은 삭제해도 됩니다.
4) database-history 폴더는 기록용이므로 그대로 함께 두어도 됩니다.
5) Commit 후 GitHub Pages 배포 완료 뒤 Ctrl+F5 또는 모바일 새로고침으로 확인합니다.

주의
- Supabase 데이터/테이블 구조는 변경하지 않았습니다.
- SQL 실행이 필요한 변경은 없습니다.
- murder.html의 공지 팝업 및 온라인 배지 로직은 기존 최신 상태를 그대로 유지했습니다.
- boardgames/deduction의 모바일 표, 확장 배지, 5칸 난이도 게이지, 시간 범위 입력 출력 기능은 기존 최신 상태를 유지했습니다.
