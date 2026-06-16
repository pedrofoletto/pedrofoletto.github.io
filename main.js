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

function switchTab(tabId, avoidRouting = false) {
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

  if (tabId === 'aulas' && !avoidRouting) {
    window.location.hash = '#/aulas';
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
// REPOSITÓRIOS DINÂMICOS (PROJETOS DO GITHUB CARREGADOS VIA JSON)
// ==========================================================================
const repositoriosListContainer = document.getElementById('repositorios-list');
const singleRepositorioView = document.getElementById('single-repositorio-view');
const backToRepositoriosBtn = document.getElementById('back-to-repositorios');

let reposPosts = [];
let currentCategory = 'todos';

async function loadRepos() {
  try {
    const response = await fetch('./posts.json');
    if (!response.ok) throw new Error('Falha ao carregar arquivo de repositórios.');
    reposPosts = await response.json();
    renderReposList(reposPosts);
    setupReposTagFilters();
  } catch (error) {
    console.error(error);
    if (repositoriosListContainer) {
      repositoriosListContainer.innerHTML = `<p class="mono-text">Erro ao carregar os repositórios. Verifique posts.json.</p>`;
    }
  }
}

function renderReposList(posts) {
  if (!repositoriosListContainer) return;
  repositoriosListContainer.innerHTML = '';

  const filteredPosts = posts.filter(post => {
    if (currentCategory === 'todos') return true;
    return (post.tags || []).includes(currentCategory);
  });

  if (filteredPosts.length === 0) {
    repositoriosListContainer.innerHTML = `<p class="mono-text empty-blog-message" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">Nenhum repositório encontrado com essa tag.</p>`;
    return;
  }

  filteredPosts.forEach(post => {
    const card = document.createElement('article');
    card.className = `technical-card blog-post-card`;

    const actionText = '[Ver Detalhes] ->';

    card.innerHTML = `
      <div class="post-meta">${escapeHTML(post.data)}</div>
      <h3 class="project-title">${escapeHTML(post.titulo)}</h3>
      <p class="project-description">${escapeHTML(post.resumo)}</p>
      <span class="post-read-more">${escapeHTML(actionText)}</span>
    `;
    card.addEventListener('click', () => showSingleRepositorio(post));
    repositoriosListContainer.appendChild(card);
  });
}

function setupReposTagFilters() {
  const tagsContainer = document.getElementById('repositorios-tags-filters');
  if (!tagsContainer) return;

  const allTags = new Set();
  reposPosts.forEach(post => {
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

      if (singleRepositorioView && singleRepositorioView.style.display === 'block') {
        singleRepositorioView.style.display = 'none';
        if (repositoriosListContainer) repositoriosListContainer.style.display = 'grid';
        const reposFiltersArea = document.getElementById('repositorios-filters-area');
        if (reposFiltersArea) reposFiltersArea.style.display = 'block';
      }

      renderReposList(reposPosts);
    });
  });
}

function showSingleRepositorio(post) {
  if (repositoriosListContainer) repositoriosListContainer.style.display = 'none';
  if (singleRepositorioView) singleRepositorioView.style.display = 'block';

  // Oculta a área de filtros
  const reposFiltersArea = document.getElementById('repositorios-filters-area');
  if (reposFiltersArea) reposFiltersArea.style.display = 'none';

  const repositorioHeaderData = document.getElementById('repositorio-header-data');
  const repositorioTitle = document.getElementById('repositorio-title');
  const repositorioBodyContainer = document.getElementById('repositorio-body');

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

  // Exibe cabeçalhos padrão para artigos
  if (repositorioHeaderData) {
    repositorioHeaderData.style.display = 'block';
    const tagsHtml = (post.tags || []).map(t => `<span class="blog-card-tag" style="color: var(--primary); font-weight: bold; margin-left: 10px;">#${escapeHTML(t)}</span>`).join('');
    repositorioHeaderData.innerHTML = escapeHTML(post.data) + tagsHtml;
  }
  if (repositorioTitle) {
    repositorioTitle.style.display = 'block';
    repositorioTitle.innerText = post.titulo;
  }
  if (repositorioBodyContainer) {
    repositorioBodyContainer.innerHTML = sanitizeHTML(post.conteudo + linksHtml);

    // Verifica se o artigo requer a injeção do simulador PID
    const pidMount = document.getElementById('interactive-pid-mount');
    if (pidMount) {
      injectPidSimulator(pidMount);
    }
  }
}

if (backToRepositoriosBtn) {
  backToRepositoriosBtn.addEventListener('click', () => {
    if (singleRepositorioView) singleRepositorioView.style.display = 'none';
    if (repositoriosListContainer) repositoriosListContainer.style.display = 'grid';

    // Exibe de volta a área de filtros
    const reposFiltersArea = document.getElementById('repositorios-filters-area');
    if (reposFiltersArea) reposFiltersArea.style.display = 'block';
  });
}

// ==========================================================================
// AULAS DINÂMICAS E SISTEMA DE NAVEGAÇÃO EM ÁRVORE
// ==========================================================================
let aulasData = [];
let currentRenderedLanguage = null;
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

async function loadAulas() {
  try {
    const response = await fetch(`./aulas.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Falha ao carregar aulas.json');
    aulasData = await response.json();
    
    // Renderiza o portal dinâmico de linguagens
    renderAulasPortal(aulasData);
    
    // Configura filtros dinâmicos de linguagens/tags
    const activeAulas = aulasData.filter(a => !a.disabled);
    const uniqueLanguages = [...new Set(activeAulas.map(a => a.language))];
    uniqueLanguages.sort((a, b) => {
      const minA = Math.min(...activeAulas.filter(x => x.language.toLowerCase() === a.toLowerCase()).map(x => x.order || 99));
      const minB = Math.min(...activeAulas.filter(x => x.language.toLowerCase() === b.toLowerCase()).map(x => x.order || 99));
      if (minA !== minB) return minA - minB;
      return a.localeCompare(b);
    });
    setupAulasTagFilters(uniqueLanguages);

    renderAulasContent(aulasData);
    handleAulaRouting();
  } catch (error) {
    console.error("Erro ao carregar aulas:", error);
    const contentArea = document.getElementById('aulas-content-area');
    if (contentArea) {
      contentArea.innerHTML = `<p class="mono-text">Erro ao carregar as aulas. Verifique aulas.json.</p>`;
    }
  }
}

function renderAulasPortal(aulas) {
  const portalGrid = document.getElementById('aulas-subjects-grid');
  if (!portalGrid) return;
  
  portalGrid.innerHTML = '';
  
  const languageMeta = {
    python: {
      icon: 'devicon-python-plain',
      title: 'Python e IA Médica',
      desc: 'Classificação inteligente de sinais de eletrocardiograma (ECG) usando Random Forest e Redes Neurais Convolucionais (Conv1D).'
    },
    julia: {
      icon: 'devicon-julia-plain',
      title: 'Julia na Automação',
      desc: 'Computação científica de alta performance para modelagem física e simulação de sistemas biológicos.'
    },
    matlab: {
      icon: 'devicon-matlab-plain',
      title: 'MATLAB e Controle',
      desc: 'Análise de estabilidade, resposta em frequência e sintonia de controladores PID para bioinstrumentação.'
    },
    c: {
      icon: 'devicon-c-plain',
      title: 'Programação C e Firmware',
      desc: 'Desenvolvimento de firmware de baixo nível para microcontroladores e dispositivos médicos.'
    }
  };

  const activeAulas = aulas.filter(a => !a.disabled);
  const languages = [...new Set(activeAulas.map(a => a.language))];
  
  languages.sort((a, b) => {
    const minA = Math.min(...activeAulas.filter(x => x.language.toLowerCase() === a.toLowerCase()).map(x => x.order || 99));
    const minB = Math.min(...activeAulas.filter(x => x.language.toLowerCase() === b.toLowerCase()).map(x => x.order || 99));
    if (minA !== minB) return minA - minB;
    return a.localeCompare(b);
  });

  if (languages.length === 0) {
    portalGrid.innerHTML = '<p class="mono-text">Nenhuma aula disponível no momento.</p>';
    return;
  }

  languages.forEach(lang => {
    const key = lang.toLowerCase();
    
    // Filtra as aulas desta linguagem e pega a de menor 'order' que possua um 'summary' ou 'subjectTitle'
    const langAulas = activeAulas.filter(a => a.language.toLowerCase() === key);
    langAulas.sort((a, b) => a.order - b.order);
    
    const firstWithSummary = langAulas.find(a => a.summary && a.summary.trim() !== '');
    const customSummary = firstWithSummary ? firstWithSummary.summary : null;

    const firstWithSubjectTitle = langAulas.find(a => a.subjectTitle && a.subjectTitle.trim() !== '');
    const customSubjectTitle = firstWithSubjectTitle ? firstWithSubjectTitle.subjectTitle : null;

    const meta = languageMeta[key] || {
      icon: 'ph ph-code',
      title: `${lang}`,
      desc: `Anotações e guias práticos sobre programação e conceitos em ${lang}.`
    };

    const finalTitle = customSubjectTitle || meta.title;
    const finalDesc = customSummary || meta.desc;

    const article = document.createElement('article');
    article.className = 'technical-card subject-card';
    article.setAttribute('data-subject', lang);
    article.style.cursor = 'pointer';
    
    article.innerHTML = `
      <div class="project-header">
        <span class="project-tech">
          <i class="${meta.icon}" style="font-size: 1.2rem;"></i> ${lang}
        </span>
      </div>
      <h3 class="project-title">${escapeHTML(finalTitle)}</h3>
      <p class="project-description">${escapeHTML(finalDesc)}</p>
      <span class="post-read-more">[Estudar Módulo] -></span>
    `;

    portalGrid.appendChild(article);
  });
}

function setupAulasTagFilters(languages) {
  const aulasTagsFilters = document.getElementById('aulas-tags-filters');
  const aulasSubjectsGrid = document.getElementById('aulas-subjects-grid');
  if (!aulasTagsFilters || !aulasSubjectsGrid) return;

  let filtersHtml = `<button class="category-btn active" data-category="todos">[Todos]</button>`;
  languages.forEach(lang => {
    filtersHtml += `<button class="category-btn" data-category="${lang.toLowerCase()}">[#${lang.toLowerCase()}]</button>`;
  });

  aulasTagsFilters.innerHTML = filtersHtml;

  const filterButtons = aulasTagsFilters.querySelectorAll('.category-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      const cards = aulasSubjectsGrid.querySelectorAll('.subject-card');
      cards.forEach(card => {
        const cardSubject = card.getAttribute('data-subject').toLowerCase();
        if (category === 'todos' || cardSubject === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function renderAulasTreeMenu(aulas, selectedLanguage) {
  const treeMenu = document.getElementById('aulas-tree-menu');
  if (!treeMenu) return;
  treeMenu.innerHTML = '';

  // Filtrar aulas apenas para o idioma selecionado
  const filteredAulas = aulas.filter(aula => aula.language.toLowerCase() === selectedLanguage.toLowerCase());

  const branchLi = document.createElement('li');
  branchLi.className = 'tree-branch';
  branchLi.style.marginTop = '10px';

  const langId = `submenu-${selectedLanguage.toLowerCase().replace(/\s+/g, '-')}`;
  
  branchLi.innerHTML = `
    <div class="tree-folder" data-target="${langId}">
      <i class="ph ph-folder-open"></i> <span>Módulo ${selectedLanguage}</span>
    </div>
    <ul class="tree-items" id="${langId}"></ul>
  `;
  
  const itemsUl = branchLi.querySelector('.tree-items');
  
  // Agrupar lições do módulo por subfolder
  const subfolders = {};
  const rootAulas = [];
  
  filteredAulas.forEach(aula => {
    if (aula.subfolder) {
      if (!subfolders[aula.subfolder]) {
        subfolders[aula.subfolder] = [];
      }
      subfolders[aula.subfolder].push(aula);
    } else {
      rootAulas.push(aula);
    }
  });

  // Anexar lições da raiz do módulo primeiro
  rootAulas.forEach(aula => {
    const li = document.createElement('li');
    const isDisabled = aula.disabled ? ' disabled-link' : '';
    const href = aula.disabled ? 'javascript:void(0)' : `#/${aula.id}`;
    li.innerHTML = `
      <a href="${href}" class="${isDisabled ? 'tree-link disabled-link' : 'tree-link'}">
        <i class="ph ph-file-text"></i> <span>${aula.title}</span>
      </a>
    `;
    itemsUl.appendChild(li);
  });

  // Anexar subpastas
  Object.keys(subfolders).forEach(sub => {
    const subBranchLi = document.createElement('li');
    subBranchLi.className = 'tree-branch';
    subBranchLi.style.marginTop = '6px';
    
    const subId = `${langId}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    
    subBranchLi.innerHTML = `
      <div class="tree-folder" data-target="${subId}">
        <i class="ph ph-folder-open"></i> <span>${sub}</span>
      </div>
      <ul class="tree-items" id="${subId}"></ul>
    `;
    
    const subItemsUl = subBranchLi.querySelector('.tree-items');
    subfolders[sub].forEach(aula => {
      const li = document.createElement('li');
      const isDisabled = aula.disabled ? ' disabled-link' : '';
      const href = aula.disabled ? 'javascript:void(0)' : `#/${aula.id}`;
      li.innerHTML = `
        <a href="${href}" class="${isDisabled ? 'tree-link disabled-link' : 'tree-link'}">
          <i class="ph ph-file-text"></i> <span>${aula.title}</span>
        </a>
      `;
      subItemsUl.appendChild(li);
    });
    
    itemsUl.appendChild(subBranchLi);
  });

  treeMenu.appendChild(branchLi);
}

function renderAulasContent(aulas) {
  const contentArea = document.getElementById('aulas-content-area');
  if (!contentArea) return;
  contentArea.innerHTML = '';

  aulas.forEach(aula => {
    const article = document.createElement('article');
    article.id = `aula-${aula.id}`;
    article.className = 'aula-article';
    article.style.display = 'none';
    
    // Cria um cabeçalho padronizado para o topo da aula
    const headerDiv = document.createElement('div');
    headerDiv.className = 'aula-header';
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.marginBottom = '24px';
    headerDiv.style.borderBottom = '1px dashed var(--border)';
    headerDiv.style.paddingBottom = '12px';

    const titleH1 = document.createElement('h1');
    titleH1.style.margin = '0';
    titleH1.style.fontSize = '1.75rem';
    titleH1.innerText = aula.title;
    headerDiv.appendChild(titleH1);

    if (isLocal) {
      const actionsContainer = document.createElement('div');
      actionsContainer.style.display = 'flex';
      actionsContainer.style.gap = '8px';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.style.fontSize = '0.75rem';
      editBtn.style.padding = '4px 8px';
      editBtn.innerHTML = '<i class="ph ph-note-pencil"></i> [Editar]';
      editBtn.addEventListener('click', () => {
        openEditModal(aula);
      });
      actionsContainer.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.style.fontSize = '0.75rem';
      deleteBtn.style.padding = '4px 8px';
      deleteBtn.innerHTML = '<i class="ph ph-trash"></i> [Apagar]';
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja apagar permanentemente a aula "${aula.title}"?`)) {
          try {
            const response = await fetch('/api/apagar-aula', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ slug: aula.id })
            });

            const result = await response.json();
            if (response.ok) {
              alert(result.message);
              window.location.hash = '#/aulas';
              await loadAulas();
            } else {
              alert(`Erro: ${result.error || 'Falha ao apagar aula.'}`);
            }
          } catch (err) {
            console.error('Erro ao excluir aula:', err);
            alert('Erro ao se conectar com a API local de exclusão.');
          }
        }
      });
      actionsContainer.appendChild(deleteBtn);

      headerDiv.appendChild(actionsContainer);
    }

    article.appendChild(headerDiv);

    // Contêiner para o corpo da aula (Markdown compilado)
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'aula-body-content';
    bodyDiv.innerHTML = sanitizeHTML(aula.content);
    article.appendChild(bodyDiv);
    
    contentArea.appendChild(article);
  });
}

function openEditModal(aula) {
  const adminModal = document.getElementById('admin-aula-modal');
  const formTitle = document.getElementById('aula-form-title');
  const formSlug = document.getElementById('aula-form-slug');
  const formLang = document.getElementById('aula-form-lang');
  const formSubfolder = document.getElementById('aula-form-subfolder');
  const formOrder = document.getElementById('aula-form-order');
  const formSummary = document.getElementById('aula-form-summary');
  const formSubjectTitle = document.getElementById('aula-form-subject-title');
  const formContent = document.getElementById('aula-form-content');

  if (adminModal && formTitle && formSlug && formLang && formSubfolder && formOrder && formSummary && formSubjectTitle && formContent) {
    formTitle.value = aula.title;
    formSlug.value = aula.id;
    formSlug.disabled = true; // Impede alterar o slug de aulas existentes para evitar duplicações
    formLang.value = aula.language;
    formSubfolder.value = aula.subfolder || '';
    formOrder.value = aula.order || 1;
    formSummary.value = aula.summary || '';
    formSubjectTitle.value = aula.subjectTitle || '';
    formContent.value = aula.rawContent || '';

    adminModal.querySelector('h3').innerText = '[Editar Aula]';
    adminModal.style.display = 'flex';
  }
}

function handleAulaRouting() {
  const hash = window.location.hash;
  const headerContainer = document.getElementById('aulas-header-container');
  const portalContainer = document.getElementById('aulas-portal-container');
  const layoutContainer = document.getElementById('aulas-layout-container');

  if (!hash || !hash.startsWith('#/') || hash === '#/aulas') {
    // Exibe portal de escolha e esconde layout de sumário/artigos
    if (headerContainer) headerContainer.style.display = 'block';
    if (portalContainer) portalContainer.style.display = 'block';
    if (layoutContainer) layoutContainer.style.display = 'none';
    
    currentRenderedLanguage = null;
    return;
  }

  const aulaId = hash.slice(2);
  const matchingAula = aulasData.find(a => a.id === aulaId);
  if (matchingAula) {
    // 1. Ativar aba de aulas caso não esteja ativa (evitando loop recursivo)
    switchTab('aulas', true);
    
    // 2. Ocultar portal de escolha e cabeçalhos
    if (headerContainer) headerContainer.style.display = 'none';
    if (portalContainer) portalContainer.style.display = 'none';
    if (layoutContainer) layoutContainer.style.display = 'block';
    
    // 3. Renderizar árvore lateral do assunto selecionado se mudou de módulo
    if (matchingAula.language !== currentRenderedLanguage) {
      renderAulasTreeMenu(aulasData, matchingAula.language);
      currentRenderedLanguage = matchingAula.language;
    }
    
    // 4. Ocultar todos os artigos e mostrar apenas o selecionado
    const articles = document.querySelectorAll('#aulas-content-area .aula-article');
    articles.forEach(art => {
      art.style.display = 'none';
    });
    const activeArticle = document.getElementById(`aula-${aulaId}`);
    if (activeArticle) {
      activeArticle.style.display = 'block';
    }
    
    // 5. Destacar link ativo e expandir suas pastas ancestrais
    const links = document.querySelectorAll('.tree-link');
    links.forEach(lnk => {
      lnk.classList.remove('active-link');
      if (lnk.getAttribute('href') === hash) {
        lnk.classList.add('active-link');
        
        let parent = lnk.closest('.tree-items');
        while (parent) {
          parent.classList.remove('collapsed');
          const folder = document.querySelector(`[data-target="${parent.id}"]`);
          if (folder) {
            const icon = folder.querySelector('i');
            if (icon) icon.className = 'ph ph-folder-open';
          }
          parent = parent.parentElement.closest('.tree-items');
        }
      }
    });
    
    // 6. Rodar o realce de sintaxe do Prism.js
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }
}

function checkInitialHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    switchTab('aulas', true);
    handleAulaRouting();
  }
}

// Gerenciador de click nos folders da árvore
document.addEventListener('click', (e) => {
  const folder = e.target.closest('.tree-folder');
  if (folder) {
    const targetId = folder.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const isCollapsed = targetEl.classList.toggle('collapsed');
      const icon = folder.querySelector('i');
      if (icon) {
        icon.className = isCollapsed ? 'ph ph-folder' : 'ph ph-folder-open';
      }
    }
    return;
  }

  // Click nos cards do portal para escolher assunto
  const subjectCard = e.target.closest('.subject-card');
  if (subjectCard) {
    const subject = subjectCard.getAttribute('data-subject');
    const firstAula = aulasData.find(a => a.language.toLowerCase() === subject.toLowerCase());
    if (firstAula) {
      window.location.hash = `#/${firstAula.id}`;
    }
  }
});

// Listener do botão de voltar para o portal
const btnVoltarPortal = document.getElementById('btn-voltar-portal');
if (btnVoltarPortal) {
  btnVoltarPortal.addEventListener('click', () => {
    window.location.hash = '#/aulas';
  });
}

window.addEventListener('hashchange', handleAulaRouting);

loadRepos();
loadAulas();
checkInitialHash();

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
  // ALTERNAR VISIBILIDADE DOS FILTROS DE TAGS (REPOSITÓRIOS)
  // ==========================================================================
  const toggleTagsBtn = document.getElementById('toggle-tags-btn');
  const tagsFilters = document.getElementById('repositorios-tags-filters');
  if (toggleTagsBtn && tagsFilters) {
    toggleTagsBtn.addEventListener('click', () => {
      const isHidden = tagsFilters.style.display === 'none';
      tagsFilters.style.display = isHidden ? 'flex' : 'none';
      toggleTagsBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  // ==========================================================================
  // FILTRAGEM POR TAGS NA ABA DE AULAS
  // ==========================================================================
  const toggleAulasTagsBtn = document.getElementById('toggle-aulas-tags-btn');
  const aulasTagsFilters = document.getElementById('aulas-tags-filters');
  const aulasSubjectsGrid = document.getElementById('aulas-subjects-grid');
  if (toggleAulasTagsBtn && aulasTagsFilters && aulasSubjectsGrid) {
    toggleAulasTagsBtn.addEventListener('click', () => {
      const isHidden = aulasTagsFilters.style.display === 'none';
      aulasTagsFilters.style.display = isHidden ? 'flex' : 'none';
      toggleAulasTagsBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
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

  // ==========================================================================
  // PAINEL DE ADMINISTRAÇÃO LOCAL (CRIAR NOVAS AULAS)
  // ==========================================================================
  const openAdminBtn = document.getElementById('open-admin-modal-btn');
  const adminModal = document.getElementById('admin-aula-modal');
  const closeAdminBtn = document.getElementById('close-admin-modal-btn');
  const cancelAulaBtn = document.getElementById('cancel-aula-btn');
  const adminForm = document.getElementById('admin-aula-form');
  const formTitle = document.getElementById('aula-form-title');
  const formSlug = document.getElementById('aula-form-slug');

  // Exibe o botão de Nova Aula apenas se estiver rodando localmente (ambiente Dev)
  if (openAdminBtn && isLocal) {
    openAdminBtn.style.display = 'inline-flex';
  }

  if (openAdminBtn && adminModal) {
    openAdminBtn.addEventListener('click', () => {
      if (adminForm) adminForm.reset();
      if (formSlug) formSlug.disabled = false; // Re-habilita edição de slug para nova aula
      adminModal.querySelector('h3').innerText = '[Criar Nova Aula]';
      adminModal.style.display = 'flex';
      if (formTitle) formTitle.focus();
    });
  }

  function hideModal() {
    if (adminModal) {
      adminModal.style.display = 'none';
      if (adminForm) adminForm.reset();
    }
  }

  if (closeAdminBtn) closeAdminBtn.addEventListener('click', hideModal);
  if (cancelAulaBtn) cancelAulaBtn.addEventListener('click', hideModal);

  // Fecha o modal ao clicar fora do conteúdo principal do modal
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        hideModal();
      }
    });
  }

  // Autogeração inteligente do Slug a partir do Título inserido
  if (formTitle && formSlug) {
    let manualSlugEdit = false;

    formSlug.addEventListener('input', () => {
      manualSlugEdit = true;
      if (formSlug.value.trim() === '') {
        manualSlugEdit = false;
      }
    });

    formTitle.addEventListener('input', () => {
      if (!manualSlugEdit) {
        // Converte para minúsculas, remove acentos, caracteres especiais e substitui espaços por hífens
        const slug = formTitle.value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // remove acentos
          .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
          .trim()
          .replace(/\s+/g, '-'); // substitui espaços por hífens
        formSlug.value = slug;
      }
    });
  }

  // Submissão do Formulário de Nova Aula
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const slug = document.getElementById('aula-form-slug').value.trim();
      const title = document.getElementById('aula-form-title').value.trim();
      const language = document.getElementById('aula-form-lang').value;
      const subfolder = document.getElementById('aula-form-subfolder').value.trim();
      const order = document.getElementById('aula-form-order').value;
      const summary = document.getElementById('aula-form-summary').value.trim();
      const subjectTitle = document.getElementById('aula-form-subject-title').value.trim();
      const content = document.getElementById('aula-form-content').value;

      try {
        const response = await fetch('/api/criar-aula', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ slug, title, language, subfolder, order, summary, subjectTitle, content })
        });

        const result = await response.json();
        if (response.ok) {
          alert(`Sucesso: ${result.message}`);
          hideModal();
          // Recarrega as aulas dinamicamente sem recarregar a página inteira
          await loadAulas();
        } else {
          alert(`Erro: ${result.error || 'Falha ao salvar aula.'}`);
        }
      } catch (err) {
        console.error('Erro ao salvar aula:', err);
        alert('Erro ao enviar dados para a API local.');
      }
    });
  }
});

