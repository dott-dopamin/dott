/* DOPAMIN MYSTERY — solo playable prototype, case 001 (fictional characters and events). */
(()=>{
  'use strict';
  const app=document.getElementById('app');
  const STORAGE_KEY='dott_mystery_wednesday_case001_v4';
  const title='수요일의 일격';
  const incident='20:58';
  const rooms=['정모실','회의실','창고','출입구'];
  const suspects=[
    {id:'daeun',name:'허다은',emoji:'📅',role:'캘박 누락에 폭발 직전',motive:'장한철이 수요일 참석 일정을 또 캘박하지 않아 예약이 겹쳤고, 뒷수습은 매번 다은의 몫이었다.',statement:'“20시 54분부터 21시 01분까지 회의실에서 화상통화를 했어요. 20시 58분에도 예약자 질문에 직접 대답했고요.”',detail:'통화 중 옆 정모실에서 쿵 하는 소리를 들었으나 의자가 넘어진 소리로 생각했다. 통화 후 정리 메모를 남겼다.'},
    {id:'seungmin',name:'손승민',emoji:'🧗',role:'클라이밍 얘기에 지친 회원',motive:'보드게임 모임인데 회장은 틈만 나면 클라이밍 얘기. “도파민이 클라이밍 동호회냐”는 말까지 했다.',statement:'“20시 53분에 창고로 들어가서 21시 02분까지 카드랑 게임을 정리했어요. 중간에 나가지 않았습니다.”',detail:'20시 45분에 금속 카드 보관함을 정모실로 옮겨둔 건 인정한다. 이후 20시 53분부터는 창고에 있었다고 주장한다.'},
    {id:'jihoon',name:'박지훈',emoji:'🌙',role:'23시 벙 시작에 지친 회원',motive:'일찍 시작한다던 벙을 회장이 또 23시 10분으로 늦췄다. 지훈은 다음 날 아침 일찍 출근해야 했다.',statement:'“20시 55분에 간식 사러 편의점에 갔어요. 20시 57분 결제 영수증도 있고 21시 04분까지 매장에 있었어요. 그때 도트 안에 없었죠.”',detail:'사건 직후 편의점 영수증을 먼저 내밀며 결백을 주장했다. 회장에게 늦은 벙 시작을 항의한 메시지가 남아 있다.'},
    {id:'jei',name:'서제이',emoji:'🚭',role:'담배 냄새에 질린 회원',motive:'장한철의 흡연 후 실내에 남는 담배 냄새가 싫었고 늦은 벙 시작에도 불만이 쌓였다.',statement:'“20시 55분에 답답해서 건물 밖으로 나갔고, 21시 02분 30초에 다시 들어왔어요. 문 CCTV랑 출입 기록 확인해보세요.”',detail:'그날도 회장의 흡연 습관에 항의했다. 그러나 사건 시각에는 건물 밖에 있었다고 주장한다.'}
  ];
  const clues=[
    {id:'plan',room:'정모실',icon:'🗺️',name:'도트 공간 안내도',text:'이 게임의 가상 도트는 정모실, 회의실, 창고, 주출입구로 이루어진다. 정모실과 회의실은 얇은 벽 하나를 사이에 둔다. 건물에 드나들 수 있는 통로는 주출입구와 비상구뿐이다. 비상구는 열리면 경보가 울리는데 이날 경보·개방 기록이 없었다. 나머지 창문은 모두 고정창이며 손상 흔적이 없다. 20시 45분 당시 내부 인원은 장한철과 네 용의자뿐이고, 21시 07분까지 다른 사람의 출입도 없었다. 모든 디지털 기록의 시각은 같은 표준시로 동기화돼 있다.'},
    {id:'box',room:'정모실',icon:'🗃️',name:'금속 카드 보관함',text:'정모실 책상 아래에 무거운 금속 카드 보관함이 떨어져 있다. 모서리에 새 충돌 자국이 있지만 정확한 용도는 감식 전이다. 손잡이에는 여러 사람의 접촉 흔적이 남았다.'},
    {id:'medical',phase:2,room:'정모실',icon:'🩺',name:'현장 감식·응급 진료 소견',text:'추가 감식에서 피해자 머리 측면의 타박 흔적은 금속 카드 보관함 모서리의 형태·폭과 부합하며, 보관함에는 새 충돌 흔적도 확인됐다. 사고성 낙상보다 외부 충격의 개연성이 높다. 다만 이 소견만으로 누가 사용했는지는 특정할 수 없다.'},
    {id:'watch',phase:2,room:'정모실',icon:'⌚',name:'스마트워치 활동 기록',text:'장한철의 스마트워치는 20시 58분 13초에 강한 충격과 쓰러짐에 해당하는 움직임을 기록했고 이후 활동이 거의 없다. 회의실 화상통화에 기록된 충격음(20시 58분 12초)과 1초 차이다. 의료 기기는 아니며 다른 단서와 함께 봐야 한다.'},
    {id:'clock',room:'정모실',icon:'🕰️',name:'바닥에서 깨진 탁상시계',text:'회장 책상에 있던 시계가 바닥에 떨어져 20시 58분 부근에서 멈췄다. 충격으로 멈춘 시계는 정확한 범행 시간을 확정하지 못한다. 다른 시각 자료가 더 필요하다.'},
    {id:'notice',room:'정모실',icon:'📱',name:'20시 48분 단체방 대화',text:'장한철: “본게임은 오늘도 23시 10분부터! 클라이밍 썰부터 푼다ㅋㅋ” / 허다은: “캘박도 안 해놓고 또요?” / 손승민: “클라이밍 얘기 그만 좀요.” / 박지훈: “내일 출근인데 또 11시 넘게 시작한다고요?” / 서제이: “흡연 문제도 오늘 얘기할 거예요.” 네 명 모두 짜증이 드러나 있다.'},
    {id:'transfer',room:'정모실',icon:'📷',name:'20시 45분 준비 사진',text:'손승민이 20시 45분 단체방에 “카드함 정모실 책상 위로 옮겨놨어요”라며 사진을 올렸다. 사진에 카드함 손잡이를 붙잡은 승민의 손이 보인다. 이때의 접촉이 사건 후 지문의 원인일 수도 있다.'},
    {id:'group',room:'정모실',icon:'👥',name:'20시 50분 단체 사진',text:'원본 촬영 시각은 20시 50분. 네 용의자와 장한철이 한 화면에 있다. 사진 구석에는 정모실 책상 위의 금속 카드함과 작은 탈취제 병이 보인다. 범행 시각의 누구 위치까지 증명하는 사진은 아니다.'},
    {id:'da-note',room:'정모실',icon:'🗒️',name:'바닥에 떨어진 찢긴 일정표',text:'피해자 의자 아래에서 찢어진 수요일 일정표가 나왔다. 허다은의 필체로 “캘박은 안 하시면서 도트는 왜 오세요?”라고 쓰여 있다. 메모가 언제 떨어졌는지는 불명이다.'},
    {id:'prints',room:'정모실',icon:'🖐️',name:'카드함 손잡이의 지문',text:'금속 카드 보관함 손잡이의 비교적 선명한 지문은 손승민과 일치한다. 손승민은 사건 전 그 물건을 옮겼다고 말하지만, 언제 마지막으로 만졌는지 지문만으로는 알 수 없다.'},
    {id:'spray',room:'정모실',icon:'🧴',name:'회장 의자 아래 탈취제',text:'한철의 의자 바로 아래에 서제이 이름 스티커가 붙은 작은 탈취제 병이 떨어져 있다. 병에는 “담배 냄새 좀 그만!”이라는 손글씨도 있다. 언제 놓였는지 현장 상태만으로는 확정할 수 없다.'},
    {id:'calendar',room:'회의실',icon:'🗓️',name:'겹쳐버린 수요일 예약',text:'장한철이 수요일 참석을 캘박하지 않아 예약 충돌이 났다. 기록에는 허다은이 오늘 20시 49분에 회장과 일정표를 놓고 언쟁한 사실도 있다. 회장은 해당 종이를 들고 정모실로 돌아갔다.'},
    {id:'call',phase:2,room:'회의실',icon:'💻',name:'화상통화 원본 녹화',text:'허다은은 20시 54분부터 21시 01분까지 회의실에서 상대방과 얼굴을 보이며 실시간으로 대화했다. 20시 58분 12초 정모실 방향에서 둔탁한 소리가 녹음됐고, 바로 이어 상대방 질문에 다은이 화면을 벗어나지 않고 답했다.'},
    {id:'shelf',room:'창고',icon:'📦',name:'비어 있는 카드함 선반',text:'창고 선반의 카드 보관함 자리가 비어 있고, 선반에는 손승민이 물건을 정리한 흔적이 보인다. 20시 45분 정모실에 카드함을 옮겼다는 준비 사진과 충돌하지 않는다.'},
    {id:'warehouse',phase:2,room:'창고',icon:'🚪',name:'창고 문·복도 영상',text:'손승민은 20시 53분 04초 창고로 들어가 문을 닫았고, 다음 문 열림은 21시 02분 06초다. 복도 CCTV에도 그 사이 문이 열린 흔적이 없으며, 창고에는 출입문 하나와 열리지 않는 창만 있다. 감시 기록은 같은 표준시로 동기화돼 있다.'},
    {id:'door',phase:2,room:'출입구',icon:'🔑',name:'양방향 출입 인증 로그',text:'20시 55분 서제이 퇴실 → 20시 59분 06초 박지훈 퇴실 → 21시 02분 30초 서제이 재입실 → 21시 06분 35초 박지훈 재입실. 주출입구와 비상구 이외 통로는 없으며 비상구 개방 기록도 없다. 카드 명의만으로 이용자를 단정하지는 말 것.'},
    {id:'gatevideo',phase:2,room:'출입구',icon:'📹',name:'출입구 CCTV 원본',text:'영상에는 서제이가 20시 55분에 나가 21시 02분 30초에 돌아오는 모습이 얼굴까지 확인된다. 20시 59분 06초 박지훈도 건물 안에서 밖으로 나가는 모습이 선명하게 찍혔다. 21시 06분 35초에는 편의점 봉투를 들고 재입실했다. 영상 시각은 출입 인증 로그와 동기화돼 있다.'},
    {id:'receipt',room:'출입구',icon:'🧾',name:'박지훈의 20시 57분 영수증',text:'박지훈이 알리바이라며 내민 편의점 영수증에는 결제 시각이 20시 57분으로 찍혀 있다. 결제 방식 작은 글씨는 “모바일 앱 선결제”. 결제 자체는 가능하지만 그때 매장에 있었다는 의미인지는 따져봐야 한다.'},
    {id:'pickup',phase:2,room:'출입구',icon:'🛍️',name:'21시 04분 편의점 수령 확인',text:'편의점 앱의 수령 QR 기록과 매장 영상에는 박지훈이 21시 04분 직접 간식 봉투를 수령한 사실이 나온다. 편의점은 도트 입구에서 약 150m, 평소 도보 약 2분 거리다. 이 기록은 20시 58분에 편의점에 있었다는 증거가 아니라 이후 이동이 가능했는지를 판단할 자료다.'},

  ];
  const caseTimeline=[
    {at:'20:45',src:'transfer',desc:'카드 보관함이 정모실 책상으로 옮겨짐'},
    {at:'20:48',src:'notice',desc:'회장, 본게임 23시 10분 시작 공지'},
    {at:'20:50',src:'group',desc:'단체사진 촬영 · 정모실 물건 배치'},
    {at:'20:53:04',src:'warehouse',desc:'손승민 창고 입실 · 문 닫힘'},
    {at:'20:54',src:'call',desc:'허다은 화상통화 시작'},
    {at:'20:55',src:'door',desc:'서제이 명의 출입카드 퇴실'},
    {at:'20:57',src:'receipt',desc:'박지훈 편의점 모바일 선결제'},
    {at:'20:58:12',src:'call',desc:'회의실 통화에 정모실 쪽 충격음 녹음'},
    {at:'20:58:13',src:'watch',desc:'장한철 스마트워치 급격한 충격 감지'},
    {at:'20:59:06',src:'door',desc:'박지훈 명의 출입카드 퇴실'},
    {at:'20:59:06',src:'gatevideo',desc:'출입구 영상에서 박지훈 본인 퇴실 확인'},
    {at:'21:01',src:'call',desc:'허다은 화상통화 종료'},
    {at:'21:02:06',src:'warehouse',desc:'창고문 열림 · 손승민 복도 등장'},
    {at:'21:02:30',src:'door',desc:'서제이 명의 출입카드 재입실'},
    {at:'21:04',src:'pickup',desc:'박지훈 편의점 상품 직접 수령'},
    {at:'21:06:35',src:'gatevideo',desc:'박지훈 봉투를 들고 도트 재입실'},
    {at:'21:07',src:null,desc:'허다은이 정모실에서 쓰러진 장한철 발견'}
  ];
    const clueIds=new Set(clues.map(x=>x.id));
  const suspectIds=new Set(suspects.map(x=>x.id));
  const proofRequirements=[
    {label:'범행 시각 교차 검증',ids:['call','watch']},
    {label:'다른 용의자의 동선 검증',ids:['warehouse','door','gatevideo']},
    {label:'범행 도구와 상해 연결',ids:['box','medical']},
    {label:'거짓 알리바이를 증거로 반박',contradiction:'jihoon'}
  ];
  function proofChecks(){
    return proofRequirements.map(group=>({label:group.label,done:group.contradiction?
      state.contradictions.includes(group.contradiction):group.ids.every(id=>state.clues.includes(id))}));
  }
  function canSubmit(){
    return state.phase===2&&state.clues.length>=8&&state.interviewed.length===suspects.length&&proofChecks().every(x=>x.done);
  }
  const leadIds=['da-note','prints','spray','notice'];
  function canUnlockRound2(){return state.phase===1&&leadIds.every(id=>state.clues.includes(id))&&state.interviewed.length===suspects.length;}
  function defaults(){return {started:false,phase:1,clues:[],interviewed:[],contradictions:[],submitted:false,answer:null};}
  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaults();
      return {
        started:saved.started===true,
        phase:saved.phase===2?2:1,
        clues:Array.isArray(saved.clues)?saved.clues.filter(id=>clueIds.has(id)):[],
        interviewed:Array.isArray(saved.interviewed)?saved.interviewed.filter(id=>suspectIds.has(id)):[],
        contradictions:Array.isArray(saved.contradictions)?saved.contradictions.filter(id=>suspectIds.has(id)):[],
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
      '<div class="mystery-meta"><span class="mystery-pill">👤 1인용</span><span class="mystery-pill">⏱ 체험판 약 10~15분</span><span class="mystery-pill">🔍 입문~중간</span></div>'+
      '<div class="mystery-actions">'+button('intro','사건 브리핑 보기','mystery-btn-primary')+
      (state.started?button('resume','이어서 수사하기'):'')+'</div></section>'+
      '<aside class="mystery-panel"><h3>수사 방법</h3>'+
      '<p>① 사건 브리핑 확인</p><p>② 도트 네 장소 조사</p><p>③ 네 사람의 진술 심문</p><p>④ 거짓 알리바이 반박</p><p>⑤ 범인·동기·도구·결정적 증거 지목</p>'+
      '<div class="mystery-divider"></div><p class="mystery-subtle">※ 실제 인물과는 무관한 가상의 사건입니다. 수사 기록은 현재 브라우저에만 저장됩니다.</p>'+
      '</aside></div>';
  }
  function intro(){
    return '<div class="mystery-kicker">CASE 001 · 사건 브리핑</div><h1 class="mystery-title">《수요일의 일격》</h1>'+
      '<div class="mystery-panel"><h2>20시 58분, 도트에서 무슨 일이?</h2>'+
      '<div class="mystery-story">도파민 회장 장한철은 주 6일 근무한다. 유일하게 쉬는 수요일이면 그토록 기다리던 도트로 향한다.\n\n그날도 한철은 신이 나서 외쳤다.\n“오늘 본게임은 23시 10분부터! 그전엔 클라이밍 썰 풀어드림ㅋㅋ”\n\n회원들의 표정은 일제히 굳어졌다.\n\n20시 58분 무렵, 정모실 쪽에서 “쿵!” 소리가 났다. 하지만 당시에는 아무도 대수롭지 않게 여겼다.\n\n21시 07분, 회의실 통화를 끝내고 메모를 정리하던 허다은이 정모실에 들렀다가 쓰러진 한철을 발견했다. 곧바로 구조 요청이 이뤄졌고, 다행히 한철은 의식을 회복했다. 다만 공격자는 기억하지 못한다.\n\n그날 도트에 있던 인물은 회장과 네 명의 회원뿐이었다. 용의자 이름은 허다은, 손승민, 박지훈, 서제이.\n\n네 사람은 모두 한철에게 불만이 있었다. 하지만 이유가 있다고 모두 범인은 아니다. 사건 시각, 현장 물건의 위치, 출입 기록과 진술이 맞물리는지 조사하라.</div>'+
      '<div class="mystery-actions">'+button('start',state.submitted?'처음부터 재수사':state.started?'조사 이어하기':'사건 조사 시작','mystery-btn-primary')+button('home','사건 목록으로')+'</div></div>';
  }
  function investigate(){
    const items=clues.filter(c=>c.room===ui.room&&(!c.phase||c.phase<=state.phase));
    const leads=leadIds.filter(id=>state.clues.includes(id)).length;
    const introRound=state.phase===1?'<div class="mystery-note"><strong>1차 조사 · 모두를 의심해보기</strong><p>찢긴 일정표, 보관함 지문, 탈취제, 단체방 대화를 확인하고 용의자 네 명의 말을 들어보세요.</p><p>수상한 흔적 '+leads+' / 4 · 면담 '+state.interviewed.length+' / 4</p>'+(canUnlockRound2()?button('unlock-round2','2차 조사 열기 · 알리바이 검증','mystery-btn-primary'):'<p>모든 흔적과 진술을 확인하면 CCTV·감식 자료가 열립니다.</p>')+'</div>':'<div class="mystery-success">✓ 2차 조사 · 통화 녹화, 출입 기록, 감식 자료가 공개되었습니다.</div>';
    const selected=clues.find(c=>c.id===ui.selectedClue&&state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">현장 조사 · '+state.phase+'차</h2><p class="mystery-subtle">1차에서는 의심스러운 흔적을, 2차에서는 진술을 검증할 기록을 조사합니다.</p>'+introRound+
      '<div class="mystery-room-tabs">'+rooms.map(room=>
        '<button type="button" class="mystery-room '+(ui.room===room?'active':'')+'" data-action="room" data-id="'+room+'">'+room+'</button>'
      ).join('')+'</div>'+
      '<div class="mystery-item-grid">'+items.map(c=>
        '<button type="button" class="mystery-item '+(state.clues.includes(c.id)?'done':'')+'" data-action="clue" data-id="'+c.id+'">'+
        '<span class="mystery-emoji" aria-hidden="true">'+c.icon+'</span><strong>'+c.name+'</strong><small>'+(state.clues.includes(c.id)?'✓ 단서 확보':'눌러서 조사하기')+'</small></button>'
      ).join('')+'</div>'+
      (selected?'<div class="mystery-evidence" role="status"><h3>'+selected.icon+' '+selected.name+'</h3><p>'+selected.text+'</p>'+button('notebook','수사 수첩으로')+'</div>':'');
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
    return '<h2 class="mystery-section-title">수사 수첩</h2>'+
      '<p class="mystery-subtle">확보 단서 '+found.length+' / '+clues.length+'개 · 면담 인원 '+state.interviewed.length+' / 4명</p>'+
      '<h3 class="mystery-section-title">확인된 사건 타임라인</h3>'+
      '<p class="mystery-subtle">확보한 단서로 입증된 시각만 표시됩니다. 새로운 증거를 수집하면 자동으로 추가됩니다.</p>'+
      '<div class="mystery-timeline">'+known.map(row=>
        '<div class="mystery-timeline-row"><time>'+escText(row.at)+'</time><span>'+escText(row.desc)+'</span></div>'
      ).join('')+'</div>'+
      '<div class="mystery-divider"></div><h3 class="mystery-section-title">증거 원문</h3>'+
      (found.length?found.map(c=>note(c.icon+' '+c.name,c.text)).join(''):'<p>아직 증거가 없습니다. 현장 조사부터 시작하세요.</p>')+
      '<div class="mystery-divider"></div><h3>면담 완료</h3><p class="mystery-subtle">'+(state.interviewed.length?
        state.interviewed.map(id=>suspects.find(s=>s.id===id)?.name).filter(Boolean).join(' · '):'면담한 사람이 없습니다.')+'</p>';
  }
  function finalGuess(){
    const ready=canSubmit();
    const checks=proofChecks();
    const evidence=clues.filter(c=>state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">최종 추리</h2>'+
      '<p class="mystery-subtle">20시 58분에 누가 어디에 있었는지, 거짓 알리바이를 누가 만들어냈는지 확인하세요. 제출하면 정답과 해설이 공개됩니다.</p>'+
      '<div class="mystery-note"><strong>논리 검증 체크리스트</strong><p>단서 8개 이상을 수집하고 네 명 모두 면담하세요. 단순한 의심이 아닌 증거로 아래 항목을 확인해야 합니다.</p>'+
      checks.map(x=>'<p>'+(x.done?'✓':'□')+' '+escText(x.label)+'</p>').join('')+'</div>'+
      (!ready?'<div class="mystery-warning">🔒 최종 제출 대기 · 단서 '+state.clues.length+'개 / 8개 이상 · 면담 '+state.interviewed.length+'명 / 4명 · 논리 검증 '+checks.filter(x=>x.done).length+' / '+checks.length+'건</div>':'')+
      '<label class="mystery-field" for="mystery-answer-person">① 장한철을 때린 사람은 누구인가요?<select id="mystery-answer-person"><option value="">범인 선택</option>'+
      suspects.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('')+'</select></label>'+
      '<label class="mystery-field" for="mystery-answer-motive">② 범행 동기는 무엇인가요?<select id="mystery-answer-motive"><option value="">동기 선택</option>'+
      '<option value="calendar">일정을 캘박하지 않아 예약이 꼬여서</option>'+
      '<option value="climbing">맨날 클라이밍 얘기만 해서</option>'+
      '<option value="late">매번 23시 이후에 벙을 시작해서</option>'+
      '<option value="smoking">흡연 습관이 마음에 들지 않아서</option></select></label>'+
      '<label class="mystery-field" for="mystery-answer-weapon">③ 무엇으로 공격했나요?<select id="mystery-answer-weapon"><option value="">사용한 물건 선택</option>'+
      '<option value="metalbox">금속 카드 보관함</option>'+
      '<option value="clock">탁상시계</option>'+
      '<option value="mug">머그컵</option>'+
      '<option value="book">두꺼운 룰북</option></select></label>'+
      '<label class="mystery-field" for="mystery-answer-evidence">④ 범인이 20시 58분에도 건물 안에 있었음을 뒷받침하는 핵심 증거는?<select id="mystery-answer-evidence"><option value="">증거 선택</option>'+
      evidence.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+'</select></label>'+
      '<div class="mystery-actions">'+button('submit','추리 제출하고 진상 확인','mystery-btn-primary',ready?'':'disabled')+'</div>'+
      (ui.feedback?'<div class="mystery-warning" role="status">'+escText(ui.feedback)+'</div>':'');
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
    else if(action==='room'){if(!rooms.includes(id))return;ui.room=id;ui.selectedClue=null;}
    else if(action==='clue'){
      const item=clues.find(c=>c.id===id);if(!item||(item.phase&&item.phase>state.phase))return;
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
      if(!evidence)ui.feedback='먼저 증거를 선택해주세요.';
      else if(ui.suspect==='jihoon'&&evidence==='gatevideo'){
        ui.feedback='🔎 결정적 모순! CCTV에는 박지훈 본인이 20시 59분 06초 도트 안에서 밖으로 나가는 장면이 있습니다. 20시 55분부터 편의점에 있었다는 진술과 양립할 수 없습니다.';
        if(!state.contradictions.includes('jihoon')){state.contradictions.push('jihoon');save();}
      }else if(ui.suspect==='jihoon'&&evidence==='door'){
        ui.feedback='🔎 20시 59분 06초 박지훈 카드로 퇴실한 기록이 있습니다. 카드 소지자와 본인 일치를 CCTV로 확인하세요.';
      }else if(ui.suspect==='jihoon'&&evidence==='receipt'){
        ui.feedback='20시 57분은 모바일 선결제 시각이므로 매장 안에 있었다는 증명은 되지 않습니다. 실제 인물의 위치 기록이 필요합니다.';
      }else if(ui.suspect==='jihoon'&&evidence==='pickup'){
        ui.feedback='21시 04분에 편의점에 있었다는 사실은 확인됩니다. 다만 그 사실만으로 20시 58분에도 편의점에 있었다고 볼 수는 없습니다.';
      }else if(ui.suspect==='jihoon'&&evidence==='notice'){
        ui.feedback='박지훈이 화난 것은 맞지만, 같은 대화에는 다른 세 명도 불만을 드러냈습니다. 메시지만으로 범인을 정할 수 없습니다.';
      }else if(ui.suspect==='daeun'&&evidence==='da-note'){
        ui.feedback='허다은: “제가 쓴 거 맞아요. 캘박도 안 하고 불쑥 오시면 예약이 다 꼬이잖아요! 20시 49분에 직접 따졌고, 일정표는 회장님이 들고 가셨어요.” 메모는 의심스럽지만 범행 시각의 위치를 보여주지는 않습니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='prints'){
        ui.feedback='손승민: “20시 45분에 제가 카드함 옮겼다고 했잖아요. 손잡이에 지문이 남는 게 당연하죠!” 지문은 접촉을 보여주지만 접촉 시각을 알려주지 않습니다.';
      }else if(ui.suspect==='jei'&&evidence==='spray'){
        ui.feedback='서제이: “제 탈취제 맞아요. 회장이 담배 냄새 풍겨서 아까 정모실에 뒀어요.” 20시 50분 단체사진에서도 병이 보이는지 확인해보세요.';
      }else if(ui.suspect==='daeun'&&evidence==='call'){
        ui.feedback='🔎 20시 58분 12초 충격음이 녹음된 순간 허다은은 회의실 화상통화 화면에서 실시간 대화를 하고 있었습니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='warehouse'){
        ui.feedback='🔎 창고문과 복도 영상에 20시 53분~21시 02분 출입 흔적이 없습니다. 카드함은 20시 45분부터 이미 정모실에 있었습니다.';
      }else if(ui.suspect==='jei'&&evidence==='gatevideo'){
        ui.feedback='🔎 서제이는 20시 55분에 건물을 나갔고 21시 02분 30초에 돌아왔습니다. 주출입구 CCTV 영상으로 얼굴까지 확인됩니다.';
      }else ui.feedback='이 증거만으로는 이 진술의 진위를 확정할 수 없습니다. 사건 시각과 다른 자료를 비교해보세요.';
    }
    else if(action==='submit'){
      if(!canSubmit())return;
      const person=document.getElementById('mystery-answer-person')?.value;
      const motive=document.getElementById('mystery-answer-motive')?.value;
      const weapon=document.getElementById('mystery-answer-weapon')?.value;
      const evidence=document.getElementById('mystery-answer-evidence')?.value;
      if(!person||!motive||!weapon||!evidence)ui.feedback='범인, 동기, 사용한 물건, 핵심 증거까지 모두 선택해주세요.';
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