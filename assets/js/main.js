document.addEventListener('DOMContentLoaded', () => {
  // Configuração do IntersectionObserver para o Scroll Reveal
  const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Dispara quando 15% do elemento estiver visível
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target); // Para animar apenas uma vez
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

  // Seleciona todos os elementos que devem ser animados
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});
