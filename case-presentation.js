(() => {
  const main = document.querySelector('main.case-study');
  if (!main) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  // Keep all original evidence in the HTML; tabs enhance its presentation.
  main.querySelectorAll('[data-findings]').forEach((grid, groupIndex) => {
    const articles = [...grid.children].filter(child => child.matches('article'));
    if (articles.length < 2) return;
    const card = document.createElement('div');
    card.className = 'findings-card';
    const tabs = document.createElement('div');
    tabs.className = 'findings-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', grid.dataset.findings);
    const buttons = [];
    const panels = [];
    const panelStack = document.createElement('div');
    panelStack.className = 'findings-panels';
    articles.forEach((article, index) => {
      const id = `finding-${groupIndex}-${index}`;
      const label = article.querySelector('.persona-role');
      const heading = article.querySelector('h3');
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `${id}-tab`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `${id}-panel`);
      button.textContent = label?.textContent || heading?.textContent || `Finding ${index + 1}`;
      const panel = document.createElement('div');
      panel.id = `${id}-panel`;
      panel.className = 'findings-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      panel.tabIndex = 0;
      const summary = document.createElement('div');
      summary.className = 'finding-summary';
      if (label) summary.append(label);
      if (heading) summary.append(heading);
      const description = document.createElement('p');
      description.textContent = article.dataset.summary || '';
      if (description.textContent) summary.append(description);
      const evidence = document.createElement('div');
      evidence.className = 'finding-evidence';
      const evidenceLabel = document.createElement('p');
      evidenceLabel.className = 'evidence-label';
      evidenceLabel.textContent = grid.dataset.evidenceLabel || 'What the research surfaced';
      evidence.append(evidenceLabel, ...article.childNodes);
      panel.append(summary, evidence);
      tabs.append(button);
      panels.push(panel);
      buttons.push(button);
      button.addEventListener('click', () => activate(index));
      button.addEventListener('keydown', event => {
        const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        activate(next);
        buttons[next].focus();
      });
    });
    function activate(index) {
      buttons.forEach((button, position) => {
        const active = position === index;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        const panel = panels[position];
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
        panel.inert = !active;
        panel.tabIndex = active ? 0 : -1;
      });
      const selected = buttons[index];
      tabs.scrollTo({
        left: selected.offsetLeft - (tabs.clientWidth - selected.offsetWidth) / 2,
        behavior: motion.matches ? 'instant' : 'smooth'
      });
    }
    panelStack.append(...panels);
    card.append(tabs, panelStack);
    grid.replaceWith(card);
    activate(0);
  });

  // Tab enhancement changes document height; honor incoming section links afterward.
  requestAnimationFrame(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && main.contains(target)) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  const board = main.querySelector('.tool-flow-board');
  if (!board) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('tool-connections');
  svg.setAttribute('aria-hidden', 'true');
  board.querySelectorAll('.tool-flow-lines').forEach(old => old.remove());
  board.append(svg);
  const dot = document.createElementNS(svgNS, 'circle');
  dot.setAttribute('r', '3.5');
  dot.classList.add('flow-dot');
  const highlight = document.createElementNS(svgNS, 'path');
  highlight.classList.add('flow-highlight');
  let paths = [];
  let frame = 0;
  let progress = -1200;
  let lastTime = 0;
  let visible = false;
  let paused = motion.matches;
  function draw() {
    const bounds = board.getBoundingClientRect();
    const target = board.querySelector('.tool-flow-clubsphere').getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    paths = [...board.querySelectorAll('.tool-flow-tile')].map(tile => {
      const source = tile.getBoundingClientRect();
      const x1 = source.right - bounds.left;
      const y1 = source.top + source.height / 2 - bounds.top;
      const x2 = target.left - bounds.left;
      const y2 = target.top + target.height / 2 - bounds.top;
      const distance = (x2 - x1) * .48;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('pathLength', '1');
      path.setAttribute('d', `M ${x1} ${y1} C ${x1 + distance} ${y1}, ${x2 - distance} ${y2}, ${x2} ${y2}`);
      return path;
    });
    paths.forEach((path, index) => path.style.setProperty('--i', index));
    svg.replaceChildren(...paths, highlight, dot);
    highlight.style.opacity = '0';
    dot.style.display = 'none';
  }
  function animate(time) {
    frame = 0;
    if (!visible || paused || document.hidden) return;
    if (lastTime) progress += Math.min(time - lastTime, 64);
    lastTime = time;
    const index = Math.floor(Math.max(0, progress) / 1800) % paths.length;
    const path = paths[index];
    if (path && progress >= 0) {
      const elapsed = progress % 1800;
      const opacity = Math.min(1, elapsed / 250, (1800 - elapsed) / 250);
      highlight.setAttribute('d', path.getAttribute('d'));
      highlight.style.opacity = opacity;
      dot.style.opacity = opacity;
      const position = path.getPointAtLength(path.getTotalLength() * elapsed / 1800);
      dot.setAttribute('cx', position.x);
      dot.setAttribute('cy', position.y);
      dot.style.display = '';
    }
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    if (paused) {
      dot.style.display = 'none';
      highlight.style.opacity = '0';
    }
    if (visible && !paused && !document.hidden) frame = requestAnimationFrame(animate);
  }
  motion.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(draw).observe(board);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) board.classList.add('flow-entered'); sync(); }, { threshold: .1 }).observe(board);
  draw();
  sync();
})();
