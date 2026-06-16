import { initTheme } from './js/theme.js';
import { initTabs } from './js/tabs.js';
import { initRepos, loadRepos } from './js/repos.js';
import { initAulas, loadAulas, checkInitialHash } from './js/aulas.js';
import { initSimulator } from './js/simulator.js';
import { initTypewriter } from './js/typewriter.js';
import { initAccordion } from './js/accordion.js';
import { initGithub } from './js/github.js';
import { initEditor, loadTextos } from './js/editor.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initRepos();
  initAulas();
  initSimulator();
  initTypewriter();
  initAccordion();
  initGithub();
  initEditor();

  // Inicialização de Dados
  loadTextos().then(() => {
    loadRepos();
    loadAulas().then(() => {
      checkInitialHash();
    });
  });
});
