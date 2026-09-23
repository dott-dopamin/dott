DOTT v35 관리자 독립 패치

원인:
v34 admin.html은 store-v33.js 같은 이전 버전 파일이 GitHub에 존재한다는 전제였습니다.
실제 배포 저장소에서 해당 파일을 찾지 못해 관리자 페이지가 열리지 않았습니다.

이번 패치는 이전 버전 파일에 의존하지 않습니다.
아래 파일 7개를 GitHub dott 저장소 루트에 전부 업로드하세요.
- admin.html
- bootstrap-v35.js
- config-v35.js
- store-v35.js
- common-v35.js
- admin-v35.js
- styles-v35.css

Supabase SQL은 필요 없습니다.
팝업은 X / 취소 / ESC로만 닫히며, 텍스트 드래그 선택 중에는 닫히지 않습니다.
