import { handleAulaRouting } from './aulas.js';

const tabButtons = document.querySelectorAll('.nav-tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');
const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

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

// Expõe switchTab globalmente
window.switchTab = switchTab;

export function initTabs() {
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
          if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
            toggleIcon.className = 'ph ph-x';
          }
        } else if (diffX > 50) {
          if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            toggleIcon.className = 'ph ph-list';
          }
        }
      }
    }, { passive: true });
  }
}
