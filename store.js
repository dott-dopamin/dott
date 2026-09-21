if(!window.supabase) throw new Error('Supabase 라이브러리를 불러오지 못했습니다.');
const db = window.supabase.createClient(window.DOTT_CONFIG.supabaseUrl, window.DOTT_CONFIG.supabaseKey);
window.DOTT_DB = {
  client: db,
  async schedules(){const {data,error}=await db.from('schedules').select('*').order('event_date').order('event_time');if(error)throw error;return data||[]},
  async notices(){const {data,error}=await db.from('notices').select('*').order('created_at',{ascending:true});if(error)throw error;return data||[]},
  async catalog(kind){let q=db.from('catalog_items').select('*').order('name');if(kind)q=q.eq('kind',kind);const {data,error}=await q;if(error)throw error;return data||[]},
  async settings(){const {data,error}=await db.from('site_settings').select('*').eq('id','main').maybeSingle();if(error){console.warn('site_settings를 불러오지 못했습니다.',error);return null}return data||null},
  async saveSettings(row){const payload={id:'main',...row,updated_at:new Date().toISOString()};const {data,error}=await db.from('site_settings').upsert(payload,{onConflict:'id'}).select().single();if(error)throw error;return data},
  async insert(table,row){const {data,error}=await db.from(table).insert(row).select().single();if(error)throw error;return data},
  async update(table,id,row){const {data,error}=await db.from(table).update(row).eq('id',id).select().single();if(error)throw error;return data},
  async remove(table,id){const {error}=await db.from(table).delete().eq('id',id);if(error)throw error},
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
