(()=>{
  const bootScript=document.currentScript;
  const entry=bootScript?.dataset?.entry||'admin-v35.js';
  const app=document.getElementById('app');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const BUILD='dott-v61-admin-playtime-range';

  function loadScript(src,{timeout=9000,retries=2}={}){
    return (async()=>{
      let lastErr;
      for(let attempt=0;attempt<=retries;attempt++){
        try{
          await new Promise((resolve,reject)=>{
            const s=document.createElement('script');
            let done=false;
            const finish=(ok,err)=>{
              if(done)return;
              done=true;
              clearTimeout(timer);
              if(!ok)s.remove();
              ok?resolve():reject(err||new Error(`${src} 로드 실패`));
            };
            const timer=setTimeout(()=>finish(false,new Error(`${src} 로드 시간 초과`)),timeout);
            const join=src.includes('?')?'&':'?';
            s.src=`${src}${join}v=${BUILD}${attempt?`&retry=${Date.now()}_${attempt}`:''}`;
            s.async=false;
            s.onload=()=>finish(true);
            s.onerror=()=>finish(false,new Error(`${src} 로드 실패`));
            document.head.appendChild(s);
          });
          return;
        }catch(e){
          lastErr=e;
          if(attempt<retries)await sleep(350*(attempt+1));
        }
      }
      throw lastErr||new Error(`${src} 로드 실패`);
    })();
  }

  function renderBootError(error){
    if(!app)return;
    const msg=String(error?.message||error||'연결 오류');
    const safe=msg.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    app.innerHTML=`<main style="max-width:720px;margin:72px auto;padding:24px;font-family:Arial,'Noto Sans KR',sans-serif;color:#222"><div style="border:1px solid #eadfd4;border-radius:18px;padding:24px;background:#fffaf5;text-align:center"><div style="font-size:34px;margin-bottom:10px">↻</div><h2 style="margin:0 0 10px;font-size:20px">페이지 연결이 잠시 불안정해요</h2><p style="margin:0 0 18px;line-height:1.6;color:#666">관리자 파일을 불러오지 못했습니다.<br>잠시 후 다시 시도해 주세요.</p><button id="bootRetry" style="border:0;border-radius:12px;background:#e95d20;color:white;padding:11px 18px;font-weight:700">다시 시도</button><details style="margin-top:16px;color:#999;font-size:12px"><summary>오류 내용</summary><div style="margin-top:8px;word-break:break-all">${safe}</div></details></div></main>`;
    document.getElementById('bootRetry')?.addEventListener('click',()=>location.reload());
  }

  (async()=>{
    try{
      await loadScript('config-v35.js',{timeout:6000,retries:2});
      await loadScript('store-v35.js',{timeout:6000,retries:2});
      await loadScript('common-v35.js',{timeout:6000,retries:2});
      await loadScript(entry,{timeout:8000,retries:2});
    }catch(e){
      console.error('[DOTT bootstrap v35]',e);
      renderBootError(e);
    }
  })();
})();
