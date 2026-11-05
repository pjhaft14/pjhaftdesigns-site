// Keep the problem sequence independent of the ecosystem illustration loading.
(() => {
  const figure = document.querySelector('.cf-color-comparison');
  if (!figure) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const charts = [...figure.querySelectorAll('[data-problem-chart]')];
  const toggle = figure.querySelector('.cf-problem-toggle');
  const positions = [[2, 9], [0, 5], [1, 3]];
  const listFrames = [{ row: 1, color: 'teal' }, { row: 4, color: 'blue' }, { row: 0, color: 'amber' }];
  const list = figure.querySelector('.cf-table-card');
  // A fixed positional palette: moving to another position changes the color.
  const palette = ['teal', 'blue', 'amber', 'teal', 'amber', 'amber', 'blue', 'teal', 'purple', 'blue'];
  const ordinal = index => `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}`;
  let frame = 0;
  let paused = reducedMotion.matches;
  let visible = false;
  let timer;

  function render() {
    charts.forEach((chart, chartIndex) => {
      const index = positions[frame][chartIndex];
      const name = palette[index];
      let count;
      if (chart.dataset.chartType === 'pie') {
        const slices = [...chart.querySelectorAll('[data-pie-segment]')];
        count = slices.length;
        slices.forEach((slice, i) => slice.setAttribute('fill', i === index ? `var(--cf-chart-${name})` : `var(--cf-neutral-bar${i === (index + 1) % count ? '' : '-alt'})`));
      } else {
        const bars = chart.querySelector('.cf-bars');
        const apac = bars.querySelector('.cf-bar-apac');
        const others = [...bars.children].filter(node => node !== apac);
        bars.querySelectorAll('span').forEach(node => node.getAnimations().forEach(animation => animation.finish()));
        const previous = new Map([...bars.children].map(node => [node, node.getBoundingClientRect().left]));
        const arranged = [...others];
        arranged.splice(index, 0, apac);
        bars.replaceChildren(...arranged);
        count = arranged.length;
        apac.style.setProperty('--apac-color', `var(--cf-chart-${name})`);
        if (!reducedMotion.matches && visible) {
          arranged.forEach(node => {
            const delta = previous.get(node) - node.getBoundingClientRect().left;
            if (delta) node.animate([{ transform: `translateX(${delta}px)` }, { transform: 'translateX(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)' });
          });
        }
      }
      chart.querySelector('.cf-chart-position').textContent = `${count} data points · APAC ${ordinal(index)}`;
      chart.querySelector('.cf-chart-key i').style.background = `var(--cf-chart-${name})`;
      chart.querySelector('.cf-chart-key b').textContent = name[0].toUpperCase() + name.slice(1);
      chart.setAttribute('aria-label', `${chart.querySelector('strong').textContent}${chart.dataset.chartType === 'pie' ? ' pie chart' : ' bar chart'}: APAC is ${ordinal(index)} of ${count} data points and ${name}.`);
    });
    if (list) {
      const body = list.querySelector('tbody');
      const apacRow = body.querySelector('.cf-skeleton-apac-row');
      const rows = [...body.children];
      rows.forEach(row => row.getAnimations().forEach(animation => animation.finish()));
      const previous = new Map(rows.map(row => [row, row.getBoundingClientRect().top]));
      const next = rows.filter(row => row !== apacRow);
      const state = listFrames[frame];
      next.splice(state.row, 0, apacRow);
      body.replaceChildren(...next);
      list.style.setProperty('--badge-color', `var(--cf-chart-${state.color})`);
      list.style.setProperty('--badge-text', `var(--cf-badge-${state.color})`);
      list.querySelector('.cf-table-position').textContent = `${next.length} records · APAC row ${state.row + 1}`;
      list.querySelector('.cf-chart-key i').style.background = `var(--cf-chart-${state.color})`;
      list.querySelector('.cf-chart-key b').textContent = state.color[0].toUpperCase() + state.color.slice(1);
      list.querySelector('table').setAttribute('aria-label', `Illustrative opportunity list: APAC is in row ${state.row + 1} with a ${state.color} Region badge.`);
      if (!reducedMotion.matches && visible) next.forEach(row => {
        const delta = previous.get(row) - row.getBoundingClientRect().top;
        if (delta) row.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)' });
      });
    }
  }
  function schedule() {
    clearInterval(timer);
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    if (!paused && visible && !document.hidden && !reducedMotion.matches) {
      timer = setInterval(() => { frame = (frame + 1) % positions.length; render(); }, 2800);
    }
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    schedule();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.2 }).observe(figure);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) paused = true;
    render();
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  render();
  schedule();
})();

(() => {
  const figure = document.querySelector('.cf-ecosystem');
  const artwork = figure?.querySelector('object');
  if (!artwork) return;
  const colors = {
    purple: { dot: '#8057D5', text: '#6239A9', rowText: '#37295D', row: '#EEE7FD', chip: '#E4D7FC', shared: '#F0E8FF', line: '#BBA6E4' },
    blue: { dot: '#3478DC', text: '#2258AB', rowText: '#24416C', row: '#E9F1FF', chip: '#D7E7FC', shared: '#E7F0FF', line: '#95B8EB' },
    teal: { dot: '#148578', text: '#09685E', rowText: '#1D5148', row: '#E2F4EE', chip: '#C7EADD', shared: '#E4F5F0', line: '#91CDBF' },
    amber: { dot: '#C78414', text: '#8A5606', rowText: '#62471C', row: '#FFF3DA', chip: '#FCE4B3', shared: '#FFF3DC', line: '#E1BD7A' }
  };
  const order = Object.keys(colors);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = figure.querySelector('.cf-animation-toggle');
  const choices = [...figure.querySelectorAll('[data-color]')];
  const announcement = figure.querySelector('[role="status"]');
  let selected = 'purple';
  let paused = reducedMotion.matches;
  let visible = false;
  let interval;
  let timers = [];
  let svg;
  let groups;
  let paths;
  let initialized = false;

  function clearTransition() {
    timers.forEach(clearTimeout);
    timers = [];
    svg?.querySelectorAll('[data-flow-pulse]').forEach(node => node.remove());
  }
  function stage(name) {
    figure.querySelectorAll('[data-step]').forEach(node => node.classList.toggle('is-current', node.dataset.step === name));
  }
  function apply(nodes, color) {
    nodes.forEach(({ node, attribute, token }) => node.setAttribute(attribute, color[token]));
  }
  function applyStage(name, color) {
    apply(groups[name], color);
    const mobile = figure.querySelector(`[data-map-stage="${name}"]`);
    if (mobile) {
      mobile.style.setProperty('--map-dot', color.dot);
      mobile.style.setProperty('--map-text', color.text);
      mobile.style.setProperty('--map-row', color.row);
      mobile.style.setProperty('--map-chip', color.chip);
    }
  }
  function pulse(path, color) {
    if (reducedMotion.matches || !path) return;
    const node = path.cloneNode(false);
    node.dataset.flowPulse = '';
    node.setAttribute('stroke', color.dot);
    node.setAttribute('stroke-width', '3');
    node.setAttribute('fill', 'none');
    node.setAttribute('stroke-linecap', 'round');
    const length = path.getTotalLength();
    node.setAttribute('stroke-dasharray', `12 ${length + 12}`);
    path.parentNode.append(node);
    const animation = node.animate([{ strokeDashoffset: length + 12 }, { strokeDashoffset: 0 }], { duration: 650, easing: 'ease-in-out' });
    animation.onfinish = () => node.remove();
  }
  function choose(name, manual = false) {
    clearTransition();
    selected = name;
    const color = colors[name];
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === name)));
    if (reducedMotion.matches) {
      Object.keys(groups).forEach(name => applyStage(name, color));
      stage('products');
      if (manual) announcement.textContent = `${name} styling applied to APAC across all four products.`;
      return;
    }
    stage('source');
    applyStage('source', color);
    pulse(paths[0], color);
    timers.push(setTimeout(() => {
      stage('shared');
      applyStage('shared', color);
      paths.slice(1).forEach(path => pulse(path, color));
    }, 650));
    timers.push(setTimeout(() => {
      stage('products');
      applyStage('products', color);
      if (manual) announcement.textContent = `${name} styling applied to APAC across all four products.`;
    }, 1300));
  }
  function schedule() {
    clearInterval(interval);
    if (!initialized || paused || !visible || document.hidden || reducedMotion.matches) return;
    interval = setInterval(() => choose(order[(order.indexOf(selected) + 1) % order.length]), 4200);
  }
  function syncToggle() {
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    schedule();
  }
  function initialize() {
    if (initialized) return;
    const doc = artwork.contentDocument;
    svg = doc?.querySelector('svg');
    if (!svg) return;
    initialized = true;
    const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = '[data-style-token]{transition:fill .3s ease,stroke .3s ease}@media(prefers-reduced-motion:reduce){[data-style-token]{transition:none}}';
    svg.prepend(style);
    const syncTheme = () => svg.setAttribute('data-theme', document.documentElement.dataset.theme || 'light');
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    groups = { source: [], shared: [], products: [] };
    const fillTokens = { '#8057D5': 'dot', '#6239A9': 'text', '#633AA9': 'text', '#37295D': 'rowText', '#EEE7FD': 'row', '#E4D7FC': 'chip', '#F0E8FF': 'shared' };
    svg.querySelectorAll('rect,circle,text').forEach(node => {
      const token = fillTokens[node.getAttribute('fill')];
      // The product chips inherit fill from their parent group.
      const inherited = fillTokens[node.parentNode.getAttribute?.('fill')];
      const effectiveToken = token || inherited;
      if (!effectiveToken) return;
      const x = Number(node.getAttribute('x') || node.getAttribute('cx') || 0);
      const y = Number(node.getAttribute('y') || node.getAttribute('cy') || 0);
      if (y < 300) return; // Keep the editorial header intact.
      const group = x < 730 ? 'source' : x < 984 ? 'shared' : 'products';
      node.setAttribute('data-style-token', effectiveToken);
      groups[group].push({ node, attribute: 'fill', token: effectiveToken });
    });
    paths = [...svg.querySelectorAll('g[stroke="#BBA6E4"] > path')];
    paths.forEach((node, i) => {
      node.setAttribute('data-style-token', 'line');
      groups[i === 0 ? 'source' : 'shared'].push({ node, attribute: 'stroke', token: 'line' });
    });
    figure.querySelector('.cf-animation-toolbar').hidden = false;
    figure.querySelector('.cf-animation-state').hidden = false;
    choices.forEach(button => button.addEventListener('click', () => {
      paused = true;
      syncToggle();
      choose(button.dataset.color, true);
    }));
    toggle.addEventListener('click', () => {
      paused = !paused;
      if (paused) {
        clearTransition();
        Object.keys(groups).forEach(name => applyStage(name, colors[selected]));
        stage('products');
      }
      if (!paused && !reducedMotion.matches) choose(order[(order.indexOf(selected) + 1) % order.length]);
      syncToggle();
    });
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.15 }).observe(figure);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) paused = true;
      choose(selected);
      syncToggle();
    });
    document.addEventListener('visibilitychange', schedule);
    syncToggle();
  }
  artwork.addEventListener('load', initialize);
  initialize();
})();
