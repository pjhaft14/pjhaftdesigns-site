// Puroresu case study: rotate the social-post carousels inside the phone cards once the
// social system section scrolls into view. Skipped entirely under reduced motion.
(() => {
  const cards = [...document.querySelectorAll('.puro-social-phone-card')];
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let timer;

  const setSlides = (advance = false) => {
    cards.forEach(card => {
      const carousel = card.querySelector('.puro-social-carousel');
      const track = card.querySelector('.puro-social-carousel__track');
      const slides = [...card.querySelectorAll('.puro-social-carousel__track img')];
      const dots = [...card.querySelectorAll('.puro-social-dots i')];
      const previous = Number(carousel?.dataset.activeSlide || 0);
      const active = advance ? (previous + 1) % slides.length : 0;

      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === active);
        slide.classList.toggle('is-previous', advance && index === previous);
      });
      if (carousel) carousel.dataset.activeSlide = String(active);
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
      track?.setAttribute('aria-hidden', 'true');
    });
  };

  const start = () => {
    if (timer) return;
    setSlides();
    timer = window.setInterval(() => setSlides(true), 3200);
  };

  const section = document.querySelector('.puro-social-system');
  if ('IntersectionObserver' in window && section) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, { threshold: 0.25 });
    observer.observe(section);
  } else {
    start();
  }
})();
