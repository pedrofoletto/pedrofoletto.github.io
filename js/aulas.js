import { isLocal } from './config.js';
import { escapeHTML, sanitizeHTML } from './utils.js';

let aulasData = [];
let currentRenderedLanguage = null;

export async function loadAulas() {
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
    formSlug.disabled = true;
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

export function handleAulaRouting() {
  const hash = window.location.hash;
  const headerContainer = document.getElementById('aulas-header-container');
  const portalContainer = document.getElementById('aulas-portal-container');
  const layoutContainer = document.getElementById('aulas-layout-container');

  if (!hash || !hash.startsWith('#/') || hash === '#/aulas') {
    if (headerContainer) headerContainer.style.display = 'block';
    if (portalContainer) portalContainer.style.display = 'block';
    if (layoutContainer) layoutContainer.style.display = 'none';
    
    currentRenderedLanguage = null;
    return;
  }

  const aulaId = hash.slice(2);
  const matchingAula = aulasData.find(a => a.id === aulaId);
  if (matchingAula) {
    if (typeof window.switchTab === 'function') {
      window.switchTab('aulas', true);
    }
    
    if (headerContainer) headerContainer.style.display = 'none';
    if (portalContainer) portalContainer.style.display = 'none';
    if (layoutContainer) layoutContainer.style.display = 'block';
    
    if (matchingAula.language !== currentRenderedLanguage) {
      renderAulasTreeMenu(aulasData, matchingAula.language);
      currentRenderedLanguage = matchingAula.language;
    }
    
    const articles = document.querySelectorAll('#aulas-content-area .aula-article');
    articles.forEach(art => {
      art.style.display = 'none';
    });
    const activeArticle = document.getElementById(`aula-${aulaId}`);
    if (activeArticle) {
      activeArticle.style.display = 'block';
    }
    
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
    
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }
}

export function checkInitialHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    if (typeof window.switchTab === 'function') {
      window.switchTab('aulas', true);
    }
    handleAulaRouting();
  }
}

export function initAulas() {
  const openAdminBtn = document.getElementById('open-admin-modal-btn');
  const adminModal = document.getElementById('admin-aula-modal');
  const closeAdminBtn = document.getElementById('close-admin-modal-btn');
  const cancelAulaBtn = document.getElementById('cancel-aula-btn');
  const adminForm = document.getElementById('admin-aula-form');
  const formTitle = document.getElementById('aula-form-title');
  const formSlug = document.getElementById('aula-form-slug');

  if (openAdminBtn && isLocal) {
    openAdminBtn.style.display = 'inline-flex';
  }

  if (openAdminBtn && adminModal) {
    openAdminBtn.addEventListener('click', () => {
      if (adminForm) adminForm.reset();
      if (formSlug) formSlug.disabled = false;
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

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        hideModal();
      }
    });
  }

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
        const slug = formTitle.value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        formSlug.value = slug;
      }
    });
  }

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

  // Click nos folders da árvore
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

    const subjectCard = e.target.closest('.subject-card');
    if (subjectCard) {
      const subject = subjectCard.getAttribute('data-subject');
      const firstAula = aulasData.find(a => a.language.toLowerCase() === subject.toLowerCase());
      if (firstAula) {
        window.location.hash = `#/${firstAula.id}`;
      }
    }
  });

  const btnVoltarPortal = document.getElementById('btn-voltar-portal');
  if (btnVoltarPortal) {
    btnVoltarPortal.addEventListener('click', () => {
      window.location.hash = '#/aulas';
    });
  }

  window.addEventListener('hashchange', handleAulaRouting);
}
