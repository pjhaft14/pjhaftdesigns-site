(() => {
  if (!document.querySelector(".testimonial")) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

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
const quotePause = document.querySelector('.quote-pause');
const quoteCount = document.querySelector('.testimonial-count');
const announcement = document.querySelector('.quote-announcement');
const slideTemplate = document.querySelector('.testimonial-slide');
const cardTemplate = slideTemplate.querySelector('.quote-card').cloneNode(true);
const mobileQuotes = matchMedia('(max-width: 760px)');
let quoteGroups = [];
let slides = [];
let quoteIndex = 0;
let quoteBusy = false;
let quoteLayoutPending = false;
let quotePaused = reducedMotion.matches;
let quoteVisible = false;
let quoteTimer;

function renderQuoteSlides() {
  const currentItem = quoteGroups[quoteIndex]?.[0] || testimonials[0];
  const perSlide = mobileQuotes.matches ? 1 : 2;
  quoteIndex = Math.floor(testimonials.indexOf(currentItem) / perSlide);
  quoteGroups = Array.from({ length: Math.ceil(testimonials.length / perSlide) }, (_, index) => testimonials.slice(index * perSlide, index * perSlide + perSlide));
  quoteStage.querySelectorAll('.testimonial-slide').forEach(slide => slide.remove());
  // Overlay slides to reserve the tallest card's space and avoid page jumps.
  slides = quoteGroups.map((items, index) => {
    const slide = slideTemplate.cloneNode(false);
    items.forEach(item => {
      const card = cardTemplate.cloneNode(true);
      card.querySelector('blockquote').textContent = `"${item.quote}"`;
      const photo = item.photo.replace(/\.png$/, '-color.webp');
      card.querySelector('img').src = `assets/testimonials/${photo}`;
      const person = card.querySelector('.quote-person p');
      person.firstChild.textContent = item.name;
      person.querySelector('span').textContent = item.role;
      slide.append(card);
    });
    slide.classList.toggle('is-active', index === quoteIndex);
    slide.setAttribute('aria-hidden', String(index !== quoteIndex));
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `Recommendation${perSlide === 1 ? '' : 's'} ${index + 1} of ${quoteGroups.length}`);
    quoteStage.append(slide);
    return slide;
  });
  quoteCount.textContent = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  scheduleQuote();
}

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
  incoming.classList.add('is-active');
  incoming.setAttribute('aria-hidden', 'false');
  outgoing.setAttribute('aria-hidden', 'true');
  if (!reducedMotion.matches) {
    await Promise.all([
      outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-in-out' }).finished,
      incoming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-in-out' }).finished
    ]);
  }
  outgoing.classList.remove('is-active');
  quoteIndex = nextIndex;
  quoteCount.textContent = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  if (manual) announcement.textContent = quoteGroups[quoteIndex].map(item => `${item.name}: ${item.quote}`).join(' ');
  quoteBusy = false;
  if (quoteLayoutPending) {
    quoteLayoutPending = false;
    renderQuoteSlides();
  }
  scheduleQuote();
}
function updateQuotePause() {
  const label = quotePaused ? 'Play testimonials' : 'Pause testimonials';
  quotePause.setAttribute('aria-label', label);
  quotePause.title = label;
  quotePause.innerHTML = window.siteIcon(quotePaused ? 'play' : 'pause', ' aria-hidden="true"');
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
mobileQuotes.addEventListener('change', () => {
  if (quoteBusy) quoteLayoutPending = true;
  else renderQuoteSlides();
});
new IntersectionObserver(entries => { quoteVisible = entries[0].isIntersecting; scheduleQuote(); }, { threshold: .3 }).observe(quoteSection);
renderQuoteSlides();
updateQuotePause();

})();
