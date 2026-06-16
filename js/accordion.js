export function initAccordion() {
  const accordionItems = document.querySelectorAll('.about-accordion-gallery .accordion-item');
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      // Evento de hover para desktop
      item.addEventListener('mouseenter', () => {
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-expanded', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      });

      // Evento de click/touch para mobile e acessibilidade
      item.addEventListener('click', () => {
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-expanded', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      });

      // Evento de teclado para acessibilidade (Enter ou Espaço)
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          accordionItems.forEach(i => {
            i.classList.remove('active');
            i.setAttribute('aria-expanded', 'false');
          });
          item.classList.add('active');
          item.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
}
