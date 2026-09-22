if(!window.supabase?.createClient) throw new Error('Supabase 라이브러리를 불러오지 못했습니다.');
const db = window.supabase.createClient(window.DOTT_CONFIG.supabaseUrl, window.DOTT_CONFIG.supabaseKey);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const transientError=e=>{
  const msg=String(e?.message||e||'').toLowerCase();
  const status=Number(e?.status||e?.statusCode||0);
  return !status||status>=500||/failed to fetch|fetch failed|network|timeout|timed out|load failed|connection|offline|gateway|temporar/.test(msg);
};
async function withRetry(label,fn,{retries=2,timeout=12000}={}){
  let last;
  for(let attempt=0;attempt<=retries;attempt++){
    try{
      const task=Promise.resolve().then(fn);
      const timer=new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} 요청 시간이 초과되었습니다.`)),timeout));
      return await Promise.race([task,timer]);
    }catch(e){
      last=e;
      if(attempt>=retries||!transientError(e))break;
      await wait(550*Math.pow(2,attempt));
    }
  }
  throw last;
}
window.DOTT_DB = {
  client: db,
  async schedules(){return withRetry('일정',async()=>{const {data,error}=await db.from('schedules').select('*').order('event_date').order('event_time');if(error)throw error;return data||[]})},
  async notices(){return withRetry('공지',async()=>{const {data,error}=await db.from('notices').select('*').order('created_at',{ascending:true});if(error)throw error;return data||[]})},
  async attendance(){try{const data=await withRetry('출석',async()=>{const {data,error}=await db.from('attendance_members').select('*').order('name');if(error)throw error;return data||[]});window.DOTT_ATTENDANCE_ERROR=null;return data}catch(error){window.DOTT_ATTENDANCE_ERROR=error;console.warn('attendance_members를 불러오지 못했습니다.',error);return []}},
  async catalog(kind){return withRetry('게임 목록',async()=>{let q=db.from('catalog_items').select('*').order('name');if(kind)q=q.eq('kind',kind);const {data,error}=await q;if(error)throw error;return data||[]})},
  async settings(){try{return await withRetry('사이트 설정',async()=>{const {data,error}=await db.from('site_settings').select('*').eq('id','main').maybeSingle();if(error)throw error;return data||null},{retries:1})}catch(error){console.warn('site_settings를 불러오지 못했습니다.',error);return null}},
  async saveSettings(row){const payload={id:'main',...row,updated_at:new Date().toISOString()};const {data,error}=await db.from('site_settings').upsert(payload,{onConflict:'id'}).select().single();if(error)throw error;return data},
  async insert(table,row){const {data,error}=await db.from(table).insert(row).select().single();if(error)throw error;return data},
  async update(table,id,row){const {data,error}=await db.from(table).update(row).eq('id',id).select().single();if(error)throw error;return data},
  async remove(table,id){const {error}=await db.from(table).delete().eq('id',id);if(error)throw error},
  async removeMany(table,ids){if(!ids||!ids.length)return;const {error}=await db.from(table).delete().in('id',ids);if(error)throw error},
  async session(){return (await db.auth.getSession()).data.session},
  async signIn(email,password){const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;return data},
  async signOut(){const {error}=await db.auth.signOut();if(error)throw error},
  async changePassword(password){const {data,error}=await db.auth.updateUser({password});if(error)throw error;return data},
  async uploadImage(file){
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from('catalog-images').upload(path,file,{cacheControl:'3600'});if(error)throw error;
    return db.storage.from('catalog-images').getPublicUrl(path).data.publicUrl;
  }
};
