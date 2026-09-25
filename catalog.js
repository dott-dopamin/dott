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
  app.innerHTML=`${nav(kind)}<main class="page catalog-page"><section class="hero"><span class="eyebrow">🎲 보유 현황</span><h1>${title} 리스트</h1>${murderNoticeHtml()}<p>${nl2br(desc)}</p><div class="stat-row"><span class="stat-pill"><span class="stat-label">전체</span><b>${items.length}개</b></span></div></section><section class="section"><div class="filters ${kind==='murder'?'filters-compact':''}">${filterHtml()}</div><div class="catalog-meta"><span id="count"></span></div><div id="catalogContent"></div></section></main>${footer()}`;
  ['q','players','difficulty','genre'].forEach(id=>{const el=document.getElementById(id);if(el)el.oninput=paint});
  paint();
  wireMurderNotice();
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
    root.innerHTML=`<div class="catalog-table-wrap"><table class="catalog-table murder-table"><thead><tr><th>게임명</th><th>인원</th><th>시간</th><th>난이도</th><th>상태 및 위치</th><th>소유주</th><th>비고</th></tr></thead><tbody>${list.map(murderRow).join('')}</tbody></table></div>`;
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
    <td><span class="status catalog-status ${statusClass}">${esc(x.status||'-')}</span></td>
    <td class="catalog-owner" title="${esc(x.note||'')}">${ownerCell(x.note)}</td>
  </tr>`;
}
function murderRow(x){
  const isOnline=x.genre===ONLINE_MURDER_MARKER;
  const onlineBadge=isOnline?'<span class="online-murder-badge">온라인머미</span>':'';
  const statusClass=x.status&&x.status!=='보유'&&!['도트','공방'].includes(x.status)?'out':'';
  return `<tr><td class="catalog-name"><span class="catalog-name-text">${esc(x.name)}</span>${onlineBadge}</td><td>${x.min_players||'?'}~${x.max_players||'?'}인</td><td>${esc(x.playtime||'-')}</td><td>${esc(x.difficulty||'-')}</td><td><span class="status ${statusClass}">${esc(x.status||'보유')}</span></td><td class="catalog-owner" title="${esc(x.location||'')}">${ownerCell(x.location)}</td><td class="catalog-note" title="${esc(x.note||'')}">${esc(x.note||'-')}</td></tr>`;
}

(async()=>{
  const cacheKey=`dott_catalog_${kind}_v61`;
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
