/* DOPAMIN MYSTERY — solo playable prototype, case 001 (fictional characters and events). */
(()=>{
  'use strict';
  const app=document.getElementById('app');
  const STORAGE_KEY='dott_mystery_wednesday_case001_v1';
  const title='수요일의 일격';
  const incident='20:58';
  const rooms=['정모실','회의실','창고','출입구'];
  const suspects=[
    {id:'daeun',name:'허다은',emoji:'📅',role:'캘박 누락에 폭발 직전',motive:'장한철이 수요일 참석 일정을 자꾸 캘박하지 않아 예약이 겹치고, 뒷수습은 매번 자신이 맡았다.',statement:'“20시 54분부터 21시 1분까지 회의실에서 예약 문제로 영상통화 중이었어요. 끊지도 않았는데요?”',detail:'실제로 장한철에게 “회장님 제발 캘박 좀!”이라고 항의한 기록이 있다.'},
    {id:'seungmin',name:'손승민',emoji:'🧗',role:'클라이밍 얘기에 지친 회원',motive:'보드게임을 하자고 모이면 장한철이 또 클라이밍 얘기부터 꺼내는 게 불만이었다.',statement:'“20시 53분부터 21시 2분까지 창고에서 게임 정리했어요. 선반 정리한 사진도 있는데요?”',detail:'평소 “도파민이 보드게임 모임인지 클라이밍 모임인지 모르겠다”고 투덜거렸다.'},
    {id:'jihoon',name:'박지훈',emoji:'🌙',role:'23시 벙 시작에 지친 회원',motive:'벙을 밤 11시 넘어서 시작하는 바람에 매번 새벽에 귀가했다. 이날도 일찍 시작하겠다던 약속을 회장이 뒤집었다.',statement:'“20시 55분부터 21시 4분까지 편의점에서 간식을 샀어요. 20시 57분 영수증도 있어요.”',detail:'남색 점퍼를 입었고, 오른쪽 소매 끝이 조금 뜯어져 있다. 편의점 봉투도 갖고 돌아왔다.'},
    {id:'jei',name:'서제이',emoji:'🚭',role:'담배 냄새에 질린 회원',motive:'장한철의 흡연 습관 때문에 실내에 담배 냄새가 남는 게 싫었고, 늦은 벙 시작에도 불만이 쌓였다.',statement:'“20시 55분쯤 냄새 때문에 밖으로 나갔고 21시 2분에 다시 들어왔어요. 출입문 기록 보세요.”',detail:'흡연 문제로 장한철에게 여러 번 항의했다. 사건 이후에도 “냄새는 여전하네”라고 말했다.'}
  ];
  const clues=[
    {id:'box',room:'정모실',icon:'🗃️',name:'금속 카드 보관함',text:'정모실 책상 아래에 무거운 금속 카드 보관함이 떨어져 있다. 한쪽 모서리에는 남색 실밥이 걸려 있다. 원래 창고 선반에 있던 물건이다.'},
    {id:'clock',room:'정모실',icon:'🕰️',name:'멈춘 탁상시계',text:'한철이 쓰러지며 떨어뜨린 시계가 20시 58분을 가리킨다. 출입구 기록 및 주변인의 증언과 맞춰보면 사건 시각은 20시 58분 전후다.'},
    {id:'notice',room:'정모실',icon:'📱',name:'단체방 공지',text:'20시 48분, 장한철: “오늘도 본게임은 23시 10분부터! 그전엔 클라이밍 썰 풀어드림ㅋㅋ” / 박지훈: “일찍 한다며요? 내일 출근인데…”'},
    {id:'fiber',room:'정모실',icon:'🧵',name:'남색 소매 실밥',text:'금속 카드 보관함 걸쇠에 남색 직물 조각이 끼어 있다. 누군가 보관함을 황급히 다루다 옷소매가 걸린 듯하다. 이것만으로 소유자를 확정할 수는 없다.'},
    {id:'calendar',room:'회의실',icon:'🗓️',name:'중복 예약 기록',text:'장한철이 수요일 참석을 미리 캘린더에 등록하지 않아 도트 예약이 겹쳤다. 허다은이 중복 예약을 정리한 기록도 남아 있다.'},
    {id:'call',room:'회의실',icon:'💻',name:'화상통화 녹화',text:'허다은은 20시 54분부터 21시 01분까지 예약자와 연속 영상통화를 했다. 20시 58분 화면에도 회의실에 앉은 모습이 확인된다.'},
    {id:'shelf',room:'창고',icon:'📦',name:'빈 보관함 자리',text:'창고에 있던 금속 카드 보관함 하나가 사라져 있다. 선반에는 “카드 정리용 — 정모실 반출 금지”라는 표지가 붙어 있다.'},
    {id:'warehouse',room:'창고',icon:'🚪',name:'창고 문 기록',text:'창고 문은 20시 53분에 닫히고 21시 02분에 다시 열렸다. 창고에는 다른 통로가 없다. 손승민이 그 시간 동안 창고에 있었다는 설명과 부합한다.'},
    {id:'door',room:'출입구',icon:'🔑',name:'출입문 기록',text:'서제이의 개인 출입카드로 20시 55분 퇴실, 21시 02분 재입실한 기록이 있다. 출입구는 하나뿐이며 사건 전후의 기록에는 오류가 없다.'},
    {id:'receipt',room:'출입구',icon:'🧾',name:'20시 57분 영수증',text:'박지훈이 보여준 편의점 영수증에는 20시 57분 결제 표시가 찍혀 있다. 그런데 결제 방식 옆 작은 글씨가 “모바일 선결제”로 되어 있다.'},
    {id:'pickup',room:'출입구',icon:'🛍️',name:'편의점 수령 기록',text:'편의점 앱에는 결제 20시 57분, 실제 상품 수령 21시 04분이라고 나온다. 20시 57분 영수증은 박지훈이 그때 편의점 안에 있었다는 증거가 아니다.'},
    {id:'sleeve',room:'출입구',icon:'🧥',name:'뜯어진 점퍼 소매',text:'박지훈의 남색 점퍼 오른쪽 소매가 뜯어져 있다. 현장의 금속 보관함에 걸린 실밥과 색상·직물 무늬가 유사하다. 정밀 감정은 하지 않았으므로 다른 단서와 함께 판단해야 한다.'}
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
      '<div class="mystery-story">도파민 회장 장한철은 주 6일 근무 중이다. 유일하게 쉬는 수요일이면 그토록 기다리던 도트로 향한다.\n\n오늘도 도트에 모인 사람들 앞에서 한철은 외쳤다.\n“자, 본게임은 23시 10분부터! 그전에 클라이밍 썰 들으실 분?”\n\n불만을 품은 회원들의 표정이 순식간에 굳었다.\n\n20시 58분, 정모실 쪽에서 “쿵!” 하는 소리가 났다.\n21시 07분, 한철은 바닥에 쓰러진 채 발견됐다. 즉시 구조 요청이 이뤄졌고, 다행히 의식을 회복했다. 그러나 공격자가 누구인지는 기억하지 못한다.\n\n그 시각 도트에 있었던 용의자는 네 명.\n허다은, 손승민, 박지훈, 서제이.\n\n놀랍게도 모두 회장을 한 대 때리고 싶을 만큼 쌓인 불만이 있었다.\n\n당신은 도파민의 임시 탐정이다. 각자의 알리바이를 확인하고 범인과 이유, 사용한 물건까지 밝혀내야 한다.</div>'+
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
    const ready=state.clues.length>=6&&state.interviewed.length>=3;
    const evidence=clues.filter(c=>state.clues.includes(c.id));
    return '<h2 class="mystery-section-title">최종 추리</h2>'+
      '<p class="mystery-subtle">20시 58분에 누가 어디에 있었는지, 거짓 알리바이를 누가 만들어냈는지 확인하세요. 제출하면 정답과 해설이 공개됩니다.</p>'+
      (!ready?'<div class="mystery-warning">🔒 단서 6개 이상, 용의자 3명 이상 면담하면 최종 추리를 제출할 수 있습니다. 현재 단서 '+state.clues.length+'개 · 면담 '+state.interviewed.length+'명</div>':'')+
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
      '<label class="mystery-field" for="mystery-answer-evidence">④ 거짓 알리바이를 드러낸 핵심 단서는?<select id="mystery-answer-evidence"><option value="">증거 선택</option>'+
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
      Number(a.weapon==='metalbox')+Number(a.evidence==='pickup');
    return '<div class="mystery-kicker">CASE 001 · CASE CLOSED</div><h1 class="mystery-title">사건의 진상</h1>'+
      '<div class="mystery-panel"><div class="mystery-result-score">'+score+' / 4 정답</div>'+
      '<p>'+(score===4?'명탐정 인정! 도파민의 평화를 지켜냈습니다.':'사건을 마쳤습니다. 아래에서 실제 사건의 흐름과 결정적인 단서를 확인해보세요.')+'</p>'+
      '<div class="mystery-divider"></div><h2>그 수요일, 도트에서 벌어진 일</h2>'+
      '<div class="mystery-story">범인은 박지훈이었다.\n\n일찍 시작하겠다던 장한철이 또다시 “본게임은 23시 10분부터”라고 공지하자, 다음 날 일찍 출근해야 하는 지훈의 불만이 폭발했다.\n\n20시 57분, 지훈은 편의점 모바일 주문을 결제했다. 그는 결제 시각만 찍힌 영수증을 알리바이로 내세우며 “그 시간에 편의점에 있었다”고 주장했다. 하지만 편의점 기록상 상품은 21시 04분에 수령했다. 즉 20시 57분 영수증은 매장에 있었다는 증거가 아니었다.\n\n20시 58분 무렵, 정모실에서 한철과 마주친 지훈은 언쟁 끝에 창고에서 가져온 무거운 금속 카드 보관함으로 한철을 때렸다. 보관함 걸쇠에는 남색 옷실밥이 남았다. 이후 지훈의 남색 점퍼 오른쪽 소매가 뜯어진 점이 확인됐다.\n\n허다은은 회의실 화상통화 기록, 손승민은 창고 문 기록, 서제이는 출입문 기록으로 각각 사건 시각의 위치를 뒷받침할 수 있었다. 지훈만이 영수증 시간을 이용해 실제 위치를 흐렸다.\n\n한철은 다행히 의식을 회복했다. 사건을 설명해주자 잠시 침묵하더니 말했다.\n“...그럼 오늘 벙은 몇 시에 시작해?”\n\n도파민 일동: “회장님 제발요!!!!”</div>'+
      '<div class="mystery-divider"></div><h3>정답 공개</h3>'+
      '<p>범인: <span class="mystery-highlight">박지훈</span></p>'+
      '<p>동기: <span class="mystery-highlight">밤 11시 이후에 시작하는 벙에 대한 불만</span></p>'+
      '<p>사용한 물건: <span class="mystery-highlight">금속 카드 보관함</span></p>'+
      '<p>핵심 단서: <span class="mystery-highlight">편의점 실제 수령 시각 21시 04분</span></p>'+
      '<p class="mystery-subtle">현장의 남색 실밥과 뜯어진 소매는 추가 정황입니다. 사전 결제 기록만으로는 현장 부재를 증명할 수 없다는 사실이 핵심입니다.</p>'+
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
      else if(ui.suspect==='jihoon'&&evidence==='pickup'){
        ui.feedback='🔎 알리바이 모순 발견! 20시 57분은 모바일 결제 시각일 뿐입니다. 박지훈이 편의점에서 물건을 받은 시각은 21시 04분이었어요.';
        if(!state.contradictions.includes('jihoon')){state.contradictions.push('jihoon');save();}
      }else if(ui.suspect==='daeun'&&evidence==='call'){
        ui.feedback='🔎 화상통화 기록으로 허다은이 사건 시각 회의실에 있었다는 사실이 확인됐습니다.';
      }else if(ui.suspect==='seungmin'&&evidence==='warehouse'){
        ui.feedback='🔎 창고에는 다른 출구가 없었습니다. 손승민의 창고 알리바이에 무게가 실립니다.';
      }else if(ui.suspect==='jei'&&evidence==='door'){
        ui.feedback='🔎 출입문 기록은 서제이가 사건 시간에 건물 밖에 있었다는 진술을 뒷받침합니다.';
      }else if(ui.suspect==='jihoon'&&evidence==='sleeve'){
        ui.feedback='🔎 남색 점퍼 소매와 현장 실밥이 유사합니다. 단독 확증은 아니니 결제·수령 시각과 함께 비교하세요.';
      }else if(ui.suspect==='jihoon'&&evidence==='receipt'){
        ui.feedback='영수증에는 20시 57분이라고 찍혔지만, 그때 매장 안에 있었다는 뜻일까요?';
      }else ui.feedback='이 증거만으로는 해당 진술의 거짓을 입증하기 어렵습니다. 시간 기록을 다시 비교해보세요.';
    }
    else if(action==='submit'){
      if(state.clues.length<6||state.interviewed.length<3)return;
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