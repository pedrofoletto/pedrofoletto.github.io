// ==========================================================================
// TEMA CLARO/ESCURO
// ==========================================================================
const themeSwitchBtn = document.getElementById('theme-switch');
const themeIcon = themeSwitchBtn ? themeSwitchBtn.querySelector('i') : null;

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Função geradora de número pseudo-aleatório semeado
function getSeededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash)) % 1;
}

// Escapa strings para evitar injeções de HTML
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// Sanitiza HTML de forma segura contra XSS usando DOMParser
function sanitizeHTML(rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');
  const allowedTags = ['P', 'STRONG', 'UL', 'OL', 'LI', 'DIV', 'SPAN', 'I', 'A', 'H1', 'H2', 'H3', 'H4', 'PRE', 'CODE', 'BR', 'IMG', 'HR'];
  const allowedAttrs = ['id', 'class', 'href', 'target', 'rel', 'style', 'src', 'alt'];

  function clean(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.includes(child.tagName)) {
          const textNode = document.createTextNode(child.textContent);
          child.replaceWith(textNode);
        } else {
          const attrs = Array.from(child.attributes);
          for (const attr of attrs) {
            if (!allowedAttrs.includes(attr.name)) {
              child.removeAttribute(attr.name);
            } else if (attr.name === 'href' || attr.name === 'src') {
              // Remove todos os espaços e caracteres de controle invisíveis antes de validar o protocolo
              const cleanVal = attr.value.replace(/[\s\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();
              if (cleanVal.startsWith('javascript:') || cleanVal.startsWith('data:') || cleanVal.startsWith('vbscript:')) {
                child.removeAttribute(attr.name);
              }
            }
          }
          clean(child);
        }
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

// Verifica se um elemento está fisicamente visível na viewport
function isElementVisible(el) {
  if (!el) return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (themeIcon) themeIcon.className = 'ph ph-sun';
  } else {
    document.documentElement.classList.remove('dark');
    if (themeIcon) themeIcon.className = 'ph ph-moon';
  }
  
  const canvas = document.getElementById('pid-canvas');
  if (canvas && isElementVisible(canvas)) {
    // 280ms para coincidir com o fim da transição CSS
    setTimeout(drawSimulation, 280);
  }
}

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  applyTheme('dark');
} else {
  applyTheme('light');
}

if (themeSwitchBtn) {
  themeSwitchBtn.addEventListener('click', () => {
    const isDarkNow = document.documentElement.classList.contains('dark');
    const nextTheme = isDarkNow ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  });
}

// ==========================================================================
// SISTEMA DE ABAS (SPA)
// ==========================================================================
const tabButtons = document.querySelectorAll('.nav-tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Menu Mobile Toggle
const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');
const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

function switchTab(tabId) {
  tabContents.forEach(content => content.classList.remove('active-tab'));
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) {
    targetTab.classList.add('active-tab');
  }

  const targetBtn = document.querySelector(`.nav-tab-btn[data-target="${tabId}"]`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }

  // Fecha o menu móvel automaticamente ao alternar abas
  if (navbar && navbar.classList.contains('active')) {
    navbar.classList.remove('active');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir Menu');
    }
    if (toggleIcon) {
      toggleIcon.className = 'ph ph-list';
    }
  }

  window.scrollTo(0, 0);
}

window.switchTab = switchTab;

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    switchTab(target);
  });
});

if (menuToggle && navbar && toggleIcon) {
  menuToggle.addEventListener('click', () => {
    const isActive = navbar.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', isActive ? 'Fechar Menu' : 'Abrir Menu');
    toggleIcon.className = isActive ? 'ph ph-x' : 'ph ph-list';
  });

  // Gestos de Touch (Swipe) para abrir/fechar o menu lateral no mobile
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Verifica se o movimento foi majoritariamente horizontal
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Swipe para a esquerda (diffX < -50) -> Abre o menu (iniciado a partir da borda direita)
      if (diffX < -50 && touchStartX > window.innerWidth - 60) {
        if (!navbar.classList.contains('active')) {
          navbar.classList.add('active');
          toggleIcon.className = 'ph ph-x';
        }
      }
      // Swipe para a direita (diffX > 50) -> Fecha o menu (se estiver aberto)
      else if (diffX > 50) {
        if (navbar.classList.contains('active')) {
          navbar.classList.remove('active');
          toggleIcon.className = 'ph ph-list';
        }
      }
    }
  }, { passive: true });
}

// ==========================================================================
// BLOG DINÂMICO & SIMULADOR INTEGRADO ESTILO NOTEBOOK
// ==========================================================================
const postsListContainer = document.getElementById('blog-posts-list');
const singlePostView = document.getElementById('single-post-view');
const backToBlogBtn = document.getElementById('back-to-blog');

let blogPosts = [];
let currentCategory = 'todos';

async function loadBlogPosts() {
  try {
    const response = await fetch('./posts.json');
    if (!response.ok) throw new Error('Falha ao carregar arquivo de artigos.');
    blogPosts = await response.json();
    renderBlogList(blogPosts);
    setupTagFilters();
  } catch (error) {
    console.error(error);
    if (postsListContainer) {
      postsListContainer.innerHTML = `<p class="mono-text">Erro ao carregar os artigos. Verifique posts.json.</p>`;
    }
  }
}

function renderBlogList(posts) {
  if (!postsListContainer) return;
  postsListContainer.innerHTML = '';

  const filteredPosts = posts.filter(post => {
    if (currentCategory === 'todos') return true;
    return (post.tags || []).includes(currentCategory);
  });

  if (filteredPosts.length === 0) {
    postsListContainer.innerHTML = `<p class="mono-text empty-blog-message" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Nenhum artigo encontrado com essa tag.</p>`;
    return;
  }

  filteredPosts.forEach(post => {
    const card = document.createElement('article');
    card.className = `technical-card blog-post-card`;

    const actionText = '[Ler Detalhes] ->';

    card.innerHTML = `
      <div class="post-meta">${escapeHTML(post.data)}</div>
      <h3 class="project-title">${escapeHTML(post.titulo)}</h3>
      <p class="project-description">${escapeHTML(post.resumo)}</p>
      <span class="post-read-more">${escapeHTML(actionText)}</span>
    `;
    card.addEventListener('click', () => showSinglePost(post));
    postsListContainer.appendChild(card);
  });
}

function setupTagFilters() {
  const tagsContainer = document.getElementById('blog-tags-filters');
  if (!tagsContainer) return;

  const allTags = new Set();
  blogPosts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => allTags.add(tag));
    }
  });

  let filtersHtml = `<button class="category-btn active" data-category="todos">[Todos]</button>`;
  allTags.forEach(tag => {
    filtersHtml += `<button class="category-btn" data-category="${escapeHTML(tag)}">[#${escapeHTML(tag)}]</button>`;
  });

  tagsContainer.innerHTML = filtersHtml;

  const filterButtons = tagsContainer.querySelectorAll('.category-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');

      if (singlePostView && singlePostView.style.display === 'block') {
        singlePostView.style.display = 'none';
        if (postsListContainer) postsListContainer.style.display = 'grid';
        const blogFiltersArea = document.getElementById('blog-filters-area');
        if (blogFiltersArea) blogFiltersArea.style.display = 'block';
      }

      renderBlogList(blogPosts);
    });
  });
}

function showSinglePost(post) {
  if (postsListContainer) postsListContainer.style.display = 'none';
  if (singlePostView) singlePostView.style.display = 'block';

  // Oculta a área de filtros do blog (botão toggle e lista de tags)
  const blogFiltersArea = document.getElementById('blog-filters-area');
  if (blogFiltersArea) blogFiltersArea.style.display = 'none';

  const postHeaderData = document.getElementById('post-header-data');
  const postTitle = document.getElementById('post-title');
  const postBodyContainer = document.getElementById('post-body');

  let linksHtml = '';
  if (post.colab || post.github || post.link_projeto) {
    linksHtml += `<div class="post-links-container" style="margin-top: 30px; border-top: 1px dashed var(--border); padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">`;
    if (post.link_projeto) {
      linksHtml += `
        <a href="${escapeHTML(post.link_projeto)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-arrow-square-out" style="font-size: 1.2rem;"></i>
          [Acessar Projeto]
        </a>
      `;
    }
    if (post.colab) {
      linksHtml += `
        <a href="${escapeHTML(post.colab)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-play-circle" style="font-size: 1.2rem;"></i>
          [Rodar no Google Colab]
        </a>
      `;
    }
    if (post.github) {
      linksHtml += `
        <a href="${escapeHTML(post.github)}" target="_blank" rel="noopener noreferrer" class="btn" style="display: inline-flex; align-items: center; gap: 8px;">
          <i class="ph ph-github-logo" style="font-size: 1.2rem;"></i>
          [Código no GitHub]
        </a>
      `;
    }
    linksHtml += `</div>`;
  }

  if (post.tipo === 'experimento') {
    // Oculta cabeçalhos padrão
    if (postHeaderData) postHeaderData.style.display = 'none';
    if (postTitle) postTitle.style.display = 'none';

    if (postBodyContainer) {
      const materiaisHtml = (post.materiais || []).map(m => `<li>${escapeHTML(m)}</li>`).join('');
      const passoHtml = (post.passo_a_passo || []).map(p => `<li>${escapeHTML(p)}</li>`).join('');
      
      const html = `
        <div class="notebook-style-view">
          <div class="notebook-label-header">
            <span>[DIY // Experimento Maker]</span>
            <span class="notebook-label-difficulty">${escapeHTML(post.dificuldade)}</span>
          </div>
          <h1 class="notebook-heading-title">${escapeHTML(post.titulo)}</h1>
          <div class="notebook-meta-date">REGISTRO DATA: ${escapeHTML(post.data)}</div>
          
          <p class="notebook-para-science"><strong>Resumo:</strong> ${escapeHTML(post.resumo)}</p>
          
          <h4 class="notebook-section-h4">Componentes / Materiais:</h4>
          <ul class="notebook-list">
            ${materiaisHtml}
          </ul>
          
          <h4 class="notebook-section-h4">Passo a Passo da Montagem:</h4>
          <ol class="notebook-list">
            ${passoHtml}
          </ol>
          
          <h4 class="notebook-section-h4">A Ciência por trás do Experimento:</h4>
          <p class="notebook-para-science">${escapeHTML(post.ciencia)}</p>
          
          <h4 class="notebook-section-h4">Anexo: Esquema de Circuito / Mecânico</h4>
          <pre class="ascii-diagram">${escapeHTML(post.esquematico)}</pre>
          ${linksHtml}
        </div>
      `;
      postBodyContainer.innerHTML = sanitizeHTML(html);
    }
  } else {
    // Exibe cabeçalhos padrão para artigos
    if (postHeaderData) {
      postHeaderData.style.display = 'block';
      const tagsHtml = (post.tags || []).map(t => `<span class="blog-card-tag" style="color: var(--primary); font-weight: bold; margin-left: 10px;">#${escapeHTML(t)}</span>`).join('');
      postHeaderData.innerHTML = escapeHTML(post.data) + tagsHtml;
    }
    if (postTitle) {
      postTitle.style.display = 'block';
      postTitle.innerText = post.titulo;
    }
    if (postBodyContainer) {
      postBodyContainer.innerHTML = sanitizeHTML(post.conteudo + linksHtml);

      // Verifica se o artigo requer a injeção do simulador PID
      const pidMount = document.getElementById('interactive-pid-mount');
      if (pidMount) {
        injectPidSimulator(pidMount);
      }
    }
  }
}

if (backToBlogBtn) {
  backToBlogBtn.addEventListener('click', () => {
    if (singlePostView) singlePostView.style.display = 'none';
    if (postsListContainer) postsListContainer.style.display = 'grid';

    // Exibe de volta a área de filtros do blog
    const blogFiltersArea = document.getElementById('blog-filters-area');
    if (blogFiltersArea) blogFiltersArea.style.display = 'block';
  });
}

loadBlogPosts();

// ==========================================================================
// MOTOR DE INJEÇÃO E CÁLCULO DO SIMULADOR PID
// ==========================================================================
function injectPidSimulator(containerElement) {
  // Cria o bloco HTML do simulador
  containerElement.innerHTML = `
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
  `;

  // Adiciona os escutadores nos sliders recém-injetados
  const sliders = ['slider-kp', 'slider-ki', 'slider-kd'];
  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', drawSimulation);
  });

  // Executa o primeiro desenho com um pequeno delay para permitir o cálculo correto de layout do canvas
  setTimeout(drawSimulation, 50);
}

function drawSimulation() {
  const canvas = document.getElementById('pid-canvas');
  if (!canvas) return;

  // Ajusta a resolução física do canvas para coincidir com o CSS (evita borrão e trata larguras zeradas)
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (width > 0 && height > 0) {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  } else if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = 500;
    canvas.height = 200;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const styles = getComputedStyle(document.documentElement);
  const colorBorder = styles.getPropertyValue('--border').trim() || '#dfdfdf';
  const colorPrimary = styles.getPropertyValue('--primary').trim() || '#72e3ad';

  // Desenhar Grid Técnico
  ctx.strokeStyle = colorBorder;
  ctx.lineWidth = 1;
  for (let i = 50; i < canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let j = 50; j < canvas.height; j += 50) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }

  // Obter valores com tratamento de nulos
  const sliderKp = document.getElementById('slider-kp');
  const sliderKi = document.getElementById('slider-ki');
  const sliderKd = document.getElementById('slider-kd');

  const Kp = sliderKp ? parseFloat(sliderKp.value) : 2.0;
  const Ki = sliderKi ? parseFloat(sliderKi.value) : 0.5;
  const Kd = sliderKd ? parseFloat(sliderKd.value) : 0.1;

  // Atualizar textos e códigos
  const valKp = document.getElementById('val-kp');
  const valKi = document.getElementById('val-ki');
  const valKd = document.getElementById('val-kd');
  const codeKp = document.getElementById('code-kp');
  const codeKi = document.getElementById('code-ki');
  const codeKd = document.getElementById('code-kd');

  if (valKp) valKp.innerText = Kp.toFixed(1);
  if (valKi) valKi.innerText = Ki.toFixed(2);
  if (valKd) valKd.innerText = Kd.toFixed(2);
  if (codeKp) codeKp.innerText = Kp.toFixed(1);
  if (codeKi) codeKi.innerText = Ki.toFixed(2);
  if (codeKd) codeKd.innerText = Kd.toFixed(2);

  // Simulação física
  const setpoint = 120; // Alvo
  let processVal = 0;
  let processVelocity = 0;
  let erroAnterior = 0;
  let integral = 0;
  const dt = 0.1;
  const points = [];

  for (let t = 0; t < canvas.width; t++) {
    const erro = setpoint - processVal;
    integral += erro * dt;
    integral = Math.max(-50, Math.min(50, integral)); // anti-windup
    const derivativo = (erro - erroAnterior) / dt;
    erroAnterior = erro;

    let output = (Kp * erro) + (Ki * integral) + (Kd * derivativo);
    output = Math.max(0, Math.min(220, output)); // Saturação do ventilador

    // Modelo de elasticidade pulmonar com inércia (2ª ordem)
    const acc = (output * 0.12) - (processVal * 0.08) - (processVelocity * 0.45);
    processVelocity += acc * dt;
    processVal += processVelocity * dt;

    points.push(processVal);
  }

  // Linha de Setpoint (Laranja)
  ctx.strokeStyle = '#f59e0b';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - setpoint);
  ctx.lineTo(canvas.width, canvas.height - setpoint);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '9px monospace';
  ctx.fillText("SETPOINT (PRESSÃO DESEJADA)", 15, canvas.height - setpoint - 6);

  // Linha de Resposta (Cor Primária)
  ctx.strokeStyle = colorPrimary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x < points.length; x++) {
    const y = canvas.height - points[x];
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Redesenha o simulador no resize da janela
window.addEventListener('resize', () => {
  if (document.getElementById('pid-canvas')) {
    drawSimulation();
  }
});

// ==========================================================================
// INTERATIVIDADE DA STACK & TOOLTIP
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // As informações da stack agora são exibidas em um balão em CSS (hover).

  // ==========================================================================
  // GRÁFICO DE CONTRIBUIÇÕES DO GITHUB (API REAL)
  // ==========================================================================
  const githubGraph = document.getElementById('github-graph');
  const githubTooltip = document.getElementById('github-tooltip');
  const githubTotalCommits = document.getElementById('github-total-commits');

  if (githubGraph) {
    const GITHUB_USERNAME = "pedrofoletto"; // <-- Substitua pelo seu usuário do GitHub

    async function loadGithubContributions() {
      try {
        const res = await fetch(`https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json?flat=true`);
        if (!res.ok) throw new Error("Erro na API");

        const data = await res.json();
        const contributions = data.contributions;

        // Pega apenas os últimos 371 dias
        const recentDays = contributions.slice(-371);

        let totalCommits = 0;
        const fragment = document.createDocumentFragment();
        const monthsContainer = document.querySelector('.github-months');
        let lastMonth = -1;
        let lastLabelCol = -10;
        const monthsFragment = document.createDocumentFragment();

        recentDays.forEach((day, index) => {
          totalCommits += day.contributionCount;

          let level = 0;
          if (day.contributionLevel === 'FIRST_QUARTILE') level = 1;
          else if (day.contributionLevel === 'SECOND_QUARTILE') level = 2;
          else if (day.contributionLevel === 'THIRD_QUARTILE') level = 3;
          else if (day.contributionLevel === 'FOURTH_QUARTILE') level = 4;

          const cell = document.createElement('span');
          cell.className = `github-cell level-${level}`;

          // Tratamento de fuso-horário para a data correta
          const dateParts = day.date.split('-');
          const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          const month = dateObj.getMonth();

          // Toda primeira linha da semana (índice múltiplo de 7) representa o início de uma nova coluna
          if (index % 7 === 0) {
            const colIndex = index / 7;
            if (month !== lastMonth) {
              // Só adiciona se o mês mudou e não está muito colado no último label (evita encavalar)
              if (colIndex - lastLabelCol >= 3) {
                const monthLabel = document.createElement('span');
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                monthLabel.innerText = monthNames[month];
                monthLabel.style.gridColumnStart = colIndex + 1;
                monthsFragment.appendChild(monthLabel);
                lastLabelCol = colIndex;
              }
              lastMonth = month;
            }
          }

          const formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'short', year: 'numeric'
          });

          const commitsStr = day.contributionCount === 1 ? '1 contribuição' : `${day.contributionCount} contribuições`;
          cell.setAttribute('data-tooltip', `${commitsStr} em ${formattedDate}`);

          cell.addEventListener('mouseenter', () => {
            if (githubTooltip) githubTooltip.innerText = cell.getAttribute('data-tooltip');
          });

          cell.addEventListener('mouseleave', () => {
            if (githubTooltip) githubTooltip.innerText = '';
          });

          fragment.appendChild(cell);
        });

        githubGraph.innerHTML = '';
        githubGraph.appendChild(fragment);
        
        if (monthsContainer) {
          monthsContainer.innerHTML = '';
          monthsContainer.appendChild(monthsFragment);
        }

        if (githubTotalCommits) {
          githubTotalCommits.innerText = `${totalCommits} contribuições no último ano`;
        }

      } catch (err) {
        console.error("Falha ao carregar GitHub:", err);
        githubGraph.innerHTML = `<span class="mono-text github-error-message">Erro ao carregar contribuições de ${escapeHTML(GITHUB_USERNAME)}.</span>`;
      }
    }

    loadGithubContributions();
  }

  // ==========================================================================
  // ALTERNAR VISIBILIDADE DOS FILTROS DE TAGS
  // ==========================================================================
  const toggleTagsBtn = document.getElementById('toggle-tags-btn');
  const tagsFilters = document.getElementById('blog-tags-filters');
  if (toggleTagsBtn && tagsFilters) {
    toggleTagsBtn.addEventListener('click', () => {
      const isHidden = tagsFilters.style.display === 'none';
      tagsFilters.style.display = isHidden ? 'flex' : 'none';
      toggleTagsBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  // ==========================================================================
  // EFEITO DE MAQUINA DE ESCREVER (TYPEWRITER)
  // ==========================================================================
  const typewriterText = document.getElementById('typewriter-text');
  if (typewriterText) {
    const words = ["Controle & Automação", "Bioinstrumentação", "Sistemas Embarcados", "Sinais Analógicos", "Tecnologia Médica"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      // Para a recursão se o elemento foi desmontado do DOM (SPA navigation)
      if (!document.body.contains(typewriterText)) {
        return;
      }
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typewriterText.innerText = currentWord.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(type, 500);
        } else {
          setTimeout(type, 30);
        }
      } else {
        typewriterText.innerText = currentWord.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(type, 2000);
        } else {
          setTimeout(type, 80);
        }
      }
    }

    setTimeout(type, 500);
  }

  // ==========================================================================
  // ACORDEÃO DE IMAGENS (SOBRE MIM)
  // ==========================================================================
  const accordionItems = document.querySelectorAll('.about-accordion-gallery .accordion-item');
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      // Evento de hover para desktop
      item.addEventListener('mouseenter', () => {
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-expanded', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      });

      // Evento de click/touch para mobile e acessibilidade
      item.addEventListener('click', () => {
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-expanded', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      });

      // Evento de teclado para acessibilidade (Enter ou Espaço)
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          accordionItems.forEach(i => {
            i.classList.remove('active');
            i.setAttribute('aria-expanded', 'false');
          });
          item.classList.add('active');
          item.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
});

