import { initTheme } from './js/theme.js';
import { initTabs } from './js/tabs.js';
import { initRepos, loadRepos } from './js/repos.js';
import { initTypewriter } from './js/typewriter.js';
import { initAccordion } from './js/accordion.js';
import { initEditor, loadTextos } from './js/editor.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initRepos();
  initTypewriter();
  initAccordion();
  initEditor();

  // Inicialização de Dados em paralelo
  Promise.all([
    loadTextos(),
    loadRepos()
  ]);
});
