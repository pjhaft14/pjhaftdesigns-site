(() => {
  'use strict';
  const { escape, badge, storageKey } = window.CFValues;
  const { records, today } = window.CFOpportunities;
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const compactMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
  const dateText = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value);
  let config = window.CFValues.loadForView();
  let measure = 'amount';
  let selection = null;
  let toastTimer;
  const choice = key => window.CFValues.choiceFor(config, key);
  const label = key => choice(key).labels.en;
  const colors = key => window.CFValues.chartStyle(config, key);
  const regionBadge = key => badge(choice(key), config.enabled);
  const valueText = value => measure === 'amount' ? money(value) : `${value} ${value === 1 ? 'opportunity' : 'opportunities'}`;
  const shortValue = value => measure === 'amount' ? compactMoney(value) : String(value);
  const iconize = () => window.lucide?.createIcons();
  function reportRecords() {
    const period = $('report-period').value;
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return records.filter(record =>
      ($('report-scope').value !== 'mine' || record.owner === 'Maya Chen') &&
      (period === 'all' || (period === 'month' ? record.close.getMonth() === today.getMonth() && record.close.getFullYear() === today.getFullYear() : record.close.getMonth() === nextMonth.getMonth() && record.close.getFullYear() === nextMonth.getFullYear()))
    );
  }
  function groupsFor(rows) {
    const groups = new Map();
    rows.forEach(row => {
      if (!groups.has(row.region)) groups.set(row.region, { key: row.region, amount: 0, count: 0 });
      const group = groups.get(row.region);
      group.amount += row.amount;
      group.count++;
    });
    return [...groups.values()];
  }
  function sortedGroups(groups) {
    const order = $('chart-order').value;
    return [...groups].sort((a, b) => order === 'label' ? label(a.key).localeCompare(label(b.key)) : (a[measure] - b[measure]) * (order === 'value-asc' ? 1 : -1) || label(a.key).localeCompare(label(b.key)));
  }
  function renderBars(groups) {
    const ordered = sortedGroups(groups);
    const max = Math.max(1, ...ordered.map(group => group[measure]));
    const magnitude = 10 ** Math.floor(Math.log10(max / 4));
    const step = measure === 'count' ? Math.max(1, Math.ceil(max / 4)) : Math.ceil(max / 4 / magnitude) * magnitude;
    const limit = Math.ceil(max / step) * step;
    const left = 56, right = 584, top = 28, bottom = 204, height = bottom - top;
    const width = (right - left) / Math.max(1, ordered.length);
    let grid = '';
    for (let tick = 0; tick <= limit; tick += step) {
      const y = bottom - tick / limit * height;
      grid += `<line class="cfr-grid-line" x1="${left}" x2="${right}" y1="${y}" y2="${y}"/><text class="cfr-axis-label" x="46" y="${y + 4}" text-anchor="end">${shortValue(tick)}</text>`;
    }
    const bars = ordered.map((group, index) => {
      const palette = colors(group.key);
      const center = left + width * (index + .5);
      const barWidth = Math.min(76, width * .48);
      const barHeight = Math.max(2, group[measure] / limit * height);
      const y = bottom - barHeight;
      return `<g class="cfr-chart-shape" role="button" tabindex="0" data-region="${group.key}" aria-label="${escape(label(group.key))}: ${escape(valueText(group[measure]))}. Show opportunities." aria-pressed="false"><title>${escape(label(group.key))}: ${escape(valueText(group[measure]))}</title><rect data-chart-fill="${group.key}" x="${center - barWidth / 2}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="${palette.background}" stroke="${palette.iconColor}" stroke-width="1.2"/><text class="cfr-bar-value" x="${center}" y="${y - 10}" text-anchor="middle">${shortValue(group[measure])}</text></g>`;
    }).join('');
    $('bar-chart').innerHTML = `<svg viewBox="0 0 600 220" role="group" aria-label="${measure === 'amount' ? 'Pipeline amount' : 'Opportunity count'} by region">${grid}${bars}</svg>`;
    $('bar-labels').style.gridTemplateColumns = `repeat(${Math.max(1, ordered.length)}, minmax(0, 1fr))`;
    $('bar-labels').innerHTML = ordered.map(group => `<button type="button" data-region="${group.key}" aria-pressed="false" aria-label="Show ${escape(label(group.key))} opportunities">${regionBadge(group.key)}<small>${shortValue(group[measure])}</small></button>`).join('');
  }
  function renderDonut(groups) {
    // A separate order demonstrates that the value's identity survives chart position changes.
    const ordered = [...groups].sort((a, b) => label(a.key).localeCompare(label(b.key)));
    const total = groups.reduce((sum, group) => sum + group[measure], 0);
    const circumference = 2 * Math.PI * 78;
    let offset = 0;
    const segments = ordered.map(group => {
      const palette = colors(group.key);
      const fullLength = total ? group[measure] / total * circumference : 0;
      const gap = Math.min(6, fullLength * .08);
      const start = (offset + gap / 2) / circumference * Math.PI * 2 - Math.PI / 2;
      const end = (offset + fullLength - gap / 2) / circumference * Math.PI * 2 - Math.PI / 2;
      const point = (radius, angle) => `${120 + radius * Math.cos(angle)} ${120 + radius * Math.sin(angle)}`;
      const largeArc = end - start > Math.PI ? 1 : 0;
      const shape = `M ${point(98, start)} A 98 98 0 ${largeArc} 1 ${point(98, end)} L ${point(58, end)} A 58 58 0 ${largeArc} 0 ${point(58, start)} Z`;
      offset += fullLength;
      return `<g class="cfr-donut-segment" role="button" tabindex="0" data-region="${group.key}" aria-label="${escape(label(group.key))}: ${escape(valueText(group[measure]))}, ${Math.round(group[measure] / total * 100)} percent. Show opportunities." aria-pressed="false"><title>${escape(label(group.key))}: ${escape(valueText(group[measure]))}</title><path class="cfr-donut-edge" data-chart-fill="${group.key}" d="${shape}" fill="${palette.background}" stroke="${palette.iconColor}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
    }).join('');
    $('donut-chart').innerHTML = `<svg viewBox="0 0 240 240" role="group" aria-label="${measure === 'amount' ? 'Pipeline' : 'Opportunity'} share by region">${segments || '<circle cx="120" cy="120" r="78" fill="none" stroke="#e2e8f0" stroke-width="38"/>'}<text class="cfr-donut-total" x="120" y="119" text-anchor="middle">${shortValue(total)}</text><text class="cfr-donut-caption" x="120" y="140" text-anchor="middle">${measure === 'amount' ? 'Open pipeline' : 'Opportunities'}</text></svg>`;
    $('donut-legend').innerHTML = ordered.map(group => {
      const palette = colors(group.key);
      const styled = config.enabled && choice(group.key).style;
      return `<button class="cfr-legend-item" type="button" data-region="${group.key}" aria-pressed="false" aria-label="Show ${escape(label(group.key))} opportunities"><span class="cfr-legend-label">${styled ? '' : `<span class="cfr-legend-swatch" aria-hidden="true" style="--region-fill:${palette.background};--region-edge:${palette.iconColor}"></span>`}${regionBadge(group.key)}</span><span class="cfr-legend-value">${Math.round(group[measure] / total * 100)}%</span></button>`;
    }).join('');
  }
  function renderDetails() {
    const rows = reportRecords().filter(row => !selection || row.region === selection).sort((a, b) => a.close - b.close);
    $('detail-count').textContent = rows.length;
    $('details-summary').textContent = `${selection ? `${label(selection)} · ` : ''}${money(rows.reduce((sum, row) => sum + row.amount, 0))} in open pipeline`;
    $('clear-selection').hidden = !selection;
    $('report-rows').innerHTML = rows.map(row => `<tr><td>${escape(row.name)}<small>${escape(row.account)}</small></td><td>${regionBadge(row.region)}</td><td>${row.stage}</td><td class="cfr-money">${money(row.amount)}</td><td>${dateText(row.close)}</td><td>${row.owner}</td></tr>`).join('') || '<tr><td colspan="6">No opportunities match these filters.</td></tr>';
    $('report-row-count').textContent = `${rows.length} ${rows.length === 1 ? 'opportunity' : 'opportunities'}${selection ? ` in ${label(selection)}` : ''}`;
    document.querySelectorAll('[data-region]').forEach(element => {
      const active = element.dataset.region === selection;
      element.setAttribute('aria-pressed', String(active));
      element.style.opacity = selection && !active ? '.42' : '1';
    });
    iconize();
  }
  function render() {
    const rows = reportRecords();
    const groups = groupsFor(rows);
    if (!groups.some(group => group.key === selection)) selection = null;
    $('pipeline-total').textContent = compactMoney(rows.reduce((sum, row) => sum + row.amount, 0));
    $('pipeline-total').title = money(rows.reduce((sum, row) => sum + row.amount, 0));
    $('opportunity-total').textContent = rows.length;
    $('region-total').textContent = groups.length;
    $('chart-description').textContent = measure === 'amount' ? 'Sum of amount · USD' : 'Number of opportunities';
    document.querySelectorAll('[data-measure]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.measure === measure)));
    renderBars(groups);
    renderDonut(groups);
    renderDetails();
  }
  function refreshStyles() { config = window.CFValues.loadForView(); render(); }
  function selectRegion(key) {
    selection = selection === key ? null : key;
    renderDetails();
    document.querySelector('.cfr-table-scroll').scrollTop = 0;
  }
  document.querySelector('.cfr-charts').addEventListener('click', event => {
    const target = event.target.closest('[data-region]');
    if (target) selectRegion(target.dataset.region);
  });
  document.querySelector('.cfr-charts').addEventListener('keydown', event => {
    const target = event.target.closest('[data-region]');
    if (target?.tagName.toLowerCase() === 'g' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); selectRegion(target.dataset.region); }
  });
  document.querySelectorAll('[data-measure]').forEach(button => button.addEventListener('click', () => { measure = button.dataset.measure; render(); }));
  $('report-period').addEventListener('change', () => { selection = null; render(); });
  $('report-scope').addEventListener('change', () => { selection = null; render(); });
  $('chart-order').addEventListener('change', render);
  $('clear-selection').addEventListener('click', () => { selection = null; renderDetails(); });
  $('refresh-report').addEventListener('click', () => {
    refreshStyles();
    clearTimeout(toastTimer);
    $('report-toast').textContent = 'Report is up to date.';
    $('report-toast').hidden = false;
    toastTimer = setTimeout(() => { $('report-toast').hidden = true; }, 2400);
  });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refreshStyles(); });
  window.addEventListener('focus', refreshStyles);
  render();
})();
