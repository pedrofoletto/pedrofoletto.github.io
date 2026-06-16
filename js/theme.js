import { isElementVisible } from './utils.js';
import { drawSimulation } from './simulator.js';

const themeSwitchBtn = document.getElementById('theme-switch');
const themeIcon = themeSwitchBtn ? themeSwitchBtn.querySelector('i') : null;

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

export function applyTheme(theme) {
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

export function initTheme() {
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
}
