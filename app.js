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

const testimonials = [
  { name: 'Adrian Venables', role: 'Product Owner / Manager', photo: 'Adrian.jpg', quote: 'He balances strategic vision with attention to detail, applies sharp critical thinking, and helps teams make stronger decisions.' },
  { name: 'Ellen True', role: 'Product', photo: 'ellen.png', quote: 'PJ shows excellence in everything he does. He is a generous collaborator and someone who consistently raises the quality of the work and the conversations around it.' },
  { name: 'Nathaniel Vincent', role: 'Technical Writer', photo: 'Nathaniel.png', quote: 'At his core, PJ is a brilliant designer who consistently creates exponential value for the products he builds and the people who use them. He understands the product because he uses it, and he understands the user because he speaks to them.' },
  { name: 'Vitalii Stepovenco', role: 'Product at Flow48', photo: 'vitalii.png', quote: 'PJ consistently grounded his design decisions in research, benchmarking, and user data. He explained the reasoning clearly, which gave the team confidence in the direction and made collaboration much easier.' },
  { name: 'Cristinel Mitoi', role: 'Software Engineering Manager', photo: 'Cristinel.png', quote: 'PJ\u2019s UX work brought clarity and elegance to complex applications. He could untangle difficult requirements, create an experience that felt simple, and give engineering a thoughtful direction to build from.' },
  { name: 'Carlos Russo', role: 'Product Owner', photo: 'Carlos.png', quote: 'PJ\u2019s work inspires designers and stakeholders to ask better questions, communicate more clearly, and stay focused on what matters. He helps teams move beyond surface-level solutions toward stronger product decisions.' }
];
const quoteSection = document.querySelector('.testimonial');
const quoteStage = document.querySelector('.testimonial-stage');
const dissolve = document.querySelector('.digital-dissolve');
const quotePause = document.querySelector('.quote-pause');
const quoteCount = document.querySelector('.testimonial-count');
const announcement = document.querySelector('.quote-announcement');
const slideTemplate = document.querySelector('.testimonial-slide');
// Stacked slides reserve the tallest quote's space at every screen width.
const slides = testimonials.map((item, index) => {
  const slide = index === 0 ? slideTemplate : slideTemplate.cloneNode(true);
  slide.querySelector('blockquote').textContent = `"${item.quote}"`;
  const photo = index === 0 ? item.photo : item.photo.replace('.png', '-color.png');
  slide.querySelector('img').src = `assets/testimonials/${photo}`;
  const person = slide.querySelector('.quote-person p');
  person.firstChild.textContent = item.name;
  person.querySelector('span').textContent = item.role;
  slide.classList.toggle('is-active', index === 0);
  slide.setAttribute('aria-hidden', String(index !== 0));
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-label', `${index + 1} of ${testimonials.length}`);
  if (index > 0) quoteStage.insertBefore(slide, dissolve);
  return slide;
});
const pixels = Array.from({ length: 72 }, () => {
  const pixel = document.createElement('span');
  dissolve.append(pixel);
  return pixel;
});
let quoteIndex = 0;
let quoteBusy = false;
let quotePaused = reducedMotion.matches;
let quoteVisible = false;
let quoteTimer;

function scheduleQuote() {
  clearTimeout(quoteTimer);
  if (!quotePaused && quoteVisible && !document.hidden && !quoteSection.matches(':hover') && !quoteSection.contains(document.activeElement)) {
    quoteTimer = setTimeout(() => changeQuote(1), 8000);
  }
}

async function changeQuote(direction, manual = false) {
  if (quoteBusy) return;
  quoteBusy = true;
  clearTimeout(quoteTimer);
  const outgoing = slides[quoteIndex];
  const nextIndex = (quoteIndex + direction + slides.length) % slides.length;
  const incoming = slides[nextIndex];
  if (!reducedMotion.matches) {
    pixels.forEach((pixel, index) => {
      const delay = (index % 12) * 16 + Math.random() * 160;
      pixel.animate([{ opacity: 0, transform: 'scaleX(.1)' }, { opacity: .18, transform: 'scaleX(1)', offset: .4 }, { opacity: 0, transform: 'scaleX(.2)' }], { duration: 580, delay, easing: 'ease-in-out' });
    });
    await outgoing.animate([{ opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }, { opacity: 0, filter: 'blur(5px)', transform: 'translateY(-6px)' }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished;
  }
  outgoing.classList.remove('is-active');
  outgoing.setAttribute('aria-hidden', 'true');
  outgoing.getAnimations().forEach(animation => animation.cancel());
  incoming.classList.add('is-active');
  incoming.setAttribute('aria-hidden', 'false');
  quoteIndex = nextIndex;
  quoteCount.textContent = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  if (!reducedMotion.matches) {
    await incoming.animate([{ opacity: 0, filter: 'blur(5px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }], { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished;
  }
  if (manual) announcement.textContent = `${testimonials[quoteIndex].name}: ${testimonials[quoteIndex].quote}`;
  quoteBusy = false;
  scheduleQuote();
}
function updateQuotePause() {
  const label = quotePaused ? 'Play testimonials' : 'Pause testimonials';
  quotePause.setAttribute('aria-label', label);
  quotePause.title = label;
  quotePause.innerHTML = `<i data-lucide="${quotePaused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
  renderIcons();
  scheduleQuote();
}
document.querySelector('.quote-previous').addEventListener('click', () => changeQuote(-1, true));
document.querySelector('.quote-next').addEventListener('click', () => changeQuote(1, true));
quotePause.addEventListener('click', () => { quotePaused = !quotePaused; updateQuotePause(); });
quoteSection.addEventListener('mouseenter', () => clearTimeout(quoteTimer));
quoteSection.addEventListener('mouseleave', scheduleQuote);
quoteSection.addEventListener('focusin', () => clearTimeout(quoteTimer));
quoteSection.addEventListener('focusout', () => setTimeout(scheduleQuote, 0));
document.addEventListener('visibilitychange', scheduleQuote);
reducedMotion.addEventListener('change', event => { quotePaused = event.matches; updateQuotePause(); });
new IntersectionObserver(entries => { quoteVisible = entries[0].isIntersecting; scheduleQuote(); }, { threshold: .3 }).observe(quoteSection);
updateQuotePause();
