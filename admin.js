const app=document.getElementById('app');
let tab='schedules';
let data={schedules:[],notices:[],boardgame:[],murder:[],deduction:[],settings:null};

(async()=>{
  const s=await DOTT_DB.session();
  if(!s)return renderLogin();
  await loadAll();
  renderAdmin();
})();

function renderLogin(){
  app.innerHTML=`${nav('admin')}<div class="login-box"><span class="eyebrow">🔒 관리자</span><h1>관리자 로그인</h1><p style="color:var(--muted);font-size:13px;line-height:1.6">실제 운영용 관리자 로그인입니다. Supabase Authentication에 만든 관리자 이메일/비밀번호를 사용하세요.</p><label class="label">이메일</label><input id="email" class="field" type="email" placeholder="admin@example.com"><label class="label" style="margin-top:12px">비밀번호</label><input id="password" class="field" type="password" placeholder="비밀번호"><button id="login" class="btn primary" style="width:100%;margin-top:14px">로그인</button><div class="error" id="err"></div></div>${footer()}`;
  document.getElementById('login').onclick=async()=>{
    const btn=document.getElementById('login');
    btn.disabled=true;
    try{
      await DOTT_DB.signIn(document.getElementById('email').value,document.getElementById('password').value);
      await loadAll();
      renderAdmin();
    }catch(e){document.getElementById('err').textContent=e.message}
    finally{btn.disabled=false}
  };
}

async function loadAll(){
  const [s,n,b,m,d,settings]=await Promise.all([
    DOTT_DB.schedules(),DOTT_DB.notices(),DOTT_DB.catalog('boardgame'),DOTT_DB.catalog('murder'),DOTT_DB.catalog('deduction'),DOTT_DB.settings()
  ]);
  data={schedules:s,notices:n,boardgame:b,murder:m,deduction:d,settings};
}

function renderAdmin(){
  const tabs=[['schedules','일정 관리'],['notices','공지 관리'],['boardgame','보드게임'],['murder','머더미스터리'],['deduction','추리게임'],['settings','관리자 설정']];
  app.innerHTML=`${nav('admin')}<main class="admin-wrap"><section class="admin-hero"><div><span class="eyebrow">⚙ 관리자 화면</span><h1>일정 · 공지 · 보유목록 관리</h1><p>여기서 등록한 내용은 공개 페이지에 바로 반영됩니다.</p></div><div class="toolbar"><a class="btn" href="index.html">공개 화면 보기</a><button class="btn" id="logout">로그아웃</button></div></section><div class="info-box">현재 데이터는 Supabase에 저장됩니다. 일반 방문자는 조회만 가능하고, 로그인한 관리자만 추가·수정·삭제할 수 있습니다.</div><div class="tabs">${tabs.map(([v,l])=>`<button class="tab ${tab===v?'active':''}" data-tab="${v}">${l}</button>`).join('')}</div><div id="panel"></div></main>${footer()}`;
  document.getElementById('logout').onclick=async()=>{await DOTT_DB.signOut();renderLogin()};
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;renderAdmin()});
  renderPanel();
}

function renderPanel(){
  const p=document.getElementById('panel');
  if(tab==='settings')return settingsPanel(p);
  if(tab==='schedules')return schedulePanel(p);
  if(tab==='notices')return noticePanel(p);
  return catalogPanel(p,tab);
}

function schedulePanel(p){
  p.innerHTML=`<div class="admin-tools"><div></div><button class="btn primary" id="add">+ 일정 추가</button></div><div class="table-wrap"><table class="table"><thead><tr><th>날짜</th><th>시간</th><th>카테고리</th><th>일정명</th><th>인원</th><th>벙주</th><th>상태</th><th>관리</th></tr></thead><tbody>${data.schedules.map(x=>{
    const cancelled=isCancelledStatus(x.status);
    return `<tr class="${cancelled?'cancelled-row':''}"><td>${fmtDate(x.event_date)}</td><td>${(x.event_time||'').slice(0,5)}</td><td>${tag(x.category)}</td><td><b>${esc(x.title)}</b></td><td>${x.people||'-'}명</td><td>${esc(x.manager||'')}</td><td><span class="schedule-status ${cancelled?'cancelled':''}">${scheduleStatusLabel(x.status)}</span></td><td><div class="actions"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`
  }).join('')||'<tr><td colspan="8">등록된 일정이 없습니다.</td></tr>'}</tbody></table></div>`;
  document.getElementById('add').onclick=()=>scheduleModal();
  wireRows('schedules',scheduleModal);
}

function normalizeTime10(v='18:00'){
  const [h,m]=String(v).slice(0,5).split(':').map(Number);
  if(!Number.isFinite(h)||!Number.isFinite(m))return '18:00';
  let total=(h*60+m);
  total=Math.round(total/10)*10;
  total=(total+1440)%1440;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function timeOptions(selected='18:00'){
  const pick=normalizeTime10(selected);
  let html='';
  for(let h=0;h<24;h++)for(let m=0;m<60;m+=10){
    const v=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    html+=`<option value="${v}" ${v===pick?'selected':''}>${v}</option>`;
  }
  return html;
}

function scheduleModal(x={}){
  const currentStatus=isCancelledStatus(x.status)?'취소':'예약';
  showModal(x.id?'일정 수정':'일정 추가',`<div class="form-grid"><div><label class="label">날짜</label><input id="f_date" class="field" type="date" value="${x.event_date||todayYmd()}"></div><div><label class="label">시간</label><select id="f_time" class="field">${timeOptions((x.event_time||'18:00').slice(0,5))}</select></div><div><label class="label">카테고리</label><select id="f_cat" class="field">${CFG.categories.map(c=>`<option value="${c.value}" ${x.category===c.value?'selected':''}>${c.label}</option>`).join('')}</select></div><div><label class="label">인원</label><input id="f_people" class="field" type="number" min="1" value="${x.people||4}"></div><div class="full"><label class="label">일정명</label><input id="f_title" class="field" value="${esc(x.title||'')}"></div><div><label class="label">벙주</label><input id="f_manager" class="field" value="${esc(x.manager||'')}"></div><div><label class="label">상태</label><select id="f_status" class="field"><option value="예약" ${currentStatus==='예약'?'selected':''}>예약</option><option value="취소" ${currentStatus==='취소'?'selected':''}>취소</option></select></div><div class="full"><label class="label">메모</label><textarea id="f_note" class="field" rows="3">${esc(x.note||'')}</textarea></div></div>`,async m=>{
    const row={
      event_date:m.querySelector('#f_date').value,
      event_time:m.querySelector('#f_time').value,
      category:m.querySelector('#f_cat').value,
      title:m.querySelector('#f_title').value.trim(),
      people:+m.querySelector('#f_people').value||null,
      manager:m.querySelector('#f_manager').value.trim(),
      status:m.querySelector('#f_status').value,
      note:m.querySelector('#f_note').value.trim()
    };
    if(!row.title)throw new Error('일정명을 입력해 주세요.');
    x.id?await DOTT_DB.update('schedules',x.id,row):await DOTT_DB.insert('schedules',row);
    await loadAll();renderAdmin();toast('저장했습니다.');
  });
}

function noticePanel(p){
  p.innerHTML=`<div class="admin-tools"><div></div><button class="btn primary" id="add">+ 공지 추가</button></div><div class="table-wrap"><table class="table"><thead><tr><th>구분</th><th>제목</th><th>내용</th><th>작성일</th><th>관리</th></tr></thead><tbody>${data.notices.map(x=>`<tr><td>${x.pinned?'📌 필독':'안내'}</td><td><b>${esc(x.title)}</b></td><td><span class="admin-notice-preview">${esc(noticePlainText(x.content))}</span></td><td>${new Date(x.created_at).toLocaleDateString('ko-KR')}</td><td><div class="actions"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`).join('')||'<tr><td colspan="5">등록된 공지가 없습니다.</td></tr>'}</tbody></table></div>`;
  document.getElementById('add').onclick=()=>noticeModal();
  wireRows('notices',noticeModal);
}

function noticeModal(x={}){
  const editorHtml=noticeEditorHtml(x.content||'');
  showModal(x.id?'공지 수정':'공지 추가',`<div><label class="label">제목</label><input id="f_title" class="field" value="${esc(x.title||'')}"></div><div style="margin-top:12px"><label class="label">내용</label><div class="rich-toolbar"><button type="button" class="rich-tool" id="fmtBold"><b>B</b> 굵게</button><label class="rich-color">글자색 <input type="color" id="fmtColor" value="#e95420"></label><button type="button" class="rich-tool" id="fmtClear">서식 지우기</button><span class="rich-help">강조할 글자를 드래그한 뒤 적용하세요.</span></div><div id="f_content" class="rich-editor" contenteditable="true" data-placeholder="공지 내용을 입력하세요.">${editorHtml}</div></div><label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px"><input id="f_pin" type="checkbox" ${x.pinned?'checked':''}> 상단 고정</label>`,async m=>{
    const editor=m.querySelector('#f_content');
    const cleaned=sanitizeNoticeRichHtml(editor.innerHTML).trim();
    const row={title:m.querySelector('#f_title').value.trim(),content:NOTICE_RICH_PREFIX+cleaned,pinned:m.querySelector('#f_pin').checked};
    if(!row.title)throw new Error('제목을 입력해 주세요.');
    x.id?await DOTT_DB.update('notices',x.id,row):await DOTT_DB.insert('notices',row);
    await loadAll();renderAdmin();toast('저장했습니다.');
  });
  const modal=document.getElementById('modal');
  const editor=modal.querySelector('#f_content');
  const colorInput=modal.querySelector('#fmtColor');
  let savedRange=null;
  const remember=()=>{
    const sel=window.getSelection();
    if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode))savedRange=sel.getRangeAt(0).cloneRange();
  };
  const restore=()=>{
    if(!savedRange)return false;
    const sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange.cloneRange());
    return true;
  };
  const applyTextColor=color=>{
    if(!savedRange||savedRange.collapsed)return;
    const range=savedRange.cloneRange();
    // 선택한 내용이 공지 편집기 안에 있을 때만 색상을 적용합니다.
    if(!editor.contains(range.commonAncestorContainer))return;
    const span=document.createElement('span');
    span.style.color=color;
    const frag=range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
    // 색상 적용 뒤 커서는 강조 영역 뒤로 보내되, 저장한 선택 범위는 덮어쓰지 않습니다.
    const after=document.createRange();
    after.setStartAfter(span);after.collapse(true);
    const sel=window.getSelection();sel.removeAllRanges();sel.addRange(after);
    editor.normalize();
    editor.focus();
  };
  ['keyup','mouseup','touchend'].forEach(ev=>editor.addEventListener(ev,remember));
  editor.addEventListener('focusout',()=>{const sel=window.getSelection();if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode))remember()});
  modal.querySelector('#fmtBold').addEventListener('mousedown',e=>{e.preventDefault();restore();document.execCommand('bold',false,null);editor.focus()});
  // color input은 팔레트를 여는 순간 브라우저 선택 영역이 사라질 수 있어 change 시 저장해 둔 Range에 직접 span을 씌웁니다.
  colorInput.addEventListener('mousedown',()=>remember());
  colorInput.addEventListener('change',e=>applyTextColor(e.target.value));
  modal.querySelector('#fmtClear').addEventListener('mousedown',e=>{e.preventDefault();restore();document.execCommand('removeFormat',false,null);editor.focus()});
}

function catalogPanel(p,kind){
  const title={boardgame:'보드게임',murder:'머더미스터리',deduction:'추리게임'}[kind];
  const descKey={boardgame:'boardgame_description',murder:'murder_description',deduction:'deduction_description'}[kind];
  const defaultDesc={boardgame:'도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.',murder:'보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.',deduction:'추리·사건 해결형 게임 보유 목록을 확인하세요.'}[kind];
  const currentDesc=(data.settings&&data.settings[descKey])||defaultDesc;
  p.innerHTML=`<div class="catalog-admin-desc"><label class="label">${title} 리스트 제목 아래 설명 문구</label><div class="catalog-admin-desc-row"><textarea id="catalogDesc" class="field" rows="2">${esc(currentDesc)}</textarea><button class="btn" id="saveCatalogDesc">설명 저장</button></div><div class="error" id="catalogDescErr"></div></div><div class="admin-tools"><div>${data[kind].length}개 등록됨</div><button class="btn primary" id="add">+ ${title} 추가</button></div><div class="table-wrap"><table class="table"><thead><tr><th>이름</th><th>인원</th><th>시간</th><th>난이도</th><th>장르</th><th>상태</th><th>관리</th></tr></thead><tbody>${data[kind].map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${x.min_players||'?'}~${x.max_players||'?'}인</td><td>${esc(x.playtime||'')}</td><td>${esc(x.difficulty||'')}</td><td>${esc(x.genre||'')}</td><td>${esc(x.status||'보유')}</td><td><div class="actions"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`).join('')||`<tr><td colspan="7">등록된 ${title}이 없습니다.</td></tr>`}</tbody></table></div>`;
  document.getElementById('saveCatalogDesc').onclick=async()=>{
    const btn=document.getElementById('saveCatalogDesc'),err=document.getElementById('catalogDescErr');
    btn.disabled=true;err.textContent='';
    try{
      data.settings=await DOTT_DB.saveSettings({[descKey]:document.getElementById('catalogDesc').value.trim()});
      toast(`${title} 설명을 저장했습니다.`);
    }catch(e){err.textContent=(e.message||e)+' — add-catalog-descriptions.sql을 먼저 실행해 주세요.'}
    finally{btn.disabled=false}
  };
  document.getElementById('add').onclick=()=>catalogModal({},kind);
  wireRows('catalog_items',x=>catalogModal(x,kind),kind);
}

function catalogModal(x={},kind){
  showModal(x.id?'항목 수정':'항목 추가',`<div class="form-grid"><div class="full"><label class="label">이름</label><input id="f_name" class="field" value="${esc(x.name||'')}"></div><div><label class="label">최소 인원</label><input id="f_min" class="field" type="number" min="1" value="${x.min_players||2}"></div><div><label class="label">최대 인원</label><input id="f_max" class="field" type="number" min="1" value="${x.max_players||4}"></div><div><label class="label">플레이시간</label><input id="f_time" class="field" placeholder="60~90분" value="${esc(x.playtime||'')}"></div><div><label class="label">난이도</label><select id="f_diff" class="field"><option value="">선택 안함</option>${['쉬움','보통','어려움'].map(v=>`<option ${x.difficulty===v?'selected':''}>${v}</option>`).join('')}</select></div><div><label class="label">장르</label><input id="f_genre" class="field" placeholder="전략 / 파티 / 추리" value="${esc(x.genre||'')}"></div><div><label class="label">상태</label><select id="f_status" class="field">${['보유','대여중','수리중','분실'].map(v=>`<option ${x.status===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="full"><label class="label">소유주</label><textarea id="f_note" class="field" rows="3">${esc(x.note||'')}</textarea></div></div>`,async m=>{
    const row={kind,name:m.querySelector('#f_name').value.trim(),min_players:+m.querySelector('#f_min').value||null,max_players:+m.querySelector('#f_max').value||null,playtime:m.querySelector('#f_time').value.trim(),difficulty:m.querySelector('#f_diff').value,genre:m.querySelector('#f_genre').value.trim(),status:m.querySelector('#f_status').value,note:m.querySelector('#f_note').value.trim()};
    if(!row.name)throw new Error('이름을 입력해 주세요.');
    x.id?await DOTT_DB.update('catalog_items',x.id,row):await DOTT_DB.insert('catalog_items',row);
    await loadAll();renderAdmin();toast('저장했습니다.');
  });
}

function wireRows(table,editFn,kind){
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
    const list=table==='schedules'?data.schedules:table==='notices'?data.notices:data[kind];
    editFn(list.find(x=>x.id===b.dataset.edit));
  });
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm('정말 삭제할까요?'))return;
    await DOTT_DB.remove(table,b.dataset.del);
    await loadAll();renderAdmin();toast('삭제했습니다.');
  });
}

function settingsPanel(p){
  const s={
    hero_badge:'◎ 전체 공개 일정',
    hero_title:'우리의 모든 일정을\n한눈에 확인하세요',
    hero_description:'월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.',
    boardgame_description:'도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.',
    murder_description:'보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.',
    deduction_description:'추리·사건 해결형 게임 보유 목록을 확인하세요.',
    ...(data.settings||{})
  };
  p.innerHTML=`<div style="display:grid;gap:18px;max-width:720px">
    <div class="card"><div class="card-head"><h2>메인 화면 문구</h2></div><div style="padding:20px">
      <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-top:0">예약현황 첫 화면 상단에 보이는 문구를 직접 변경할 수 있습니다. 제목에서 줄을 바꾸고 싶은 곳에 Enter를 넣으면 그대로 반영됩니다.</p>
      <label class="label">상단 작은 문구</label><input id="heroBadge" class="field" value="${esc(s.hero_badge)}">
      <label class="label" style="margin-top:12px">큰 제목</label><textarea id="heroTitle" class="field" rows="3">${esc(s.hero_title)}</textarea>
      <label class="label" style="margin-top:12px">설명 문구</label><textarea id="heroDescription" class="field" rows="4">${esc(s.hero_description)}</textarea>
      <button class="btn primary" id="saveHero" style="margin-top:14px">메인 문구 저장</button><div class="error" id="settingsErr"></div>
    </div></div>

    <div class="card"><div class="card-head"><h2>보유 리스트 설명 문구</h2></div><div style="padding:20px">
      <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-top:0">보드게임·머더미스터리·추리게임 페이지 상단의 설명 문구를 각각 수정할 수 있습니다. 줄바꿈도 그대로 반영됩니다.</p>
      <label class="label">보드게임 설명</label><textarea id="boardgameDescription" class="field" rows="3">${esc(s.boardgame_description)}</textarea>
      <label class="label" style="margin-top:12px">머더미스터리 설명</label><textarea id="murderDescription" class="field" rows="3">${esc(s.murder_description)}</textarea>
      <label class="label" style="margin-top:12px">추리게임 설명</label><textarea id="deductionDescription" class="field" rows="3">${esc(s.deduction_description)}</textarea>
      <button class="btn primary" id="saveCatalogDescriptions" style="margin-top:14px">리스트 설명 저장</button><div class="error" id="catalogSettingsErr"></div>
    </div></div>

    <div class="card"><div class="card-head"><h2>관리자 비밀번호 변경</h2></div><div style="padding:20px">
      <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-top:0">현재 로그인한 관리자 자신의 Supabase Auth 비밀번호를 변경합니다. 8자 이상을 권장합니다.</p>
      <label class="label">새 비밀번호</label><input id="pw1" class="field" type="password">
      <label class="label" style="margin-top:12px">새 비밀번호 확인</label><input id="pw2" class="field" type="password">
      <button class="btn primary" id="changePw" style="margin-top:14px">비밀번호 변경</button>
    </div></div>
  </div>`;

  document.getElementById('saveHero').onclick=async()=>{
    const btn=document.getElementById('saveHero'),err=document.getElementById('settingsErr');btn.disabled=true;err.textContent='';
    try{
      const row={hero_badge:document.getElementById('heroBadge').value.trim(),hero_title:document.getElementById('heroTitle').value.trim(),hero_description:document.getElementById('heroDescription').value.trim()};
      if(!row.hero_title)throw new Error('큰 제목을 입력해 주세요.');
      data.settings=await DOTT_DB.saveSettings(row);toast('메인 화면 문구를 저장했습니다.');
    }catch(e){err.textContent=(e.message||e)+' — add-site-settings.sql을 아직 실행하지 않았다면 먼저 실행해 주세요.'}
    finally{btn.disabled=false}
  };

  document.getElementById('saveCatalogDescriptions').onclick=async()=>{
    const btn=document.getElementById('saveCatalogDescriptions'),err=document.getElementById('catalogSettingsErr');btn.disabled=true;err.textContent='';
    try{
      const row={
        boardgame_description:document.getElementById('boardgameDescription').value.trim(),
        murder_description:document.getElementById('murderDescription').value.trim(),
        deduction_description:document.getElementById('deductionDescription').value.trim()
      };
      data.settings=await DOTT_DB.saveSettings(row);toast('리스트 설명을 저장했습니다.');
    }catch(e){err.textContent=(e.message||e)+' — add-catalog-descriptions.sql을 먼저 실행해 주세요.'}
    finally{btn.disabled=false}
  };

  document.getElementById('changePw').onclick=async()=>{
    const a=document.getElementById('pw1').value,b=document.getElementById('pw2').value;
    if(a.length<6)return alert('6자 이상 입력해 주세요.');
    if(a!==b)return alert('비밀번호가 일치하지 않습니다.');
    await DOTT_DB.changePassword(a);toast('비밀번호를 변경했습니다.');
  };
}
