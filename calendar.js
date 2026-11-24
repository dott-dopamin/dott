const app=document.getElementById('app');
let cursor=new Date();cursor.setDate(1);
let schedules=[],scheduleWaits=[],notices=[],siteSettings=null;
let calendarDetailScrollPad='';
const DEFAULT_HERO={hero_badge:'◎ 전체 공개 일정',hero_title:'우리의 모든 일정을\n한눈에 확인하세요',hero_description:'월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.'};

function monthEvents(){
  return schedules.filter(x=>{const d=new Date(x.event_date+'T00:00:00');return d.getFullYear()===cursor.getFullYear()&&d.getMonth()===cursor.getMonth()});
}

function render(){
  const me=monthEvents(),today=todayYmd(),te=schedules.filter(x=>x.event_date===today),hero={...DEFAULT_HERO,...(siteSettings||{})};
  app.innerHTML=`${nav('calendar')}<main class="page"><section class="hero hero-with-overview"><div class="hero-heading"><span class="eyebrow">${heroPublicHtml(hero.hero_badge)}</span><h1>${heroPublicHtml(hero.hero_title)}</h1></div><div class="hero-intro-row"><div class="hero-copy"><p>${heroPublicHtml(hero.hero_description)}</p></div><aside class="hero-sidebar calendar-overview" aria-label="오늘 일정 및 일정 현황"><div class="today-box today-agenda"><div class="today-head"><strong>오늘 일정</strong><small>${fmtDate(today)}</small><span class="count-badge">${te.length}건</span></div><div class="mini-events">${te.length?te.map(todayEventHtml).join(''):'<div class="today-agenda-empty">오늘 등록된 일정이 없습니다.</div>'}</div></div><div class="overview-stats" aria-label="일정 현황">
  <div class="overview-stat"><span class="overview-stat-label"><span aria-hidden="true">📅</span> 이번 달 일정</span><strong>${me.length}<small>건</small></strong></div>
  <div class="overview-stat"><span class="overview-stat-label"><span aria-hidden="true">🟢</span> 오늘 일정</span><strong>${te.length}<small>건</small></strong></div>
</div><div class="legend"><div class="legend-title">🎨 카테고리 색상</div><div class="legend-row">${CFG.categories.map(c=>`<span class="legend-chip"><i class="dot" style="background:${c.color}"></i>${esc(c.label)}</span>`).join('')}</div></div></aside></div></section>
<section class="section card calendar-card"><div class="card-head calendar-head-with-meta"><h2>${cursor.getFullYear()}년 ${cursor.getMonth()+1}월</h2><div class="calendar-heading-meta" aria-label="일정 건수 및 카테고리 색상"><span class="calendar-inline-count">📅 이번 달 <b>${me.length}건</b></span><span class="calendar-inline-count">🟢 오늘 <b>${te.length}건</b></span><span class="calendar-inline-divider" aria-hidden="true"></span><span class="calendar-inline-category-title" aria-hidden="true">🎨</span><div class="calendar-inline-categories">${CFG.categories.map(c=>`<span class="calendar-inline-category"><i class="dot" style="background:${c.color}"></i>${esc(c.label)}</span>`).join('')}</div></div><div class="toolbar"><button class="btn" id="prev">‹</button><button class="btn" id="today">오늘</button><button class="btn" id="next">›</button></div></div><div class="calendar-scroll"><div class="calendar-grid">${calendarHtml(me)}</div></div></section>
<section class="section card"><div class="card-head"><h2>공지사항</h2></div><div class="notice-list">${noticeHtml()}</div></section></main>${footer()}`;
  document.getElementById('prev').onclick=()=>{cursor.setMonth(cursor.getMonth()-1);render()};
  document.getElementById('next').onclick=()=>{cursor.setMonth(cursor.getMonth()+1);render()};
  document.getElementById('today').onclick=()=>{cursor=new Date();cursor.setDate(1);render()};
  wireMobileCalendarEvents();
  wireScheduleWaitActions();
}

function waitsForSchedule(scheduleId){
  return scheduleWaits
    .filter(w=>String(w.schedule_id)===String(scheduleId))
    .sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));
}
function waitCategoryLabel(v){return v==='strategy'?'전략':'보겜'}
function scheduleWaitHtml(w){
  const state=w.response==='ok'
    ? '<span class="calendar-wait-status ok">O 가능</span>'
    : w.response==='no'
      ? '<span class="calendar-wait-status no">X 불가</span>'
      : '';
  return `<div class="calendar-wait-row" data-wait-id="${esc(w.id||'')}" role="button" tabindex="0" title="대기 상세 보기"><span class="calendar-wait-label">대기</span><b>${waitCategoryLabel(w.category)}</b><span class="calendar-wait-text">${esc(w.requester_name||'-')} · ${w.people||'-'}명 · ${esc(String(w.requested_time||'').slice(0,5)||'-')}</span>${state}</div>`;
}

function todayEventHtml(e){
  const cancelled=isCancelledStatus(e.status);
  return `<div class="mini-event today-agenda-item ${cancelled?'is-cancelled':''}"><div class="today-agenda-main">${tag(e.category)}<b class="today-agenda-name">${esc(e.title)}</b>${cancelled?'<span class="cancel-label">취소</span>':''}</div><div class="today-agenda-info"><span>◷ ${esc(String(e.event_time||'').slice(0,5)||'-')}</span><span>♙ ${e.people||'-'}명</span><span>벙주 ${esc(e.manager||'-')}</span></div></div>`;
}

function calendarHtml(){
  const y=cursor.getFullYear(),m=cursor.getMonth();
  const first=new Date(y,m,1),start=first.getDay(),daysInMonth=new Date(y,m+1,0).getDate();
  const cellCount=Math.ceil((start+daysInMonth)/7)*7;
  let out=['일','월','화','수','목','금','토'].map((d,i)=>`<div class="dow ${i===5?'friday-priority':''}" ${i===5?'title="금요일 · 보드게임 우선예약"':''}>${d}</div>`).join('');
  for(let i=0;i<cellCount;i++){
    const dayNum=i-start+1;
    if(dayNum<1||dayNum>daysInMonth){
      out+='<div class="day empty-day" aria-hidden="true"></div>';
      continue;
    }
    const date=new Date(y,m,dayNum),ds=ymd(date),ev=schedules.filter(x=>x.event_date===ds);
    const weekendClass=date.getDay()===0?'sunday':date.getDay()===6?'saturday':'';
    const fridayClass=date.getDay()===5?'friday-priority':'';
    const eligibleWaitSchedules=ev.filter(x=>x.wait_allowed&&!isCancelledStatus(x.status));
    const dayWaits=scheduleWaits.filter(w=>eligibleWaitSchedules.some(s=>String(s.id)===String(w.schedule_id))||ev.some(s=>String(s.id)===String(w.schedule_id)));
    const waitAllowedCheck=eligibleWaitSchedules.length?'<span class="day-wait-check" title="대기 가능" aria-label="대기 가능">✓</span>':'';
    const mobileWaitTrigger=(eligibleWaitSchedules.length||dayWaits.length)?`<button class="mobile-day-wait-trigger" type="button" data-day-wait-date="${ds}">${dayWaits.length?`대기${dayWaits.length}`:'대기+'}</button>`:'';
    out+=`<div class="day ${ds===todayYmd()?'today':''} ${weekendClass} ${fridayClass}" data-date="${ds}"><div class="day-head"><div class="day-date-wrap"><div class="day-num">${dayNum}</div>${waitAllowedCheck}</div>${mobileWaitTrigger}</div><div class="day-events">${ev.slice(0,3).map(calendarEventHtml).join('')}${ev.length>3?`<div class="day-more">+${ev.length-3}개 일정</div>`:''}</div></div>`;
  }
  return out;
}

function calendarEventHtml(e){
  const c=catInfo(e.category),cancelled=isCancelledStatus(e.status),waits=waitsForSchedule(e.id);
  const eventCard=`<div class="day-event ${cancelled?'is-cancelled':''}" data-event-id="${esc(e.id||'')}" role="button" tabindex="0" style="background:${hexWithAlpha(c.color,'26')};color:#1f1f1f" title="${esc(e.title)}"><div class="event-line event-main"><span class="event-time">${(e.event_time||'').slice(0,5)}</span><span class="event-title">${esc(e.title)}</span>${cancelled?'<span class="cancel-label">취소</span>':''}</div><div class="event-line event-sub"><span>${e.people||'-'}명</span><span>벙주 ${esc(e.manager||'-')}</span></div></div>`;
  const waitRows=waits.map(scheduleWaitHtml).join('');
  const waitButton=e.wait_allowed&&!cancelled?`<button class="calendar-wait-add" type="button" data-wait-schedule="${esc(e.id||'')}">+ 대기 걸기</button>`:'';
  return `<div class="calendar-event-wrap">${eventCard}${waitRows}${waitButton}</div>`;
}

function wireMobileCalendarEvents(){
  document.querySelectorAll('.day-event[data-event-id]').forEach(card=>{
    const open=()=>{
      const event=schedules.find(x=>String(x.id)===String(card.dataset.eventId));
      if(event)openCalendarDetail(event);
    };
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  });
}

function wireScheduleWaitActions(){
  document.querySelectorAll('[data-wait-schedule]').forEach(btn=>{
    btn.onclick=ev=>{
      ev.preventDefault();ev.stopPropagation();
      openScheduleWaitModal(btn.dataset.waitSchedule);
    };
  });
  document.querySelectorAll('.calendar-wait-row[data-wait-id]').forEach(row=>{
    const open=()=>{
      const wait=scheduleWaits.find(x=>String(x.id)===String(row.dataset.waitId));
      if(wait)openScheduleWaitDetail(wait);
    };
    row.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();open()});
    row.addEventListener('keydown',ev=>{
      if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ev.stopPropagation();open()}
    });
  });
  document.querySelectorAll('[data-day-wait-date]').forEach(btn=>{
    btn.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      openMobileDayWaitPanel(btn.dataset.dayWaitDate);
    });
  });
}
function openMobileDayWaitPanel(dateStr){
  const daySchedules=schedules
    .filter(x=>String(x.event_date)===String(dateStr)&&!isCancelledStatus(x.status))
    .sort((a,b)=>String(a.event_time||'').localeCompare(String(b.event_time||'')));
  const eligible=daySchedules.filter(x=>x.wait_allowed);
  const waits=scheduleWaits
    .filter(w=>daySchedules.some(s=>String(s.id)===String(w.schedule_id)))
    .sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));

  if(!waits.length&&eligible.length===1){
    openScheduleWaitModal(eligible[0].id);
    return;
  }

  let back=document.getElementById('mobileDayWaitModal');
  if(!back){
    back=document.createElement('div');
    back.id='mobileDayWaitModal';
    back.className='calendar-detail-backdrop';
    document.body.appendChild(back);
  }

  const waitList=waits.length
    ? waits.map(w=>{
        const schedule=daySchedules.find(s=>String(s.id)===String(w.schedule_id));
        const state=w.response==='ok'
          ? '<span class="mobile-day-wait-state ok">O 가능</span>'
          : w.response==='no'
            ? '<span class="mobile-day-wait-state no">X 불가</span>'
            : '';
        return `<button type="button" class="mobile-day-wait-item" data-mobile-wait-id="${esc(w.id||'')}">
          <span class="mobile-day-wait-kind">${waitCategoryLabel(w.category)}</span>
          <span class="mobile-day-wait-main"><b>${esc(w.requester_name||'-')}</b><small>${esc(String(w.requested_time||'').slice(0,5)||'-')} · ${w.people||'-'}명 · ${esc(schedule?.title||'일정')}</small></span>
          ${state}
        </button>`;
      }).join('')
    : '<div class="mobile-day-wait-empty">등록된 대기가 없습니다.</div>';

  const registerList=eligible.length
    ? `<div class="mobile-day-wait-register"><span>대기 등록</span>${eligible.map(s=>`<button type="button" class="mobile-day-wait-register-btn" data-mobile-wait-schedule="${esc(s.id||'')}"><b>${esc(String(s.event_time||'').slice(0,5))}</b> ${esc(s.title||'일정')}</button>`).join('')}</div>`
    : '';

  back.innerHTML=`<div class="calendar-detail mobile-day-wait-modal" role="dialog" aria-modal="true" aria-label="대기 현황">
    <div class="calendar-detail-head"><div><span class="calendar-detail-category">대기</span><h3>${fmtDate(dateStr)}</h3></div><button class="calendar-detail-close" type="button" aria-label="닫기">✕</button></div>
    <div class="mobile-day-wait-body">
      ${waitList}
      ${registerList}
    </div>
  </div>`;

  const close=()=>back.classList.remove('open');
  back.classList.add('open');
  back.querySelector('.calendar-detail-close').onclick=close;
  back.onclick=ev=>{if(ev.target===back)close()};
  back.querySelectorAll('[data-mobile-wait-id]').forEach(btn=>btn.onclick=()=>{
    const wait=scheduleWaits.find(x=>String(x.id)===String(btn.dataset.mobileWaitId));
    close();
    if(wait)openScheduleWaitDetail(wait);
  });
  back.querySelectorAll('[data-mobile-wait-schedule]').forEach(btn=>btn.onclick=()=>{
    const scheduleId=btn.dataset.mobileWaitSchedule;
    close();
    openScheduleWaitModal(scheduleId);
  });
}

function openScheduleWaitDetail(wait){
  const schedule=schedules.find(x=>String(x.id)===String(wait.schedule_id));
  if(!schedule)return;
  let back=document.getElementById('calendarWaitDetailModal');
  if(!back){
    back=document.createElement('div');
    back.id='calendarWaitDetailModal';
    back.className='calendar-detail-backdrop';
    document.body.appendChild(back);
  }
  const responseRow=wait.response==='ok'
    ? '<div class="calendar-detail-row"><span>벙주 응답</span><b class="calendar-wait-detail-state ok">O 가능</b></div>'
    : wait.response==='no'
      ? '<div class="calendar-detail-row"><span>벙주 응답</span><b class="calendar-wait-detail-state no">X 불가</b></div>'
      : '';
  back.innerHTML=`<div class="calendar-detail calendar-wait-detail" role="dialog" aria-modal="true" aria-label="대기 상세">
    <div class="calendar-detail-head"><div><span class="calendar-detail-category">대기</span><h3>${esc(schedule.title||'일정')}</h3></div><button class="calendar-detail-close" type="button" aria-label="닫기">✕</button></div>
    <div class="calendar-detail-body">
      <div class="calendar-detail-row"><span>일정 날짜</span><b>${fmtDate(schedule.event_date)}</b></div>
      <div class="calendar-detail-row"><span>기존 일정</span><b>${esc(String(schedule.event_time||'').slice(0,5)||'-')} · ${esc(schedule.title||'-')}</b></div>
      <div class="calendar-detail-row"><span>대기 종류</span><b>${waitCategoryLabel(wait.category)}</b></div>
      <div class="calendar-detail-row"><span>신청자</span><b>${esc(wait.requester_name||'-')}</b></div>
      <div class="calendar-detail-row"><span>희망 시간</span><b>${esc(String(wait.requested_time||'').slice(0,5)||'-')}</b></div>
      <div class="calendar-detail-row"><span>인원</span><b>${wait.people||'-'}명</b></div>
      ${responseRow}
    </div>
  </div>`;
  const close=()=>back.classList.remove('open');
  back.classList.add('open');
  back.querySelector('.calendar-detail-close').onclick=close;
  back.onclick=ev=>{if(ev.target===back)close()};
}

function openScheduleWaitModal(scheduleId){
  const schedule=schedules.find(x=>String(x.id)===String(scheduleId));
  if(!schedule||!schedule.wait_allowed||isCancelledStatus(schedule.status))return;
  let back=document.getElementById('calendarWaitModal');
  if(!back){
    back=document.createElement('div');
    back.id='calendarWaitModal';
    back.className='calendar-wait-backdrop';
    document.body.appendChild(back);
  }
  back.innerHTML=`<div class="calendar-wait-modal" role="dialog" aria-modal="true" aria-label="대기 등록">
    <div class="calendar-wait-modal-head"><div><small>${fmtDate(schedule.event_date)} · ${esc(String(schedule.event_time||'').slice(0,5))}</small><h3>${esc(schedule.title)}</h3></div><button type="button" class="calendar-wait-close" aria-label="닫기">✕</button></div>
    <div class="calendar-wait-modal-body">
      <p class="calendar-wait-guide">이 일정은 <b>대기 가능한 벙</b>입니다. 원하는 보드게임/전략 일정 정보를 남겨주세요.</p>
      <div class="calendar-wait-form">
        <div><label>종류</label><select id="waitCategory" class="field"><option value="boardgame">보겜</option><option value="strategy">전략</option></select></div>
        <div><label>시간</label><input id="waitTime" class="field" type="time" value="${esc(String(schedule.event_time||'20:00').slice(0,5))}"></div>
        <div><label>신청자 이름</label><input id="waitName" class="field" maxlength="30" placeholder="이름 입력"></div>
        <div><label>인원</label><input id="waitPeople" class="field" type="number" min="1" max="30" value="4"></div>
      </div>
      <p class="calendar-wait-note">등록한 대기는 캘린더에 표시되며, 운영진이 벙주 확인 후 <b>O 가능 / X 불가</b>로 표시합니다.</p>
    </div>
    <div class="calendar-wait-modal-foot"><button type="button" class="btn calendar-wait-cancel">취소</button><button type="button" class="btn primary calendar-wait-submit">대기 등록</button></div>
  </div>`;
  const close=()=>back.classList.remove('open');
  back.classList.add('open');
  back.querySelector('.calendar-wait-close').onclick=close;
  back.querySelector('.calendar-wait-cancel').onclick=close;
  back.onclick=ev=>{if(ev.target===back)close()};
  back.querySelector('.calendar-wait-submit').onclick=async()=>{
    const btn=back.querySelector('.calendar-wait-submit');
    const requester=back.querySelector('#waitName').value.trim();
    const people=Number(back.querySelector('#waitPeople').value||0);
    const requestedTime=back.querySelector('#waitTime').value;
    const category=back.querySelector('#waitCategory').value;
    if(!requester)return alert('신청자 이름을 입력해 주세요.');
    if(!people||people<1||people>30)return alert('인원을 확인해 주세요.');
    if(!requestedTime)return alert('시간을 입력해 주세요.');
    btn.disabled=true;btn.textContent='등록 중...';
    try{
      await DOTT_DB.createScheduleWait({schedule_id:schedule.id,category,requester_name:requester,people,requested_time:requestedTime});
      scheduleWaits=await DOTT_DB.scheduleWaits();
      writePublicCache();
      close();render();
      alert('대기를 등록했습니다.');
    }catch(e){
      alert(e.message||e);
      btn.disabled=false;btn.textContent='대기 등록';
    }
  };
}

function openCalendarDetail(e){
  const cancelled=isCancelledStatus(e.status),c=catInfo(e.category);
  let back=document.getElementById('calendarDetailModal');
  if(!back){
    back=document.createElement('div');
    back.id='calendarDetailModal';
    back.className='calendar-detail-backdrop';
    document.body.appendChild(back);
  }
  back.innerHTML=`<div class="calendar-detail" role="dialog" aria-modal="true" aria-label="일정 상세">
    <div class="calendar-detail-head"><div><span class="calendar-detail-category" style="background:${hexWithAlpha(c.color,'35')}">${esc(c.label)}</span><h3 class="${cancelled?'is-cancelled-text':''}">${esc(e.title)}</h3></div><button class="calendar-detail-close" type="button" aria-label="닫기">✕</button></div>
    <div class="calendar-detail-body">
      <div class="calendar-detail-row"><span>날짜</span><b>${fmtDate(e.event_date)}</b></div>
      <div class="calendar-detail-row"><span>시간</span><b>${esc((e.event_time||'').slice(0,5)||'-')}</b></div>
      <div class="calendar-detail-row"><span>인원</span><b>${e.people||'-'}명</b></div>
      <div class="calendar-detail-row"><span>벙주</span><b>${esc(e.manager||'-')}</b></div>
      <div class="calendar-detail-row"><span>상태</span><b class="${cancelled?'detail-cancelled':''}">${scheduleStatusLabel(e.status)}</b></div>
      ${e.wait_allowed&&!cancelled?`<div class="calendar-detail-wait"><button class="btn primary" type="button" data-detail-wait="${esc(e.id||'')}">+ 대기 걸기</button></div>`:''}
      ${e.note?`<div class="calendar-detail-note"><span>메모</span><p>${nl2br(e.note)}</p></div>`:''}
    </div>
  </div>`;
  const close=()=>{
    back.classList.remove('open');
    document.body.classList.remove('calendar-detail-open');
    document.body.style.paddingRight=calendarDetailScrollPad;
  };
  const scrollbarWidth=window.innerWidth-document.documentElement.clientWidth;
  calendarDetailScrollPad=document.body.style.paddingRight;
  if(scrollbarWidth>0)document.body.style.paddingRight=scrollbarWidth+'px';
  document.body.classList.add('calendar-detail-open');
  back.classList.add('open');
  back.querySelector('.calendar-detail-close').onclick=close;
  back.querySelector('[data-detail-wait]')?.addEventListener('click',()=>{close();openScheduleWaitModal(e.id)});
  back.onclick=ev=>{if(ev.target===back)close()};
}

function noticeHtml(){
  if(!notices.length)return '<div class="empty">등록된 공지가 없습니다.</div>';
  return notices.map(n=>`<article class="notice"><span class="notice-badge ${n.pinned?'pin':''}">${n.pinned?'📌 필독':'안내'}</span><div><h3>${esc(n.title)}</h3><div class="notice-content">${noticePublicHtml(n.content)}</div></div><time>${new Date(n.created_at).toLocaleDateString('ko-KR')}</time></article>`).join('');
}

const PUBLIC_CACHE_KEY='dott_public_cache_v2';
function readPublicCache(){
  try{const v=JSON.parse(localStorage.getItem(PUBLIC_CACHE_KEY)||'null');return v&&Array.isArray(v.schedules)?v:null}catch(_e){return null}
}
function writePublicCache(){
  try{localStorage.setItem(PUBLIC_CACHE_KEY,JSON.stringify({schedules,scheduleWaits,notices,siteSettings,savedAt:Date.now()}))}catch(_e){}
}
function showPublicLoadWarning(parts){
  if(!parts.length)return;
  let el=document.getElementById('publicLoadWarning');
  if(!el){
    el=document.createElement('div');el.id='publicLoadWarning';el.className='public-load-warning';
    document.querySelector('.page')?.prepend(el);
  }
  el.innerHTML=`<span>연결이 잠시 불안정해 ${parts.join('·')} 일부를 최신 상태로 불러오지 못했습니다.</span><button type="button" id="publicRetry">다시 시도</button>`;
  document.getElementById('publicRetry').onclick=()=>loadPublicData(false);
}
async function loadPublicData(initial=true){
  const cached=readPublicCache();
  if(initial&&cached){
    schedules=cached.schedules||[];scheduleWaits=cached.scheduleWaits||[];notices=cached.notices||[];siteSettings=cached.siteSettings||null;render();
  }else if(initial){
    app.innerHTML=`${nav('calendar')}<div class="loading">일정을 불러오는 중...</div>`;
  }
  const results=await Promise.allSettled([DOTT_DB.schedules(),DOTT_DB.notices(),DOTT_DB.settings(),DOTT_DB.scheduleWaits()]);
  const failed=[];
  if(results[0].status==='fulfilled')schedules=results[0].value;else failed.push('일정');
  if(results[1].status==='fulfilled')notices=results[1].value;else failed.push('공지');
  if(results[2].status==='fulfilled')siteSettings=results[2].value;
  if(results[3].status==='fulfilled')scheduleWaits=results[3].value;else failed.push('대기');
  const hasCore=results[0].status==='fulfilled'||cached;
  if(hasCore){
    render();
    if(results[0].status==='fulfilled'&&results[1].status==='fulfilled')writePublicCache();
    if(failed.length)showPublicLoadWarning(failed);
    return;
  }
  const message=results[0].reason?.message||'네트워크 연결을 확인해 주세요.';
  app.innerHTML=`${nav('calendar')}<main class="page"><div class="info-box public-fatal">일정을 불러오지 못했습니다.<br>잠시 후 다시 시도해 주세요.<br><small>${esc(message)}</small><br><button class="btn primary" id="fatalRetry" type="button">다시 시도</button></div></main>${footer()}`;
  document.getElementById('fatalRetry').onclick=()=>loadPublicData(false);
}
loadPublicData(true);
