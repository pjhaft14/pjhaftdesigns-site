(() => {
  const gallery = document.querySelector('[data-portrait-rotation]');
  if (!gallery) return;
  const sets = [...gallery.querySelectorAll('[data-portrait-set]')];
  const selectors = [...gallery.querySelectorAll('[data-portrait-select]')];
  const controls = gallery.querySelector('.puro-portrait-controls');
  const pause = gallery.querySelector('[data-portrait-pause]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let visible = false;
  let timer;
  let revision = 0;

  function schedule() {
    clearTimeout(timer);
    if (paused || !visible || document.hidden || motion.matches) return;
    timer = setTimeout(() => select((current + 1) % sets.length), 4500);
  }

  async function select(index) {
    clearTimeout(timer);
    const request = ++revision;
    await Promise.all([...sets[index].querySelectorAll('img')].map(image => {
      image.loading = 'eager';
      return image.decode?.().catch(() => {}) || Promise.resolve();
    }));
    if (request !== revision) return;
    sets.forEach((set, position) => {
      const active = position === index;
      set.classList.toggle('is-active', active);
      set.setAttribute('aria-hidden', String(!active));
      set.inert = !active;
      selectors[position].setAttribute('aria-pressed', String(active));
    });
    current = index;
    schedule();
  }

  function updatePause() {
    pause.hidden = motion.matches;
    pause.setAttribute('aria-label', paused ? 'Resume portrait rotation' : 'Pause portrait rotation');
    pause.querySelector('path').setAttribute('d', paused ? 'M8 5l11 7-11 7Z' : 'M9 5v14M15 5v14');
    schedule();
  }

  selectors.forEach((button, index) => button.addEventListener('click', () => select(index)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => {
    if (motion.matches) paused = true;
    updatePause();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: .1 }).observe(gallery);

  sets.forEach((set, index) => {
    set.classList.toggle('is-active', index === 0);
    set.setAttribute('aria-hidden', String(index !== 0));
    set.inert = index !== 0;
  });
  gallery.classList.add('is-enhanced');
  controls.hidden = false;
  updatePause();
})();
