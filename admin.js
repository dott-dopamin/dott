const app=document.getElementById('app');
let tab='schedules';
let attendanceFilter='all';
let attendanceSearch='';
let scheduleView='month';
let scheduleCursor=new Date(); scheduleCursor.setDate(1);
let selectedScheduleIds=new Set();
let accountingSubtab='fees';
let accountingMonth=new Date(); accountingMonth.setDate(1);
let accountingFilter='all';
let accountingSearch='';
let data={schedules:[],notices:[],attendance:[],boardgame:[],murder:[],deduction:[],settings:null,fees:[],ledger:[],closures:[]};
let adminLoadWarnings=[];

(async()=>{
  try{
    const s=await DOTT_DB.session();
    if(!s)return renderLogin();
    await loadAll();
    renderAdmin();
  }catch(e){
    console.warn('관리자 세션 확인 실패',e);
    renderLogin();
  }
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
  const jobs=[
    ['schedules','일정',DOTT_DB.schedules()],
    ['notices','공지',DOTT_DB.notices()],
    ['attendance','출석',DOTT_DB.attendance()],
    ['boardgame','보드게임',DOTT_DB.catalog('boardgame')],
    ['murder','머더미스터리',DOTT_DB.catalog('murder')],
    ['deduction','추리게임',DOTT_DB.catalog('deduction')],
    ['settings','사이트 설정',DOTT_DB.settings()],
    ['fees','회비',DOTT_DB.feeRecords()],
    ['ledger','회계장부',DOTT_DB.accountingEntries()],
    ['closures','월 마감',DOTT_DB.accountingClosures()]
  ];
  const results=await Promise.allSettled(jobs.map(x=>x[2]));
  adminLoadWarnings=[];
  results.forEach((r,i)=>{
    const [key,label]=jobs[i];
    if(r.status==='fulfilled')data[key]=r.value;
    else{adminLoadWarnings.push(label);console.warn(`${label} 불러오기 실패`,r.reason)}
  });
  if(window.DOTT_ATTENDANCE_ERROR&&!adminLoadWarnings.includes('출석'))adminLoadWarnings.push('출석');
}

function renderAdmin(){
  const tabs=[['schedules','일정 관리'],['attendance','출석 관리'],['notices','공지 관리'],['boardgame','보드게임'],['murder','머더미스터리'],['deduction','추리게임'],['accounting','회비 · 회계'],['settings','관리자 설정']];
  const loadWarning=adminLoadWarnings.length?`<div class="info-box admin-load-warning">⚠ ${adminLoadWarnings.join(' · ')} 데이터를 최신 상태로 불러오지 못했습니다. 네트워크가 안정되면 새로고침해 주세요.</div>`:'';
  app.innerHTML=`${nav('admin')}<main class="admin-wrap"><section class="admin-hero"><div><span class="eyebrow">⚙ 관리자 화면</span><h1>일정 · 공지 · 보유목록 관리</h1><p>여기서 등록한 내용은 공개 페이지에 바로 반영됩니다.</p></div><div class="toolbar"><a class="btn" href="index.html">공개 화면 보기</a><button class="btn" id="logout">로그아웃</button></div></section><div class="info-box">현재 데이터는 Supabase에 저장됩니다. 일반 방문자는 조회만 가능하고, 로그인한 관리자만 추가·수정·삭제할 수 있습니다.</div>${loadWarning}<div class="tabs">${tabs.map(([v,l])=>`<button class="tab ${tab===v?'active':''}" data-tab="${v}">${l}</button>`).join('')}</div><div id="panel"></div></main>${footer()}`;
  document.getElementById('logout').onclick=async()=>{await DOTT_DB.signOut();renderLogin()};
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;renderAdmin()});
  renderPanel();
}

function renderPanel(){
  const p=document.getElementById('panel');
  if(tab==='settings')return settingsPanel(p);
  if(tab==='accounting')return accountingPanel(p);
  if(tab==='schedules')return schedulePanel(p);
  if(tab==='attendance')return attendancePanel(p);
  if(tab==='notices')return noticePanel(p);
  return catalogPanel(p,tab);
}

function scheduleMonthLabel(){return `${scheduleCursor.getFullYear()}년 ${scheduleCursor.getMonth()+1}월`}
function compactScheduleDate(dateStr){
  if(!dateStr)return '-';
  const [y,m,d]=String(dateStr).split('-');
  return `${String(y).slice(-2)}/${m}/${d}`;
}
function inScheduleMonth(dateStr){
  if(!dateStr)return false;
  const d=new Date(dateStr+'T00:00:00');
  return d.getFullYear()===scheduleCursor.getFullYear()&&d.getMonth()===scheduleCursor.getMonth();
}
function scheduleRowsForView(){
  const today=todayYmd();
  let rows=[...data.schedules];
  if(scheduleView==='month')rows=rows.filter(x=>inScheduleMonth(x.event_date));
  else if(scheduleView==='upcoming')rows=rows.filter(x=>x.event_date>=today);
  else if(scheduleView==='past')rows=rows.filter(x=>x.event_date<today);
  rows.sort((a,b)=>{
    const dateCmp=String(a.event_date||'').localeCompare(String(b.event_date||''));
    const timeCmp=String(a.event_time||'').localeCompare(String(b.event_time||''));
    return scheduleView==='past'?-(dateCmp||timeCmp):(dateCmp||timeCmp);
  });
  return rows;
}

function schedulePanel(p){
  const rows=scheduleRowsForView();
  const visibleIds=new Set(rows.map(x=>x.id));
  selectedScheduleIds=new Set([...selectedScheduleIds].filter(id=>visibleIds.has(id)));
  const allSelected=rows.length>0&&rows.every(x=>selectedScheduleIds.has(x.id));
  const tabs=[['month','월별 보기'],['upcoming','예정 일정'],['past','지난 일정']];
  p.innerHTML=`
    <div class="schedule-control-panel">
      <div class="schedule-manage-head">
        <div class="schedule-view-tabs">${tabs.map(([v,l])=>`<button class="schedule-view-btn ${scheduleView===v?'active':''}" data-schedule-view="${v}">${l}</button>`).join('')}</div>
        <button class="btn primary schedule-add-btn" id="add">+ 일정 추가</button>
      </div>
      ${scheduleView==='month'?`<div class="schedule-monthbar">
        <div class="schedule-month-nav">
          <button class="btn schedule-month-arrow" id="monthPrev" aria-label="이전 달">‹</button>
          <strong>${scheduleMonthLabel()}</strong>
          <button class="btn schedule-month-arrow" id="monthNext" aria-label="다음 달">›</button>
        </div>
        <button class="btn schedule-month-today" id="monthToday">이번 달</button>
        <span class="schedule-count">${rows.length}건</span>
      </div>`:''}
      <div class="schedule-bulkbar">
        <label class="schedule-select-all"><input type="checkbox" id="scheduleSelectAll" ${allSelected?'checked':''}> <span>현재 목록 전체 선택</span></label>
        <div class="schedule-bulk-actions"><span id="scheduleSelectedCount">${selectedScheduleIds.size}개 선택</span><button class="btn danger" id="deleteSelected" ${selectedScheduleIds.size?'':'disabled'}>선택 삭제</button></div>
      </div>
    </div>
    <div class="table-wrap schedule-table-wrap"><table class="table schedule-table"><thead><tr><th class="check-col"></th><th>날짜</th><th>시간</th><th>카테고리</th><th>일정명</th><th>인원</th><th>벙주</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(x=>{
      const cancelled=isCancelledStatus(x.status);
      return `<tr class="${cancelled?'cancelled-row':''}"><td class="check-col"><input class="schedule-check" type="checkbox" data-schedule-check="${x.id}" ${selectedScheduleIds.has(x.id)?'checked':''}></td><td><span class="schedule-date-desktop">${fmtDate(x.event_date)}</span><span class="schedule-date-mobile">${compactScheduleDate(x.event_date)}</span></td><td>${(x.event_time||'').slice(0,5)}</td><td>${tag(x.category)}</td><td><b>${esc(x.title)}</b></td><td>${x.people||'-'}명</td><td>${esc(x.manager||'')}${x.venue_flexible?' <span class="venue-flex-mark" title="장소 이동 가능">✓</span>':''}</td><td><span class="schedule-status ${cancelled?'cancelled':''}">${scheduleStatusLabel(x.status)}</span></td><td><div class="actions"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`
    }).join('')||'<tr><td colspan="9">해당 일정이 없습니다.</td></tr>'}</tbody></table></div>`;

  document.getElementById('add').onclick=()=>scheduleModal();
  document.querySelectorAll('[data-schedule-view]').forEach(btn=>btn.onclick=()=>{scheduleView=btn.dataset.scheduleView;selectedScheduleIds.clear();schedulePanel(p)});
  if(scheduleView==='month'){
    document.getElementById('monthPrev').onclick=()=>{scheduleCursor.setMonth(scheduleCursor.getMonth()-1);selectedScheduleIds.clear();schedulePanel(p)};
    document.getElementById('monthNext').onclick=()=>{scheduleCursor.setMonth(scheduleCursor.getMonth()+1);selectedScheduleIds.clear();schedulePanel(p)};
    document.getElementById('monthToday').onclick=()=>{scheduleCursor=new Date();scheduleCursor.setDate(1);selectedScheduleIds.clear();schedulePanel(p)};
  }
  const refreshBulk=()=>{
    const count=document.getElementById('scheduleSelectedCount');
    const del=document.getElementById('deleteSelected');
    const all=document.getElementById('scheduleSelectAll');
    if(count)count.textContent=`${selectedScheduleIds.size}개 선택`;
    if(del)del.disabled=!selectedScheduleIds.size;
    if(all)all.checked=rows.length>0&&rows.every(x=>selectedScheduleIds.has(x.id));
  };
  document.getElementById('scheduleSelectAll').onchange=e=>{
    if(e.target.checked)rows.forEach(x=>selectedScheduleIds.add(x.id));
    else rows.forEach(x=>selectedScheduleIds.delete(x.id));
    document.querySelectorAll('[data-schedule-check]').forEach(cb=>cb.checked=e.target.checked);
    refreshBulk();
  };
  document.querySelectorAll('[data-schedule-check]').forEach(cb=>cb.onchange=()=>{cb.checked?selectedScheduleIds.add(cb.dataset.scheduleCheck):selectedScheduleIds.delete(cb.dataset.scheduleCheck);refreshBulk()});
  document.getElementById('deleteSelected').onclick=async()=>{
    const ids=[...selectedScheduleIds];
    if(!ids.length)return;
    if(!confirm(`선택한 ${ids.length}개 일정을 삭제할까요?\n삭제 후에는 복구할 수 없습니다.`))return;
    await DOTT_DB.removeMany('schedules',ids);
    selectedScheduleIds.clear();
    await loadAll();schedulePanel(p);toast('선택한 일정을 삭제했습니다.');
  };
  wireRows('schedules',scheduleModal);
}

function normalizeManualTime(v=''){
  let raw=String(v||'').trim().replace(/[.]/g,':').replace(/\s+/g,'');
  if(/^\d{3,4}$/.test(raw)) raw=raw.length===3?`0${raw[0]}:${raw.slice(1)}`:`${raw.slice(0,2)}:${raw.slice(2)}`;
  const m=raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if(!m)throw new Error('시간을 19:30 형식으로 입력해 주세요.');
  const h=Number(m[1]), min=Number(m[2]);
  if(h<0||h>23||min<0||min>59)throw new Error('올바른 시간을 입력해 주세요. 예: 19:30');
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}

function scheduleModal(x={}){
  const currentStatus=isCancelledStatus(x.status)?'취소':'예약';
  showModal(x.id?'일정 수정':'일정 추가',`<div class="form-grid schedule-form"><div><label class="label">날짜</label><input id="f_date" class="field" type="date" value="${x.event_date||todayYmd()}"></div><div><label class="label">시간</label><input id="f_time" class="field" type="text" inputmode="numeric" maxlength="5" placeholder="예: 19:30" value="${esc((x.event_time||'18:00').slice(0,5))}"></div><div><label class="label">카테고리</label><select id="f_cat" class="field">${CFG.categories.map(c=>`<option value="${c.value}" ${x.category===c.value?'selected':''}>${c.label}</option>`).join('')}</select></div><div><label class="label">인원</label><input id="f_people" class="field" type="number" min="1" value="${x.people||4}"></div><div class="full"><label class="label">일정명</label><input id="f_title" class="field" value="${esc(x.title||'')}"></div><div><div class="label-row"><label class="label">벙주</label><label class="venue-flex-check"><input id="f_venue_flexible" type="checkbox" ${x.venue_flexible?'checked':''}> 장소 이동 가능</label></div><input id="f_manager" class="field" value="${esc(x.manager||'')}"></div><div><label class="label">상태</label><select id="f_status" class="field"><option value="예약" ${currentStatus==='예약'?'selected':''}>예약</option><option value="취소" ${currentStatus==='취소'?'selected':''}>취소</option></select></div><div class="full"><label class="label">메모</label><textarea id="f_note" class="field" rows="2">${esc(x.note||'')}</textarea></div></div>`,async m=>{
    const row={
      event_date:m.querySelector('#f_date').value,
      event_time:normalizeManualTime(m.querySelector('#f_time').value),
      category:m.querySelector('#f_cat').value,
      title:m.querySelector('#f_title').value.trim(),
      people:+m.querySelector('#f_people').value||null,
      manager:m.querySelector('#f_manager').value.trim(),
      venue_flexible:m.querySelector('#f_venue_flexible').checked,
      status:m.querySelector('#f_status').value,
      note:m.querySelector('#f_note').value.trim()
    };
    if(!row.title)throw new Error('일정명을 입력해 주세요.');
    x.id?await DOTT_DB.update('schedules',x.id,row):await DOTT_DB.insert('schedules',row);
    const savedDate=new Date(row.event_date+'T00:00:00');
    if(!Number.isNaN(savedDate.getTime())){scheduleCursor=new Date(savedDate.getFullYear(),savedDate.getMonth(),1);scheduleView='month';selectedScheduleIds.clear()}
    await loadAll();renderAdmin();toast('저장했습니다.');
  });
  const scheduleModalEl=document.querySelector('#modal .modal');
  if(scheduleModalEl)scheduleModalEl.classList.add('schedule-modal');
  const timeInput=document.getElementById('f_time');
  if(timeInput){
    timeInput.addEventListener('blur',()=>{
      if(!timeInput.value.trim())return;
      try{timeInput.value=normalizeManualTime(timeInput.value)}catch(_e){}
    });
  }
}


function attendanceDueDate(member){
  const base=member.last_attended_at||member.joined_at;
  return base?addCalendarMonths(base,2):'';
}

function addCalendarMonths(dateStr,months){
  const parts=String(dateStr||'').split('-').map(Number);
  if(parts.length!==3||parts.some(Number.isNaN))return '';
  const [y,m,d]=parts;
  const target=new Date(y,m-1+months,1);
  const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0).getDate();
  target.setDate(Math.min(d,lastDay));
  return ymd(target);
}

function shortDate(dateStr){
  if(!dateStr)return '-';
  const [y,m,d]=String(dateStr).split('-').map(Number);
  return `${y}. ${m}. ${d}`;
}
function compactAttendanceDate(dateStr){
  if(!dateStr)return '-';
  const [y,m,d]=String(dateStr).split('-').map(Number);
  return `${String(y).slice(-2)}.${String(m).padStart(2,'0')}.${String(d).padStart(2,'0')}`;
}

function attendanceState(member){
  if(member.member_status==='left')return {key:'left',label:'탈퇴'};
  if(member.grace)return {key:'grace',label:'유예'};
  const due=attendanceDueDate(member);
  if(due&&todayYmd()>=due)return {key:'overdue',label:'경과'};
  return {key:'keep',label:'유지'};
}

function attendancePanel(p){
  if(window.DOTT_ATTENDANCE_ERROR){
    p.innerHTML=`<div class="info-box attendance-setup"><b>출석관리 DB를 아직 만들지 않았습니다.</b><br>Supabase SQL Editor에서 <code>add-attendance.sql</code>을 한 번 실행하면 이 메뉴가 활성화됩니다.</div>`;
    return;
  }
  const states=data.attendance.map(x=>({member:x,state:attendanceState(x),due:attendanceDueDate(x)}));
  const counts={all:states.length,keep:0,overdue:0,grace:0,left:0};
  states.forEach(x=>counts[x.state.key]=(counts[x.state.key]||0)+1);
  let rows=states.filter(({member,state})=>{
    if(attendanceFilter!=='all'&&state.key!==attendanceFilter)return false;
    if(attendanceSearch&&!String(member.name||'').toLowerCase().includes(attendanceSearch.toLowerCase()))return false;
    return true;
  });
  // 운영진은 항상 최상단에 고정하고, 운영진/일반회원 각각 이름 가나다순으로 정렬합니다.
  rows.sort((a,b)=>Number(Boolean(b.member.is_staff))-Number(Boolean(a.member.is_staff))||String(a.member.name||'').localeCompare(String(b.member.name||''),'ko'));
  const filters=[['all','전체'],['keep','유지'],['overdue','경과'],['grace','유예'],['left','탈퇴']];
  p.innerHTML=`
    <div class="attendance-head">
      <div>
        <div class="attendance-summary">
          <span>전체 <b>${counts.all}</b></span><span class="keep">유지 <b>${counts.keep}</b></span><span class="overdue">경과 <b>${counts.overdue}</b></span><span class="grace">유예 <b>${counts.grace}</b></span><span>탈퇴 <b>${counts.left}</b></span>
        </div>
        <p class="attendance-help">최근 참석일이 없으면 가입일 기준으로 계산하고, 최근 참석일 + 2개월이 되면 자동으로 ‘경과’ 표시됩니다.</p>
      </div>
      <button class="btn primary" id="addMember">+ 회원 추가</button>
    </div>
    <div class="attendance-controls">
      <div class="attendance-filters">${filters.map(([v,l])=>`<button class="attendance-filter ${attendanceFilter===v?'active':''}" data-att-filter="${v}">${l}</button>`).join('')}</div>
      <input id="attendanceSearch" class="field attendance-search" placeholder="이름 검색" value="${esc(attendanceSearch)}">
    </div>
    <div class="attendance-table-wrap">
      <table class="attendance-table">
        <thead><tr><th>이름</th><th>가입일</th><th><span class="att-head-desktop">최근 참석일</span><span class="att-head-mobile">최근</span></th><th><span class="att-head-desktop">2개월 경과일</span><span class="att-head-mobile">경과일</span></th><th>상태</th><th><span class="att-head-desktop">유예 사유</span><span class="att-head-mobile">유예</span></th><th>관리</th></tr></thead>
        <tbody>${rows.map(({member:x,state,due})=>`<tr class="attendance-row ${state.key} ${x.is_staff?'staff':''}">
          <td data-label="이름"><span class="attendance-name-wrap"><b>${esc(x.name)}</b>${x.is_staff?'<span class="attendance-staff-badge">운영진</span>':''}</span></td>
          <td data-label="가입일"><span class="att-date-desktop">${shortDate(x.joined_at)}</span><span class="att-date-mobile">${compactAttendanceDate(x.joined_at)}</span></td>
          <td data-label="최근 참석일"><span class="att-date-desktop">${shortDate(x.last_attended_at)}</span><span class="att-date-mobile">${compactAttendanceDate(x.last_attended_at)}</span></td>
          <td data-label="2개월 경과일"><span class="att-date-desktop">${shortDate(due)}</span><span class="att-date-mobile">${compactAttendanceDate(due)}</span></td>
          <td data-label="상태"><span class="attendance-status ${state.key}">${state.label}</span></td>
          <td data-label="유예 사유" class="attendance-reason" title="${esc(x.grace?x.grace_reason||'-':'-')}">${x.grace?esc(x.grace_reason||'-'):'-'}</td>
          <td data-label="관리"><div class="attendance-actions">${x.member_status!=='left'?`<button class="btn attendance-today" data-attend="${x.id}" title="오늘 참석"><span class="att-action-desktop">오늘 참석</span><span class="att-action-mobile">✓</span></button>`:''}<button class="icon-btn" data-att-edit="${x.id}" title="수정">✎</button><button class="icon-btn" data-att-del="${x.id}" title="완전 삭제">♲</button></div></td>
        </tr>`).join('')||`<tr><td colspan="7" class="attendance-empty">해당하는 회원이 없습니다.</td></tr>`}</tbody>
      </table>
    </div>`;
  document.getElementById('addMember').onclick=()=>attendanceModal();
  document.querySelectorAll('[data-att-filter]').forEach(btn=>btn.onclick=()=>{attendanceFilter=btn.dataset.attFilter;attendancePanel(p)});
  const search=document.getElementById('attendanceSearch');
  search.oninput=()=>{attendanceSearch=search.value;attendancePanel(p);const next=document.getElementById('attendanceSearch');if(next){next.focus();next.setSelectionRange(next.value.length,next.value.length)}};
  document.querySelectorAll('[data-attend]').forEach(btn=>btn.onclick=async()=>{
    btn.disabled=true;
    try{
      await DOTT_DB.update('attendance_members',btn.dataset.attend,{last_attended_at:todayYmd(),grace:false,grace_reason:'',member_status:'active',left_at:null,updated_at:new Date().toISOString()});
      await loadAll();attendancePanel(p);toast('오늘 참석으로 처리했습니다.');
    }catch(e){alert(e.message||e)}finally{btn.disabled=false}
  });
  document.querySelectorAll('[data-att-edit]').forEach(btn=>btn.onclick=()=>attendanceModal(data.attendance.find(x=>x.id===btn.dataset.attEdit)));
  document.querySelectorAll('[data-att-del]').forEach(btn=>btn.onclick=async()=>{
    const member=data.attendance.find(x=>x.id===btn.dataset.attDel);
    if(!confirm(`${member?.name||'이 회원'}을(를) 완전히 삭제할까요?\n기록도 함께 사라집니다.`))return;
    await DOTT_DB.remove('attendance_members',btn.dataset.attDel);
    await loadAll();attendancePanel(p);toast('삭제했습니다.');
  });
}

function attendanceModal(x={}){
  const status=x.member_status||'active';
  showModal(x.id?'회원 수정':'회원 추가',`<div class="form-grid attendance-form">
    <div class="full"><label class="label">이름</label><input id="m_name" class="field" value="${esc(x.name||'')}"></div>
    <div><label class="label">가입일</label><input id="m_joined" class="field" type="date" value="${x.joined_at||todayYmd()}"></div>
    <div><label class="label">최근 참석일</label><input id="m_last" class="field" type="date" value="${x.last_attended_at||''}"></div>
    <div><label class="label">회원 상태</label><select id="m_status" class="field"><option value="active" ${status==='active'?'selected':''}>활동중</option><option value="left" ${status==='left'?'selected':''}>탈퇴</option></select></div>
    <div class="attendance-grace-box attendance-check-group"><label class="attendance-check"><input id="m_staff" type="checkbox" ${x.is_staff?'checked':''}> 운영진 상단 고정</label><label class="attendance-check"><input id="m_grace" type="checkbox" ${x.grace?'checked':''}> 유예 적용</label></div>
    <div class="full"><label class="label">유예 사유</label><textarea id="m_reason" class="field" rows="2" placeholder="필요할 때만 입력">${esc(x.grace_reason||'')}</textarea></div>
  </div>`,async m=>{
    const memberStatus=m.querySelector('#m_status').value;
    const grace=memberStatus==='active'&&m.querySelector('#m_grace').checked;
    const row={
      name:m.querySelector('#m_name').value.trim(),
      joined_at:m.querySelector('#m_joined').value,
      last_attended_at:m.querySelector('#m_last').value||null,
      member_status:memberStatus,
      is_staff:m.querySelector('#m_staff').checked,
      grace,
      grace_reason:grace?m.querySelector('#m_reason').value.trim():'',
      left_at:memberStatus==='left'?(x.left_at||todayYmd()):null,
      updated_at:new Date().toISOString()
    };
    if(!row.name)throw new Error('이름을 입력해 주세요.');
    if(!row.joined_at)throw new Error('가입일을 입력해 주세요.');
    x.id?await DOTT_DB.update('attendance_members',x.id,row):await DOTT_DB.insert('attendance_members',row);
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

const ONLINE_MURDER_MARKER='__DOTT_ONLINE_MURDER__';


function catalogPlaytimeLabel(v){
  const s=String(v??'').trim();
  if(!s)return '-';
  let m=s.match(/^\s*(\d+)\s*(?:분)?\s*$/);
  if(m)return `${m[1]}분`;
  m=s.match(/^\s*(\d+)\s*[~～\-–—]\s*(\d+)\s*(?:분)?\s*$/);
  if(m)return `${m[1]}~${m[2]}분`;
  return s;
}
function catalogPlaytimeInputValue(v){
  const s=String(v??'').trim();
  let m=s.match(/^\s*(\d+)\s*(?:분)?\s*$/);
  if(m)return m[1];
  m=s.match(/^\s*(\d+)\s*[~～\-–—]\s*(\d+)\s*(?:분)?\s*$/);
  if(m)return `${m[1]}~${m[2]}`;
  return s.replace(/분/g,'').trim();
}
function normalizeCatalogPlaytimeInput(v,{allowRange=false}={}){
  const s=String(v??'').trim();
  if(!s)return '';
  let m=s.match(/^\s*(\d+)\s*$/);
  if(m)return m[1];
  if(allowRange){
    m=s.match(/^\s*(\d+)\s*[~～\-–—]\s*(\d+)\s*$/);
    if(m){
      const a=Number(m[1]),b=Number(m[2]);
      if(a<=0||b<=0)throw new Error('플레이시간은 1 이상의 숫자로 입력해 주세요.');
      if(a>b)throw new Error('플레이시간 범위는 작은 숫자~큰 숫자 순서로 입력해 주세요. 예: 60~90');
      return `${a}~${b}`;
    }
  }
  throw new Error(allowRange?'플레이시간은 60 또는 60~90 형식으로 입력해 주세요.':'플레이시간은 숫자만 입력해 주세요. 예: 180');
}

function catalogDifficultyInputValue(v){
  const s=String(v??'').trim();
  if(!s)return '';
  const n=Number(s);
  return Number.isFinite(n)&&n>=1&&n<=5?String(Math.round(n*100)/100):'';
}
function catalogDifficultyMeterHtml(v){
  const raw=String(v??'').trim();
  const score=parseFloat(raw);
  if(!Number.isFinite(score)||score<1||score>5)return esc(raw||'-');
  const safe=Math.max(1,Math.min(5,score));
  const boxes=Array.from({length:5},(_,i)=>{
    const fill=Math.max(0,Math.min(100,(safe-i)*100));
    return `<span style="display:inline-block;width:10px;height:10px;border:1px solid #d8c9bc;border-radius:2px;margin-right:2px;background:linear-gradient(90deg,#e46f3a 0 var(--fill),#fff 0 100%);--fill:${fill}%"></span>`;
  }).join('');
  const label=(Math.round(safe*100)/100).toString();
  return `<span title="난이도 ${esc(label)} / 5" style="display:inline-flex;align-items:center;white-space:nowrap">${boxes}</span>`;
}

function catalogPanel(p,kind){
  const title={boardgame:'보드게임',murder:'머더미스터리',deduction:'추리게임'}[kind];
  const descKey={boardgame:'boardgame_description',murder:'murder_description',deduction:'deduction_description'}[kind];
  const defaultDesc={boardgame:'도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.',murder:'보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.',deduction:'추리·사건 해결형 게임 보유 목록을 확인하세요.'}[kind];
  const currentDesc=(data.settings&&data.settings[descKey])||defaultDesc;
  const rows=data[kind];
  const head=kind==='murder'
    ? '<th style="text-align:center">게임명</th><th style="text-align:center">인원</th><th style="text-align:center">시간</th><th style="text-align:center">난이도</th><th style="text-align:center">상태 및 위치</th><th style="text-align:center">소유주</th><th style="text-align:center">비고</th><th style="text-align:center">관리</th>'
    : '<th style="text-align:center">게임명</th><th style="text-align:center">인원</th><th style="text-align:center">시간</th><th style="text-align:center">난이도</th><th style="text-align:center">장르</th><th style="text-align:center">상태 및 위치</th><th style="text-align:center">소유주</th><th style="text-align:center">관리</th>';
  const body=rows.map(x=>{
    if(kind==='murder'){
      const isOnline=x.genre===ONLINE_MURDER_MARKER;
      const onlineBadge=isOnline?'<span class="online-murder-badge">온라인</span>':'';
      return `<tr><td style="text-align:left"><b>${esc(x.name)}</b>${onlineBadge}</td><td style="text-align:center">${x.min_players||'?'}~${x.max_players||'?'}인</td><td style="text-align:center">${esc(catalogPlaytimeLabel(x.playtime))}</td><td style="text-align:center">${esc(x.difficulty||'-')}</td><td style="text-align:center">${esc(x.status||'보유')}</td><td style="text-align:center">${esc(x.location||'-')}</td><td style="text-align:center">${esc(x.note||'-')}</td><td style="text-align:center"><div class="actions" style="justify-content:center"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`;
    }
    const expansionBadge=kind==='boardgame'&&x.is_expansion?'<span class="boardgame-expansion-badge">확장</span>':'';
    return `<tr><td style="text-align:left"><b>${esc(x.name)}</b>${expansionBadge}</td><td style="text-align:center">${x.min_players||'?'}~${x.max_players||'?'}인</td><td style="text-align:center">${esc(catalogPlaytimeLabel(x.playtime))}</td><td style="text-align:center">${catalogDifficultyMeterHtml(x.difficulty)}</td><td style="text-align:center">${esc(x.genre||'')}</td><td style="text-align:center">${esc(x.status||'-')}</td><td style="text-align:center">${esc(x.note||'-')}</td><td style="text-align:center"><div class="actions" style="justify-content:center"><button class="icon-btn" data-edit="${x.id}">✎</button><button class="icon-btn" data-del="${x.id}">♲</button></div></td></tr>`;
  }).join('')||`<tr><td colspan="8">등록된 ${title}이 없습니다.</td></tr>`;
  const murderNoticeEditor=kind==='murder'?`<div class="catalog-admin-desc"><label class="label">머더미스터리 이용수칙 · 공지 팝업</label><p style="font-size:11px;color:var(--muted);line-height:1.55;margin:0 0 9px">공개 머더미스터리 페이지의 공지 버튼을 눌렀을 때 뜨는 별도 팝업입니다. 버튼 이름과 공지 내용을 각각 수정할 수 있습니다.</p><div style="margin-bottom:10px"><label class="label" style="font-size:11px">공지 버튼 이름</label><input id="murderNoticeButtonLabel" class="field" maxlength="30" placeholder="예: 이용수칙 · 공지 보기" value="${esc((data.settings&&data.settings.murder_notice_button_label)||'이용수칙 · 공지 보기')}"></div><div class="catalog-admin-desc-row"><textarea id="murderNotice" class="field" rows="7" placeholder="이용수칙, 플레이 안내, 주의사항 등을 입력하세요.">${esc((data.settings&&data.settings.murder_notice)||'')}</textarea><button class="btn" id="saveMurderNotice">버튼·공지 저장</button></div><div class="error" id="murderNoticeErr"></div></div>`:'';
  p.innerHTML=`<div class="catalog-admin-desc"><label class="label">${title} 리스트 제목 아래 설명 문구</label><div class="catalog-admin-desc-row"><textarea id="catalogDesc" class="field" rows="2">${esc(currentDesc)}</textarea><button class="btn" id="saveCatalogDesc">설명 저장</button></div><div class="error" id="catalogDescErr"></div></div>${murderNoticeEditor}<div class="admin-tools"><div>${rows.length}개 등록됨</div><button class="btn primary" id="add">+ ${title} 추가</button></div><div class="table-wrap"><table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  document.getElementById('saveCatalogDesc').onclick=async()=>{
    const btn=document.getElementById('saveCatalogDesc'),err=document.getElementById('catalogDescErr');
    btn.disabled=true;err.textContent='';
    try{
      data.settings=await DOTT_DB.saveSettings({[descKey]:document.getElementById('catalogDesc').value.trim()});
      toast(`${title} 설명을 저장했습니다.`);
    }catch(e){err.textContent=(e.message||e)+' — add-catalog-descriptions.sql을 먼저 실행해 주세요.'}
    finally{btn.disabled=false}
  };
  if(kind==='murder')document.getElementById('saveMurderNotice').onclick=async()=>{
    const btn=document.getElementById('saveMurderNotice'),err=document.getElementById('murderNoticeErr');
    btn.disabled=true;err.textContent='';
    try{
      const label=document.getElementById('murderNoticeButtonLabel').value.trim()||'이용수칙 · 공지 보기';
      data.settings=await DOTT_DB.saveSettings({murder_notice_button_label:label,murder_notice:document.getElementById('murderNotice').value.trim()});
      toast('공지 버튼 이름과 내용을 저장했습니다.');
    }catch(e){err.textContent=(e.message||e)+' — add-murder-notice-button-label.sql을 Supabase에서 한 번 실행해 주세요.'}
    finally{btn.disabled=false}
  };
  document.getElementById('add').onclick=()=>catalogModal({},kind);
  wireRows('catalog_items',x=>catalogModal(x,kind),kind);
}

function catalogModal(x={},kind){
  const boardgameGenres=['전략','파티/패밀리','협력','디덕션','마피아','레거시'];
  const murderDifficulties=['입문','쉬움','중간','어려움','매우어려움'];
  const murderStatuses=['보유','대여중','분실','도트','공방'];
  const murderOnline=x.genre===ONLINE_MURDER_MARKER;
  const boardgameExpansion=!!x.is_expansion;
  const nameField=kind==='murder'
    ? `<div class="full murder-name-row"><div><label class="label">게임명</label><input id="f_name" class="field" value="${esc(x.name||'')}"></div><label class="murder-online-check murder-online-check-name"><input id="f_online_murder" type="checkbox" ${murderOnline?'checked':''}> 온라인</label></div>`
    : kind==='boardgame'
      ? `<div class="full murder-name-row"><div><label class="label">이름</label><input id="f_name" class="field" value="${esc(x.name||'')}"></div><label class="catalog-flag-check murder-online-check-name"><input id="f_boardgame_expansion" type="checkbox" ${boardgameExpansion?'checked':''}> 확장</label></div>`
      : `<div class="full"><label class="label">이름</label><input id="f_name" class="field" value="${esc(x.name||'')}"></div>`;
  const timeField=kind==='murder'
    ? `<div><label class="label">플레이시간</label><div style="display:flex;align-items:center;gap:7px"><input id="f_time" class="field" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="예: 180" value="${esc(catalogPlaytimeInputValue(x.playtime))}" oninput="this.value=this.value.replace(/\D/g,'')"><span style="flex:0 0 auto;color:var(--muted);font-size:13px;font-weight:700">분</span></div></div>`
    : `<div><label class="label">플레이시간</label><div style="display:flex;align-items:center;gap:7px"><input id="f_time" class="field" type="text" inputmode="text" maxlength="9" placeholder="예: 60 또는 60~90" value="${esc(catalogPlaytimeInputValue(x.playtime))}" oninput="this.value=this.value.replace(/[^0-9~～\-–—]/g,'')"><span style="flex:0 0 auto;color:var(--muted);font-size:13px;font-weight:700">분</span></div><div style="margin-top:5px;font-size:11px;color:var(--muted)">숫자 또는 범위 입력 · 예: 60 / 60~90</div></div>`;
  const commonTop=`<div class="form-grid">${nameField}<div><label class="label">최소 인원</label><input id="f_min" class="field" type="number" min="1" value="${x.min_players||2}"></div><div><label class="label">최대 인원</label><input id="f_max" class="field" type="number" min="1" value="${x.max_players||4}"></div>${timeField}`;
  let middle='';
  let bottom='';
  if(kind==='murder'){
    middle=`<div><label class="label">난이도</label><select id="f_diff" class="field"><option value="">선택 안함</option>${murderDifficulties.map(v=>`<option value="${v}" ${x.difficulty===v?'selected':''}>${v}</option>`).join('')}</select></div>`;
    bottom=`<div><label class="label">상태 및 위치</label><select id="f_status" class="field">${murderStatuses.map(v=>`<option value="${v}" ${x.status===v?'selected':''}>${v}</option>`).join('')}</select></div><div><label class="label">소유주</label><input id="f_owner" class="field" placeholder="소유주 입력" value="${esc(x.location||'')}"></div><div class="full"><label class="label">비고</label><textarea id="f_note" class="field" rows="3" placeholder="자유롭게 입력">${esc(x.note||'')}</textarea></div></div>`;
  }else{
    const genreField=kind==='boardgame'
      ? `<select id="f_genre" class="field"><option value="">선택 안함</option>${boardgameGenres.map(v=>`<option value="${esc(v)}" ${x.genre===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`
      : `<input id="f_genre" class="field" placeholder="장르 입력" value="${esc(x.genre||'')}">`;
    middle=`<div><label class="label">난이도</label><input id="f_diff" class="field" type="number" min="1" max="5" step="0.01" inputmode="decimal" placeholder="예: 1.78" value="${esc(catalogDifficultyInputValue(x.difficulty))}"><div style="margin-top:5px;font-size:11px;color:var(--muted)">1~5 사이 소수점 입력 · 예: 1.78</div></div><div><label class="label">장르</label>${genreField}</div>`;
    bottom=`<div><label class="label">상태 및 위치</label><select id="f_status" class="field">${['보유','도트','공방','대여중','분실'].map(v=>`<option value="${v}" ${x.status===v?'selected':''}>${v}</option>`).join('')}</select></div><div><label class="label">소유주</label><input id="f_note" class="field" placeholder="소유주 입력" value="${esc(x.note||'')}"></div></div>`;
  }
  showModal(x.id?'항목 수정':'항목 추가',commonTop+middle+bottom,async m=>{
    const row={
      kind,
      name:m.querySelector('#f_name').value.trim(),
      min_players:+m.querySelector('#f_min').value||null,
      max_players:+m.querySelector('#f_max').value||null,
      playtime:(()=>{
        const raw=m.querySelector('#f_time').value.trim();
        if(kind==='murder')return normalizeCatalogPlaytimeInput(raw,{allowRange:false});
        return normalizeCatalogPlaytimeInput(raw,{allowRange:true});
      })(),
      status:m.querySelector('#f_status').value,
      note:m.querySelector('#f_note').value.trim()
    };
    if(kind==='murder'){
      row.difficulty=m.querySelector('#f_diff').value;
      // online_murder 컬럼은 PostgREST 스키마 캐시 문제를 피하기 위해 사용하지 않습니다.
      // 머더미스터리에서는 사용하지 않는 genre 필드에 온라인머미 여부를 저장합니다.
      row.genre=m.querySelector('#f_online_murder')?.checked?ONLINE_MURDER_MARKER:null;
      row.location=m.querySelector('#f_owner').value.trim();
    }else{
      const diffInput=m.querySelector('#f_diff').value.trim();
      const originalDifficulty=String(x.difficulty||'').trim();
      const originalNumeric=originalDifficulty!==''&&Number.isFinite(Number(originalDifficulty))&&Number(originalDifficulty)>=1&&Number(originalDifficulty)<=5;
      if(diffInput){
        const score=Number(diffInput);
        if(!Number.isFinite(score)||score<1||score>5)throw new Error('난이도는 1~5 사이 숫자로 입력해 주세요. 예: 1.78');
        row.difficulty=String(Math.round(score*100)/100);
      }else{
        row.difficulty=(x.id&&!originalNumeric&&originalDifficulty)?originalDifficulty:'';
      }
      row.genre=m.querySelector('#f_genre').value.trim();
      if(kind==='boardgame')row.is_expansion=!!m.querySelector('#f_boardgame_expansion')?.checked;
    }
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
    murder_notice:'',
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
  document.getElementById('changePw').onclick=async()=>{
    const a=document.getElementById('pw1').value,b=document.getElementById('pw2').value;
    if(a.length<6)return alert('6자 이상 입력해 주세요.');
    if(a!==b)return alert('비밀번호가 일치하지 않습니다.');
    await DOTT_DB.changePassword(a);toast('비밀번호를 변경했습니다.');
  };
}

// ===== 회비 · 회계 =====
function acctMonthKey(d=accountingMonth){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`}
function acctMonthLabel(d=accountingMonth){return `${d.getFullYear()}년 ${d.getMonth()+1}월`}
function acctYmd(v){return v?String(v).slice(0,10):'-'}
function acctMoney(v){return `${Number(v||0).toLocaleString('ko-KR')}원`}
function acctClosed(month=acctMonthKey()){return data.closures.find(x=>String(x.month).slice(0,10)===month)}
function acctRows(){const ym=acctMonthKey().slice(0,7);return data.ledger.filter(x=>String(x.entry_date||'').slice(0,7)===ym)}
function acctFees(){const ym=acctMonthKey().slice(0,7);return data.fees.filter(x=>String(x.fee_month||'').slice(0,7)===ym)}
function acctBalanceBefore(){const first=acctMonthKey();return data.ledger.filter(x=>String(x.entry_date)<first).reduce((a,x)=>a+acctCashDelta(x),0)}
function acctCashDelta(x){if(x.category==='미지급금'&&x.entry_type==='발생')return 0;return Number(x.amount||0)*(x.entry_type==='수입'?1:-1)}
function accountingPanel(p){
  const subs=[['fees','회비 현황'],['ledger','회계장부'],['report','월별 보고서']];
  p.innerHTML=`<div class="accounting-subtabs">${subs.map(([v,l])=>`<button class="accounting-subtab ${accountingSubtab===v?'active':''}" data-acct-sub="${v}">${l}</button>`).join('')}</div><div id="accountingBody"></div>`;
  p.querySelectorAll('[data-acct-sub]').forEach(b=>b.onclick=()=>{accountingSubtab=b.dataset.acctSub;accountingPanel(p)});
  const body=document.getElementById('accountingBody'); if(accountingSubtab==='fees')feeStatusPanel(body); else if(accountingSubtab==='ledger')ledgerPanel(body); else reportPanel(body);
}
function acctMonthBar(extra=''){
  return `<div class="accounting-monthbar"><div class="accounting-monthnav"><button class="btn" data-acct-month="-1">‹</button><div class="accounting-monthtitle">${acctMonthLabel()}</div><button class="btn" data-acct-month="1">›</button></div>${extra}</div>`
}
function wireAcctMonth(p){p.querySelectorAll('[data-acct-month]').forEach(b=>b.onclick=()=>{accountingMonth.setMonth(accountingMonth.getMonth()+Number(b.dataset.acctMonth));accountingPanel(document.getElementById('panel'))})}
function feeForMember(id){return acctFees().find(x=>x.member_id===id)}
function feeStatusPanel(p){
  const members=data.attendance.filter(x=>x.member_status!=='left'); const closed=acctClosed();
  const counts={paid:0,unpaid:0,exempt:0}; members.forEach(m=>{const f=feeForMember(m.id);counts[f?.status==='exempt'?'exempt':f?.status==='paid'?'paid':'unpaid']++});
  p.innerHTML=`${acctMonthBar()}${closed?`<div class="accounting-lockbar"><b>🔒 ${acctMonthLabel()} 마감 완료</b><span class="accounting-lock">수정 잠금</span></div>`:''}<div class="accounting-summary"><div class="accounting-stat"><small>전체 회원</small><b>${members.length}명</b></div><div class="accounting-stat green"><small>납부 완료</small><b>${counts.paid}명</b></div><div class="accounting-stat red"><small>미납</small><b>${counts.unpaid}명</b></div><div class="accounting-stat yellow"><small>면제</small><b>${counts.exempt}명</b></div></div>
  <div class="accounting-controls"><div class="accounting-filters">${[['all','전체'],['paid','납부'],['unpaid','미납'],['exempt','면제']].map(([v,l])=>`<button class="accounting-chip ${accountingFilter===v?'active':''}" data-fee-filter="${v}">${l}</button>`).join('')}</div><input id="feeSearch" class="field accounting-search" placeholder="이름 검색" value="${esc(accountingSearch)}"></div>
  <div class="table-wrap"><table class="table"><thead><tr><th>이름</th><th>가입일</th><th>회비 상태</th><th>납부일</th><th>금액</th><th>비고</th><th>관리</th></tr></thead><tbody>${members.filter(m=>{const f=feeForMember(m.id),st=f?.status==='exempt'?'exempt':f?.status==='paid'?'paid':'unpaid';return (accountingFilter==='all'||accountingFilter===st)&&(!accountingSearch||m.name.toLowerCase().includes(accountingSearch.toLowerCase()))}).map(m=>{const f=feeForMember(m.id),st=f?.status==='exempt'?'exempt':f?.status==='paid'?'paid':'unpaid',label=st==='paid'?'납부완료':st==='exempt'?'면제':'납부전';return `<tr><td><b>${esc(m.name)}</b></td><td>${acctYmd(m.joined_at)}</td><td><span class="fee-manage fee-${st}">${label}</span></td><td>${f?.paid_at?acctYmd(f.paid_at):'-'}</td><td>${acctMoney(f?.amount??5000)}</td><td>${esc(f?.note||'-')}</td><td><button class="fee-manage fee-${st}" data-fee-member="${m.id}" ${closed?'disabled':''}>${label}</button></td></tr>`}).join('')||'<tr><td colspan="7">해당 회원이 없습니다.</td></tr>'}</tbody></table></div><div class="accounting-note">※ 일괄 납부를 하더라도 회계장부에는 회원별 회비가 각각 1건씩 기록됩니다.</div>`;
  wireAcctMonth(p); p.querySelectorAll('[data-fee-filter]').forEach(b=>b.onclick=()=>{accountingFilter=b.dataset.feeFilter;feeStatusPanel(p)}); const q=p.querySelector('#feeSearch');q.oninput=()=>{accountingSearch=q.value;feeStatusPanel(p)};p.querySelectorAll('[data-fee-member]').forEach(b=>b.onclick=()=>feeModal(data.attendance.find(x=>x.id===b.dataset.feeMember),feeForMember(b.dataset.feeMember)));
}
function feeModal(member,fee){
  const status=fee?.status||'unpaid',today=new Date().toISOString().slice(0,10);
  showModal(`${member.name} · ${acctMonthLabel()} 회비`,`<div style="display:grid;gap:12px"><div><label class="label">상태</label><select id="feeStatus" class="field"><option value="paid" ${status==='paid'?'selected':''}>납부완료</option><option value="unpaid" ${status==='unpaid'?'selected':''}>납부전</option><option value="exempt" ${status==='exempt'?'selected':''}>면제</option></select></div><div><label class="label">금액</label><input id="feeAmount" class="field" type="number" value="${fee?.amount??5000}"></div><div><label class="label">납부일</label><input id="feeDate" class="field" type="date" value="${fee?.paid_at?acctYmd(fee.paid_at):today}"></div><div><label class="label">비고</label><input id="feeNote" class="field" value="${esc(fee?.note||'')}"></div><div class="accounting-note">납부일은 오늘이 기본값이며 실제 입금일이 다르면 수정할 수 있습니다. 납부완료 시 회계장부에 이 회원의 회비 1건이 자동 생성됩니다.</div></div>`,async m=>{
    const st=m.querySelector('#feeStatus').value,row={member_id:member.id,member_name:member.name,fee_month:acctMonthKey(),status:st,amount:Number(m.querySelector('#feeAmount').value||5000),paid_at:st==='paid'?m.querySelector('#feeDate').value:null,note:m.querySelector('#feeNote').value.trim(),updated_at:new Date().toISOString()}; await DOTT_DB.upsertFee(row);await loadAll();accountingPanel(document.getElementById('panel'));toast('회비 상태를 저장했습니다.');
  });
  document.querySelector('#modal .modal')?.classList.add('accounting-modal');
  const save=document.getElementById('modalSave'); if(save)save.textContent=status==='unpaid'?'납부처리 완료':'저장';
}
function ledgerPanel(p){
  const rows=acctRows(),closed=acctClosed(),carry=acctBalanceBefore(),feeIncome=rows.filter(x=>x.category==='회비'&&x.entry_type==='수입').reduce((a,x)=>a+Number(x.amount),0),otherIncome=rows.filter(x=>x.entry_type==='수입'&&x.category!=='회비').reduce((a,x)=>a+Number(x.amount),0),expense=rows.filter(x=>x.entry_type==='지출'&&x.category!=='미지급금').reduce((a,x)=>a+Number(x.amount),0)+rows.filter(x=>x.category==='미지급금'&&x.entry_type==='지급').reduce((a,x)=>a+Number(x.amount),0),payable=rows.filter(x=>x.category==='미지급금').reduce((a,x)=>a+(x.entry_type==='발생'?Number(x.amount):-Number(x.amount)),0),balance=carry+rows.reduce((a,x)=>a+acctCashDelta(x),0);
  p.innerHTML=`${acctMonthBar(`<button class="btn primary" id="addLedger" ${closed?'disabled':''}>+ 내역 추가</button>`)}${closed?`<div class="accounting-lockbar"><b>🔒 ${acctMonthLabel()} 마감 완료</b><span class="accounting-lock">수정 잠금</span></div>`:''}<div class="accounting-summary"><div class="accounting-stat"><small>전월 이월</small><b>${acctMoney(carry)}</b></div><div class="accounting-stat green"><small>회비 수입</small><b>${acctMoney(feeIncome)}</b></div><div class="accounting-stat green"><small>기타 수입 · 이자</small><b>${acctMoney(otherIncome)}</b></div><div class="accounting-stat red"><small>실제 지출</small><b>${acctMoney(expense)}</b></div><div class="accounting-stat purple"><small>남은 미지급금</small><b>${acctMoney(payable)}</b></div></div><div class="accounting-stat yellow" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><small>현재 장부 잔액</small><b style="margin:0">${acctMoney(balance)}</b></div>
  <div class="table-wrap"><table class="table ledger-table" style="min-width:1000px"><thead><tr><th>날짜</th><th>수입/지출</th><th>구분</th><th>내용</th><th>관련 회원/거래처</th><th>금액</th><th>잔액</th><th>증빙</th><th>관리</th></tr></thead><tbody>${ledgerRowsHtml(rows,carry,closed)}</tbody></table></div><div class="accounting-note">※ 회비는 회비 현황에서 납부처리 완료 시 회원별 1건씩 자동등록되며 장부에서는 직접 수정하지 않습니다. 영수증은 관리자끼리 미리보기·다운로드할 수 있습니다.</div>`;
  wireAcctMonth(p);p.querySelector('#addLedger')?.addEventListener('click',()=>ledgerModal());p.querySelectorAll('[data-ledger-edit]').forEach(b=>b.onclick=()=>ledgerModal(data.ledger.find(x=>x.id===b.dataset.ledgerEdit)));p.querySelectorAll('[data-receipt]').forEach(b=>b.onclick=()=>receiptModal(data.ledger.find(x=>x.id===b.dataset.receipt)));
}
function ledgerRowsHtml(rows,carry,closed){let bal=carry;return rows.map(x=>{bal+=acctCashDelta(x);const payable=x.category==='미지급금',typeClass=payable?'money-payable':x.entry_type==='수입'?'money-in':'money-out',sign=x.entry_type==='수입'||(payable&&x.entry_type==='발생')?'+':'-';return `<tr><td>${acctYmd(x.entry_date).slice(5)}</td><td class="${typeClass}">${esc(x.entry_type)}</td><td>${esc(x.category)}</td><td>${esc(x.description||'-')}</td><td>${esc(x.party_name||'-')}</td><td class="${typeClass}">${sign}${acctMoney(x.amount)}</td><td>${acctMoney(bal)}</td><td>${x.receipt_path?`<button class="receipt-link" data-receipt="${x.id}">📎 영수증 보기</button>`:'-'}</td><td>${x.source_fee_id?'-':`<button class="btn" data-ledger-edit="${x.id}" ${closed?'disabled':''}>수정</button>`}</td></tr>`}).join('')||'<tr><td colspan="9">등록된 내역이 없습니다.</td></tr>'}
function ledgerModal(x={}){
  const isPay=x.category==='미지급금',type=x.entry_type||'지출';
  showModal(x.id?'회계 내역 수정':'회계 내역 추가',`<div class="form-grid"><div><label class="label">수입 / 지출</label><select id="leType" class="field"><option ${type==='지출'?'selected':''}>지출</option><option ${type==='수입'?'selected':''}>수입</option><option ${type==='발생'?'selected':''}>발생</option><option ${type==='지급'?'selected':''}>지급</option></select></div><div><label class="label">구분</label><select id="leCat" class="field"><option ${x.category==='유지비'?'selected':''}>유지비</option><option ${x.category==='기타'?'selected':''}>기타</option><option ${isPay?'selected':''}>미지급금</option><option ${x.category==='이자수익'?'selected':''}>이자수익</option></select></div><div><label class="label">날짜</label><input id="leDate" type="date" class="field" value="${x.entry_date?acctYmd(x.entry_date):new Date().toISOString().slice(0,10)}"></div><div><label class="label">금액</label><input id="leAmount" type="number" class="field" value="${x.amount||''}"></div><div class="full"><label class="label">내용</label><input id="leDesc" class="field" value="${esc(x.description||'')}"></div><div class="full"><label class="label">관련 회원 / 거래처</label><input id="leParty" class="field" value="${esc(x.party_name||'')}"></div><div class="full"><label class="label">영수증 / 증빙자료 (선택)</label><input id="leReceipt" type="file" class="field" accept="image/jpeg,image/png,application/pdf"><div class="accounting-note">지출 또는 미지급금 발생 시 첨부할 수 있습니다. JPG · PNG · PDF</div></div><div class="full"><label class="label">비고</label><input id="leNote" class="field" value="${esc(x.note||'')}"></div></div>`,async m=>{
    const cat=m.querySelector('#leCat').value;let et=m.querySelector('#leType').value;if(cat==='미지급금'&&!['발생','지급'].includes(et))et='발생';if(cat!=='미지급금'&&!['수입','지출'].includes(et))et='지출';let receipt={path:x.receipt_path||null,name:x.receipt_name||null,type:x.receipt_type||null};const file=m.querySelector('#leReceipt').files[0];if(file){if(receipt.path)await DOTT_DB.deleteReceipt(receipt.path);receipt=await DOTT_DB.uploadReceipt(file)}const row={entry_date:m.querySelector('#leDate').value,entry_type:et,category:cat,description:m.querySelector('#leDesc').value.trim(),party_name:m.querySelector('#leParty').value.trim(),amount:Number(m.querySelector('#leAmount').value),note:m.querySelector('#leNote').value.trim(),receipt_path:receipt.path,receipt_name:receipt.name,receipt_type:receipt.type,updated_at:new Date().toISOString()};if(!row.entry_date||!row.amount)throw new Error('날짜와 금액을 입력해 주세요.');if(cat==='미지급금'&&!row.party_name)throw new Error('미지급금은 관련 회원/지급 대상을 입력해 주세요.');x.id?await DOTT_DB.update('accounting_entries',x.id,row):await DOTT_DB.insert('accounting_entries',row);await loadAll();accountingPanel(document.getElementById('panel'));toast('회계 내역을 저장했습니다.');
  });
  document.querySelector('#modal .modal')?.classList.add('accounting-modal','accounting-modal-ledger');
  if(x.id && !x.source_fee_id){
    const foot=document.querySelector('#modal .modal-foot');
    if(foot){
      const del=document.createElement('button');
      del.type='button'; del.className='btn danger'; del.textContent='내역 삭제'; del.style.marginRight='auto';
      foot.prepend(del);
      del.onclick=async()=>{
        if(!confirm('이 회계 내역을 삭제할까요?\n삭제 후에는 복구할 수 없습니다.'))return;
        del.disabled=true;
        try{
          await DOTT_DB.remove('accounting_entries',x.id);
          if(x.receipt_path){try{await DOTT_DB.deleteReceipt(x.receipt_path)}catch(e){console.warn(e)}}
          document.querySelector('#modal [data-close]')?.click();
          await loadAll(); accountingPanel(document.getElementById('panel')); toast('회계 내역을 삭제했습니다.');
        }catch(e){alert(e.message||e);del.disabled=false}
      };
    }
  }
}
async function receiptModal(x){
  const blob=await DOTT_DB.receiptBlob(x.receipt_path),url=URL.createObjectURL(blob),isPdf=(x.receipt_type||'').includes('pdf');showModal('영수증 / 증빙자료',`${isPdf?`<iframe src="${url}" style="width:100%;height:55vh;border:0"></iframe>`:`<img class="receipt-preview" src="${url}" alt="영수증">`}<div style="margin-top:12px;text-align:center"><a class="btn primary" href="${url}" download="${esc(x.receipt_name||'receipt')}">다운로드</a></div>`,async()=>{});const save=document.getElementById('modalSave');if(save)save.style.display='none';
}
function reportPanel(p){
  const rows=acctRows(),closed=acctClosed(),carry=acctBalanceBefore();
  const income=rows.filter(x=>x.entry_type==='수입').reduce((a,x)=>a+Number(x.amount),0);
  const expense=rows.filter(x=>x.entry_type==='지출').reduce((a,x)=>a+Number(x.amount),0)+rows.filter(x=>x.category==='미지급금'&&x.entry_type==='지급').reduce((a,x)=>a+Number(x.amount),0);
  const payable=rows.filter(x=>x.category==='미지급금').reduce((a,x)=>a+(x.entry_type==='발생'?Number(x.amount):-Number(x.amount)),0);
  const balance=carry+rows.reduce((a,x)=>a+acctCashDelta(x),0),cats=['회비','유지비','기타','미지급금','이자수익'];
  const lastDay=new Date(accountingMonth.getFullYear(),accountingMonth.getMonth()+1,0).getDate();
  let running=carry;
  const txRows=rows.map(x=>{running+=acctCashDelta(x);const payableRow=x.category==='미지급금',pc=payableRow?'money-payable':x.entry_type==='수입'?'money-in':'money-out',sign=x.entry_type==='수입'||(payableRow&&x.entry_type==='발생')?'+':'-';return `<tr><td>${acctYmd(x.entry_date).slice(5)}</td><td class="${pc}">${esc(x.entry_type)}</td><td>${esc(x.category)}</td><td>${esc(x.description||'-')}</td><td>${esc(x.party_name||'-')}</td><td class="num ${pc}">${sign}${acctMoney(x.amount)}</td><td class="num">${acctMoney(running)}</td></tr>`}).join('')||'<tr><td colspan="7">등록된 내역이 없습니다.</td></tr>';
  const catHtml=cats.map(c=>{const val=rows.filter(x=>x.category===c).reduce((a,x)=>a+(c==='미지급금'?(x.entry_type==='발생'?Number(x.amount):-Number(x.amount)):acctCashDelta(x)),0);const cls=val>=0?'money-in':'money-out';return `<div class="fr-cat">${c}<b class="${cls}">${val>=0?'+':'-'}${acctMoney(Math.abs(val))}</b></div>`}).join('');
  p.innerHTML=`${acctMonthBar(`<div>${closed?`<span class="accounting-lock">🔒 마감 완료</span> <button class="btn" id="reopenMonth">마감 해제</button> <button class="btn primary" id="printReport">PDF 생성</button>`:`<button class="btn primary" id="closeMonth">${accountingMonth.getMonth()+1}월 장부 마감</button>`}</div>`)}<div class="accounting-lockbar"><div><b>${closed?'🔒 마감된 장부':'마감 전 장부'}</b><div class="accounting-note">${closed?'해당 월의 회비 및 회계내역은 수정할 수 없습니다. PDF는 이 마감 데이터를 기준으로 생성됩니다.':'마감하면 해당 월의 회비 및 회계내역이 잠기고, 이후 PDF와 사이트 숫자가 동일하게 유지됩니다.'}</div></div></div>
  <article class="accounting-report final-report">
    <div class="fr-header"><h2>도파민 ${accountingMonth.getFullYear()}년 ${accountingMonth.getMonth()+1}월 회계 보고서</h2><p>회계기간 ${accountingMonth.getFullYear()}. ${String(accountingMonth.getMonth()+1).padStart(2,'0')}. 01 ~ ${accountingMonth.getFullYear()}. ${String(accountingMonth.getMonth()+1).padStart(2,'0')}. ${String(lastDay).padStart(2,'0')}</p></div>
    <section class="fr-sec"><h3>1. 월간 회계 요약</h3><div class="fr-cards"><div class="fr-card"><small>전월 이월</small><b>${acctMoney(carry)}</b></div><div class="fr-card green"><small>총 수입</small><b>${acctMoney(income)}</b></div><div class="fr-card red"><small>총 지출</small><b>${acctMoney(expense)}</b></div><div class="fr-card orange"><small>남은 미지급금</small><b>${acctMoney(payable)}</b></div></div><div class="fr-total"><span>${accountingMonth.getFullYear()}년 ${accountingMonth.getMonth()+1}월 월말 잔액</span><strong>${acctMoney(balance)}</strong></div></section>
    <section class="fr-sec"><h3>2. 장부 구분별 집계</h3><div class="fr-cats">${catHtml}</div></section>
    <section class="fr-sec"><h3>3. 전체 거래 내역</h3><table><thead><tr><th>날짜</th><th>수입/지출</th><th>구분</th><th>내용</th><th>관련 회원/거래처</th><th>금액</th><th>잔액</th></tr></thead><tbody>${txRows}</tbody></table></section>
    <section class="fr-sec"><h3>4. 미지급금 요약</h3><div class="fr-unpaidbox"><div class="fr-unpaidhead"><span>현재 지급해야 할 금액</span><strong>${acctMoney(payable)}</strong></div>${payableSummaryHtml(rows)}</div><p class="fr-note">※ 미지급금은 회원/운영진이 대신 결제한 금액 중 아직 정산되지 않은 금액을 표시합니다. 일부 지급 시 지급액을 차감하여 남은 미지급금을 자동 계산합니다.</p></section>
  </article>`;
  wireAcctMonth(p);p.querySelector('#closeMonth')?.addEventListener('click',()=>confirmCloseMonth());p.querySelector('#reopenMonth')?.addEventListener('click',()=>reopenMonth());p.querySelector('#printReport')?.addEventListener('click',()=>window.print());
}
function payableSummaryHtml(rows){const map={};rows.filter(x=>x.category==='미지급금').forEach(x=>{const k=x.party_name||'미지정';map[k]??={name:k,first:x.entry_date,desc:x.description||'-',occur:0,paid:0};if(x.entry_type==='발생'){map[k].occur+=Number(x.amount);if(String(x.entry_date)<String(map[k].first))map[k].first=x.entry_date;if(map[k].desc==='-'&&x.description)map[k].desc=x.description}else map[k].paid+=Number(x.amount)});const vals=Object.values(map),occur=vals.reduce((a,v)=>a+v.occur,0),paid=vals.reduce((a,v)=>a+v.paid,0);return `<table class="payable-table"><colgroup><col style="width:14%"><col style="width:12%"><col style="width:25%"><col style="width:16%"><col style="width:16%"><col style="width:17%"></colgroup><thead><tr><th>이름</th><th>발생일</th><th>내용</th><th>발생 금액</th><th>지급 금액</th><th>남은 미지급금</th></tr></thead><tbody>${vals.map(v=>`<tr><td><b>${esc(v.name)}</b></td><td>${acctYmd(v.first).slice(5)}</td><td>${esc(v.desc)}</td><td>${acctMoney(v.occur)}</td><td>${v.paid?acctMoney(v.paid):'-'}</td><td>${acctMoney(v.occur-v.paid)}</td></tr>`).join('')||'<tr><td colspan="6">미지급금 내역이 없습니다.</td></tr>'}${vals.length?`<tr class="fr-sumrow"><td colspan="3">합계</td><td>${acctMoney(occur)}</td><td>${acctMoney(paid)}</td><td>${acctMoney(occur-paid)}</td></tr>`:''}</tbody></table>`}
function confirmCloseMonth(){showModal(`${acctMonthLabel()} 장부를 마감하시겠습니까?`,`<div class="info-box" style="border-color:#efc79d;background:#fff5e9;color:#76522f">마감 후에는 해당 월의 <b>회비 및 회계내역을 수정할 수 없습니다.</b><br>PDF도 마감된 데이터를 기준으로 생성됩니다.</div>`,async()=>{await DOTT_DB.closeAccountingMonth(acctMonthKey());await loadAll();accountingPanel(document.getElementById('panel'));toast(`${acctMonthLabel()} 장부를 마감했습니다.`)});const save=document.getElementById('modalSave');if(save)save.textContent=`${accountingMonth.getMonth()+1}월 마감`}
async function reopenMonth(){const c=acctClosed();if(!c||!confirm(`${acctMonthLabel()} 마감을 해제할까요? 다시 수정할 수 있게 됩니다.`))return;await DOTT_DB.reopenAccountingMonth(c.id);await loadAll();accountingPanel(document.getElementById('panel'));toast('마감을 해제했습니다.')}
