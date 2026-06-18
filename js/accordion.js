export function initAccordion() {
  const gallery = document.querySelector('.about-accordion-gallery');
  const accordionItems = document.querySelectorAll('.about-accordion-gallery .accordion-item');
  
  if (accordionItems.length > 0) {
    // Helper para alternar o item ativo
    const setActiveItem = (index) => {
      accordionItems.forEach((item, idx) => {
        if (idx === index) {
          item.classList.add('active');
          item.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.remove('active');
          item.setAttribute('aria-expanded', 'false');
        }
      });
    };

    // Remove classe de primeiro pulso após 1 segundo
    if (gallery) {
      setTimeout(() => {
        gallery.classList.remove('first-load');
      }, 1000);
    }

    accordionItems.forEach((item, index) => {
      // Evento de hover para desktop
      item.addEventListener('mouseenter', () => {
        setActiveItem(index);
      });

      // Evento de click/touch para mobile e acessibilidade
      item.addEventListener('click', () => {
        setActiveItem(index);
      });

      // Evento de teclado para acessibilidade (Enter ou Espaço)
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveItem(index);
        }
      });
    });

    // Troca automática ao rolar a página (quando descer)
    const aboutSection = document.getElementById('sobre');
    if (aboutSection && accordionItems.length === 2) {
      window.addEventListener('scroll', () => {
        const rect = aboutSection.getBoundingClientRect();
        const sectionHeight = rect.height;
        const sectionTop = rect.top; // Posição do topo em relação ao viewport

        // Verifica se a seção está visível na tela
        if (sectionTop < window.innerHeight && sectionTop + sectionHeight > 0) {
          const threshold = window.innerHeight / 2;
          const sectionMid = sectionTop + (sectionHeight / 2);

          if (sectionMid < threshold) {
            // Rolar mais para baixo ativa o segundo item (index 1: Automação)
            if (!accordionItems[1].classList.contains('active')) {
              setActiveItem(1);
            }
          } else {
            // Rolar para cima/início ativa o primeiro item (index 0: Controle)
            if (!accordionItems[0].classList.contains('active')) {
              setActiveItem(0);
            }
          }
        }
      }, { passive: true });
    }
  }
}
