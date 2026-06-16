import { isLocal, updateConfig } from './config.js';
import { loadGithubContributions } from './github.js';

export async function loadTextos() {
  try {
    const response = await fetch(`./textos.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Falha ao carregar textos.json');
    const textos = await response.json();
    
    // Atualiza configurações dinâmicas
    if (textos['github-username']) {
      updateConfig('github-username', textos['github-username']);
    }
    if (textos['typewriter-words']) {
      updateConfig('typewriter-words', textos['typewriter-words']);
    }
    
    Object.entries(textos).forEach(([key, val]) => {
      const elements = document.querySelectorAll(`[data-txt="${key}"]`);
      elements.forEach(el => {
        if ((key.endsWith('-link') || key.startsWith('link-')) && el.tagName === 'A') {
          el.href = val;
        } else if (el.tagName === 'A' && key === 'hero-email') {
          el.href = `mailto:${val}`;
          el.textContent = val;
        } else {
          el.textContent = val;
        }
      });
    });

    if (textos['hero-email']) {
      const contactEmail = document.getElementById('contact-email');
      if (contactEmail) {
        contactEmail.href = `mailto:${textos['hero-email']}`;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar textos estáticos:', error);
  }
}

export function setupTextEditing() {
  if (!isLocal) return;

  const textElements = document.querySelectorAll('[data-txt]');
  textElements.forEach(el => {
    el.classList.add('local-editable');

    // Em dev, previne clique acidental em links do tipo data-txt (como email ou repo)
    el.addEventListener('click', (e) => {
      if (el.tagName === 'A') {
        e.preventDefault();
      }
    });

    el.addEventListener('dblclick', async (e) => {
      e.preventDefault();
      
      const key = el.getAttribute('data-txt');
      if (key && (key.endsWith('-link') || key.startsWith('link-'))) {
        const originalUrl = el.href;
        let promptMsg = "Digite a nova URL:";
        if (key.startsWith('proj-')) {
          promptMsg = "Digite a nova URL do repositório no GitHub:";
        } else if (key === 'link-linkedin') {
          promptMsg = "Digite a URL do seu perfil no LinkedIn:";
        } else if (key === 'link-github') {
          promptMsg = "Digite a URL do seu perfil no GitHub:";
        } else if (key === 'link-kaggle') {
          promptMsg = "Digite a URL do seu perfil no Kaggle:";
        }
        
        const newUrl = prompt(promptMsg, originalUrl);
        if (newUrl === null) return; // Cancelou
        
        const trimmedUrl = newUrl.trim();
        if (trimmedUrl === originalUrl) return;

        try {
          const response = await fetch('/api/salvar-texto', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value: trimmedUrl })
          });

          const result = await response.json();
          if (response.ok) {
            console.log(`URL '${key}' atualizada com sucesso!`);
            el.href = trimmedUrl;
          } else {
            alert(`Erro ao salvar URL: ${result.error}`);
          }
        } catch (err) {
          console.error('Erro ao salvar URL:', err);
          alert('Erro ao enviar dados para a API local.');
        }
        return;
      }

      const originalText = el.innerText.trim();
      el.dataset.original = originalText;

      el.contentEditable = 'true';
      el.focus();
      
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      el.classList.add('editing-active');
    });

    el.addEventListener('blur', async () => {
      if (el.contentEditable !== 'true') return;
      
      el.contentEditable = 'false';
      el.classList.remove('editing-active');

      const key = el.getAttribute('data-txt');
      const value = el.innerText.trim();
      const original = el.dataset.original;

      if (value === original) return;

      try {
        const response = await fetch('/api/salvar-texto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key, value })
        });

        const result = await response.json();
        if (response.ok) {
          console.log(`Texto '${key}' atualizado com sucesso!`);
          if (key === 'hero-email') {
            el.href = `mailto:${value}`;
            const contactEmail = document.getElementById('contact-email');
            if (contactEmail) {
              contactEmail.href = `mailto:${value}`;
            }
          }
          // Se o usuário editou o github-username ou as palavras do typewriter, recarrega
          if (key === 'github-username') {
            updateConfig('github-username', value);
            loadGithubContributions();
          } else if (key === 'typewriter-words') {
            updateConfig('typewriter-words', value);
          }
        } else {
          alert(`Erro ao salvar text: ${result.error}`);
          el.innerText = original;
        }
      } catch (err) {
        console.error('Erro ao salvar texto:', err);
        alert('Erro ao enviar dados para a API local.');
        el.innerText = original;
      }
    });

    el.addEventListener('keydown', (e) => {
      if (el.contentEditable !== 'true') return;

      const keyAttr = el.getAttribute('data-txt');
      const isSingleLine = keyAttr && !keyAttr.includes('sobre-p') && !keyAttr.includes('-desc');

      if (e.key === 'Enter') {
        if (isSingleLine || (!isSingleLine && !e.shiftKey)) {
          e.preventDefault();
          el.blur();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        el.innerText = el.dataset.original || '';
        el.contentEditable = 'false';
        el.classList.remove('editing-active');
      }
    });
  });
}

export function initEditor() {
  setupTextEditing();

  // Previne perda de dados se o usuário atualizar a página (F5) ou sair enquanto edita
  window.addEventListener('beforeunload', (e) => {
    if (document.querySelector('.editing-active')) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}
