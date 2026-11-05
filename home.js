// Home page project cards: loop each preview video between its data-loop-start and
// data-loop-end, and play only while it is on screen and motion is allowed.
(() => {
  const videos = [...document.querySelectorAll('.project-media video')];
  if (!videos.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const visibleVideos = new Set();
  let motionPaused = reducedMotion.matches;

  function syncPlayback() {
    videos.forEach(video => {
      if (!motionPaused && !document.hidden && visibleVideos.has(video)) video.play().catch(() => {});
      else video.pause();
    });
  }

  videos.forEach(video => {
    const start = Number(video.dataset.loopStart);
    const end = Number(video.dataset.loopEnd);
    const seekStart = () => { video.currentTime = start; };
    if (video.readyState >= 1) seekStart();
    else video.addEventListener('loadedmetadata', seekStart, { once: true });
    video.addEventListener('timeupdate', () => { if (video.currentTime >= end) seekStart(); });
    video.addEventListener('ended', () => { seekStart(); syncPlayback(); });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleVideos.add(entry.target);
      else visibleVideos.delete(entry.target);
    });
    syncPlayback();
  }, { threshold: 0.1 });
  videos.forEach(video => observer.observe(video));
  reducedMotion.addEventListener('change', event => { motionPaused = event.matches; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  syncPlayback();
})();
