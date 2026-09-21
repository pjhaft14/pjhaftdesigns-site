if (window.lucide) lucide.createIcons();
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
function closeMenu() {
  header.classList.remove('menu-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}
menu.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); menu.focus(); }
});
const viewer = document.querySelector('.image-viewer');
document.querySelectorAll('.enlarge-image').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const original = link.querySelector('img');
    viewer.querySelector('img').src = link.href;
    viewer.querySelector('img').alt = original.alt;
    viewer.querySelector('p').textContent = original.alt;
    viewer.showModal();
  });
});
document.querySelector('.close-image')?.addEventListener('click', () => viewer.close());
viewer?.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
const demonstrations = [...document.querySelectorAll('video')];
demonstrations.forEach(video => video.addEventListener('play', () => {
  demonstrations.forEach(other => { if (other !== video) other.pause(); });
}));
