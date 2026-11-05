/* DOPAMIN MYSTERY — solo playable prototype, case 001 (fictional characters and events). */
(()=>{
  'use strict';
  const app=document.getElementById('app');
  const STORAGE_KEY='dott_mystery_wednesday_case001_v2';
  const title='수요일의 일격';
  const incident='20:58';
  const rooms=['정모실','회의실','창고','출입구'];
  const suspects=[
    {id:'daeun',name:'허다은',emoji:'📅',role:'캘박 누락에 폭발 직전',motive:'장한철이 수요일 참석 일정을 또 캘박하지 않아 예약이 겹쳤고, 뒷수습은 매번 다은의 몫이었다.',statement:'“20시 54분부터 21시 01분까지 회의실에서 화상통화를 했어요. 20시 58분에도 예약자 질문에 직접 대답했고요.”',detail:'통화 중 옆 정모실에서 쿵 하는 소리를 들었으나 의자가 넘어진 소리로 생각했다. 통화 후 정리 메모를 남겼다.'},
    {id:'seungmin',name:'손승민',emoji:'🧗',role:'클라이밍 얘기에 지친 회원',motive:'보드게임 모임인데 회장은 틈만 나면 클라이밍 얘기. “도파민이 클라이밍 동호회냐”는 말까지 했다.',statement:'“20시 53분에 창고로 들어가서 21시 02분까지 카드랑 게임을 정리했어요. 중간에 나가지 않았습니다.”',detail:'20시 45분에 금속 카드 보관함을 정모실로 옮겨둔 건 인정한다. 이후 20시 53분부터는 창고에 있었다고 주장한다.'},
    {id:'jihoon',name:'박지훈',emoji:'🌙',role:'23시 벙 시작에 지친 회원',motive:'일찍 시작한다던 벙을 회장이 또 23시 10분으로 늦췄다. 지훈은 다음 날 아침 일찍 출근해야 했다.',statement:'“20시 55분에 간식 사러 편의점에 갔어요. 20시 57분 결제 영수증도 있고 21시 04분까지 매장에 있었어요. 그때 도트 안에 없었죠.”',detail:'당일 남색 점퍼를 입었다. 수사 때 오른쪽 소매 끝이 뜯어진 모습이 확인됐다. 단체 사진에는 멀쩡했다.'},
    {id:'jei',name:'서제이',emoji:'🚭',role:'담배 냄새에 질린 회원',motive:'장한철의 흡연 후 실내에 남는 담배 냄새가 싫었고 늦은 벙 시작에도 불만이 쌓였다.',statement:'“20시 55분에 답답해서 건물 밖으로 나갔고, 21시 02분에 다시 들어왔어요. 문 CCTV랑 출입 기록 확인해보세요.”',detail:'그날도 회장의 흡연 습관에 항의했다. 그러나 사건 시각에는 건물 밖에 있었다고 주장한다.'}
  ];
  const clues=[
    {id:'plan',room:'정모실',icon:'🗺️',name:'도트 공간 안내도',text:'이 게임의 가상 도트는 정모실, 회의실, 창고, 주출입구로 이루어진다. 정모실과 회의실은 얇은 벽 하나를 사이에 둔다. 주출입구 외 비상구는 열리면 경보가 울리며, 이날 경보는 없었다. 20시 45분부터 21시 07분까지 외부 방문객 출입도 없었다. 모든 디지털 기록의 시각은 같은 표준시로 동기화돼 있다.'},
    {id:'box',room:'정모실',icon:'🗃️',name:'금속 카드 보관함',text:'정모실 책상 아래에 무거운 금속 카드 보관함이 떨어져 있다. 모서리 걸쇠에는 남색 옷감 실밥이 끼어 있다. 외부 손상과 피해자 주변의 상황상 공격 도구로 의심된다.'},
    {id:'watch',room:'정모실',icon:'⌚',name:'장한철의 스마트워치 활동 기록',text:'장한철이 차고 있던 시계의 활동 기록에는 20시 58분 13초 강한 충격과 쓰러짐에 해당하는 움직임이 감지됐고, 이후 수 분간 활동이 거의 없다. 이 기기의 자동 긴급 신고는 꺼져 있었다. 회의실 통화 녹음의 20시 58분 12초 소리와도 시각이 일치한다.'},
    {id:'clock',room:'정모실',icon:'🕰️',name:'바닥의 탁상시계',text:'시계 유리가 깨졌고 바늘이 20시 58분쯤에 멈춰 있다. 시계만으로 시각을 확정할 수는 없으므로, 피해자의 스마트워치 활동 기록과 화상통화 녹음도 함께 확인해야 한다.'},
    {id:'notice',room:'정모실',icon:'📱',name:'20시 48분 단체방 공지',text:'장한철: “오늘도 본게임은 23시 10분부터! 그전에 클라이밍 썰 풀어드림ㅋㅋ” / 박지훈: “분명 일찍 한다며요? 내일 아침 출근인데…” 네 용의자의 불만이 더 크게 드러난 메시지다.'},
    {id:'transfer',room:'정모실',icon:'📷',name:'20시 45분 준비 사진',text:'손승민이 20시 45분 단체방에 “카드함 정모실 책상 위로 옮겨놨어요”라며 사진을 올렸다. 사진에는 문제의 금속 카드 보관함이 정모실 책상 위에 이미 놓여 있다. 사건 직전 창고에서 가져올 필요는 없었다.'},
    {id:'group',room:'정모실',icon:'👥',name:'20시 50분 단체 사진',text:'20시 50분 촬영된 도트 단체사진에 네 용의자와 장한철이 찍혀 있다. 박지훈이 입은 남색 점퍼의 오른쪽 소매는 이때 멀쩡하다. 사진 원본의 촬영 시각이 확인됐다.'},
    {id:'fiber',room:'정모실',icon:'🧵',name:'걸쇠에 남은 직물',text:'카드 보관함 걸쇠에 남색 실밥과 사선 이중 봉제 흔적이 남아 있다. 누군가 이 물건을 급히 움직일 때 옷이 걸린 것으로 보인다. 이 흔적만으로 특정인의 옷이라고 확정할 수는 없다.'},
    {id:'calendar',room:'회의실',icon:'🗓️',name:'중복 예약 내역',text:'장한철이 매주 수요일 도트 참석 일정을 캘린더에 올리지 않아 예약이 겹쳤고, 허다은이 여러 번 수습한 기록이다. 허다은에게는 충분히 화날 이유가 있었다.'},
    {id:'call',room:'회의실',icon:'💻',name:'화상통화 원본 녹화',text:'허다은은 20시 54분~21시 01분 회의실에서 상대방과 얼굴을 보이며 실시간 대화를 이어갔다. 20시 58분 12초에 이웃한 정모실 쪽의 둔탁한 “쿵” 소리가 녹음됐고, 곧바로 허다은이 화면에서 움직이지 않은 채 질문에 답하는 모습이 보인다. 통화 후에는 회의록을 작성했다.'},
    {id:'shelf',room:'창고',icon:'📦',name:'빈 카드함 자리',text:'창고 선반의 카드 보관함 자리가 비어 있다. 아래에는 “카드함 사용 후 제자리”라는 메모가 붙어 있다. 20시 45분에 손승민이 정모실로 옮겼다는 준비 사진과 모순되지 않는다.'},
    {id:'warehouse',room:'창고',icon:'🚪',name:'창고문 개폐·복도 영상',text:'손승민이 20시 53분 04초 창고에 들어가 문을 닫았다. 다음 문 열림은 21시 02분 06초다. 창고에는 문 하나와 외벽으로 통하지 않는 창만 있고, 복도 영상도 그사이 출입자가 없음을 보여준다. 사건 시각인 20시 58분에 손승민은 창고 안에 있었다.'},
    {id:'door',room:'출입구',icon:'🔑',name:'주출입구 출입 인증 기록',text:'양방향 카드 인증 기록: 20시 55분 서제이 퇴실 → 20시 59분 06초 박지훈 퇴실 → 21시 02분 서제이 재입실 → 21시 06분 35초 박지훈 재입실. 주출입구 외 비상구 개방 경보는 없다. 카드 소지자가 누구인지 영상으로 따로 확인해야 한다.'},
    {id:'gatevideo',room:'출입구',icon:'📹',name:'출입구 CCTV 원본',text:'출입구 영상은 20시 55분 서제이 퇴실·21시 02분 재입실을 확인한다. 그리고 20시 59분 06초 박지훈이 건물 안에서 밖으로 나가는 장면에 얼굴과 뜯어진 남색 오른쪽 소매가 선명하게 찍혀 있다. 21시 06분 35초에는 편의점 봉투를 들고 재입실했다. 영상 시계는 출입 인증 기록과 동기화돼 있다.'},
    {id:'receipt',room:'출입구',icon:'🧾',name:'20시 57분 편의점 영수증',text:'박지훈이 제시한 영수증에는 20시 57분 결제라고 적혀 있다. 하지만 그 아래 결제 방식은 “앱 모바일 선결제”다. 결제할 때 본인이 매장에 있었다는 뜻은 전혀 아니다.'},
    {id:'pickup',room:'출입구',icon:'🛍️',name:'21시 04분 편의점 수령 확인',text:'편의점 앱의 수령 QR 기록과 매장 영상에 박지훈이 21시 04분 직접 간식 봉투를 수령하는 장면이 있다. 편의점은 도트 주출입구에서 도보 약 150m(약 2분) 거리다. 20시 59분 퇴실 후 21시 04분 수령, 21시 06분 재입실은 충분히 가능한 동선이다.'},
    {id:'sleeve',room:'출입구',icon:'🧥',name:'뜯어진 오른쪽 소매',text:'20시 50분 단체사진에서는 멀쩡했던 박지훈의 남색 점퍼 오른쪽 소매가 20시 59분 06초 출입구 영상에서는 찢어져 있다. 사건 현장 카드함 걸쇠의 남색 실밥·사선 이중 봉제 흔적과 형태가 유사하다. 정밀 감정 결과는 아니므로 다른 증거와 종합해야 한다.'}
  ];
  const clueIds=new Set(clues.map(x=>x.id));
  const suspectIds=new Set(suspects.map(x=>x.id));
  function defaults(){return {started:false,clues:[],interviewed:[],contradictions:[],submitted:false,answer:null};}
  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaults();
      return {
        started:saved.started===true,
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
      '<p>유력 용의자는 허다은, 손승민, 박지훈, 서제이. 전원 수상한 동기가 있고 모두 확실한 알리바이를 주장한다. 진술과 시간을 대조해 거짓말을 찾아내자.</p>'+
      '<div class="mystery-meta"><span class="mystery-pill">👤 1인용</span><span class="mystery-pill">⏱ 약 20~30분</span><span class="mystery-pill">🔍 입문~중간</span></div>'+
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
      '<div class="mystery-actions">'+button('start','사건 조사 시작','mystery-btn-primary')+button('home','사건 목록으로')+'</div></div>';
  }
  function investigate(){
    const items=clues.filter(c=>c.room===ui.room);
    const selected=clues.find(c=>c.id===ui.selectedClue&&state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">현장 조사</h2><p class="mystery-subtle">각 장소에 남은 흔적을 수집하고, 다른 사람의 알리바이와 비교해보세요.</p>'+
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
    return '<h2 class="mystery-section-title">수사 수첩</h2>'+
      '<p class="mystery-subtle">확보 단서 '+found.length+' / '+clues.length+'개 · 면담 인원 '+state.interviewed.length+' / 4명</p>'+
      (found.length?found.map(c=>note(c.icon+' '+c.name,c.text)).join(''):'<p>수집한 단서가 없습니다. 장소를 먼저 조사하세요.</p>')+
      '<div class="mystery-divider"></div><h3>면담 완료</h3><p class="mystery-subtle">'+(state.interviewed.length?
        state.interviewed.map(id=>suspects.find(s=>s.id===id)?.name).filter(Boolean).join(' · '):'면담한 사람이 없습니다.')+'</p>';
  }
  function finalGuess(){
    const ready=state.clues.length>=8&&state.interviewed.length===4;
    const evidence=clues.filter(c=>state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">최종 추리</h2>'+
      '<p class="mystery-subtle">20시 58분에 누가 어디에 있었는지, 거짓 알리바이를 누가 만들어냈는지 확인하세요. 제출하면 정답과 해설이 공개됩니다.</p>'+
      (!ready?'<div class="mystery-warning">🔒 단서 8개 이상, 용의자 전원(4명) 면담하면 최종 추리를 제출할 수 있습니다. 현재 단서 '+state.clues.length+'개 · 면담 '+state.interviewed.length+'명</div>':'')+
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
      '<div class="mystery-meta"><span class="mystery-pill">단서 '+state.clues.length+' / '+clues.length+'</span><span class="mystery-pill">면담 '+state.interviewed.length+' / 4</span><span class="mystery-pill">모순 '+state.contradictions.length+'건</span></div>'+
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
      '<p>'+(score===4?'명탐정 인정! 시간 기록과 물증을 모두 꿰뚫어봤습니다.':'수사를 마쳤습니다. 아래에서 기록을 대조하며 사건의 진상을 확인하세요.')+'</p>'+
      '<div class="mystery-divider"></div><h2>수요일 20시 58분의 진실</h2>'+
      '<div class="mystery-story">범인은 박지훈이었다.\n\n사건 전 20시 45분, 손승민이 창고의 금속 카드 보관함을 정모실 책상 위로 옮겼다. 따라서 범행 도구가 20시 53분부터 닫혀 있던 창고에서 갑자기 튀어나올 필요는 없었다.\n\n20시 48분, 장한철은 또 “본게임은 23시 10분부터”라고 공지했다. 다음 날 출근을 앞둔 박지훈은 크게 화가 났다.\n\n20시 55분쯤 지훈은 “편의점에 간다”고 말했지만 실제로는 건물에 남아 있었다. 20시 57분 스마트폰으로 편의점 앱 선결제를 하고, 정모실에서 한철과 마주쳤다.\n\n20시 58분 12초 무렵 두 사람이 말다툼하다 지훈이 정모실에 있던 금속 카드 보관함으로 한철을 때렸다. 충격음은 회의실 화상통화 녹음(20시 58분 12초)에 남고, 피해자의 스마트워치는 1초 뒤 강한 충격을 기록했다. 바닥에서 발견된 탁상시계도 비슷한 시각에 멈췄다.\n\n20시 59분 06초, 지훈은 오른쪽 소매가 뜯어진 채 주출입구에서 밖으로 나갔다. 이 장면은 출입 인증 기록과 본인 얼굴이 찍힌 CCTV로 확인된다. 20시 50분에는 멀쩡했던 소매가 20시 59분에 뜯어져 있었고, 현장 보관함의 남색 실밥과도 부합한다.\n\n편의점은 도트에서 약 150m 거리였다. 지훈은 21시 04분에 모바일 주문 상품을 실제 수령하고, 21시 06분 35초에 도트로 돌아왔다. 20시 57분 영수증은 매장 결제가 아닌 앱 선결제였으므로 그의 “20시 55분부터 매장에 있었다”는 주장은 거짓이다.\n\n같은 시각 허다은은 회의실 화상통화에 실시간으로 나타났고, 손승민은 다른 출입구가 없는 창고 안에 있었으며, 서제이는 20시 55분부터 21시 02분까지 건물 밖이었다. 각 기록은 통화 영상, 창고문 센서·복도 영상, 주출입구 CCTV로 독립 검증된다.\n\n21시 07분, 허다은이 정모실에서 쓰러진 회장을 발견했다. 의식을 회복한 한철은 잠시 침묵하다 말했다.\n“...그럼 오늘 벙은 몇 시에 시작해?”\n\n도파민 일동: “회장님 제발요!!!!”</div>'+
      '<div class="mystery-divider"></div><h3>정답 및 증거 논리</h3>'+
      '<p>범인: <span class="mystery-highlight">박지훈</span></p>'+
      '<p>동기: <span class="mystery-highlight">밤 11시 이후 벙 시작에 대한 누적 불만</span></p>'+
      '<p>도구: <span class="mystery-highlight">정모실에 미리 옮겨져 있던 금속 카드 보관함</span></p>'+
      '<p>핵심 증거: <span class="mystery-highlight">20시 59분 06초 박지훈 본인의 퇴실 영상</span></p>'+
      '<p class="mystery-subtle">주의: 편의점 21시 04분 수령 기록만으로 20시 58분의 위치를 증명할 수는 없습니다. 20시 59분 본인 퇴실 영상이 그의 “20시 55분부터 편의점에 있었다”는 주장과 정면 충돌합니다. 소매 손상은 추가 정황 증거입니다.</p>'+
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
    else if(action==='start'){state.started=true;save();ui.view='play';ui.tab='investigate';}
    else if(action==='resume')ui.view=state.submitted?'result':'play';
    else if(action==='tab'){tabChange(id);return;}
    else if(action==='room'){if(!rooms.includes(id))return;ui.room=id;ui.selectedClue=null;}
    else if(action==='clue'){
      if(!clueIds.has(id))return;
      if(!state.clues.includes(id)){state.clues.push(id);save();}
      ui.selectedClue=id;
    }
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
      }else if(ui.suspect==='jihoon'&&evidence==='sleeve'){
        ui.feedback='🔎 20시 50분에는 멀쩡했던 오른쪽 소매가 20시 59분에는 뜯어져 있네요. 현장의 남색 실밥과 비교하세요.';
      }else if(ui.suspect==='daeun'&&evidence==='call'){
        ui.feedback='🔎 20시 58분 12초 충격음이 녹음된 순간 허다은은 회의실 화상통화 화면에서 실시간 대화를 하고 있었습니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='warehouse'){
        ui.feedback='🔎 창고문과 복도 영상에 20시 53분~21시 02분 출입 흔적이 없습니다. 카드함은 20시 45분부터 이미 정모실에 있었습니다.';
      }else if(ui.suspect==='jei'&&evidence==='gatevideo'){
        ui.feedback='🔎 서제이는 20시 55분에 건물을 나갔고 21시 02분 돌아왔습니다. 주출입구 CCTV 영상으로 얼굴까지 확인됩니다.';
      }else ui.feedback='이 증거만으로는 이 진술의 진위를 확정할 수 없습니다. 사건 시각과 다른 자료를 비교해보세요.';
    }
    else if(action==='submit'){
      if(state.clues.length<8||state.interviewed.length!==4)return;
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