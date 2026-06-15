(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const N=document.getElementById("theme-switch"),F=N?N.querySelector("i"):null,q=localStorage.getItem("theme"),J=window.matchMedia("(prefers-color-scheme: dark)").matches;function u(e){return typeof e!="string"?"":e.replace(/[&<>"']/g,function(i){switch(i){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";case"'":return"&#039;";default:return i}})}function G(e){const n=new DOMParser().parseFromString(e,"text/html"),t=["P","STRONG","UL","OL","LI","DIV","SPAN","I","A","H1","H2","H3","H4","PRE","CODE","BR","IMG","HR"],o=["id","class","href","target","rel","style","src","alt"];function s(c){const b=Array.from(c.childNodes);for(const a of b)if(a.nodeType===Node.ELEMENT_NODE)if(t.includes(a.tagName)){const r=Array.from(a.attributes);for(const l of r)if(!o.includes(l.name))a.removeAttribute(l.name);else if(l.name==="href"||l.name==="src"){const p=l.value.replace(/[\s\x00-\x1F\x7F-\x9F]/g,"").toLowerCase();(p.startsWith("javascript:")||p.startsWith("data:")||p.startsWith("vbscript:"))&&a.removeAttribute(l.name)}s(a)}else{const r=document.createTextNode(a.textContent);a.replaceWith(r)}}return s(n.body),n.body.innerHTML}function X(e){return e?!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length):!1}function K(e){e==="dark"?(document.documentElement.classList.add("dark"),F&&(F.className="ph ph-sun")):(document.documentElement.classList.remove("dark"),F&&(F.className="ph ph-moon"));const i=document.getElementById("pid-canvas");i&&X(i)&&setTimeout(R,280)}K(q==="dark"||!q&&J?"dark":"light");N&&N.addEventListener("click",()=>{const i=document.documentElement.classList.contains("dark")?"light":"dark";localStorage.setItem("theme",i),K(i)});const V=document.querySelectorAll(".nav-tab-btn"),Q=document.querySelectorAll(".tab-content"),v=document.getElementById("menu-toggle"),y=document.getElementById("navbar"),M=v?v.querySelector("i"):null;function U(e){Q.forEach(t=>t.classList.remove("active-tab")),V.forEach(t=>{t.classList.remove("active"),t.setAttribute("aria-selected","false")});const i=document.getElementById(`tab-${e}`);i&&i.classList.add("active-tab");const n=document.querySelector(`.nav-tab-btn[data-target="${e}"]`);n&&(n.classList.add("active"),n.setAttribute("aria-selected","true")),y&&y.classList.contains("active")&&(y.classList.remove("active"),v&&(v.setAttribute("aria-expanded","false"),v.setAttribute("aria-label","Abrir Menu")),M&&(M.className="ph ph-list")),window.scrollTo(0,0)}window.switchTab=U;V.forEach(e=>{e.addEventListener("click",()=>{const i=e.getAttribute("data-target");U(i)})});if(v&&y&&M){v.addEventListener("click",()=>{const n=y.classList.toggle("active");v.setAttribute("aria-expanded",n?"true":"false"),v.setAttribute("aria-label",n?"Fechar Menu":"Abrir Menu"),M.className=n?"ph ph-x":"ph ph-list"});let e=0,i=0;document.addEventListener("touchstart",n=>{e=n.touches[0].clientX,i=n.touches[0].clientY},{passive:!0}),document.addEventListener("touchend",n=>{const t=n.changedTouches[0].clientX,o=n.changedTouches[0].clientY,s=t-e,c=o-i;Math.abs(s)>Math.abs(c)&&(s<-50&&e>window.innerWidth-60?y.classList.contains("active")||(y.classList.add("active"),M.className="ph ph-x"):s>50&&y.classList.contains("active")&&(y.classList.remove("active"),M.className="ph ph-list"))},{passive:!0})}const h=document.getElementById("blog-posts-list"),w=document.getElementById("single-post-view"),W=document.getElementById("back-to-blog");let O=[],j="todos";async function Z(){try{const e=await fetch("./posts.json");if(!e.ok)throw new Error("Falha ao carregar arquivo de artigos.");O=await e.json(),z(O),ee()}catch(e){console.error(e),h&&(h.innerHTML='<p class="mono-text">Erro ao carregar os artigos. Verifique posts.json.</p>')}}function z(e){if(!h)return;h.innerHTML="";const i=e.filter(n=>j==="todos"?!0:(n.tags||[]).includes(j));if(i.length===0){h.innerHTML='<p class="mono-text empty-blog-message" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Nenhum artigo encontrado com essa tag.</p>';return}i.forEach(n=>{const t=document.createElement("article");t.className="technical-card blog-post-card";const o="[Ler Detalhes] ->";t.innerHTML=`
      <div class="post-meta">${u(n.data)}</div>
      <h3 class="project-title">${u(n.titulo)}</h3>
      <p class="project-description">${u(n.resumo)}</p>
      <span class="post-read-more">${u(o)}</span>
    `,t.addEventListener("click",()=>te(n)),h.appendChild(t)})}function ee(){const e=document.getElementById("blog-tags-filters");if(!e)return;const i=new Set;O.forEach(o=>{o.tags&&o.tags.forEach(s=>i.add(s))});let n='<button class="category-btn active" data-category="todos">[Todos]</button>';i.forEach(o=>{n+=`<button class="category-btn" data-category="${u(o)}">[#${u(o)}]</button>`}),e.innerHTML=n;const t=e.querySelectorAll(".category-btn");t.forEach(o=>{o.addEventListener("click",()=>{if(t.forEach(s=>s.classList.remove("active")),o.classList.add("active"),j=o.getAttribute("data-category"),w&&w.style.display==="block"){w.style.display="none",h&&(h.style.display="grid");const s=document.getElementById("blog-filters-area");s&&(s.style.display="block")}z(O)})})}function te(e){h&&(h.style.display="none"),w&&(w.style.display="block");const i=document.getElementById("blog-filters-area");i&&(i.style.display="none");const n=document.getElementById("post-header-data"),t=document.getElementById("post-title"),o=document.getElementById("post-body");let s="";if((e.colab||e.github||e.link_projeto)&&(s+='<div class="post-links-container" style="margin-top: 30px; border-top: 1px dashed var(--border); padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">',e.link_projeto&&(s+=`
        <a href="${u(e.link_projeto)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-arrow-square-out" style="font-size: 1.2rem;"></i>
          [Acessar Projeto]
        </a>
      `),e.colab&&(s+=`
        <a href="${u(e.colab)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-play-circle" style="font-size: 1.2rem;"></i>
          [Rodar no Google Colab]
        </a>
      `),e.github&&(s+=`
        <a href="${u(e.github)}" target="_blank" rel="noopener noreferrer" class="btn" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-github-logo" style="font-size: 1.2rem;"></i>
          [Código no GitHub]
        </a>
      `),s+="</div>"),e.tipo==="experimento"){if(n&&(n.style.display="none"),t&&(t.style.display="none"),o){const c=(e.materiais||[]).map(r=>`<li>${u(r)}</li>`).join(""),b=(e.passo_a_passo||[]).map(r=>`<li>${u(r)}</li>`).join(""),a=`
        <div class="notebook-style-view">
          <div class="notebook-label-header">
            <span>[DIY // Experimento Maker]</span>
            <span class="notebook-label-difficulty">${u(e.dificuldade)}</span>
          </div>
          <h1 class="notebook-heading-title">${u(e.titulo)}</h1>
          <div class="notebook-meta-date">REGISTRO DATA: ${u(e.data)}</div>
          
          <p class="notebook-para-science"><strong>Resumo:</strong> ${u(e.resumo)}</p>
          
          <h4 class="notebook-section-h4">Componentes / Materiais:</h4>
          <ul class="notebook-list">
            ${c}
          </ul>
          
          <h4 class="notebook-section-h4">Passo a Passo da Montagem:</h4>
          <ol class="notebook-list">
            ${b}
          </ol>
          
          <h4 class="notebook-section-h4">A Ciência por trás do Experimento:</h4>
          <p class="notebook-para-science">${u(e.ciencia)}</p>
          
          <h4 class="notebook-section-h4">Anexo: Esquema de Circuito / Mecânico</h4>
          <pre class="ascii-diagram">${u(e.esquematico)}</pre>
          ${s}
        </div>
      `;o.innerHTML=G(a)}}else{if(n){n.style.display="block";const c=(e.tags||[]).map(b=>`<span class="blog-card-tag" style="color: var(--primary); font-weight: bold; margin-left: 10px;">#${u(b)}</span>`).join("");n.innerHTML=u(e.data)+c}if(t&&(t.style.display="block",t.innerText=e.titulo),o){o.innerHTML=G(e.conteudo+s);const c=document.getElementById("interactive-pid-mount");c&&ne(c)}}}W&&W.addEventListener("click",()=>{w&&(w.style.display="none"),h&&(h.style.display="grid");const e=document.getElementById("blog-filters-area");e&&(e.style.display="block")});Z();function ne(e){e.innerHTML=`
    <div class="embedded-sim-container">
      <div class="playground-layout">
        <!-- Display do Gráfico -->
        <div class="sim-display technical-card">
          <h4>[GRAFICO_DE_RESPOSTA_DO_SISTEMA]</h4>
          <canvas id="pid-canvas" width="550" height="200"></canvas>
          
          <div class="sim-controls">
            <div class="control-group">
              <label for="slider-kp" class="mono-text">Ganho Proporcional (Kp): <span id="val-kp">2.0</span></label>
              <input type="range" id="slider-kp" min="0" max="10" step="0.1" value="2.0">
            </div>
            <div class="control-group">
              <label for="slider-ki" class="mono-text">Ganho Integral (Ki): <span id="val-ki">0.50</span></label>
              <input type="range" id="slider-ki" min="0" max="5" step="0.05" value="0.50">
            </div>
            <div class="control-group">
              <label for="slider-kd" class="mono-text">Ganho Derivativo (Kd): <span id="val-kd">0.10</span></label>
              <input type="range" id="slider-kd" min="0" max="2" step="0.02" value="0.10">
            </div>
          </div>
        </div>

        <!-- Painel de Código Jupyter Style -->
        <div class="code-panel technical-card">
          <h4>[CODIGO_DO_LOOP_DE_CONTROLE]</h4>
          <pre><code>// Constantes PID atuais
double Kp = <span id="code-kp">2.0</span>;
double Ki = <span id="code-ki">0.5</span>;
double Kd = <span id="code-kd">0.1</span>;

double erro = setpoint - pressao;
integral += erro * dt;
double derivativo = (erro - erro_anterior) / dt;

double output = (Kp * erro) 
              + (Ki * integral) 
              + (Kd * derivativo);

acionarValvula(output);</code></pre>
        </div>
      </div>
    </div>
  `,["slider-kp","slider-ki","slider-kd"].forEach(n=>{const t=document.getElementById(n);t&&t.addEventListener("input",R)}),setTimeout(R,50)}function R(){const e=document.getElementById("pid-canvas");if(!e)return;const i=e.clientWidth,n=e.clientHeight;i>0&&n>0?(e.width!==i||e.height!==n)&&(e.width=i,e.height=n):(e.width===0||e.height===0)&&(e.width=500,e.height=200);const t=e.getContext("2d");t.clearRect(0,0,e.width,e.height);const o=getComputedStyle(document.documentElement),s=o.getPropertyValue("--border").trim()||"#dfdfdf",c=o.getPropertyValue("--primary").trim()||"#72e3ad";t.strokeStyle=s,t.lineWidth=1;for(let d=50;d<e.width;d+=50)t.beginPath(),t.moveTo(d,0),t.lineTo(d,e.height),t.stroke();for(let d=50;d<e.height;d+=50)t.beginPath(),t.moveTo(0,d),t.lineTo(e.width,d),t.stroke();const b=document.getElementById("slider-kp"),a=document.getElementById("slider-ki"),r=document.getElementById("slider-kd"),l=b?parseFloat(b.value):2,p=a?parseFloat(a.value):.5,f=r?parseFloat(r.value):.1,E=document.getElementById("val-kp"),C=document.getElementById("val-ki"),D=document.getElementById("val-kd"),A=document.getElementById("code-kp"),H=document.getElementById("code-ki"),P=document.getElementById("code-kd");E&&(E.innerText=l.toFixed(1)),C&&(C.innerText=p.toFixed(2)),D&&(D.innerText=f.toFixed(2)),A&&(A.innerText=l.toFixed(1)),H&&(H.innerText=p.toFixed(2)),P&&(P.innerText=f.toFixed(2));const k=120;let m=0,B=0,T=0,g=0;const L=.1,S=[];for(let d=0;d<e.width;d++){const x=k-m;g+=x*L,g=Math.max(-50,Math.min(50,g));const _=(x-T)/L;T=x;let I=l*x+p*g+f*_;I=Math.max(0,Math.min(220,I));const $=I*.12-m*.08-B*.45;B+=$*L,m+=B*L,S.push(m)}t.strokeStyle="#f59e0b",t.setLineDash([4,4]),t.lineWidth=1.5,t.beginPath(),t.moveTo(0,e.height-k),t.lineTo(e.width,e.height-k),t.stroke(),t.setLineDash([]),t.fillStyle="#f59e0b",t.font="9px monospace",t.fillText("SETPOINT (PRESSÃO DESEJADA)",15,e.height-k-6),t.strokeStyle=c,t.lineWidth=2.5,t.beginPath(),t.moveTo(0,e.height);for(let d=0;d<S.length;d++){const x=e.height-S[d];t.lineTo(d,x)}t.stroke()}window.addEventListener("resize",()=>{document.getElementById("pid-canvas")&&R()});document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("github-graph"),i=document.getElementById("github-tooltip"),n=document.getElementById("github-total-commits");if(e){const a="pedrofoletto";async function r(){try{const l=await fetch(`https://github-contributions-api.deno.dev/${a}.json?flat=true`);if(!l.ok)throw new Error("Erro na API");const E=(await l.json()).contributions.slice(-371);let C=0;const D=document.createDocumentFragment(),A=document.querySelector(".github-months");let H=-1,P=-10;const k=document.createDocumentFragment();E.forEach((m,B)=>{C+=m.contributionCount;let T=0;m.contributionLevel==="FIRST_QUARTILE"?T=1:m.contributionLevel==="SECOND_QUARTILE"?T=2:m.contributionLevel==="THIRD_QUARTILE"?T=3:m.contributionLevel==="FOURTH_QUARTILE"&&(T=4);const g=document.createElement("span");g.className=`github-cell level-${T}`;const L=m.date.split("-"),S=new Date(L[0],L[1]-1,L[2]),d=S.getMonth();if(B%7===0){const I=B/7;if(d!==H){if(I-P>=3){const $=document.createElement("span"),Y=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];$.innerText=Y[d],$.style.gridColumnStart=I+1,k.appendChild($),P=I}H=d}}const x=S.toLocaleDateString("pt-BR",{day:"numeric",month:"short",year:"numeric"}),_=m.contributionCount===1?"1 contribuição":`${m.contributionCount} contribuições`;g.setAttribute("data-tooltip",`${_} em ${x}`),g.addEventListener("mouseenter",()=>{i&&(i.innerText=g.getAttribute("data-tooltip"))}),g.addEventListener("mouseleave",()=>{i&&(i.innerText="")}),D.appendChild(g)}),e.innerHTML="",e.appendChild(D),A&&(A.innerHTML="",A.appendChild(k)),n&&(n.innerText=`${C} contribuições no último ano`)}catch(l){console.error("Falha ao carregar GitHub:",l),e.innerHTML=`<span class="mono-text github-error-message">Erro ao carregar contribuições de ${u(a)}.</span>`}}r()}const t=document.getElementById("toggle-tags-btn"),o=document.getElementById("blog-tags-filters");t&&o&&t.addEventListener("click",()=>{const a=o.style.display==="none";o.style.display=a?"flex":"none",t.setAttribute("aria-expanded",a?"true":"false")});const s=document.getElementById("typewriter-text");if(s){let f=function(){if(!document.body.contains(s))return;const E=a[r];p?(s.innerText=E.substring(0,l-1),l--,l===0?(p=!1,r=(r+1)%a.length,setTimeout(f,500)):setTimeout(f,30)):(s.innerText=E.substring(0,l+1),l++,l===E.length?(p=!0,setTimeout(f,2e3)):setTimeout(f,80))};var b=f;const a=["Controle & Automação","Bioinstrumentação","Sistemas Embarcados","Sinais Analógicos","Tecnologia Médica"];let r=0,l=0,p=!1;setTimeout(f,500)}const c=document.querySelectorAll(".about-accordion-gallery .accordion-item");c.length>0&&c.forEach(a=>{a.addEventListener("mouseenter",()=>{c.forEach(r=>{r.classList.remove("active"),r.setAttribute("aria-expanded","false")}),a.classList.add("active"),a.setAttribute("aria-expanded","true")}),a.addEventListener("click",()=>{c.forEach(r=>{r.classList.remove("active"),r.setAttribute("aria-expanded","false")}),a.classList.add("active"),a.setAttribute("aria-expanded","true")}),a.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),c.forEach(l=>{l.classList.remove("active"),l.setAttribute("aria-expanded","false")}),a.classList.add("active"),a.setAttribute("aria-expanded","true"))})})});
