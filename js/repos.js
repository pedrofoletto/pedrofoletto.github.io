import { escapeHTML, sanitizeHTML } from './utils.js';

const repositoriosListContainer = document.getElementById('repositorios-list');
const singleRepositorioView = document.getElementById('single-repositorio-view');
const backToRepositoriosBtn = document.getElementById('back-to-repositorios');

let reposPosts = [];
let currentCategory = 'todos';

export async function loadRepos() {
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

    card.innerHTML = `
      <div class="post-meta">${escapeHTML(post.data)}</div>
      <div class="card-body">
        <h3 class="project-title">${escapeHTML(post.titulo)}</h3>
        <p class="project-description">${escapeHTML(post.resumo)}</p>
      </div>
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
  }
  window.scrollTo(0, 0);
}

export function initRepos() {
  const toggleTagsBtn = document.getElementById('toggle-tags-btn');
  const tagsFilters = document.getElementById('repositorios-tags-filters');
  if (toggleTagsBtn && tagsFilters) {
    toggleTagsBtn.addEventListener('click', () => {
      const isHidden = tagsFilters.style.display === 'none';
      tagsFilters.style.display = isHidden ? 'flex' : 'none';
      toggleTagsBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
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
}
