// Função geradora de número pseudo-aleatório semeado
export function getSeededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash)) % 1;
}

// Escapa strings para evitar injeções de HTML
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// Sanitiza HTML de forma segura contra XSS usando DOMParser
export function sanitizeHTML(rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');
  const allowedTags = ['P', 'STRONG', 'UL', 'OL', 'LI', 'DIV', 'SPAN', 'I', 'A', 'H1', 'H2', 'H3', 'H4', 'PRE', 'CODE', 'BR', 'IMG', 'HR'];
  const allowedAttrs = ['id', 'class', 'href', 'target', 'rel', 'style', 'src', 'alt'];

  function clean(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.includes(child.tagName)) {
          const textNode = document.createTextNode(child.textContent);
          child.replaceWith(textNode);
        } else {
          const attrs = Array.from(child.attributes);
          for (const attr of attrs) {
            if (!allowedAttrs.includes(attr.name)) {
              child.removeAttribute(attr.name);
            } else if (attr.name === 'href' || attr.name === 'src') {
              const cleanVal = attr.value.replace(/[\s\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();
              if (cleanVal.startsWith('javascript:') || cleanVal.startsWith('data:') || cleanVal.startsWith('vbscript:')) {
                child.removeAttribute(attr.name);
              }
            }
          }
          clean(child);
        }
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

// Verifica se um elemento está fisicamente visível na viewport
export function isElementVisible(el) {
  if (!el) return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
