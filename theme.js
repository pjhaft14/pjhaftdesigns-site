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
    function update() {
      const light = document.documentElement.dataset.theme === 'light';
      const label = `Switch to ${light ? 'dark' : 'light'} theme`;
      button.setAttribute('aria-label', label);
      button.title = label;
      button.innerHTML = `<i data-lucide="${light ? 'moon' : 'sun'}" aria-hidden="true"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
    button.addEventListener('click', () => {
      theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem(key, theme); } catch {}
      update();
    });
    actions.prepend(button);
    update();
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
      update();
    });
  });
})();
