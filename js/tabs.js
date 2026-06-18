const tabButtons = document.querySelectorAll('.nav-tab-btn[data-target]');
const tabContents = document.querySelectorAll('.tab-content');

const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');
const navBackdrop = document.getElementById('nav-backdrop');
const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

function openMenu() {
  navbar.classList.add('active');
  if (navBackdrop) navBackdrop.classList.add('active');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar Menu');
  }
  if (toggleIcon) toggleIcon.className = 'ph ph-x';
}

function closeMenu() {
  navbar.classList.remove('active');
  if (navBackdrop) navBackdrop.classList.remove('active');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir Menu');
  }
  if (toggleIcon) toggleIcon.className = 'ph ph-list';
}

export function switchTab(tabId, avoidRouting = false) {
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

  if (navbar && navbar.classList.contains('active')) {
    closeMenu();
  }

  if (!avoidRouting) {
    if (tabId === 'portfolio') {
      window.location.hash = '#/inicio';
    } else if (tabId === 'repositorios') {
      window.location.hash = '#/repositorios';
    }
  }

  window.scrollTo(0, 0);
}

export function handleRouting() {
  const hash = window.location.hash;

  if (!hash || hash === '#/inicio' || hash === '#/portfolio' || hash === '#portfolio') {
    switchTab('portfolio', true);
  } else if (hash === '#/repositorios' || hash === '#repositorios') {
    switchTab('repositorios', true);
  } else {
    // Redireciona qualquer hash inválido ou antigo de aulas para o início
    switchTab('portfolio', true);
  }
}

// Expõe switchTab globalmente
window.switchTab = switchTab;

export function initTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Escuta mudanças na hash para atualizar a aba ativa
  window.addEventListener('hashchange', handleRouting);

  // Executa o roteamento inicial
  handleRouting();

  if (menuToggle && navbar && toggleIcon) {
    menuToggle.addEventListener('click', () => {
      const isActive = navbar.classList.contains('active');
      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha ao clicar no backdrop
    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMenu);
    }

    // Fecha ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (navbar.classList.contains('active')) {
          closeMenu();
        }
      }
    });

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
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < -50 && touchStartX > window.innerWidth - 60) {
          if (!navbar.classList.contains('active')) openMenu();
        } else if (diffX > 50) {
          if (navbar.classList.contains('active')) closeMenu();
        }
      }
    }, { passive: true });
  }
}
