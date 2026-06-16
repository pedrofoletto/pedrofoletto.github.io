import { typewriterWords } from './config.js';

export function initTypewriter() {
  const typewriterText = document.getElementById('typewriter-text');
  if (typewriterText) {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      // Para a recursão se o elemento foi desmontado do DOM (SPA navigation)
      if (!document.body.contains(typewriterText)) {
        return;
      }
      
      const words = typewriterWords;
      if (!words || words.length === 0) {
        setTimeout(type, 500);
        return;
      }
      
      const currentWord = words[wordIndex % words.length];
      if (isDeleting) {
        typewriterText.innerText = currentWord.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(type, 500);
        } else {
          setTimeout(type, 30);
        }
      } else {
        typewriterText.innerText = currentWord.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(type, 2000);
        } else {
          setTimeout(type, 80);
        }
      }
    }

    setTimeout(type, 500);
  }
}
