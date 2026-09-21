(() => {
  const main = document.querySelector('main.case-study');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!main || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  // Reveal long galleries item by item rather than hiding the entire gallery.
  const sections = [...main.children].flatMap(section => {
    if (!section.matches('section,figure') || section.matches('.case-hero')) return [];
    if (section.matches('.solution-gallery')) return [...section.children];
    return [section];
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('case-reveal-pending');
      observer.unobserve(entry.target);
    });
  }, {threshold:0, rootMargin:'0px 0px -48px 0px'});

  sections.forEach(section => {
    if (section.getBoundingClientRect().top < innerHeight) return;
    section.classList.add('case-scroll-reveal', 'case-reveal-pending');
    observer.observe(section);
  });
  const showAll = () => {
    observer.disconnect();
    sections.forEach(section => section.classList.remove('case-reveal-pending'));
  };
  reducedMotion.addEventListener('change', event => {if (event.matches) showAll();});
  window.addEventListener('beforeprint', showAll);
  main.addEventListener('focusin', event => {
    const section = event.target.closest('.case-reveal-pending');
    if (section) {section.classList.remove('case-reveal-pending');observer.unobserve(section);}
  });
})();
