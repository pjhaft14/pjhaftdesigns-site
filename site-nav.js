// Site header navigation, loaded on every page: the mobile menu toggle, and on pages whose
// navigation links point at in-page sections (the home page), current-section highlighting.
(() => {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('.menu-toggle');

  if (header && button) {
    const setOpen = open => {
      const label = open ? 'Close navigation' : 'Open navigation';
      header.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', label);
      button.title = label;
    };

    button.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
    header.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && header.classList.contains('menu-open')) {
        setOpen(false);
        button.focus();
      }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 640) setOpen(false); });
  }

  const links = [...document.querySelectorAll('.site-header nav a')];
  if (links.some(link => link.getAttribute('href')?.startsWith('#')) && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('#work, #about, #contact').forEach(section => observer.observe(section));
  }
})();
