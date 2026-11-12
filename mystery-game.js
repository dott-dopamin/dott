(()=>{
  const app=document.getElementById('app');
  if(!app)return;
  app.innerHTML=`${nav('mystery-game')}
    <main class="mystery-embed-page" id="gameMain">
      <iframe
        class="mystery-embed-frame"
        id="mysteryFrame"
        title="누가 장한철을 뚜까 팼나? 게임"
        src="https://dott-dopamin.github.io/dott-admin/mystery-test/?embed=1&scorev=17"
        loading="eager"
        allowfullscreen>
      </iframe>
      <p class="mystery-embed-fallback">게임 화면이 보이지 않으면 <a href="https://dott-dopamin.github.io/dott-admin/mystery-test/" target="_blank" rel="noopener noreferrer">게임 별도 화면 열기</a></p>
    </main>
    ${footer()}`;
})();
