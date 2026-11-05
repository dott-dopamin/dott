/* DOPAMIN MYSTERY — solo playable prototype, case 001 (fictional characters and events). */
(()=>{
  'use strict';
  const app=document.getElementById('app');
  const STORAGE_KEY='dott_mystery_wednesday_case001_v6';
  const title='수요일의 일격';
  const incident='20:58';
  const rooms=['정모실','회의실','창고','출입구'];
  const suspects=[
    {id:'daeun',name:'허다은',emoji:'📅',role:'캘박 누락에 폭발 직전',motive:'장한철이 수요일 참석 일정을 또 캘박하지 않아 예약이 겹쳤고, 뒷수습은 매번 다은의 몫이었다.',statement:'“20시 54분부터 21시 01분까지 회의실에서 화상통화를 했어요. 20시 58분에도 예약자 질문에 직접 대답했고요.”',detail:'통화 중 옆 정모실에서 쿵 하는 소리를 들었으나 의자가 넘어진 소리로 생각했다. 통화 후 정리 메모를 남겼다.'},
    {id:'seungmin',name:'손승민',emoji:'🧗',role:'클라이밍 얘기에 지친 회원',motive:'보드게임 모임인데 회장은 틈만 나면 클라이밍 얘기. “도파민이 클라이밍 동호회냐”는 말까지 했다.',statement:'“20시 53분에 창고로 들어가서 21시 02분까지 카드랑 게임을 정리했어요. 중간에 나가지 않았습니다.”',detail:'평소 카드 보관함을 자주 정리하던 담당이었다. 정확히 언제 마지막으로 만졌는지는 기록을 확인해야 한다. 사건 시각에는 창고에 있었다고 주장한다.'},
    {id:'jihoon',name:'박지훈',emoji:'🌙',role:'23시 벙 시작에 지친 회원',motive:'일찍 시작한다던 벙을 회장이 또 23시 10분으로 늦췄다. 지훈은 다음 날 아침 일찍 출근해야 했다.',statement:'“20시 55분에 간식 사러 편의점에 갔어요. 20시 57분 결제 영수증도 있고 21시 04분까지 매장에 있었어요. 그때 도트 안에 없었죠.”',detail:'사건 직후 편의점 영수증을 먼저 내밀며 결백을 주장했다. 회장에게 늦은 벙 시작을 항의한 메시지가 남아 있다.'},
    {id:'jei',name:'서제이',emoji:'🚭',role:'담배 냄새에 질린 회원',motive:'장한철의 흡연 후 실내에 남는 담배 냄새가 싫었고 늦은 벙 시작에도 불만이 쌓였다.',statement:'“20시 55분에 답답해서 건물 밖으로 나갔고, 21시 02분 30초에 다시 들어왔어요. 문 CCTV랑 출입 기록 확인해보세요.”',detail:'그날도 회장의 흡연 습관에 항의했다. 그러나 사건 시각에는 건물 밖에 있었다고 주장한다.'}
  ];
  const clues=[
    {id:'da-note',phase:1,room:'정모실',icon:'🗒️',name:'찢긴 수요일 일정표',summary:'피해자 의자 아래에서 발견된 종이. 허다은의 불만이 그대로 남아 있다.',text:'회장 의자 아래서 발견된 수요일 일정표. 종이 끝은 찢어져 있고 허다은의 글씨로 “캘박은 안 하시면서 도트는 왜 오세요?”가 적혀 있다. 일정 등록 문제로 다툰 건 사실이지만 종이가 언제 바닥에 떨어졌는지는 알 수 없다.'},
    {id:'prints',phase:1,room:'정모실',icon:'🖐️',name:'금속 카드함의 지문',summary:'바닥에 떨어진 무거운 카드함. 손잡이에 손승민의 지문이 발견됐다.',text:'금속 카드 보관함은 정모실 책상 아래에서 발견됐으며 한쪽 모서리에 새 충돌 흔적이 있다. 손잡이에서 나온 선명한 지문은 손승민의 것과 일치한다. 그러나 지문은 접촉 시각을 말해주지 않는다.'},
    {id:'spray',phase:1,room:'정모실',icon:'🧴',name:'회장 의자 아래의 탈취제',summary:'“담배 냄새 좀 그만!”이라는 쪽지가 붙은 서제이의 물건.',text:'장한철이 쓰러진 의자 아래서 서제이 이름이 적힌 탈취제 병이 발견됐다. 병에는 “담배 냄새 좀 그만!”이라는 쪽지가 붙어 있다. 의자 주변 물건들이 흩어져 있어 누가 언제 그곳에 뒀는지는 불명이다.'},
    {id:'receipt',phase:1,room:'출입구',icon:'🧾',name:'20시 57분 편의점 영수증',summary:'박지훈이 알리바이라며 제출한 영수증. 결제 방식 부분은 접혀 있다.',text:'박지훈은 20시 55분에 편의점으로 나갔다고 진술하며 20시 57분 승인 영수증 사진을 보여줬다. 점포명과 승인 시각만 보이고 결제 방식은 접힌 부분에 가려져 있다. 영수증이 그 시간에 실제로 매장에 있었다는 증거인지는 추가 확인이 필요하다.'},
    {id:'call',phase:2,room:'회의실',icon:'💻',name:'화상통화·충격 시각 검증팩',summary:'허다은의 통화 영상, 사건 충격음, 피해자 기기·감식 기록을 대조한다.',text:'회의실 화상통화 원본에는 허다은이 20시 54분부터 21시 01분까지 얼굴을 보이며 연속 대화한 기록이 있다. 20시 58분 12초 정모실 방향에서 “쿵” 소리가 녹음됐고, 다은은 화면을 벗어나지 않은 채 바로 질문에 답했다. 한철의 스마트워치에도 20시 58분 13초 강한 충격이 기록돼 있다. 응급 진료·현장 감식 요약에서는 머리 측면 타박이 금속 카드함 모서리와 형태상 부합해 외부 충격이 의심된다. 이 자료만으로 범인을 특정할 수는 없다.'},
    {id:'warehouse',phase:2,room:'창고',icon:'📦',name:'창고 출입 기록·20시 45분 사진',summary:'손승민의 실제 동선과 카드함을 이전에 만졌을 가능성을 확인한다.',text:'20시 45분 단체방에 올라온 준비 사진에는 손승민이 금속 카드함 손잡이를 잡고 정모실 책상으로 옮긴 모습이 있다. 따라서 지문은 사건 전 접촉으로 남았을 수 있다. 창고 문·복도 기록에는 20시 53분 04초 손승민이 출입구 하나뿐인 창고에 들어간 뒤 21시 02분 06초에야 나왔다고 남아 있다. 사건 추정 시각에는 창고 밖으로 나온 흔적이 없다.'},
    {id:'group',phase:2,room:'정모실',icon:'📷',name:'20시 50분 사진·출입 검증팩',summary:'서제이의 탈취제가 사건 전에 어디 있었는지, 당시 동선은 어땠는지 확인한다.',text:'20시 50분 단체사진 원본을 확대하면 서제이 이름이 적힌 탈취제가 이미 정모실 책상 위에 놓여 있다. 사건 후 의자 아래에 떨어져 있던 경위 자체는 불명이다. 출입문 양방향 인증 로그와 얼굴이 식별되는 출입구 영상에는 제이가 20시 55분에 퇴실해 21시 02분 30초에야 재입실한 모습이 남아 있다. 비상구 경보와 다른 외부인 출입 기록은 없다.'},
    {id:'gatevideo',phase:2,room:'출입구',icon:'📹',name:'출입구 CCTV·편의점 원거래',summary:'20시 59분 퇴실 영상과 20시 57분 결제 방식, 21시 04분 수령 내역.',text:'출입구 CCTV에는 박지훈 본인이 20시 59분 06초 도트 안에서 밖으로 나가는 모습이 찍혀 있다. 다시 들어온 시각은 21시 06분 35초다. 편의점 원거래 내역을 확인하니 20시 57분 승인은 매장에서의 결제가 아니라 모바일 앱 사전결제였으며, 실제 물건 수령은 21시 04분이었다. 편의점은 도트에서 약 150m 거리여서 퇴실 후 방문 동선도 성립한다. “20시 55분부터 편의점 안에 있었다”는 진술은 본인 퇴실 영상과 모순된다.'}
  ];
  const caseTimeline=[
    {at:'20:45',src:'warehouse',desc:'손승민이 금속 카드함을 정모실로 옮긴 사진'},
    {at:'20:48',src:null,desc:'장한철이 본게임 23시 10분 시작을 공지'},
    {at:'20:50',src:'group',desc:'정모실 책상 위 탈취제가 단체사진에 찍힘'},
    {at:'20:53:04',src:'warehouse',desc:'손승민 창고 입실'},
    {at:'20:54',src:'call',desc:'허다은 화상통화 시작'},
    {at:'20:55',src:'group',desc:'서제이 건물 퇴실'},
    {at:'20:57',src:'receipt',desc:'박지훈 영수증 결제 승인 시각'},
    {at:'20:57',src:'gatevideo',desc:'상세 거래에서 모바일 사전결제로 확인'},
    {at:'20:58:12',src:'call',desc:'정모실 방향 충격음 녹음'},
    {at:'20:58:13',src:'call',desc:'스마트워치 충격 기록'},
    {at:'20:59:06',src:'gatevideo',desc:'박지훈 건물 안에서 밖으로 퇴실'},
    {at:'21:01',src:'call',desc:'허다은 화상통화 종료'},
    {at:'21:02:06',src:'warehouse',desc:'손승민 창고에서 나옴'},
    {at:'21:02:30',src:'group',desc:'서제이 건물 재입실'},
    {at:'21:04',src:'gatevideo',desc:'박지훈 편의점 상품 실제 수령'},
    {at:'21:06:35',src:'gatevideo',desc:'박지훈 도트 재입실'},
    {at:'21:07',src:null,desc:'허다은이 쓰러진 장한철 발견'}
  ];
  const clueIds=new Set(clues.map(x=>x.id));
  const suspectIds=new Set(suspects.map(x=>x.id));
  const leadIds=clues.filter(c=>c.phase===1).map(c=>c.id);
  const secondIds=clues.filter(c=>c.phase===2).map(c=>c.id);
  const MIN_CLUES_TO_SUBMIT=clues.length;
  function proofChecks(){
    return [
      {label:'1차 의심 단서 4개 확인',done:leadIds.every(id=>state.clues.includes(id))},
      {label:'용의자 네 명 면담',done:suspects.every(p=>state.interviewed.includes(p.id))},
      {label:'2차 검증 단서 4개 대조',done:secondIds.every(id=>state.clues.includes(id))}
    ];
  }
  function canUnlockRound2(){
    return state.phase===1&&leadIds.every(id=>state.clues.includes(id))&&suspects.every(p=>state.interviewed.includes(p.id));
  }
  function canSubmit(){
    return state.phase===2&&proofChecks().every(c=>c.done);
  }
  function defaults(){return {started:false,phase:1,clues:[],interviewed:[],contradictions:[],submitted:false,answer:null};}
  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaults();
      return {
        started:saved.started===true,
        phase:saved.phase===2?2:1,
        clues:Array.isArray(saved.clues)?[...new Set(saved.clues.filter(id=>clueIds.has(id)))]:[],
        interviewed:Array.isArray(saved.interviewed)?[...new Set(saved.interviewed.filter(id=>suspectIds.has(id)))]:[],
        contradictions:Array.isArray(saved.contradictions)?[...new Set(saved.contradictions.filter(id=>suspectIds.has(id)))]:[],
        submitted:saved.submitted===true,
        answer:saved.answer&&typeof saved.answer==='object'?saved.answer:null
      };
    }catch(err){return defaults();}
  }
  let state=load();
  const ui={view:'home',tab:'investigate',room:'정모실',suspect:'daeun',selectedClue:null,feedback:''};
  const escText=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(err){}};
  const button=(action,label,cls='',extra='')=>'<button type="button" class="mystery-btn '+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
  const note=(name,body)=>'<div class="mystery-note"><strong>'+name+'</strong><p>'+body+'</p></div>';
  function home(){
    return '<div class="mystery-kicker">DOPAMIN ORIGINAL MYSTERY · CASE 001</div>'+
      '<h1 class="mystery-title">수요일의 일격</h1>'+
      '<p class="mystery-lead">주 6일 일하는 도파민 회장 장한철. 수요일 하루 쉬는 날, 도트에서 누군가에게 얻어맞고 기절했다. 범인은 대체 누구일까?</p>'+
      '<div class="mystery-grid"><section class="mystery-panel mystery-card">'+
      '<div class="mystery-case-symbol" aria-hidden="true">🕵️‍♀️</div>'+
      '<div class="mystery-kicker">허구의 코믹 추리 사건 · 체험판</div>'+
      '<h2>《누가 장한철을 때렸나?》</h2>'+
      '<p>유력 용의자는 허다은, 손승민, 박지훈, 서제이. 전원 수상한 동기가 있고 제각기 다른 알리바이를 주장한다. 진술과 시간을 대조해 거짓말을 찾아내자.</p>'+
      '<div class="mystery-meta"><span class="mystery-pill">👤 1인용</span><span class="mystery-pill">⏱ 체험판 약 15~25분</span><span class="mystery-pill">🔍 입문~중간</span></div>'+
      '<div class="mystery-actions">'+button('intro','사건 브리핑 보기','mystery-btn-primary')+
      (state.started?button('resume','이어서 수사하기'):'')+'</div></section>'+
      '<aside class="mystery-panel"><h3>수사 방법</h3>'+
      '<p>① 사건 브리핑 확인</p><p>② 증거 이미지 4개 조사</p><p>③ 네 사람의 진술 심문</p><p>④ 2차 증거 카드 4개 대조</p><p>⑤ 범인·동기·도구·결정적 증거 지목</p>'+
      '<div class="mystery-divider"></div><p class="mystery-subtle">※ 실제 인물과는 무관한 가상의 사건입니다. 수사 기록은 현재 브라우저에만 저장됩니다.</p>'+
      '</aside></div>';
  }
  function intro(){
    return '<div class="mystery-kicker">CASE 001 · 사건 브리핑</div><h1 class="mystery-title">《수요일의 일격》</h1>'+
      '<div class="mystery-panel"><h2>20시 58분, 도트에서 무슨 일이?</h2>'+
      '<div class="mystery-story">도파민 회장 장한철은 주 6일 근무한다. 유일하게 쉬는 수요일이면 그토록 기다리던 도트로 향한다.\n\n그날도 한철은 신이 나서 외쳤다.\n“오늘 본게임은 23시 10분부터! 그전엔 클라이밍 썰 풀어드림ㅋㅋ”\n\n회원들의 표정은 일제히 굳어졌다.\n\n20시 58분 무렵, 정모실 쪽에서 “쿵!” 소리가 났다. 하지만 당시에는 아무도 대수롭지 않게 여겼다.\n\n21시 07분, 회의실 통화를 끝내고 메모를 정리하던 허다은이 정모실에 들렀다가 쓰러진 한철을 발견했다. 곧바로 구조 요청이 이뤄졌고, 다행히 한철은 의식을 회복했다. 다만 공격자는 기억하지 못한다.\n\n그날 도트에 있던 인물은 회장과 네 명의 회원뿐이었다. 용의자 이름은 허다은, 손승민, 박지훈, 서제이.\n\n네 사람은 모두 한철에게 불만이 있었다. 하지만 이유가 있다고 모두 범인은 아니다. 사건 시각, 현장 물건의 위치, 출입 기록과 진술이 맞물리는지 조사하라.</div>'+
      '<div class="mystery-actions">'+button('start',state.submitted?'처음부터 재수사':state.started?'조사 이어하기':'사건 조사 시작','mystery-btn-primary')+button('home','사건 목록으로')+'</div></div>';
  }
  const visualScenes={
    'da-note':'<div class="ev-object ev-paper"><div class="ev-paper-top">수요일 일정표 <span>20:49</span></div><div class="ev-paper-lines">□ 정모 준비<br>☒ 예약 중복<br>□ 회장 캘박 확인</div><div class="ev-paper-hand">캘박은 안 하시면서<br>도트는 왜 오세요?</div><div class="ev-paper-tear"></div></div>',
    'prints':'<div class="ev-object ev-metal"><div class="ev-metal-top">DOTT CARD BOX</div><div class="ev-metal-lock">▣</div><div class="ev-print">◎</div><div class="ev-metal-foot">지문 채취 구역 · 01</div></div>',
    'spray':'<div class="ev-chair"></div><div class="ev-object ev-bottle"><span class="ev-nozzle"></span><div class="ev-bottle-label">탈취제<small>서제이</small></div></div><div class="ev-note-yellow">담배 냄새<br>좀 그만!</div>',
    'receipt':'<div class="ev-object ev-receipt"><div class="ev-center">24 HOURS · 편의점</div><div class="ev-dashed"></div><div>결제 승인　20:57</div><div>상품　　　간식 외</div><div>합계　　　6,700원</div><div class="ev-dashed"></div><div class="ev-obscured">결제 수단　██████</div><div class="ev-barcode">|||| ||| ||||| ||</div></div>',
    'call':'<div class="ev-object ev-laptop"><div class="ev-display"><div class="ev-face">●<span>●</span></div><div class="ev-display-top">회의실 · 화상통화</div><div class="ev-time">20:58:12</div><div class="ev-sound">▂▃▆▇▃▁</div></div><div class="ev-keyboard"></div></div><div class="ev-small-evidence">⌚ 20:58:13 · 충격 기록</div>',
    'warehouse':'<div class="ev-cctv"><div class="ev-cctv-head">CAM 03 · STORAGE</div><div class="ev-door-shape"><span>03</span></div><div class="ev-cctv-times"><span>IN 20:53:04</span><span>OUT 21:02:06</span></div></div><div class="ev-photo-tag">📷 20:45 · 카드함 이동 기록</div>',
    'group':'<div class="ev-object ev-photo"><div class="ev-photo-title">DOTT · 20:50</div><div class="ev-photo-desk"><div class="ev-mini-box"></div><div class="ev-mini-spray"></div></div><div class="ev-red-ring"></div><div class="ev-photo-caption">책상 위 탈취제</div></div><div class="ev-small-evidence">출입 영상 20:55 → 21:02:30</div>',
    'gatevideo':'<div class="ev-cctv ev-exit"><div class="ev-cctv-head">CAM 01 · EXIT</div><div class="ev-cctv-person"><span>●</span><i></i></div><div class="ev-time">20:59:06</div></div><div class="ev-payment"><div>편의점 원거래</div><strong>20:57 · 앱 선결제</strong><small>수령 21:04</small></div>'
  };
  function evidenceArt(c){
    return '<div class="evidence-art evidence-art--'+escText(c.id)+'" aria-hidden="true">'+(visualScenes[c.id]||'')+
      '<span class="ev-photo-label">EVIDENCE / '+String(clues.indexOf(c)+1).padStart(2,'0')+'</span></div>';
  }
  function investigate(){
    const items=clues.filter(c=>c.phase===state.phase);
    const leadCount=leadIds.filter(id=>state.clues.includes(id)).length;
    const secondCount=secondIds.filter(id=>state.clues.includes(id)).length;
    const selected=clues.find(c=>c.id===ui.selectedClue&&state.clues.includes(c.id));
    return '<div class="mystery-stage-head"><div><div class="mystery-kicker">INVESTIGATION · ROUND '+(state.phase===1?'01':'02')+'</div>'+
      '<h2 class="mystery-section-title">'+(state.phase===1?'1차 · 의심스러운 물증':'2차 · 알리바이 검증')+'</h2></div>'+
      '<span class="mystery-stage-count">'+(state.phase===1?leadCount:secondCount)+' / 4 확보</span></div>'+
      '<p class="mystery-subtle">'+(state.phase===1?'누구에게나 의심스러운 흔적이 있습니다. 네 가지 증거를 확보하고 네 명을 심문하세요.':'주장과 시간을 대조할 수 있는 기록 네 가지가 추가 공개됐습니다. 이미지와 설명을 자세히 살펴보세요.')+'</p>'+
      '<div class="evidence-card-grid">'+items.map(c=>'<button class="evidence-card '+(state.clues.includes(c.id)?'evidence-collected':'')+'" type="button" data-action="clue" data-id="'+c.id+'">'+
      evidenceArt(c)+'<div class="evidence-card-copy"><strong>'+escText(c.name)+'</strong><p>'+escText(c.summary)+'</p><span class="evidence-card-status">'+(state.clues.includes(c.id)?'✓ 수사 수첩에 확보됨':'⌕ 증거 조사하기')+'</span></div></button>').join('')+'</div>'+
      (selected?'<div class="evidence-detail" role="status"><div class="mystery-kicker">EVIDENCE FILE OPENED</div><h3>'+selected.icon+' '+escText(selected.name)+'</h3>'+evidenceArt(selected)+'<p>'+escText(selected.text)+'</p><div class="mystery-actions">'+button('notebook','수사 수첩에서 확인')+'</div></div>':'')+
      (state.phase===1?'<div class="mystery-note"><strong>2차 조사 잠금</strong><p>1차 증거 '+leadCount+' / 4 · 면담 '+state.interviewed.length+' / 4명</p>'+
      (canUnlockRound2()?button('unlock-round2','2차 증거 4개 공개하기','mystery-btn-primary'):'<p>증거 네 개를 모두 조사하고 용의자 네 명에게 말을 걸면 열립니다.</p>')+'</div>':
      '<div class="mystery-success">2차 증거 '+secondCount+' / 4개 확보 · 최종 추리에서 범인과 범행 도구를 선택할 수 있습니다.</div>');
  }
  function interview(){
    const p=suspects.find(x=>x.id===ui.suspect)||suspects[0];
    const found=clues.filter(c=>state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">용의자 심문</h2><p class="mystery-subtle">모든 인물에게 의심할 만한 동기가 있어요. 그러나 동기만으로 범인을 단정할 수는 없습니다.</p>'+
      '<div class="mystery-suspect-list">'+suspects.map(s=>
        '<button type="button" class="mystery-suspect '+(ui.suspect===s.id?'active':'')+'" data-action="suspect" data-id="'+s.id+'">'+
        '<span aria-hidden="true">'+s.emoji+'</span><strong>'+s.name+'</strong><small>'+s.role+'</small></button>'
      ).join('')+'</div>'+
      note(p.name+'의 진술',p.statement)+note('의심받는 이유',p.motive)+note('추가 관찰',p.detail)+
      '<label class="mystery-field" for="mystery-claim">진술을 검증할 증거 선택<select id="mystery-claim"><option value="">증거를 골라주세요</option>'+
      found.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+'</select></label>'+
      '<div class="mystery-actions">'+button('present','증거 제시하기','mystery-btn-primary',found.length?'':'disabled')+'</div>'+
      (ui.feedback?'<div class="'+(ui.feedback.startsWith('🔎')?'mystery-success':'mystery-warning')+'" role="status">'+escText(ui.feedback)+'</div>':'')+
      (state.contradictions.includes('jihoon')?'<div class="mystery-success">✓ 누군가의 핵심 알리바이에서 모순을 발견했습니다.</div>':'');
  }
  function notebook(){
    const found=clues.filter(c=>state.clues.includes(c.id));
    const known=caseTimeline.filter(row=>!row.src||state.clues.includes(row.src));
    return '<h2 class="mystery-section-title">수사 수첩</h2><p class="mystery-subtle">확보 '+found.length+' / 8개 · 면담 '+state.interviewed.length+' / 4명</p>'+
      '<h3 class="mystery-section-title">확인된 타임라인</h3>'+
      '<div class="mystery-timeline">'+known.map(row=>
        '<div class="mystery-timeline-row"><time>'+escText(row.at)+'</time><span>'+escText(row.desc)+'</span></div>'
      ).join('')+'</div><div class="mystery-divider"></div><h3>확보한 증거</h3>'+
      (found.length?found.map(c=>note(c.icon+' '+c.name,c.text)).join(''):'<p class="mystery-subtle">수집한 증거가 없습니다.</p>')+
      '<div class="mystery-divider"></div><h3>면담 완료</h3><p class="mystery-subtle">'+
      (state.interviewed.length?state.interviewed.map(id=>suspects.find(s=>s.id===id)?.name).filter(Boolean).join(' · '):'없음')+'</p>';
  }
  function finalGuess(){
    const ready=canSubmit(),checks=proofChecks();
    const evidence=clues.filter(c=>state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">최종 추리</h2><p class="mystery-subtle">증거는 모두 확보했습니다. 서로 다른 기록을 대조해 한 명을 지목하세요. 정답 제출 후 진상이 공개됩니다.</p>'+
      '<div class="mystery-note"><strong>수사 완료 조건</strong>'+checks.map(x=>'<p>'+(x.done?'✓':'□')+' '+escText(x.label)+'</p>').join('')+'</div>'+
      (!ready?'<div class="mystery-warning">🔒 1차 4개 + 2차 4개 증거와 네 명의 진술을 모두 확인하면 제출 가능합니다.</div>':'')+
      '<label class="mystery-field" for="mystery-answer-person">① 범인은?<select id="mystery-answer-person"><option value="">범인 선택</option>'+
      suspects.map(x=>'<option value="'+x.id+'">'+x.name+'</option>').join('')+'</select></label>'+
      '<label class="mystery-field" for="mystery-answer-motive">② 범행 동기는?<select id="mystery-answer-motive"><option value="">동기 선택</option>'+
      '<option value="calendar">캘박을 안 해서</option><option value="climbing">클라이밍 얘기만 해서</option><option value="late">23시 이후에 벙을 시작해서</option><option value="smoking">흡연 문제 때문에</option></select></label>'+
      '<label class="mystery-field" for="mystery-answer-weapon">③ 사용한 물건은?<select id="mystery-answer-weapon"><option value="">도구 선택</option>'+
      '<option value="metalbox">금속 카드 보관함</option><option value="clock">탁상시계</option><option value="mug">머그컵</option><option value="book">두꺼운 룰북</option></select></label>'+
      '<label class="mystery-field" for="mystery-answer-evidence">④ 결정적인 모순을 드러내는 증거는?<select id="mystery-answer-evidence"><option value="">증거 선택</option>'+
      evidence.map(c=>'<option value="'+c.id+'">'+escText(c.name)+'</option>').join('')+'</select></label>'+
      '<div class="mystery-actions">'+button('submit','추리 제출 · 사건의 진상 확인','mystery-btn-primary',ready?'':'disabled')+'</div>'+
      (ui.feedback?'<div class="mystery-warning">'+escText(ui.feedback)+'</div>':'');
  }
  function play(){
    const tabs=[['investigate','🔍 현장 조사'],['interview','💬 용의자 심문'],['notebook','📔 수사 수첩'],['final','⚖️ 최종 추리']];
    return '<div class="mystery-kicker">DOPAMIN MYSTERY · CASE 001 · 수요일</div>'+
      '<h1 class="mystery-title">누가 장한철을 때렸나?</h1>'+
      '<p class="mystery-lead">사건 발생 시각 '+incident+'. 범인, 동기, 사용한 물건을 밝혀 도파민 회장 습격 사건을 종결하세요.</p>'+
      '<div class="mystery-meta"><span class="mystery-pill">'+state.phase+'차 조사</span><span class="mystery-pill">단서 '+state.clues.length+' / '+clues.length+'</span><span class="mystery-pill">면담 '+state.interviewed.length+' / 4</span><span class="mystery-pill">모순 '+state.contradictions.length+'건</span></div>'+
      '<div class="mystery-progress" role="progressbar" aria-label="단서 수집률" aria-valuemin="0" aria-valuemax="'+clues.length+'" aria-valuenow="'+state.clues.length+'"><span style="width:'+(state.clues.length/clues.length*100)+'%"></span></div>'+
      '<div class="mystery-tabs" role="navigation" aria-label="수사 진행 메뉴">'+tabs.map(t=>
        '<button type="button" class="mystery-tab '+(ui.tab===t[0]?'active':'')+'" data-action="tab" data-id="'+t[0]+'">'+t[1]+'</button>'
      ).join('')+'</div><section class="mystery-panel">'+({
        investigate,interview,notebook,final:finalGuess
      }[ui.tab]||investigate)()+'</section>'+
      '<p class="mystery-footer-note">이 사건은 실제 인물을 모티프로 한 가상 코믹 추리극입니다. 진행 기록은 이 브라우저에만 저장됩니다.</p>';
  }
  function result(){
    const a=state.answer||{};
    const score=Number(a.person==='jihoon')+Number(a.motive==='late')+
      Number(a.weapon==='metalbox')+Number(a.evidence==='gatevideo');
    return '<div class="mystery-kicker">CASE 001 · CASE CLOSED</div><h1 class="mystery-title">사건의 진상</h1>'+
      '<div class="mystery-panel"><div class="mystery-result-score">'+score+' / 4 정답</div>'+
      '<p>'+(score===4?'명탐정 인정! 네 사람의 의심스러운 흔적 속에서 진짜 모순을 찾아냈습니다.':'수사를 마쳤습니다. 아래에서 각 단서가 정확히 무엇을 의미했는지 확인해보세요.')+'</p>'+
      '<div class="mystery-divider"></div><h2>그 수요일, 무슨 일이 있었나</h2>'+
      '<div class="mystery-story">범인은 박지훈이었다.\n\n처음에는 네 사람 모두 의심스러웠다. 20시 49분 허다은은 캘박 누락 문제로 한철과 다투고 “캘박은 안 하시면서 도트는 왜 오세요?”라는 글이 적힌 일정표를 보여줬다. 피해자 의자 아래에서 발견된 찢긴 일정표가 바로 그것이었다. 하지만 20시 58분 12초 현장 쪽 충격음이 들릴 때 다은은 옆 회의실의 연속 화상통화 화면에 있었다.\n\n손승민의 지문은 실제로 범행에 쓰인 금속 카드함 손잡이에 있었다. 그러나 그는 20시 45분 그 카드함을 정모실로 옮겼고 당시 촬영 사진에 손잡이를 쥔 모습이 남았다. 이후 20시 53분 04초부터 21시 02분 06초까지 출구 하나뿐인 창고에 있었음이 문 센서와 복도 영상으로 검증됐다.\n\n서제이의 이름이 붙은 탈취제는 회장 의자 아래에서 발견돼 수상했다. 하지만 20시 50분 단체사진에도 같은 병이 정모실 책상 위에 있었다. 제이는 20시 55분 건물 밖으로 나가 21시 02분 30초 돌아온 사실이 출입 로그와 얼굴이 찍힌 CCTV로 확인됐다.\n\n박지훈은 다음 날 출근을 앞두고도 본게임을 밤 11시 10분에 시작하겠다는 회장의 공지에 화가 났다. 그는 20시 55분부터 편의점에 있었다고 주장하면서 20시 57분 결제 영수증을 내보였다. 하지만 그것은 위치를 증명하지 못하는 모바일 선결제였다.\n\n20시 58분 12초 무렵 정모실에서 장한철과 언쟁하던 지훈은 책상에 놓인 무거운 금속 카드 보관함으로 그를 때렸다. 회의실 통화 녹음에는 20시 58분 12초 충격음이, 피해자의 스마트워치에는 20시 58분 13초 충격 움직임이 남았다. 감식 자료에서도 머리 측면 타박과 보관함 모서리의 형태가 부합했다.\n\n결정적인 사실은 20시 59분 06초 박지훈 본인이 도트 안에서 주출입구로 나오는 모습이 CCTV에 찍혔다는 것이다. “20시 55분부터 편의점에 있었다”는 진술과 절대 양립할 수 없다. 그는 건물을 빠져나가 21시 04분 편의점에서 선결제 상품을 수령하고 21시 06분 35초에 돌아왔다.\n\n다른 세 사람의 독립적으로 확인되는 알리바이와 현장 자료를 종합하면, 기록과 일치하는 유일한 가해자는 박지훈이다.\n\n의식을 되찾은 장한철은 정모실을 둘러보고 말했다.\n“...그럼 오늘 벙은 몇 시에 시작해?”\n\n도파민 일동: “회장님 제발요!!!!”</div>'+
      '<div class="mystery-divider"></div><h3>범인처럼 보였던 다른 세 사람</h3>'+
      note('허다은 · 찢긴 일정표','피해자 옆에 남은 분노의 메모는 사실이지만, 회의실 화상통화로 범행 시각의 위치가 검증된다.')+
      note('손승민 · 금속 보관함의 지문','손잡이를 만진 건 사실이지만 20시 45분의 정상적인 이동 과정에서 남겼을 수 있다. 창고 출입 기록이 별도로 존재한다.')+
      note('서제이 · 탈취제와 손글씨','피해자 의자 근처의 물건이지만 20시 50분 사진에 이미 등장한다. 사건 당시 건물 밖에 있었다.')+
      '<div class="mystery-divider"></div><h3>최종 정답</h3>'+
      '<p>범인: <span class="mystery-highlight">박지훈</span></p>'+
      '<p>동기: <span class="mystery-highlight">밤 11시 이후로 밀리는 벙 시작에 대한 불만</span></p>'+
      '<p>도구: <span class="mystery-highlight">정모실에 미리 놓인 금속 카드 보관함</span></p>'+
      '<p>핵심 증거: <span class="mystery-highlight">20시 59분 06초 박지훈 본인의 퇴실 CCTV</span></p>'+
      '<p class="mystery-subtle">중요: 거짓말을 했다는 사실만으로 공격자를 확정하는 것은 아닙니다. 다른 세 사람의 독립 알리바이, 사건 시각의 교차 기록, 범행 도구와 부상 소견을 함께 대조해야 합니다. 이 게임의 시설 및 기록은 가상의 설정입니다.</p>'+
      '<div class="mystery-actions">'+button('restart','처음부터 다시 수사','mystery-btn-primary')+button('home','사건 목록으로')+'</div></div>';
  }
  function render(){
    const html=({home,intro,play,result}[ui.view]||home)();
    app.innerHTML=nav('mystery')+'<main class="mystery-wrap"><div class="mystery-content">'+html+'</div></main>'+footer();
  }
  function tabChange(id){
    if(!['investigate','interview','notebook','final'].includes(id))return;
    ui.tab=id;ui.selectedClue=null;ui.feedback='';
    if(id==='interview'&&!state.interviewed.includes(ui.suspect)){
      state.interviewed.push(ui.suspect);save();
    }
    render();
  }
  app.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');
    if(!el||!app.contains(el))return;
    const action=el.dataset.action,id=el.dataset.id;
    if(action==='home')ui.view='home';
    else if(action==='intro')ui.view='intro';
    else if(action==='start'){if(state.submitted){if(!window.confirm('기존 수사 결과를 지우고 처음부터 다시 할까요?'))return;state=defaults();}state.started=true;save();ui.view='play';ui.tab='investigate';}
    else if(action==='resume')ui.view=state.submitted?'result':'play';
    else if(action==='tab'){tabChange(id);return;}
    else if(action==='clue'){
      const item=clues.find(c=>c.id===id);if(!item||item.phase!==state.phase)return;
      if(!state.clues.includes(id)){state.clues.push(id);save();}
      ui.selectedClue=id;
    }
    else if(action==='unlock-round2'){if(!canUnlockRound2())return;state.phase=2;save();ui.tab='investigate';ui.selectedClue=null;ui.feedback='';}
    else if(action==='suspect'){
      if(!suspectIds.has(id))return;
      ui.suspect=id;ui.feedback='';
      if(!state.interviewed.includes(id)){state.interviewed.push(id);save();}
    }
    else if(action==='notebook'){ui.tab='notebook';ui.feedback='';}
    else if(action==='present'){
      const evidence=document.getElementById('mystery-claim')?.value;
      if(!evidence)ui.feedback='증거를 선택해주세요.';
      else if(!state.clues.includes(evidence))ui.feedback='아직 확보하지 않은 증거입니다.';
      else if(ui.suspect==='jihoon'&&evidence==='gatevideo'){
        ui.feedback='🔎 모순 발견! 박지훈은 20시 55분부터 편의점에 있었다고 했지만, 20시 59분 06초 도트에서 직접 나가는 영상이 있습니다. 20시 57분 승인은 모바일 선결제였어요.';
        if(!state.contradictions.includes('jihoon')){state.contradictions.push('jihoon');save();}
      }else if(ui.suspect==='jihoon'&&evidence==='receipt'){
        ui.feedback='20시 57분 승인 시각은 확인됩니다. 하지만 접힌 부분의 결제 방식과 실제 이동 기록은 아직 확인되지 않았습니다.';
      }else if(ui.suspect==='daeun'&&evidence==='da-note'){
        ui.feedback='허다은: “캘박은 안 하시면서 도트는 왜 오세요? 이거 제가 쓴 거 맞아요. 일정이 꼬여서 화났어요. 종이는 회장님이 갖고 가셨는데요!”';
      }else if(ui.suspect==='daeun'&&evidence==='call'){
        ui.feedback='🔎 화상통화 원본에서 20시 58분 12초 충격음 직후에도 허다은은 회의실 화면에서 실시간 답변하고 있었습니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='prints'){
        ui.feedback='손승민: “카드함 평소에 제가 옮기는데 지문이 없으면 그게 더 이상하죠!” 언제 손잡이를 만졌는지가 중요합니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='warehouse'){
        ui.feedback='🔎 손승민은 20시 45분 카드함을 옮겼고, 20시 53분부터 21시 02분까지 창고 밖으로 나온 기록이 없습니다.';
      }else if(ui.suspect==='jei'&&evidence==='spray'){
        ui.feedback='서제이: “탈취제는 제 거 맞아요. 근데 왜 의자 밑에 있죠? 저는 책상 쪽에 뒀는데요?”';
      }else if(ui.suspect==='jei'&&evidence==='group'){
        ui.feedback='🔎 20시 50분 사진에는 탈취제가 이미 정모실에 있고, 출입 영상은 서제이가 사건 당시 건물 밖에 있었음을 뒷받침합니다.';
      }else ui.feedback='이 증거는 그 사람의 동기나 현장 상태를 보여주지만, 지금 선택한 진술을 직접 뒤집지는 못합니다.';
    }
    else if(action==='submit'){
      if(!canSubmit())return;
      const person=document.getElementById('mystery-answer-person')?.value;
      const motive=document.getElementById('mystery-answer-motive')?.value;
      const weapon=document.getElementById('mystery-answer-weapon')?.value;
      const evidence=document.getElementById('mystery-answer-evidence')?.value;
      if(!person||!motive||!weapon||!evidence)ui.feedback='범인, 동기, 사용한 물건, 핵심 증거까지 모두 선택해주세요.';
      else if(!suspectIds.has(person)||!['calendar','climbing','late','smoking'].includes(motive)||!['metalbox','clock','mug','book'].includes(weapon)||!state.clues.includes(evidence)){ui.feedback='선택 항목 중 확인되지 않은 내용이 있습니다. 수사 기록을 다시 확인해주세요.';}
      else {state.submitted=true;state.answer={person,motive,weapon,evidence};save();ui.view='result';ui.feedback='';}
    }
    else if(action==='restart'){
      if(!window.confirm('기존 수사 기록을 지우고 처음부터 다시 할까요?'))return;
      state=defaults();save();ui.view='intro';ui.tab='investigate';ui.room='정모실';ui.suspect='daeun';ui.selectedClue=null;ui.feedback='';
    }else return;
    render();
  });
  render();
})();