DOTT database-history
=====================
이 폴더의 SQL은 Supabase 변경 이력 보관용입니다.

주의:
- 이미 정상 운영 중인 DB에는 임의로 다시 실행하지 마세요.
- 새 DB를 처음부터 구축하는 단일 통합 스키마 파일이 아닙니다.
- 특정 기능 복구/점검 시 어떤 변경이 적용됐는지 확인하기 위한 기록입니다.

최근 이력:
- add-accounting.sql: 회비/회계/월 마감/영수증
- add-rental-loans.sql: 대여 관리대장
- add-rental-tooltip-fields.sql: 현재 대여자 표시 필드
- add-self-rental-page.sql: QR 셀프 대여 RPC
- fix-fee-payment-sync.sql: 회비 납부 + 장부 동기화 RPC

- add-accounting-multi-receipts.sql: 회계 내역별 영수증 여러 장 첨부 + 기존 1장 데이터 자동 이전
