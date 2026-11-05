(() => {
  const videos = [...document.querySelectorAll('.case-study video')];
  if (!videos.length || !('IntersectionObserver' in window)) return;

  const pauseOnly = document.currentScript.hasAttribute('data-pause-only');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const visibility = new Map();
  const manual = new WeakSet();

  function sync() {
    videos.forEach(video => {
      const visible = visibility.get(video) === true;
      if (!visible || document.hidden) {
        video.pause();
      } else if (!pauseOnly && !motion.matches && !manual.has(video) && !video.ended) {
        video.muted = true;
        video.play().catch(() => {}); // Native controls remain available if autoplay is blocked.
      }
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio >= .25));
    sync();
  }, { threshold: [0, .25] });

  videos.forEach(video => {
    video.muted = true;
    // Once a visitor uses a player's controls, leave subsequent play decisions to them.
    video.addEventListener('pointerdown', () => manual.add(video));
    video.addEventListener('keydown', () => manual.add(video));
    observer.observe(video);
  });

  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => {
    if (motion.matches) videos.forEach(video => video.pause());
    sync();
  });
})();
