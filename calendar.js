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
}

function todayEventHtml(e){
  const cancelled=isCancelledStatus(e.status);
  return `<div class="mini-event ${cancelled?'is-cancelled':''}">${tag(e.category)} <b>${esc(e.title)}</b> <span>◷ ${(e.event_time||'').slice(0,5)}</span> <span>♙ ${e.people||'-'}명</span> <span>벙주 ${esc(e.manager||'-')}</span>${cancelled?'<span class="cancel-label">취소</span>':''}</div>`;
}

function calendarHtml(){
  const first=new Date(cursor.getFullYear(),cursor.getMonth(),1),start=first.getDay();
  let out=['일','월','화','수','목','금','토'].map(d=>`<div class="dow">${d}</div>`).join('');
  for(let i=0;i<42;i++){
    const date=new Date(cursor.getFullYear(),cursor.getMonth(),1-start+i),inMonth=date.getMonth()===cursor.getMonth(),ds=ymd(date),ev=schedules.filter(x=>x.event_date===ds);
    const weekendClass=date.getDay()===0?'sunday':date.getDay()===6?'saturday':'';
    out+=`<div class="day ${inMonth?'':'muted'} ${ds===todayYmd()?'today':''} ${weekendClass}" data-date="${ds}"><div class="day-num">${date.getDate()}</div><div class="day-events">${ev.slice(0,3).map(calendarEventHtml).join('')}${ev.length>3?`<div class="day-more">+${ev.length-3}개 일정</div>`:''}</div></div>`;
  }
  return out;
}

function calendarEventHtml(e){
  const c=catInfo(e.category),cancelled=isCancelledStatus(e.status);
  return `<div class="day-event ${cancelled?'is-cancelled':''}" style="background:${hexWithAlpha(c.color,'26')};color:#1f1f1f" title="${esc(e.title)}"><div class="event-line event-main"><span class="event-time">${(e.event_time||'').slice(0,5)}</span><span class="event-title">${esc(e.title)}</span>${cancelled?'<span class="cancel-label">취소</span>':''}</div><div class="event-line event-sub"><span>${e.people||'-'}명</span><span>벙주 ${esc(e.manager||'-')}</span></div></div>`;
}

function noticeHtml(){
  if(!notices.length)return '<div class="empty">등록된 공지가 없습니다.</div>';
  return notices.map(n=>`<article class="notice"><span class="notice-badge ${n.pinned?'pin':''}">${n.pinned?'📌 필독':'안내'}</span><div><h3>${esc(n.title)}</h3><div class="notice-content">${noticePublicHtml(n.content)}</div></div><time>${new Date(n.created_at).toLocaleDateString('ko-KR')}</time></article>`).join('');
}

(async()=>{
  app.innerHTML=`${nav('calendar')}<div class="loading">일정을 불러오는 중...</div>`;
  try{
    [schedules,notices,siteSettings]=await Promise.all([DOTT_DB.schedules(),DOTT_DB.notices(),DOTT_DB.settings()]);
    render();
  }catch(e){
    app.innerHTML=`${nav('calendar')}<div class="page"><div class="info-box">Supabase 연결은 됐지만 아직 테이블이 준비되지 않았습니다.<br><b>supabase.sql</b>을 먼저 실행해 주세요.<br><br>${esc(e.message)}</div></div>${footer()}`;
  }
})();
