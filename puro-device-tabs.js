(() => {
  const viewer = document.querySelector('[data-home-device-tabs]');
  if (!viewer) return;
  const tablist = viewer.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (panels.some(panel => !panel)) return;
  const stack = viewer.querySelector('.puro-device-panels');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = -1;
  let requestedIndex = 0;
  let animation = null;
  let transition = 0;

  function show(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      panels[position].inert = !selected;
    });
    currentIndex = index;
  }

  async function activate(index, animate = true) {
    requestedIndex = index;
    const revision = ++transition;
    const opacity = getComputedStyle(stack).opacity;
    animation?.cancel();
    if (!animate || motion.matches || !stack.animate || index === currentIndex) {
      show(index);
      animation = null;
      return;
    }
    if (currentIndex !== -1) {
      animation = stack.animate([{ opacity }, { opacity: 0 }], {
        duration: 130, easing: 'ease-out', fill: 'forwards'
      });
      try { await animation.finished; } catch { return; }
      if (revision !== transition) return;
      animation.cancel();
    }
    show(index);
    animation = stack.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 260, easing: 'cubic-bezier(.2,.65,.3,1)'
    });
    try { await animation.finished; } catch { return; }
    if (revision === transition) animation = null;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(next);
      tabs[next].focus();
    });
  });

  const syncHash = () => activate(location.hash.startsWith('#homepage-mobile') ? 1 : 0, false);
  syncHash();
  tablist.hidden = false;
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#homepage-mobile') || location.hash === '#homepage-desktop') syncHash();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) activate(requestedIndex, false);
  });
})();
