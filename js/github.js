import { GITHUB_USERNAME } from './config.js';
import { escapeHTML } from './utils.js';

export async function loadGithubContributions() {
  const githubGraph = document.getElementById('github-graph');
  const githubTooltip = document.getElementById('github-tooltip');
  const githubTotalCommits = document.getElementById('github-total-commits');

  if (!githubGraph) return;

  if (!githubGraph.dataset.delegated) {
    githubGraph.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.github-cell');
      if (cell && githubTooltip) {
        githubTooltip.innerText = cell.getAttribute('data-tooltip') || '';
      }
    });

    githubGraph.addEventListener('mouseout', (e) => {
      const cell = e.target.closest('.github-cell');
      if (cell && githubTooltip) {
        githubTooltip.innerText = '';
      }
    });
    githubGraph.dataset.delegated = 'true';
  }

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

export function initGithub() {
  window.loadGithubContributions = loadGithubContributions;
  loadGithubContributions();
}
