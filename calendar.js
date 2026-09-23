const app=document.getElementById('app');
let cursor=new Date();cursor.setDate(1);
let schedules=[],notices=[],siteSettings=null;
const DEFAULT_HERO={hero_badge:'◎ 전체 공개 일정',hero_title:'우리의 모든 일정을\n한눈에 확인하세요',hero_description:'월별 캘린더에서 예약 일정을 확인하고, 보드게임·머더미스터리·추리게임 보유 목록도 함께 살펴볼 수 있습니다.'};

function monthEvents(){
  return schedules.filter(x=>{const d=new Date(x.event_date+'T00:00:00');return d.getFullYear()===cursor.getFullYear()&&d.getMonth()===cursor.getMonth()});
}

function render(){
  const me=monthEvents(),today=todayYmd(),te=schedules.filter(x=>x.event_date===today),hero={...DEFAULT_HERO,...(siteSettings||{})};
  app.innerHTML=`${nav('calendar')}<main class="page"><section class="hero"><span class="eyebrow">${esc(hero.hero_badge)}</span><h1>${nl2br(hero.hero_title)}</h1><p>${nl2br(hero.hero_description)}</p><div class="stat-row"><span class="stat-pill">📅 이번 달 일정 <b>${me.length}건</b></span><span class="stat-pill">🟢 오늘 일정 <b>${te.length}건</b></span></div></section>
<section class="section grid-2"><div class="today-box"><div class="today-icon">▣</div><div><div class="today-head"><strong>오늘 일정</strong><small>${fmtDate(today)}</small><span class="count-badge">${te.length}건</span></div><div class="mini-events">${te.length?te.map(todayEventHtml).join(''):'오늘 등록된 일정이 없습니다.'}</div></div></div><div class="legend"><div class="legend-title">🎨 카테고리 색상</div><div class="legend-row">${CFG.categories.map(c=>`<span class="legend-chip"><i class="dot" style="background:${c.color}"></i>${esc(c.label)}</span>`).join('')}</div></div></section>
<section class="section card calendar-card"><div class="card-head"><h2>${cursor.getFullYear()}년 ${cursor.getMonth()+1}월</h2><div class="toolbar"><button class="btn" id="prev">‹</button><button class="btn" id="today">오늘</button><button class="btn" id="next">›</button></div></div><div class="calendar-scroll"><div class="calendar-grid">${calendarHtml(me)}</div></div></section>
<section class="section card"><div class="card-head"><h2>공지사항</h2></div><div class="notice-list">${noticeHtml()}</div></section></main>${footer()}`;
  document.getElementById('prev').onclick=()=>{cursor.setMonth(cursor.getMonth()-1);render()};
  document.getElementById('next').onclick=()=>{cursor.setMonth(cursor.getMonth()+1);render()};
  document.getElementById('today').onclick=()=>{cursor=new Date();cursor.setDate(1);render()};
  wireMobileCalendarEvents();
}

function todayEventHtml(e){
  const cancelled=isCancelledStatus(e.status);
  return `<div class="mini-event ${cancelled?'is-cancelled':''}">${tag(e.category)} <b>${esc(e.title)}</b> <span>◷ ${(e.event_time||'').slice(0,5)}</span> <span>♙ ${e.people||'-'}명</span> <span>벙주 ${esc(e.manager||'-')}${e.venue_flexible?'<b class="venue-flex-public">✓</b>':''}</span>${cancelled?'<span class="cancel-label">취소</span>':''}</div>`;
}

function calendarHtml(){
  const y=cursor.getFullYear(),m=cursor.getMonth();
  const first=new Date(y,m,1),start=first.getDay(),daysInMonth=new Date(y,m+1,0).getDate();
  const cellCount=Math.ceil((start+daysInMonth)/7)*7;
  let out=['일','월','화','수','목','금','토'].map(d=>`<div class="dow">${d}</div>`).join('');
  for(let i=0;i<cellCount;i++){
    const dayNum=i-start+1;
    if(dayNum<1||dayNum>daysInMonth){
      out+='<div class="day empty-day" aria-hidden="true"></div>';
      continue;
    }
    const date=new Date(y,m,dayNum),ds=ymd(date),ev=schedules.filter(x=>x.event_date===ds);
    const weekendClass=date.getDay()===0?'sunday':date.getDay()===6?'saturday':'';
    out+=`<div class="day ${ds===todayYmd()?'today':''} ${weekendClass}" data-date="${ds}"><div class="day-num">${dayNum}</div><div class="day-events">${ev.slice(0,3).map(calendarEventHtml).join('')}${ev.length>3?`<div class="day-more">+${ev.length-3}개 일정</div>`:''}</div></div>`;
  }
  return out;
}

function calendarEventHtml(e){
  const c=catInfo(e.category),cancelled=isCancelledStatus(e.status);
  return `<div class="day-event ${cancelled?'is-cancelled':''} ${e.venue_flexible?'venue-flexible':''}" data-event-id="${esc(e.id||'')}" role="button" tabindex="0" style="background:${hexWithAlpha(c.color,'26')};color:#1f1f1f" title="${esc(e.title)}"><div class="event-line event-main"><span class="event-time">${(e.event_time||'').slice(0,5)}</span><span class="event-title">${esc(e.title)}</span>${cancelled?'<span class="cancel-label">취소</span>':''}</div><div class="event-line event-sub"><span>${e.people||'-'}명</span><span>벙주 ${esc(e.manager||'-')}${e.venue_flexible?'<b class="venue-flex-public">✓</b>':''}</span></div></div>`;
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
      <div class="calendar-detail-row"><span>벙주</span><b>${esc(e.manager||'-')}${e.venue_flexible?' <span class="venue-flex-public">✓</span>':''}</b></div>
      <div class="calendar-detail-row"><span>상태</span><b class="${cancelled?'detail-cancelled':''}">${scheduleStatusLabel(e.status)}</b></div>
      ${e.note?`<div class="calendar-detail-note"><span>메모</span><p>${nl2br(e.note)}</p></div>`:''}
    </div>
  </div>`;
  const close=()=>{back.classList.remove('open');document.body.classList.remove('calendar-detail-open')};
  back.classList.add('open');
  document.body.classList.add('calendar-detail-open');
  back.querySelector('.calendar-detail-close').onclick=close;
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
  try{localStorage.setItem(PUBLIC_CACHE_KEY,JSON.stringify({schedules,notices,siteSettings,savedAt:Date.now()}))}catch(_e){}
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
    schedules=cached.schedules||[];notices=cached.notices||[];siteSettings=cached.siteSettings||null;render();
  }else if(initial){
    app.innerHTML=`${nav('calendar')}<div class="loading">일정을 불러오는 중...</div>`;
  }
  const results=await Promise.allSettled([DOTT_DB.schedules(),DOTT_DB.notices(),DOTT_DB.settings()]);
  const failed=[];
  if(results[0].status==='fulfilled')schedules=results[0].value;else failed.push('일정');
  if(results[1].status==='fulfilled')notices=results[1].value;else failed.push('공지');
  if(results[2].status==='fulfilled')siteSettings=results[2].value;
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
