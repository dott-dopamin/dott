DOTT 운영 기준본
================
정리일: 2026-10-02
빌드: dott-20261002-maint

현재 배포용 루트 파일
- index.html / calendar.js
- boardgames.html / murder.html / deduction.html / catalog.js
- admin.html / admin.js
- rental.html / rental.css / rental.js
- styles.css
- bootstrap.js / config.js / store.js / common.js

현재 반영된 주요 기능
- 일정/공지/출석/게임목록 관리자
- 보드게임·머더미스터리·추리게임 공통 리스트 구조
- 게임 상태 5종 및 대여중 PC 대여자 툴팁
- 대여 관리대장 + QR 셀프 대여 페이지
- 보드게임 '오늘 뭐하지?' 추천기
- 출석 2개월 경과 14일 전 경고 표시 + 회원 자유 메모
- 회비 개별/일괄 납부 및 회계장부 개별 자동 등록
- 월 마감/해제 및 월별 회계 보고서
- 데이터 JSON 백업/복원
- iPhone 일정 팝업 날짜칸/자동 확대 보정

유지보수 원칙
- database-history 폴더는 이미 적용한 Supabase SQL 이력 보관용입니다.
- 현재 DB가 정상 동작 중이라면 database-history의 SQL을 다시 실행할 필요가 없습니다.
- GitHub Pages 배포 시 루트의 웹 파일을 교체하고, GITHUB_삭제목록.txt에 적힌 오래된 루트 파일은 삭제하세요.
- 기능 추가는 이 기준본에서 이어서 작업합니다.

- 회계 영수증 다중 첨부: 회계 내역 1건에 JPG/PNG/PDF 여러 장 추가 가능, 영수증 보기에서 1번·2번·3번 전환

- 관리자 모바일 전체보기: 보드게임/머더미스터리/추리게임/대여관리/회비·회계 표 가로스크롤 제거
- iPhone 일정 추가/회원 추가 팝업 날짜 입력 높이·폭 통일 및 포커스 자동확대 방지

- 공개 보드게임/머더미스터리/추리게임 목록에 소유주 검색 추가 (공동소유 포함 검색)
