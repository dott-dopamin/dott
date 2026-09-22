(()=>{
  const bootScript=document.currentScript;
  const entry=bootScript?.dataset?.entry||'';
  const app=document.getElementById('app');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  function loadScript(src,{timeout=10000}={}){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      let done=false;
      const finish=(ok,err)=>{
        if(done)return; done=true; clearTimeout(timer);
        if(!ok)s.remove();
        ok?resolve():reject(err||new Error(`${src} 로드 실패`));
      };
      const timer=setTimeout(()=>finish(false,new Error(`${src} 로드 시간 초과`)),timeout);
      s.src=src;
      s.async=false;
      s.onload=()=>finish(true);
      s.onerror=()=>finish(false,new Error(`${src} 로드 실패`));
      document.head.appendChild(s);
    });
  }

  async function loadSupabase(){
    if(window.supabase?.createClient)return;
    const sources=[
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
      'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'
    ];
    let lastErr;
    for(const base of sources){
      for(let attempt=0;attempt<2;attempt++){
        try{
          const sep=base.includes('?')?'&':'?';
          await loadScript(`${base}${sep}dott_retry=${Date.now()}_${attempt}`,{timeout:9000});
          if(window.supabase?.createClient)return;
          throw new Error('Supabase 초기화 실패');
        }catch(e){
          lastErr=e;
          await sleep(450*(attempt+1));
        }
      }
    }
    throw lastErr||new Error('Supabase 라이브러리를 불러오지 못했습니다.');
  }

  function renderBootError(error){
    if(!app)return;
    const msg=String(error?.message||error||'연결 오류');
    app.innerHTML=`<main style="max-width:720px;margin:72px auto;padding:24px;font-family:Arial,'Noto Sans KR',sans-serif;color:#222"><div style="border:1px solid #eadfd4;border-radius:18px;padding:24px;background:#fffaf5;text-align:center"><div style="font-size:34px;margin-bottom:10px">↻</div><h2 style="margin:0 0 10px;font-size:20px">연결이 잠시 불안정해요</h2><p style="margin:0 0 18px;line-height:1.6;color:#666">모바일 네트워크 전환이나 일시적인 통신 지연일 수 있습니다.<br>잠시 후 다시 시도해 주세요.</p><button id="bootRetry" style="border:0;border-radius:12px;background:#e95d20;color:white;padding:11px 18px;font-weight:700">다시 시도</button><details style="margin-top:16px;color:#999;font-size:12px"><summary>오류 내용</summary><div style="margin-top:8px;word-break:break-all">${msg.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</div></details></div></main>`;
    document.getElementById('bootRetry')?.addEventListener('click',()=>location.reload());
  }

  (async()=>{
    try{
      await loadScript('config.js',{timeout:6000});
      await loadSupabase();
      await loadScript('store.js',{timeout:6000});
      await loadScript('common.js',{timeout:6000});
      if(!entry)throw new Error('실행 파일이 지정되지 않았습니다.');
      await loadScript(entry,{timeout:8000});
    }catch(e){
      console.error('[DOTT bootstrap]',e);
      renderBootError(e);
    }
  })();
})();
