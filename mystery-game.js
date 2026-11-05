/* DOPAMIN MYSTERY — playable single-player case prototype */
(function(){
  'use strict';
  const app = document.getElementById('app');
  const STORAGE_KEY = 'dott_mystery_case001_v1';
  const CASE_TITLE = '9시 7분, 정모실';
  const clues = [
    {id:'clock',room:'정모실',icon:'🕰️',name:'멈춘 탁상시계',text:'피해자 옆에 놓인 시계가 20시 58분에 멈춰 있다. 강한 충격으로 멈춘 흔적이 있어 사건 시각을 짐작하게 한다.'},
    {id:'trophy',room:'정모실',icon:'🏆',name:'황동 트로피',text:'무거운 황동 트로피가 책상 아래에 떨어져 있다. 손잡이에는 검은색 목도리 섬유로 보이는 실밥이 걸려 있다.'},
    {id:'phone',room:'정모실',icon:'📱',name:'피해자의 휴대전화',text:'20시 52분 수신 메시지: “장부 얘기, 정모실에서 둘이 정리해요.” 발신자 연락처는 “서 총무”로 저장돼 있다.'},
    {id:'ledger',room:'서류함',icon:'📒',name:'회비 장부 메모',text:'피해자가 남긴 메모: “회비 120만 원이 비어 있다. 오늘 윤서에게 직접 확인할 것.” 누군가 장부 한 장을 찢어 간 흔적도 있다.'},
    {id:'receipt',room:'서류함',icon:'☕',name:'카페 영수증',text:'서윤서 명의의 마지막 카드 결제 기록은 20시 42분. 이후 21시 10분까지 결제 내역은 확인되지 않는다. 카페에 계속 있었다는 증거는 아니다.'},
    {id:'entry',room:'복도',icon:'🔑',name:'출입 카드 기록',text:'20시 56분 정모실 출입: STAFF-02. 카드 대여대장에 따르면 STAFF-02는 이날 서윤서에게 발급된 임시 출입카드다.'},
    {id:'blackout',room:'복도',icon:'⚡',name:'정전 기록',text:'20시 55분부터 20시 59분까지 복도 CCTV가 꺼졌다. 카드 인식기는 예비 전원으로 정상 작동했다.'},
    {id:'photo',room:'복도',icon:'📸',name:'복도 단체사진',text:'20시 58분 촬영된 원본 사진에는 복도의 강도현과 이나경 두 사람이 함께 찍혀 있다. 사진 촬영 시간 메타데이터도 일치한다.'}
  ];
  const suspects = [
    {id:'yoon',emoji:'🧣',name:'서윤서',role:'동호회 총무',text:'“20시 50분부터 21시 5분까지 카페에 있었어요. 정모실에는 들어가지 않았어요.”',detail:'사건 당일 검은 목도리를 착용했다. 회비 장부를 관리하는 담당자다.'},
    {id:'kang',emoji:'🔦',name:'강도현',role:'전 운영진',text:'“정전이 나서 복도에 있었어요. 나경 씨와 같이 포스터 앞에서 사진도 찍었고요.”',detail:'피해자와 최근 운영 방식으로 다툰 적이 있다고 한다.'},
    {id:'lee',emoji:'📷',name:'이나경',role:'신입 회원',text:'“20시 58분에는 도현 씨와 복도에서 사진을 찍었어요. 그 후 바로 자리를 떠났어요.”',detail:'정모실 근처에 있던 건 인정하지만 피해자와는 개인적인 친분이 없다.'}
  ];
  const initial = () => ({started:false,clues:[],interviewed:[],contradiction:false,submitted:false,answer:null});
  function load(){
    try {
      const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!raw||typeof raw!=='object')return initial();
      const validClues=new Set(clues.map(x=>x.id));
      const validSuspects=new Set(suspects.map(x=>x.id));
      return {
        started:raw.started===true,
        clues:Array.isArray(raw.clues)?raw.clues.filter(x=>validClues.has(x)):[],
        interviewed:Array.isArray(raw.interviewed)?raw.interviewed.filter(x=>validSuspects.has(x)):[],
        contradiction:raw.contradiction===true,
        submitted:raw.submitted===true,
        answer:raw.answer&&typeof raw.answer==='object'?raw.answer:null
      };
    } catch(e) {return initial();}
  }
  let progress=load();
  const ui={view:'home',tab:'investigate',room:'정모실',suspect:'yoon',selectedClue:'',feedback:''};
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}catch(e){ /* private mode */ }}
  function button(action,label,extra='',attrs=''){return '<button class="mystery-btn '+extra+'" type="button" data-action="'+action+'" '+attrs+'>'+label+'</button>'}
  function renderHome(){
    return '<div class="mystery-kicker">DOPAMIN ORIGINAL MYSTERY · CASE 001</div>'+
      '<h1 class="mystery-title">혼자서 밝혀내는 사건의 진실</h1>'+
      '<p class="mystery-lead">스토리를 읽고, 현장을 조사하고, 용의자의 진술에 증거를 제시하세요. 마지막 선택에 따라 수사 결과가 달라집니다.</p>'+
      '<div class="mystery-grid"><section class="mystery-panel mystery-card">'+
        '<div class="mystery-case-symbol" aria-hidden="true">🕰️</div>'+
        '<div class="mystery-kicker">체험판 · 첫 번째 사건</div>'+
        '<h2>《'+CASE_TITLE+'》</h2>'+
        '<p>정모가 끝난 직후, 동호회장이 숨진 채 발견됐다. 유력한 용의자는 세 명. 같은 시간을 다르게 기억하는 사람들 중 거짓말을 하고 있는 사람은 누구일까?</p>'+
        '<div class="mystery-meta"><span class="mystery-pill">👤 1인용</span><span class="mystery-pill">⏱ 약 10~20분</span><span class="mystery-pill">🔍 입문</span></div>'+
        '<div class="mystery-actions">'+button('intro',progress.started?'사건 브리핑 보기':'사건 시작하기','mystery-btn-primary')+
          (progress.started?button('resume','이어서 조사하기'):'')+'</div>'+
        '</section><aside class="mystery-panel">'+
        '<h3>수사 안내</h3><p>① 사건의 전말을 읽습니다.</p><p>② 세 장소에서 단서를 찾습니다.</p><p>③ 용의자를 심문하고 증거를 제시합니다.</p><p>④ 범인·동기·핵심 증거를 선택합니다.</p>'+
        '<div class="mystery-divider"></div><p class="mystery-subtle">진행 상황은 현재 브라우저에만 저장됩니다. 다른 기기와 자동 동기화되지는 않습니다.</p>'+
        '</aside></div>';
  }
  function renderIntro(){
    return '<div class="mystery-kicker">CASE 001 · 사건 브리핑</div><h1 class="mystery-title">《'+CASE_TITLE+'》</h1>'+
      '<div class="mystery-panel"><h2>그날 밤, 무슨 일이 있었나</h2>'+
      '<div class="mystery-story">20시 40분. 도심의 작은 보드게임 동호회는 정기 모임을 마쳤다.\n\n21시 07분. 동호회장 김현우가 정모실에서 숨진 채 발견됐다. 정모실은 잠겨 있지 않았지만, 사건 전후 복도에는 짧은 정전이 발생했다.\n\n사건 발생 시간대에 건물에 남은 주요 인물은 총무 서윤서, 전 운영진 강도현, 신입 회원 이나경.\n\n당신은 사건을 맡은 조사관이다. 현장의 작은 흔적과 세 사람의 진술을 맞춰 범인을 밝혀야 한다.</div>'+
      '<div class="mystery-actions">'+button('start','조사 시작','mystery-btn-primary')+button('home','게임 목록으로')+'</div></div>';
  }
  function renderInvestigation(){
    const entries=clues.filter(x=>x.room===ui.room);
    const selected=clues.find(x=>x.id===ui.selectedClue && progress.clues.includes(x.id));
    return '<h2 class="mystery-section-title">현장 조사</h2>'+
      '<p class="mystery-subtle">조사할 장소를 선택하고 수상한 물건을 눌러보세요. 단서는 수사 수첩에 자동 저장됩니다.</p>'+
      '<div class="mystery-room-tabs">'+['정모실','서류함','복도'].map(room=>
        '<button type="button" class="mystery-room '+(room===ui.room?'active':'')+'" data-action="room" data-id="'+room+'">'+room+'</button>'
      ).join('')+'</div>'+
      '<div class="mystery-item-grid">'+entries.map(c=>
        '<button type="button" class="mystery-item '+(progress.clues.includes(c.id)?'done':'')+'" data-action="clue" data-id="'+c.id+'">'+
        '<span class="mystery-emoji" aria-hidden="true">'+c.icon+'</span><strong>'+c.name+'</strong><small>'+(progress.clues.includes(c.id)?'✓ 단서 확보됨':'눌러서 조사하기')+'</small></button>'
      ).join('')+'</div>'+
      (selected?'<div class="mystery-evidence" role="status"><h3>'+selected.icon+' '+selected.name+'</h3><p>'+selected.text+'</p>'+button('notebook','수사 수첩 열기')+'</div>':'');
  }
  function renderInterrogation(){
    const selected=suspects.find(x=>x.id===ui.suspect)||suspects[0];
    const available=clues.filter(x=>progress.clues.includes(x.id));
    return '<h2 class="mystery-section-title">인물 심문</h2><p class="mystery-subtle">인물을 선택해 진술을 듣고, 의심스러운 주장에 확보한 증거를 제시해보세요.</p>'+
      '<div class="mystery-suspect-list">'+suspects.map(s=>
        '<button type="button" class="mystery-suspect '+(ui.suspect===s.id?'active':'')+'" data-action="suspect" data-id="'+s.id+'">'+
        '<span aria-hidden="true">'+s.emoji+'</span><strong>'+s.name+'</strong><small>'+s.role+'</small></button>'
      ).join('')+'</div>'+
      '<div class="mystery-note"><strong>'+selected.name+'의 진술</strong><p>'+selected.text+'</p></div>'+
      '<div class="mystery-note"><strong>인물 기록</strong><p>'+selected.detail+'</p></div>'+
      '<label class="mystery-field" for="mystery-claim">진술에 제시할 증거'+
        '<select id="mystery-claim"><option value="">증거를 선택하세요</option>'+available.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+'</select></label>'+
      '<div class="mystery-actions">'+button('present','이 증거 제시하기','mystery-btn-primary',available.length?'':'disabled')+'</div>'+
      (ui.feedback?'<div class="'+(ui.feedback.indexOf('모순 발견')>=0?'mystery-success':'mystery-warning')+'" role="status">'+esc(ui.feedback)+'</div>':'')+
      (progress.contradiction?'<div class="mystery-success">✓ 중요한 진술의 모순을 밝혀냈습니다. 최종 추리에 활용하세요.</div>':'');
  }
  function renderNotebook(){
    const found=clues.filter(c=>progress.clues.includes(c.id));
    return '<h2 class="mystery-section-title">수사 수첩</h2>'+
      '<p class="mystery-subtle">확보한 단서 '+found.length+' / '+clues.length+'개 · 면담한 용의자 '+progress.interviewed.length+' / '+suspects.length+'명</p>'+
      (found.length?found.map(c=>'<div class="mystery-note"><strong>'+c.icon+' '+c.name+'</strong><p>'+c.text+'</p></div>').join(''):'<p>아직 확보한 단서가 없습니다. 현장 조사부터 시작하세요.</p>')+
      '<div class="mystery-divider"></div><h3>용의자 면담</h3><p class="mystery-subtle">'+(progress.interviewed.length?progress.interviewed.map(id=>suspects.find(x=>x.id===id)?.name).filter(Boolean).join(' · '):'아직 면담한 인물이 없습니다.')+'</p>';
  }
  function renderFinal(){
    const ready=progress.clues.length>=4 && progress.interviewed.length>=2;
    return '<h2 class="mystery-section-title">최종 추리</h2>'+
      '<p class="mystery-subtle">사건의 범인과 동기, 결정적인 증거를 선택하세요. 제출 후 사건의 진상을 확인할 수 있습니다.</p>'+
      (!ready?'<div class="mystery-warning">🔒 최종 추리는 단서 4개 이상을 확보하고 용의자 2명 이상을 면담한 뒤에 제출할 수 있습니다. 현재 단서 '+progress.clues.length+'개 · 면담 '+progress.interviewed.length+'명</div>':'')+
      '<label class="mystery-field" for="mystery-answer-person">01. 범인은 누구인가요?<select id="mystery-answer-person"><option value="">범인을 선택하세요</option>'+suspects.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('')+'</select></label>'+
      '<label class="mystery-field" for="mystery-answer-motive">02. 범행 동기는 무엇인가요?<select id="mystery-answer-motive"><option value="">동기를 선택하세요</option><option value="money">회비 장부의 금액 누락을 숨기기 위해</option><option value="jealousy">오랜 개인적인 질투 때문에</option><option value="game">분실된 게임의 책임을 피하기 위해</option></select></label>'+
      '<label class="mystery-field" for="mystery-answer-evidence">03. 범인의 알리바이를 깨뜨리는 결정적 증거는?<select id="mystery-answer-evidence"><option value="">증거를 선택하세요</option>'+
      clues.filter(c=>progress.clues.includes(c.id)).map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('')+'</select></label>'+
      '<div class="mystery-actions">'+button('submit','추리 제출하고 진상 확인','mystery-btn-primary',ready?'':'disabled')+'</div>'+
      (ui.feedback?'<div class="mystery-warning" role="status">'+esc(ui.feedback)+'</div>':'');
  }
  function renderPlay(){
    const completed=progress.clues.length;
    const body={investigate:renderInvestigation,interrogate:renderInterrogation,notebook:renderNotebook,final:renderFinal}[ui.tab]();
    return '<div class="mystery-kicker">CASE 001 · INVESTIGATION</div>'+
      '<h1 class="mystery-title">《'+CASE_TITLE+'》</h1>'+
      '<p class="mystery-lead">모든 물건이 진실을 말하지는 않습니다. 진술과 단서를 서로 비교해보세요.</p>'+
      '<div class="mystery-meta"><span class="mystery-pill">단서 '+completed+' / 8</span><span class="mystery-pill">면담 '+progress.interviewed.length+' / 3</span><span class="mystery-pill">'+(progress.contradiction?'✓ 모순 발견':'모순 미발견')+'</span></div>'+
      '<div class="mystery-progress" role="progressbar" aria-valuemin="0" aria-valuemax="8" aria-valuenow="'+completed+'" aria-label="단서 수집 진행률"><span style="width:'+(completed/8*100)+'%"></span></div>'+
      '<div class="mystery-tabs" role="navigation" aria-label="게임 진행 메뉴">'+[
        ['investigate','🔍 현장 조사'],['interrogate','💬 인물 심문'],['notebook','📔 수사 수첩'],['final','⚖️ 최종 추리']
      ].map(t=>'<button type="button" class="mystery-tab '+(ui.tab===t[0]?'active':'')+'" data-action="tab" data-id="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>'+
      '<section class="mystery-panel">'+body+'</section>'+
      '<p class="mystery-footer-note">진행 상황은 이 브라우저에 자동 저장됩니다. 다른 기기로는 이어할 수 없습니다.</p>';
  }
  function renderResult(){
    const a=progress.answer||{};
    const score=Number(a.person==='yoon')+Number(a.motive==='money')+Number(a.evidence==='entry');
    return '<div class="mystery-kicker">CASE 001 · CASE CLOSED</div><h1 class="mystery-title">수사 결과</h1>'+
      '<div class="mystery-panel"><div class="mystery-result-score">'+score+' / 3 정답</div>'+
      '<p>'+(score===3?'축하합니다. 사건의 핵심을 정확하게 밝혀냈어요.':'수사를 마쳤습니다. 아래에서 실제 사건의 진상을 확인해보세요.')+'</p>'+
      '<div class="mystery-divider"></div><h2>사건의 진상</h2>'+
      '<div class="mystery-story">범인은 총무 서윤서였다.\n\n서윤서는 회비 장부에서 사라진 120만 원의 내역이 드러나는 것을 막으려 했다. 20시 42분 카페에서 결제한 뒤 다시 건물로 돌아와 피해자를 만나기로 했다.\n\n20시 55분 정전으로 복도 CCTV가 멈췄지만, 예비 전원으로 움직이던 출입 카드 인식기는 20시 56분 STAFF-02의 정모실 입장을 기록했다. 이 카드를 발급받은 사람은 서윤서였다.\n\n서윤서는 정모실에서 피해자와 다투다가 황동 트로피로 가격했다. 떨어진 트로피에는 서윤서가 착용한 검은 목도리 섬유가 남았다. 피해자 옆 시계는 충격으로 20시 58분에 멈췄다.\n\n복도의 20시 58분 사진은 강도현과 이나경의 진술을 뒷받침한다. 반면 “정모실에 들어간 적 없다”는 서윤서의 말은 출입 기록과 정면으로 모순된다.</div>'+
      '<div class="mystery-divider"></div><h3>정답</h3>'+
      '<p>범인: <span class="mystery-highlight">서윤서</span></p>'+
      '<p>동기: <span class="mystery-highlight">회비 장부 누락 은폐</span></p>'+
      '<p>결정적 증거: <span class="mystery-highlight">STAFF-02 출입 카드 기록</span></p>'+
      '<div class="mystery-actions">'+button('restart','새로 수사하기','mystery-btn-primary')+button('home','게임 목록으로')+'</div></div>';
  }
  function render(){
    const page={home:renderHome,intro:renderIntro,play:renderPlay,result:renderResult}[ui.view]();
    app.innerHTML=nav('mystery')+'<main class="mystery-wrap"><div class="mystery-content">'+page+'</div></main>'+footer();
  }
  function openTab(id){
    if(!['investigate','interrogate','notebook','final'].includes(id))return;
    ui.tab=id;ui.selectedClue='';ui.feedback='';render();
  }
  app.addEventListener('click',function(e){
    const el=e.target.closest('[data-action]');if(!el||!app.contains(el))return;
    const action=el.dataset.action,id=el.dataset.id;
    if(action==='home'){ui.view='home'}
    else if(action==='intro'){ui.view='intro'}
    else if(action==='start'){progress.started=true;save();ui.view='play';ui.tab='investigate'}
    else if(action==='resume'){ui.view=progress.submitted?'result':'play'}
    else if(action==='tab'){openTab(id);return}
    else if(action==='room'){ui.room=id;ui.selectedClue=''}
    else if(action==='clue'){
      const clue=clues.find(c=>c.id===id);if(!clue)return;
      if(!progress.clues.includes(id)){progress.clues.push(id);save()}
      ui.selectedClue=id;
    }
    else if(action==='suspect'){
      if(!suspects.some(x=>x.id===id))return;
      ui.suspect=id;ui.feedback='';
      if(!progress.interviewed.includes(id)){progress.interviewed.push(id);save()}
    }
    else if(action==='notebook'){ui.tab='notebook';ui.feedback=''}
    else if(action==='present'){
      const evidence=document.getElementById('mystery-claim')?.value;
      if(!evidence){ui.feedback='제시할 증거를 먼저 선택해주세요.'}
      else if(ui.suspect==='yoon'&&evidence==='entry'){
        progress.contradiction=true;save();
        ui.feedback='모순 발견! 서윤서: “출입 카드는 제가 갖고 있었지만… 그날 누가 빌려 갔는지는 기억이 안 나요.” 정모실에 들어간 적 없다는 첫 진술과 충돌합니다.';
      }else if((ui.suspect==='kang'||ui.suspect==='lee')&&evidence==='photo'){
        ui.feedback='사진은 두 사람이 20시 58분에 복도에 있었다는 진술을 뒷받침합니다.';
      }else{ui.feedback='아직 이 증거만으로는 해당 진술의 모순을 입증하기 어렵습니다. 다른 단서를 찾아보세요.'}
    }
    else if(action==='submit'){
      if(progress.clues.length<4||progress.interviewed.length<2)return;
      const person=document.getElementById('mystery-answer-person')?.value;
      const motive=document.getElementById('mystery-answer-motive')?.value;
      const evidence=document.getElementById('mystery-answer-evidence')?.value;
      if(!person||!motive||!evidence){ui.feedback='범인, 동기, 결정적 증거를 모두 선택해주세요.'}
      else{progress.submitted=true;progress.answer={person,motive,evidence};save();ui.view='result';ui.feedback=''}
    }
    else if(action==='restart'){
      if(!window.confirm('기존 수사 기록을 지우고 처음부터 시작할까요?'))return;
      progress=initial();save();ui.view='intro';ui.tab='investigate';ui.room='정모실';ui.suspect='yoon';ui.selectedClue='';ui.feedback='';
    }else{return}
    render();
  });
  render();
})();