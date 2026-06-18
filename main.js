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

  // Console easter egg — para devs curiosos que abrem o DevTools
  console.log(
    '%c[PEDROFOLETTO.DEV]\n%cEng. Controle & Automação → Saúde\nConstruído com HTML + CSS + JS puro. Sem frameworks.\nCurioso sobre a arquitetura? github.com/pedrofoletto',
    'color: #006239; font-weight: bold; font-size: 13px; font-family: monospace;',
    'color: #888; font-size: 11px; font-family: monospace;'
  );
});
