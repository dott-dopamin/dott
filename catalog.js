const app=document.getElementById('app');
const kind=document.body.dataset.kind;
const labels={
  boardgame:['보드게임','도트에 있는 보드게임을 검색하고 인원·난이도·장르별로 골라보세요.'],
  murder:['머더미스터리','보유 중인 머더미스터리 시나리오를 한눈에 확인하세요.'],
  deduction:['추리게임','추리·사건 해결형 게임 보유 목록을 확인하세요.']
};
const descriptionKeys={
  boardgame:'boardgame_description',
  murder:'murder_description',
  deduction:'deduction_description'
};
let items=[];
let settings=null;

function render(){
  const [title,defaultDesc]=labels[kind];
  const desc=(settings&&settings[descriptionKeys[kind]])||defaultDesc;
  app.innerHTML=`${nav(kind)}<main class="page catalog-page"><section class="hero"><span class="eyebrow">🎲 보유 현황</span><h1>${title} 리스트</h1><p>${nl2br(desc)}</p><div class="stat-row"><span class="stat-pill">전체 <b>${items.length}개</b></span></div></section><section class="section"><div class="filters"><input class="field search-field" id="q" placeholder="게임명 검색"><select class="field" id="players"><option value="">인원 전체</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select><select class="field" id="difficulty"><option value="">난이도 전체</option><option value="쉬움">쉬움</option><option value="보통">보통</option><option value="어려움">어려움</option></select><select class="field" id="genre"><option value="">장르 전체</option>${[...new Set(items.map(x=>x.genre).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div class="catalog-meta"><span id="count"></span></div><div id="catalogContent"></div></section></main>${footer()}`;
  ['q','players','difficulty','genre'].forEach(id=>document.getElementById(id).oninput=paint);
  paint();
}

function filteredItems(){
  const q=document.getElementById('q').value.trim().toLowerCase(),p=+document.getElementById('players').value||0,d=document.getElementById('difficulty').value,g=document.getElementById('genre').value;
  return items.filter(x=>(!q||(x.name||'').toLowerCase().includes(q))&&(!p||((x.min_players||0)<=p&&(x.max_players||99)>=p))&&(!d||x.difficulty===d)&&(!g||x.genre===g));
}

function paint(){
  const list=filteredItems();
  document.getElementById('count').textContent=`${list.length}개 표시 중`;
  const root=document.getElementById('catalogContent');
  if(!list.length){root.innerHTML='<div class="empty">조건에 맞는 게임이 없습니다.</div>';return}
  root.innerHTML=`<div class="catalog-table-wrap"><table class="catalog-table"><thead><tr><th>게임명</th><th>인원</th><th>시간</th><th>난이도</th><th>장르</th><th>상태</th><th>소유주</th></tr></thead><tbody>${list.map(listRow).join('')}</tbody></table></div>`;
}

function listRow(x){
  return `<tr><td class="catalog-name">${esc(x.name)}</td><td>${x.min_players||'?'}~${x.max_players||'?'}인</td><td>${esc(x.playtime||'-')}</td><td>${esc(x.difficulty||'-')}</td><td>${esc(x.genre||'-')}</td><td><span class="status ${x.status&&x.status!=='보유'?'out':''}">${esc(x.status||'보유')}</span></td><td class="catalog-note" title="${esc(x.note||'')}">${esc(x.note||'-')}</td></tr>`;
}

(async()=>{
  const cacheKey=`dott_catalog_${kind}_v1`;
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(cacheKey)||'null')}catch(_e){}
  if(cached?.items){items=cached.items;settings=cached.settings||null;render()}
  else app.innerHTML=`${nav(kind)}<div class="loading">목록을 불러오는 중...</div>`;
  const [ir,sr]=await Promise.allSettled([DOTT_DB.catalog(kind),DOTT_DB.settings()]);
  if(ir.status==='fulfilled'){items=ir.value;if(sr.status==='fulfilled')settings=sr.value;render();try{localStorage.setItem(cacheKey,JSON.stringify({items,settings,savedAt:Date.now()}))}catch(_e){}}
  else if(!cached){app.innerHTML=`${nav(kind)}<main class="page"><div class="info-box">목록을 불러오지 못했습니다.<br>잠시 후 새로고침해 주세요.<br>${esc(ir.reason?.message||'')}</div></main>${footer()}`}
})();
