(() => {
  const key = 'pj-editorial-theme';
  let theme = 'light';
  try { theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch {}
  document.documentElement.dataset.theme = theme;
  document.addEventListener('DOMContentLoaded', () => {
    const actions = document.querySelector('.header-actions');
    if (!actions) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button theme-toggle';
    button.innerHTML = '<span class="theme-sky" aria-hidden="true"><span class="theme-sun"><i data-lucide="sun"></i></span><span class="theme-moon"><i data-lucide="moon"></i></span></span>';
    let transitionTimer;
    function applyTheme(next, animate = false) {
      const root = document.documentElement;
      clearTimeout(transitionTimer);
      const shouldAnimate = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.classList.toggle('theme-switching', shouldAnimate);
      button.querySelectorAll('.theme-sky > span').forEach(icon => icon.getAnimations().forEach(animation => animation.cancel()));
      if (shouldAnimate && next !== root.dataset.theme) {
        const outgoing = button.querySelector(next === 'dark' ? '.theme-sun' : '.theme-moon');
        const incoming = button.querySelector(next === 'dark' ? '.theme-moon' : '.theme-sun');
        const timing = { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)' };
        outgoing.animate([
          { transform: 'translate(0,0) rotate(0)', opacity: 1 },
          { transform: 'translate(-22px,30px) rotate(-65deg)', opacity: 0 }
        ], timing);
        incoming.animate([
          { transform: 'translate(22px,30px) rotate(65deg)', opacity: 0 },
          { transform: 'translate(0,0) rotate(0)', opacity: 1 }
        ], timing);
      }
      theme = next;
      root.dataset.theme = theme;
      transitionTimer = setTimeout(() => root.classList.remove('theme-switching'), 700);
      update();
    }
    function update() {
      const light = document.documentElement.dataset.theme === 'light';
      const label = `Switch to ${light ? 'dark' : 'light'} theme`;
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    button.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
      try { localStorage.setItem(key, theme); } catch {}
    });
    actions.prepend(button);
    if (window.lucide) window.lucide.createIcons();
    update();
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      applyTheme(event.newValue === 'dark' ? 'dark' : 'light');
    });
  });
})();
