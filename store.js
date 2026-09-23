// DOTT v30: supabase-js CDN 없이 브라우저 기본 fetch로 Supabase Data API/Auth에 직접 연결합니다.
const DOTT_API_CFG=window.DOTT_CONFIG;
if(!DOTT_API_CFG?.supabaseUrl||!DOTT_API_CFG?.supabaseKey)throw new Error('Supabase 연결 정보가 없습니다.');

const API_BASE=String(DOTT_API_CFG.supabaseUrl).replace(/\/$/,'');
const API_KEY=DOTT_API_CFG.supabaseKey;
const SESSION_KEY='dott_supabase_session_v30';
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function readSession(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(_e){return null}
}
function saveSession(s){
  if(!s){localStorage.removeItem(SESSION_KEY);return null}
  const expiresIn=Number(s.expires_in||3600);
  const rawExp=Number(s.expires_at||0);
  const normalized={...s,expires_at:rawExp?(rawExp<1e12?rawExp*1000:rawExp):Date.now()+expiresIn*1000};
  localStorage.setItem(SESSION_KEY,JSON.stringify(normalized));
  return normalized;
}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function transientError(e){
  const msg=String(e?.message||e||'').toLowerCase();
  const status=Number(e?.status||0);
  return !status||status===408||status===425||status===429||status>=500||/failed to fetch|fetch failed|network|timeout|timed out|load failed|connection|offline|gateway|temporar|abort/.test(msg);
}
function apiError(message,status,detail){
  const e=new Error(message||`요청 실패 (${status||'unknown'})`);
  e.status=status||0;e.detail=detail;return e;
}
async function fetchWithTimeout(url,options={},timeout=12000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{...options,signal:controller.signal})}
  finally{clearTimeout(timer)}
}
async function withRetry(label,fn,{retries=2}={}){
  let last;
  for(let attempt=0;attempt<=retries;attempt++){
    try{return await fn()}
    catch(e){
      last=e;
      if(attempt>=retries||!transientError(e))break;
      await wait(500*Math.pow(2,attempt));
    }
  }
  if(last?.name==='AbortError')throw apiError(`${label} 요청 시간이 초과되었습니다.`,408);
  throw last;
}
async function parseResponse(res){
  const text=await res.text();
  let body=null;
  if(text){try{body=JSON.parse(text)}catch(_e){body=text}}
  if(!res.ok){
    const message=body?.msg||body?.message||body?.error_description||body?.error||`요청 실패 (${res.status})`;
    throw apiError(message,res.status,body);
  }
  return body;
}
async function refreshSession(session){
  if(!session?.refresh_token)return null;
  try{
    const res=await fetchWithTimeout(`${API_BASE}/auth/v1/token?grant_type=refresh_token`,{
      method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:session.refresh_token})
    },10000);
    const body=await parseResponse(res);
    return saveSession(body);
  }catch(e){
    if(e.status===400||e.status===401){clearSession();return null}
    throw e;
  }
}
async function currentSession({refresh=true}={}){
  let s=readSession();
  if(!s)return null;
  const exp=Number(s.expires_at||0);
  if(refresh&&(!exp||Date.now()>exp-120000))s=await refreshSession(s);
  return s;
}
async function headersFor({auth=false,json=false,prefer=''}={}){
  const h={apikey:API_KEY};
  if(json)h['Content-Type']='application/json';
  if(prefer)h.Prefer=prefer;
  if(auth){
    const s=await currentSession();
    if(!s?.access_token)throw apiError('관리자 로그인이 필요합니다.',401);
    h.Authorization=`Bearer ${s.access_token}`;
  }
  return h;
}
function enc(v){return encodeURIComponent(String(v))}
async function restSelect(table,query='',label='데이터',requireAuth=false){
  return withRetry(label,async()=>{
    const res=await fetchWithTimeout(`${API_BASE}/rest/v1/${table}?${query}`,{headers:await headersFor({auth:requireAuth})});
    return (await parseResponse(res))||[];
  });
}
async function restWrite(method,table,{id=null,row=null,ids=null,query='',prefer='return=representation'}={}){
  let q=query;
  if(id)q+=(q?'&':'')+`id=eq.${enc(id)}`;
  if(ids?.length)q+=(q?'&':'')+`id=in.(${ids.map(enc).join(',')})`;
  const res=await fetchWithTimeout(`${API_BASE}/rest/v1/${table}${q?'?'+q:''}`,{
    method,headers:await headersFor({auth:true,json:row!==null,prefer}),
    ...(row!==null?{body:JSON.stringify(row)}:{})
  });
  return parseResponse(res);
}

window.DOTT_DB={
  async schedules(){return restSelect('schedules','select=*&order=event_date.asc,event_time.asc','일정')},
  async notices(){return restSelect('notices','select=*&order=created_at.asc','공지')},
  async attendance(){
    try{const rows=await restSelect('attendance_members','select=*&order=name.asc','출석',true);window.DOTT_ATTENDANCE_ERROR=null;return rows}
    catch(error){window.DOTT_ATTENDANCE_ERROR=error;console.warn('attendance_members를 불러오지 못했습니다.',error);return []}
  },
  async catalog(kind){
    const filter=kind?`&kind=eq.${enc(kind)}`:'';
    return restSelect('catalog_items',`select=*${filter}&order=name.asc`,'게임 목록');
  },
  async settings(){
    try{const rows=await restSelect('site_settings','select=*&id=eq.main&limit=1','사이트 설정');return rows[0]||null}
    catch(error){console.warn('site_settings를 불러오지 못했습니다.',error);return null}
  },
  async saveSettings(row){
    const payload={id:'main',...row,updated_at:new Date().toISOString()};
    const body=await restWrite('POST','site_settings',{row:payload,query:'on_conflict=id',prefer:'resolution=merge-duplicates,return=representation'});
    return Array.isArray(body)?body[0]:body;
  },
  async insert(table,row){const body=await restWrite('POST',table,{row});return Array.isArray(body)?body[0]:body},
  async update(table,id,row){const body=await restWrite('PATCH',table,{id,row});return Array.isArray(body)?body[0]:body},
  async remove(table,id){await restWrite('DELETE',table,{id,prefer:'return=minimal'})},
  async removeMany(table,ids){if(ids?.length)await restWrite('DELETE',table,{ids,prefer:'return=minimal'})},
  async session(){return currentSession()},
  async signIn(email,password){
    const res=await fetchWithTimeout(`${API_BASE}/auth/v1/token?grant_type=password`,{
      method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})
    },12000);
    return saveSession(await parseResponse(res));
  },
  async signOut(){
    const s=readSession();
    if(s?.access_token){
      try{await fetchWithTimeout(`${API_BASE}/auth/v1/logout`,{method:'POST',headers:{apikey:API_KEY,Authorization:`Bearer ${s.access_token}`}},8000)}catch(_e){}
    }
    clearSession();
  },
  async changePassword(password){
    const s=await currentSession();
    if(!s?.access_token)throw apiError('관리자 로그인이 필요합니다.',401);
    const res=await fetchWithTimeout(`${API_BASE}/auth/v1/user`,{
      method:'PUT',headers:{apikey:API_KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({password})
    },12000);
    return parseResponse(res);
  },
  async uploadImage(file){
    const s=await currentSession();
    if(!s?.access_token)throw apiError('관리자 로그인이 필요합니다.',401);
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
    const res=await fetchWithTimeout(`${API_BASE}/storage/v1/object/catalog-images/${path}`,{
      method:'POST',headers:{apikey:API_KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file
    },20000);
    await parseResponse(res);
    return `${API_BASE}/storage/v1/object/public/catalog-images/${path}`;
  }
};
