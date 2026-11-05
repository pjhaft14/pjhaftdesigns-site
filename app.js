const menuButton = document.querySelector('.menu-toggle');
const header = document.querySelector('.site-header');

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

renderIcons();

function closeMenu() {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  menuButton.title = 'Open navigation';
}
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuButton.title = open ? 'Close navigation' : 'Open navigation';
});
document.querySelectorAll('.site-header nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
const sections = [...document.querySelectorAll('#work, #about, #contact')];
const navigation = [...document.querySelectorAll('.site-header nav a')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navigation.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -55% 0px' });
sections.forEach(section => observer.observe(section));

const videos = [...document.querySelectorAll('.project-media video')];
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
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= end) seekStart();
  });
  video.addEventListener('ended', () => { seekStart(); syncPlayback(); });
});
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleVideos.add(entry.target);
    else visibleVideos.delete(entry.target);
  });
  syncPlayback();
}, { threshold: 0.1 });
videos.forEach(video => videoObserver.observe(video));
reducedMotion.addEventListener('change', event => { motionPaused = event.matches; syncPlayback(); });
document.addEventListener('visibilitychange', syncPlayback);
syncPlayback();
