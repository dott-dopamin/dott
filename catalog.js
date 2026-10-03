const app=document.getElementById('app');
const kind=document.body.dataset.kind;
const labels={
  boardgame:['보드게임','도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.'],
  murder:['머더미스터리','보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.'],
  deduction:['추리게임','추리·사건 해결형 게임 보유 목록을 확인하세요.']
};
const descriptionKeys={boardgame:'boardgame_description',murder:'murder_description',deduction:'deduction_description'};
const BOARDGAME_GENRES=['전략','파티/패밀리','협력','디덕션','마피아','레거시'];
const ONLINE_MURDER_MARKER='__DOTT_ONLINE_MURDER__';
let items=[];
let settings=null;

function filterHtml(){
  const base=`<input class="field search-field" id="q" placeholder="게임명 검색"><select class="field" id="players"><option value="">인원 전체</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select>`;
  if(kind==='murder')return base+`<select class="field" id="difficulty"><option value="">난이도 전체</option>${['입문','쉬움','중간','어려움','매우어려움'].map(v=>`<option value="${v}">${v}</option>`).join('')}</select>`;
  const diff=`<select class="field" id="difficulty"><option value="">난이도 전체</option>${[1,2,3,4,5].map(v=>`<option value="${v}">${v}점대</option>`).join('')}</select>`;
  const genres=kind==='boardgame'?BOARDGAME_GENRES:[...new Set(items.map(x=>x.genre).filter(Boolean))];
  const genre=`<select class="field" id="genre"><option value="">장르 전체</option>${genres.map(x=>`<option>${esc(x)}</option>`).join('')}</select>`;
  return base+diff+genre;
}

function render(){
  const [title,defaultDesc]=labels[kind];
  const desc=(settings&&settings[descriptionKeys[kind]])||defaultDesc;
  app.innerHTML=`${nav(kind)}<main class="page catalog-page ${kind}-page"><section class="hero"><span class="eyebrow">🎲 보유 현황</span><h1>${title} 리스트</h1><p>${nl2br(desc)}</p><div class="stat-row"><span class="stat-pill"><span class="stat-label">전체</span><b>${items.length}개</b></span>${murderNoticeHtml()}${recommendOpenHtml()}</div></section><section class="section"><div class="filters">${filterHtml()}</div><div class="catalog-meta"><span id="count"></span></div><div id="catalogContent"></div></section></main>${footer()}`;
  ['q','players','difficulty','genre'].forEach(id=>{const el=document.getElementById(id);if(el)el.oninput=paint});
  paint();
  wireMurderNotice();
  wireRecommendOpen();
}

function filteredItems(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  const p=+document.getElementById('players').value||0;
  const d=document.getElementById('difficulty')?.value||'';
  const g=document.getElementById('genre')?.value||'';
  return items.filter(x=>{
    const difficultyOk=kind==='murder'
      ? (!d||x.difficulty===d)
      : (!d||(()=>{const n=parseFloat(String(x.difficulty??'').trim());return Number.isFinite(n)&&Math.min(5,Math.max(1,Math.floor(n)))===+d})());
    return (!q||(x.name||'').toLowerCase().includes(q))&&(!p||((x.min_players||0)<=p&&(x.max_players||99)>=p))&&difficultyOk&&(!g||x.genre===g);
  });
}


function playtimeLabel(v){
  const s=String(v??'').trim();
  if(!s)return '-';
  let m=s.match(/^(\d+)\s*(?:분)?$/);
  if(m)return `${m[1]}분`;
  m=s.match(/^(\d+)\s*[~-]\s*(\d+)\s*(?:분)?$/);
  if(m)return `${m[1]}~${m[2]}분`;
  return s;
}

function statusClassName(status){
  const map={
    '보유':'status-owned',
    '대여중':'status-rented',
    '분실':'status-lost',
    '도트':'status-dott',
    '공방':'status-workshop'
  };
  return map[status]||'';
}


function rentalStatusAttrs(x){
  if(String(x?.status||'')!=='대여중')return '';
  const borrower=String(x?.current_borrower||'').trim();
  return borrower?` data-rental-tooltip="대여자:${esc(borrower)}" tabindex="0"`:'';
}

function difficultyMeterHtml(value){
  const raw=String(value??'').trim();
  const score=parseFloat(raw);
  if(!Number.isFinite(score)||score<1||score>5)return esc(raw||'-');
  const safe=Math.max(1,Math.min(5,score));
  const boxes=Array.from({length:5},(_,i)=>{
    const fill=Math.max(0,Math.min(100,(safe-i)*100));
    return `<span class="difficulty-box" style="--fill:${fill}%"></span>`;
  }).join('');
  const label=(Math.round(safe*100)/100).toString();
  return `<span class="difficulty-meter" title="난이도 ${esc(label)} / 5" aria-label="난이도 ${esc(label)}점">${boxes}</span>`;
}

function ownerNames(raw){
  const v=String(raw||'').trim();
  if(!v)return [];
  return v.split(/[.·,\\/,]+/).map(x=>x.trim()).filter(Boolean);
}
function ownerCell(raw){
  const names=ownerNames(raw);
  if(!names.length)return '<span class="owner-desktop">-</span><span class="owner-mobile">-</span>';
  const pretty=names.map(esc).join(' · ');
  const mobile=names.length===1
    ? `<span class="owner-mobile">${esc(names[0])}</span>`
    : `<button type="button" class="owner-mobile owner-count" data-owners="${encodeURIComponent(names.join('|'))}">${names.length}명</button>`;
  return `<span class="owner-desktop">${pretty}</span>${mobile}`;
}
function showOwners(names){
  document.getElementById('ownerPopup')?.remove();
  const box=document.createElement('div');
  box.id='ownerPopup';box.className='owner-popup-overlay';
  box.innerHTML=`<div class="owner-popup"><button type="button" class="owner-popup-x" aria-label="닫기">×</button><b>소유주</b><div class="owner-popup-names">${names.map(esc).join(' · ')}</div><button type="button" class="owner-popup-ok">확인</button></div>`;
  document.body.appendChild(box);
  const close=()=>box.remove();
  box.querySelector('.owner-popup-x').onclick=close;box.querySelector('.owner-popup-ok').onclick=close;
  box.onclick=e=>{if(e.target===box)close()};
}
document.addEventListener('click',e=>{
  const b=e.target.closest('.owner-count');if(!b)return;
  showOwners(decodeURIComponent(b.dataset.owners||'').split('|').filter(Boolean));
});


function recommendOpenHtml(){
  if(kind!=='boardgame')return '';
  return `<button id="recommendOpenBtn" class="recommend-open-btn" type="button">🎲 오늘 뭐하지?</button>`;
}
function wireRecommendOpen(){
  if(kind!=='boardgame')return;
  const btn=document.getElementById('recommendOpenBtn');
  if(btn)btn.onclick=openRecommendModal;
}
function playtimeMaxMinutes(v){
  const nums=String(v??'').match(/\d+/g)?.map(Number).filter(Number.isFinite)||[];
  return nums.length?Math.max(...nums):null;
}
function recommendEligibleBase(){
  return items.filter(x=>!['대여중','분실'].includes(String(x.status||'').trim()));
}
function recommendMatches(x,{players,maxTime,genre,difficulty}){
  if(players&&!(Number(x.min_players||0)<=players&&Number(x.max_players||99)>=players))return false;
  if(maxTime){const t=playtimeMaxMinutes(x.playtime);if(t===null||t>maxTime)return false}
  if(genre&&x.genre!==genre)return false;
  if(difficulty){
    const n=parseFloat(String(x.difficulty??'').trim());
    if(!Number.isFinite(n)||Math.floor(Math.max(1,Math.min(5,n)))!==difficulty)return false;
  }
  return true;
}
function recommendResultHtml(x,count){
  if(!x)return `<div class="recommend-empty"><b>조건에 맞는 게임이 없어!</b><span>조건을 조금 넓혀서 다시 뽑아봐.</span></div>`;
  const status=statusClassName(x.status);
  return `<div class="recommend-result-card">
    <div class="recommend-result-kicker">조건에 맞는 게임 ${count}개 중 랜덤 추천</div>
    <div class="recommend-result-name">${esc(x.name)}</div>
    <div class="recommend-result-info">
      <span>👥 ${x.min_players||'?'}~${x.max_players||'?'}인</span><span>⏱ ${esc(playtimeLabel(x.playtime))}</span><span>🎯 ${esc(x.genre||'-')}</span><span>난이도 ${esc(String(x.difficulty||'-'))}</span>
    </div>
    <span class="status catalog-status ${status}">${esc(x.status||'-')}</span>
  </div>`;
}
function openRecommendModal(){
  document.getElementById('recommendModal')?.remove();
  const genres=BOARDGAME_GENRES.filter(g=>items.some(x=>x.genre===g));
  const box=document.createElement('div');box.id='recommendModal';box.className='recommend-backdrop open';
  box.innerHTML=`<div class="recommend-modal">
    <div class="recommend-head"><div><h3>🎲 오늘 뭐하지?</h3><p>조건을 고르면 가능한 게임 중 하나를 랜덤으로 뽑아줘.</p></div><button type="button" class="recommend-close" aria-label="닫기">✕</button></div>
    <div class="recommend-fields">
      <label>인원<select id="recPlayers" class="field"><option value="">전체</option>${[2,3,4,5,6,7,8].map(v=>`<option value="${v}">${v}명</option>`).join('')}</select></label>
      <label>플레이시간<select id="recTime" class="field"><option value="">전체</option><option value="30">30분 이하</option><option value="60">60분 이하</option><option value="90">90분 이하</option><option value="120">120분 이하</option><option value="180">180분 이하</option></select></label>
      <label>장르<select id="recGenre" class="field"><option value="">전체</option>${genres.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></label>
      <label>난이도<select id="recDifficulty" class="field"><option value="">전체</option>${[1,2,3,4,5].map(v=>`<option value="${v}">${v}점대</option>`).join('')}</select></label>
    </div>
    <div id="recommendResult" class="recommend-result"><div class="recommend-placeholder">조건을 고르고 <b>추천받기</b>를 눌러줘!</div></div>
    <div class="recommend-actions"><button type="button" id="recAny" class="btn recommend-secondary">🎲 그냥 하나 골라줘!</button><button type="button" id="recPick" class="btn recommend-primary">추천받기</button></div>
  </div>`;
  document.body.appendChild(box);document.body.classList.add('recommend-open');
  const close=()=>{box.remove();document.body.classList.remove('recommend-open')};
  box.querySelector('.recommend-close').onclick=close;box.onclick=e=>{if(e.target===box)close()};
  const pick=(ignoreConditions=false)=>{
    const cond=ignoreConditions?{players:0,maxTime:0,genre:'',difficulty:0}:{
      players:+box.querySelector('#recPlayers').value||0,maxTime:+box.querySelector('#recTime').value||0,
      genre:box.querySelector('#recGenre').value,difficulty:+box.querySelector('#recDifficulty').value||0
    };
    const candidates=recommendEligibleBase().filter(x=>recommendMatches(x,cond));
    const chosen=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:null;
    box.querySelector('#recommendResult').innerHTML=recommendResultHtml(chosen,candidates.length);
    box.querySelector('#recPick').textContent=chosen?'다시 뽑기':'추천받기';
  };
  box.querySelector('#recPick').onclick=()=>pick(false);
  box.querySelector('#recAny').onclick=()=>pick(true);
}

function murderNoticeHtml(){
  if(kind!=='murder')return '';
  const label=(settings?.murder_notice_button_label||'이용수칙 · 공지 보기').trim()||'이용수칙 · 공지 보기';
  return `<button id="murderNoticeBtn" class="notice-open-btn" type="button">📌 ${esc(label)}</button>`;
}
function wireMurderNotice(){
  if(kind!=='murder')return;
  const btn=document.getElementById('murderNoticeBtn');if(!btn)return;
  btn.onclick=()=>{
    const label=(settings?.murder_notice_button_label||'이용수칙 · 공지 보기').trim()||'이용수칙 · 공지 보기';
    const text=settings?.murder_notice||'등록된 공지가 없습니다.';
    const box=document.createElement('div');box.className='murder-notice-backdrop open';box.id='murderNoticeModal';
    box.innerHTML=`<div class="murder-notice-modal"><div class="murder-notice-head"><h3>📌 ${esc(label)}</h3><button class="murder-notice-close" type="button">✕</button></div><div class="murder-notice-content">${nl2br(text)}</div></div>`;
    document.body.appendChild(box);document.body.classList.add('murder-notice-open');
    const close=()=>{box.remove();document.body.classList.remove('murder-notice-open')};
    box.querySelector('.murder-notice-close').onclick=close;box.onclick=e=>{if(e.target===box)close()};
  };
}

function paint(){
  const list=filteredItems();
  document.getElementById('count').textContent=`${list.length}개 표시 중`;
  const root=document.getElementById('catalogContent');
  if(!list.length){root.innerHTML='<div class="empty">조건에 맞는 게임이 없습니다.</div>';return}
  if(kind==='murder'){
    root.innerHTML=`<div class="catalog-table-wrap"><table class="catalog-table catalog-kind-table murder-table"><thead><tr><th>게임명</th><th>인원</th><th>시간</th><th>난이도</th><th>상태 및 위치</th><th>소유주</th><th>비고</th></tr></thead><tbody>${list.map(murderRow).join('')}</tbody></table></div>`;
    return;
  }
  const tableClass=kind==='boardgame'?'boardgame-table':'deduction-table';
  root.innerHTML=`<div class="catalog-table-wrap"><table class="catalog-table catalog-kind-table ${tableClass}"><thead><tr><th>게임명</th><th>인원</th><th>시간</th><th>난이도</th><th>장르</th><th>상태 및 위치</th><th>소유주</th></tr></thead><tbody>${list.map(listRow).join('')}</tbody></table></div>`;
}

function listRow(x){
  const expansionBadge=kind==='boardgame'&&x.is_expansion?'<span class="boardgame-expansion-badge">확장</span>':'';
  const statusClass=statusClassName(x.status);
  return `<tr>
    <td class="catalog-name"><span class="catalog-name-inner"><span class="catalog-name-text">${esc(x.name)}</span>${expansionBadge}</span></td>
    <td>${x.min_players||'?'}~${x.max_players||'?'}인</td>
    <td>${esc(playtimeLabel(x.playtime))}</td>
    <td class="catalog-difficulty">${difficultyMeterHtml(x.difficulty)}</td>
    <td>${esc(x.genre||'-')}</td>
    <td><span class="status catalog-status ${statusClass}"${rentalStatusAttrs(x)}>${esc(x.status||'-')}</span></td>
    <td class="catalog-owner" title="${esc(x.note||'')}">${ownerCell(x.note)}</td>
  </tr>`;
}

function murderNoteHtml(note){
  const full=String(note||'-');
  let count=0, cut='';
  for(const ch of full){
    if(ch!==' ')count++;
    if(count>8)break;
    cut+=ch;
  }
  const shortened=count>8;
  return `<span class="murder-note-full">${esc(full)}</span><span class="murder-note-mobile" title="${esc(full)}">${esc(cut.trimEnd())}${shortened?'…':''}</span>`;
}
function murderRow(x){
  const isOnline=x.genre===ONLINE_MURDER_MARKER;
  const onlineBadge=isOnline?'<span class="online-murder-badge">온라인</span>':'';
  const statusClass=statusClassName(x.status||'보유');
  return `<tr><td class="catalog-name"><span class="catalog-name-inner"><span class="catalog-name-text">${esc(x.name)}</span>${onlineBadge}</span></td><td>${x.min_players||'?'}~${x.max_players||'?'}인</td><td>${esc(x.playtime||'-')}</td><td>${esc(x.difficulty||'-')}</td><td><span class="status catalog-status ${statusClass}"${rentalStatusAttrs(x)}>${esc(x.status||'보유')}</span></td><td class="catalog-owner" title="${esc(x.location||'')}">${ownerCell(x.location)}</td><td class="catalog-note" title="${esc(x.note||'')}">${murderNoteHtml(x.note)}</td></tr>`;
}


function wireRentalTooltip(){
  if(window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:769px)').matches===false)return;
  let tip=null,current=null;
  const hide=()=>{if(tip){tip.remove();tip=null}current=null};
  const show=(el)=>{
    const text=el?.dataset?.rentalTooltip;if(!text)return;
    hide();current=el;
    tip=document.createElement('div');tip.className='rental-hover-tooltip';tip.textContent=text;
    document.body.appendChild(tip);
    const r=el.getBoundingClientRect(),t=tip.getBoundingClientRect();
    let left=r.left+r.width/2-t.width/2;
    left=Math.max(8,Math.min(left,window.innerWidth-t.width-8));
    let top=r.top-t.height-10;
    if(top<8)top=r.bottom+10;
    tip.style.left=`${Math.round(left)}px`;tip.style.top=`${Math.round(top)}px`;
  };
  document.addEventListener('mouseover',e=>{
    const el=e.target.closest?.('.catalog-status.status-rented[data-rental-tooltip]');
    if(!el||el===current)return;show(el);
  });
  document.addEventListener('mouseout',e=>{
    const el=e.target.closest?.('.catalog-status.status-rented[data-rental-tooltip]');
    if(!el)return;
    if(e.relatedTarget&&el.contains(e.relatedTarget))return;
    hide();
  });
  window.addEventListener('scroll',hide,{passive:true});
  window.addEventListener('resize',hide);
}
wireRentalTooltip();

(async()=>{
  const cacheKey=`dott_catalog_${kind}_v64`;
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(cacheKey)||'null')}catch(_e){}
  if(cached?.items){items=cached.items;settings=cached.settings||null;render()}
  else app.innerHTML=`${nav(kind)}<div class="loading">목록을 불러오는 중...</div>`;
  const [ir,sr]=await Promise.allSettled([DOTT_DB.catalog(kind),DOTT_DB.settings()]);
  if(ir.status==='fulfilled'){
    items=ir.value;
    if(sr.status==='fulfilled')settings=sr.value;
    render();
    try{localStorage.setItem(cacheKey,JSON.stringify({items,settings,savedAt:Date.now()}))}catch(_e){}
  }else if(!cached){
    app.innerHTML=`${nav(kind)}<main class="page"><div class="info-box">목록을 불러오지 못했습니다.<br>잠시 후 다시 시도해 주세요.<br>${esc(ir.reason?.message||'')}</div></main>${footer()}`;
  }
})();
