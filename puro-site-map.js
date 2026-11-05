(() => {
  const map = document.querySelector('[data-puro-site-map]');
  if (!map) return;
  // Destinations match the six trail action lists on the current homepage.
  const trails = {
    muta: ['vault', 'lineage', 'masks', 'timeline'],
    'tiger-mask': ['vault', 'lineage', 'wrestlers', 'masks'],
    'four-pillars': ['vault', 'lineage', 'wrestlers', 'timeline'],
    inokiism: ['vault', 'lineage', 'wrestlers', 'timeline'],
    'deathmatch-frontier': ['vault', 'wrestlers', 'masks', 'timeline'],
    'monster-gaijins': ['vault', 'wrestlers', 'masks', 'timeline']
  };
  const buttons = [...map.querySelectorAll('[data-map-trail]')];
  const nodes = [...map.querySelectorAll('[data-map-node]')];
  const labels = Object.fromEntries(nodes.map(node => [node.dataset.mapNode, node.querySelector('h4').textContent]));
  const select = button => {
    const destinations = trails[button.dataset.mapTrail];
    if (!destinations) return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    nodes.forEach(node => node.classList.toggle('is-on-trail', destinations.includes(node.dataset.mapNode)));
    map.querySelector('[data-map-trail-name]').textContent = button.textContent;
    map.querySelector('[data-map-trail-destinations]').textContent = destinations.map(id => labels[id]).join(' · ');
  };
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  select(buttons[0]);
  map.querySelector('.site-map-trail-buttons').hidden = false;
})();
