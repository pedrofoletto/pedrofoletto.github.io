export const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export let GITHUB_USERNAME = "pedrofoletto";
export let typewriterWords = ["Controle & Automação", "Bioinstrumentação", "Sistemas Embarcados", "Sinais Analógicos", "Tecnologia Médica"];

export function updateConfig(key, value) {
  if (key === 'github-username') {
    GITHUB_USERNAME = value;
  } else if (key === 'typewriter-words') {
    typewriterWords = value.split(',').map(s => s.trim());
  }
}
