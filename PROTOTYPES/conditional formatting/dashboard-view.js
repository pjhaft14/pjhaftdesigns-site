(() => {
  'use strict';
  const { escape, badge, storageKey, choiceFor, chartStyle } = window.CFValues;
  const { records, today } = window.CFOpportunities;
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const compactMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
  const dateText = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value);
  const opportunityIcon = document.querySelector('[data-list-navigation] .left-nav__tile').innerHTML;
  $('opportunity-widget-icon').innerHTML = opportunityIcon;
  let config = window.CFValues.loadForView();
  let selection = null;
  let currentRecord = null;
  let toastTimer;
  const dialog = $('dashboard-record-dialog');
  const choice = key => choiceFor(config, key);
  const label = key => choice(key).labels.en;
  const regionBadge = key => badge(choice(key), config.enabled);
  const iconize = () => window.lucide?.createIcons();
  function dashboardRecords() {
    const period = $('dashboard-period').value;
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return records.filter(record =>
      ($('dashboard-scope').value !== 'mine' || record.owner === 'Maya Chen') &&
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
    return [...groups.values()].sort((a, b) => b.amount - a.amount || label(a.key).localeCompare(label(b.key)));
  }
  function treemapLayout(groups, x = 0, y = 0, width = 100, height = 56) {
    if (!groups.length) return [];
    if (groups.length === 1) return [{ ...groups[0], x, y, width, height }];
    const total = groups.reduce((sum, group) => sum + group.amount, 0);
    let split = 1, sum = 0, best = Infinity;
    for (let index = 1; index < groups.length; index++) {
      sum += groups[index - 1].amount;
      const distance = Math.abs(total / 2 - sum);
      if (distance < best) { best = distance; split = index; }
    }
    const first = groups.slice(0, split), second = groups.slice(split);
    const ratio = first.reduce((sum, group) => sum + group.amount, 0) / total;
    return width >= height
      ? [...treemapLayout(first, x, y, width * ratio, height), ...treemapLayout(second, x + width * ratio, y, width * (1 - ratio), height)]
      : [...treemapLayout(first, x, y, width, height * ratio), ...treemapLayout(second, x, y + height * ratio, width, height * (1 - ratio))];
  }
  function renderChart(rows) {
    const groups = groupsFor(rows);
    const total = groups.reduce((sum, group) => sum + group.amount, 0);
    $('chart-total').textContent = `${rows.length} ${rows.length === 1 ? 'opportunity' : 'opportunities'} · ${groups.length} ${groups.length === 1 ? 'region' : 'regions'}`;
    $('dashboard-chart').innerHTML = treemapLayout(groups).map(group => {
      const style = chartStyle(config, group.key);
      const share = group.amount / total * 100;
      const compact = group.width < 25 || group.height / 56 < .4;
      return `<button type="button" class="cfd-treemap-tile${compact ? ' is-compact' : ''}" data-region="${group.key}" data-report-region="${group.key}" data-chart-fill="${group.key}" data-amount="${group.amount}" data-share="${share}" aria-pressed="false" aria-label="${escape(label(group.key))}: ${money(group.amount)}, ${Math.round(share)} percent of pipeline, ${group.count} ${group.count === 1 ? 'opportunity' : 'opportunities'}. Show opportunities." title="${escape(label(group.key))}: ${money(group.amount)} · ${Math.round(share)}% of pipeline" style="left:${group.x}%;top:${group.y / 56 * 100}%;width:${group.width}%;height:${group.height / 56 * 100}%;--tile-fill:${style.background};--tile-edge:${style.iconColor};--tile-text:${style.text}"><span class="cfd-treemap-label">${compact ? escape(label(group.key)) : regionBadge(group.key)}</span><strong>${compactMoney(group.amount)}</strong><span class="cfd-treemap-meta">${Math.round(share)}% · ${group.count} ${group.count === 1 ? 'deal' : 'deals'}</span></button>`;
    }).join('') || '<p class="cfd-empty">No opportunities match these filters.</p>';
  }
  function reportGroups(rows, field) {
    const groups = new Map();
    rows.forEach(row => {
      const name = row[field];
      if (!groups.has(name)) groups.set(name, { name, amount: 0, parts: new Map() });
      const group = groups.get(name);
      group.amount += row.amount;
      group.parts.set(row.region, (group.parts.get(row.region) || 0) + row.amount);
    });
    return [...groups.values()];
  }
  function reportScale(groups) {
    const max = Math.max(1, ...groups.map(group => group.amount));
    const magnitude = 10 ** Math.floor(Math.log10(max / 4));
    const step = Math.ceil(max / 4 / magnitude) * magnitude;
    return { step, limit: step * 4 };
  }
  function renderReportLegend(keys, reportName) {
    return keys.map(key => {
      const style = chartStyle(config, key);
      const styled = config.enabled && choice(key).style;
      return `<button type="button" data-region="${key}" data-report-region="${key}" aria-pressed="false" aria-label="${reportName}: show ${escape(label(key))} opportunities">${styled ? '' : `<span class="cfd-report-swatch" aria-hidden="true" style="--region-fill:${style.background};--region-edge:${style.iconColor}"></span>`}${regionBadge(key)}</button>`;
    }).join('');
  }
  function stackedRows(groups, keys) {
    const { step, limit } = reportScale(groups);
    const rows = groups.map(group => `<div class="cfd-stack-row"><div class="cfd-stack-summary"><span>${escape(group.name)}</span><strong>${money(group.amount)}</strong></div><div class="cfd-stack-track"><div class="cfd-stack-total" role="group" aria-label="${escape(group.name)} pipeline" style="width:${group.amount / limit * 100}%">${keys.filter(key => group.parts.has(key)).map(key => {
      const style = chartStyle(config, key);
      const amount = group.parts.get(key);
      return `<button class="cfd-stack-segment" type="button" data-region="${key}" data-report-region="${key}" data-chart-fill="${key}" data-report-group="${escape(group.name)}" data-amount="${amount}" aria-pressed="false" aria-label="${escape(label(key))} in ${escape(group.name)}: ${money(amount)}. Show opportunities." title="${escape(label(key))}: ${money(amount)}" style="flex-basis:${amount / group.amount * 100}%;background-color:${style.background};border-color:${style.iconColor}"></button>`;
    }).join('')}</div></div></div>`).join('');
    return `<div class="cfd-stacked-rows">${rows}</div><div class="cfd-axis cfd-stack-axis" aria-hidden="true">${Array.from({length: 5}, (_, index) => `<span>${compactMoney(step * index)}</span>`).join('')}</div>`;
  }
  function closeDateLines(rows, keys, chartWidth = 540) {
    const weekStart = date => {
      const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
      monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
      return monday;
    };
    if (!rows.length) return '<p class="cfd-empty">No opportunities match these filters.</p>';
    const first = weekStart(new Date(Math.min(...rows.map(row => row.close.getTime()))));
    const last = weekStart(new Date(Math.max(...rows.map(row => row.close.getTime()))));
    const weeks = [];
    for (let date = new Date(first); date <= last; date.setDate(date.getDate() + 7)) weeks.push(new Date(date));
    const series = keys.map(key => ({ key, points: weeks.map(week => rows.filter(row => row.region === key && weekStart(row.close).getTime() === week.getTime()).reduce((sum, row) => sum + row.amount, 0)) }));
    const { step, limit } = reportScale(series.flatMap(series => series.points.map(amount => ({amount}))));
    const left = chartWidth === 360 ? 49 : 60, right = chartWidth - 22, top = 28, bottom = 222;
    const x = index => weeks.length === 1 ? (left + right) / 2 : left + index / (weeks.length - 1) * (right - left);
    const y = amount => bottom - amount / limit * (bottom - top);
    const weekLabel = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let grid = '';
    for (let tick = 0; tick <= 4; tick++) {
      const ordinate = y(step * tick);
      grid += `<line class="cfd-report-grid-line" x1="${left}" x2="${right}" y1="${ordinate}" y2="${ordinate}"/><text class="cfd-report-axis-label" x="${left - 10}" y="${ordinate + 4}" text-anchor="end">${compactMoney(step * tick)}</text>`;
    }
    const lines = series.map(({key, points}) => {
      const style = chartStyle(config, key);
      const lineColor = style.line;
      const total = points.reduce((sum, amount) => sum + amount, 0);
      const path = points.map((amount, index) => `${index ? 'L' : 'M'}${x(index)},${y(amount)}`).join(' ');
      const markers = points.map((amount, index) => `<circle class="cfd-line-point" cx="${x(index)}" cy="${y(amount)}" r="4.5" fill="${style.background}" stroke="${lineColor}" stroke-width="2" data-week="${weekLabel(weeks[index])}" data-amount="${amount}"><title>${escape(label(key))} · Week of ${weekLabel(weeks[index])}: ${money(amount)}</title></circle>`).join('');
      return `<g class="cfd-report-segment cfd-line-series" role="button" tabindex="0" data-region="${key}" data-report-region="${key}" aria-pressed="false" aria-label="${escape(label(key))} expected close pipeline: ${money(total)}. Show opportunities."><path d="${path}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" data-line-region="${key}"/>${markers}</g>`;
    }).join('');
    const labels = weeks.map((week, index) => `<text class="cfd-report-axis-label" x="${x(index)}" y="${bottom + 25}" text-anchor="middle">${weekLabel(week)}</text>`).join('');
    return `<svg viewBox="0 0 ${chartWidth} 266" role="group" aria-label="Open pipeline amount by expected close week and region">${grid}${lines}${labels}</svg>`;
  }
  function renderAdditionalReports(rows) {
    const keys = groupsFor(rows).map(group => group.key).sort((a, b) => label(a).localeCompare(label(b)));
    const owners = reportGroups(rows, 'owner').sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
    $('close-report-legend').innerHTML = renderReportLegend(keys, 'Expected close report');
    $('owner-report-legend').innerHTML = renderReportLegend(keys, 'Sales rep report');
    $('close-report-chart').innerHTML = closeDateLines(rows, keys);
    $('close-report-mobile').innerHTML = closeDateLines(rows, keys, 360);
    $('owner-report-chart').innerHTML = stackedRows(owners, keys);
  }
  function updateSelection() {
    document.querySelectorAll('[data-report-region]').forEach(button => {
      const active = button.dataset.region === selection;
      button.setAttribute('aria-pressed', String(active));
      button.style.opacity = selection && !active ? '.42' : '1';
    });
    $('report-focus').hidden = !selection;
    $('report-focus-label').innerHTML = selection ? `Selected region ${regionBadge(selection)}` : '';
  }
  function renderOpportunities() {
    const rows = dashboardRecords().filter(record => !selection || record.region === selection).sort((a, b) => a.close - b.close);
    $('widget-count').textContent = rows.length;
    $('widget-description').textContent = selection ? `${label(selection)} deals · Sorted by expected close` : 'Your team’s open deals · Sorted by expected close';
    $('selected-region').hidden = !selection;
    document.querySelector('.cfd-opportunities-widget').classList.toggle('has-region-selection', Boolean(selection));
    $('selected-region-label').innerHTML = selection ? `Region ${regionBadge(selection)}` : '';
    $('dashboard-opportunities').innerHTML = rows.map(record => `<tr><td><button type="button" class="cfd-deal-name" data-open-record="${record.id}" title="${escape(record.name)}">${escape(record.name)}</button><small>${escape(record.account)}</small></td><td>${regionBadge(record.region)}</td><td class="cfd-money">${money(record.amount)}<small>${dateText(record.close)}</small></td><td><button class="cfp-icon-button" type="button" data-open-record="${record.id}" aria-label="Preview ${escape(record.name)}"><i data-lucide="chevron-right" aria-hidden="true"></i></button></td></tr>`).join('') || '<tr><td class="cfd-empty" colspan="4">No opportunities match these filters.</td></tr>';
    $('dashboard-row-count').textContent = `${rows.length} ${rows.length === 1 ? 'opportunity' : 'opportunities'}`;
    $('widget-amount').textContent = `${money(rows.reduce((sum, record) => sum + record.amount, 0))} in pipeline`;
    updateSelection();
    iconize();
  }
  function render() {
    const rows = dashboardRecords();
    const groups = groupsFor(rows);
    if (!groups.some(group => group.key === selection)) selection = null;
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    const closing = rows.filter(row => row.close.getMonth() === today.getMonth() && row.close.getFullYear() === today.getFullYear());
    $('dashboard-pipeline').textContent = compactMoney(total);
    $('dashboard-pipeline').title = money(total);
    $('pipeline-caption').textContent = 'Open opportunity amount';
    $('dashboard-count').textContent = rows.length;
    $('regions-caption').textContent = `Across ${groups.length} ${groups.length === 1 ? 'region' : 'regions'}`;
    $('dashboard-closing').textContent = compactMoney(closing.reduce((sum, row) => sum + row.amount, 0));
    $('closing-caption').textContent = `${closing.length} ${closing.length === 1 ? 'opportunity' : 'opportunities'} expected to close`;
    renderChart(rows);
    renderAdditionalReports(rows);
    renderOpportunities();
  }
  function openRecord(id, show = true) {
    currentRecord = records.find(record => record.id === id);
    if (!currentRecord) return;
    const r = currentRecord;
    $('dashboard-record-content').innerHTML = `<header class="cfl-record-header"><span>Opportunity preview</span><button class="cfp-icon-button" type="button" id="close-dashboard-record" aria-label="Close opportunity preview"><i data-lucide="x" aria-hidden="true"></i></button></header><div class="cfl-record-body"><span class="cfp-title-icon">${opportunityIcon}</span><h2 id="dashboard-record-name">${escape(r.name)}</h2><p class="cfl-record-account">${escape(r.account)}</p><dl class="cfl-record-fields"><div><dt>Region</dt><dd>${regionBadge(r.region)}</dd></div><div><dt>Sales stage</dt><dd><span class="cfl-stage">${r.stage}</span></dd></div><div><dt>Amount</dt><dd>${money(r.amount)}</dd></div><div><dt>Expected close</dt><dd>${dateText(r.close)}</dd></div><div><dt>Assigned to</dt><dd><span class="cfl-owner"><span class="cfl-avatar" aria-hidden="true">${r.initials}</span>${r.owner}</span></dd></div></dl><section class="cfl-record-note"><h3>Next step</h3><p>${escape(r.note)}</p></section></div>`;
    $('close-dashboard-record').addEventListener('click', () => dialog.close());
    iconize();
    if (show) dialog.showModal();
  }
  function selectRegion(key) {
    selection = key === selection ? null : key;
    renderOpportunities();
    document.querySelector('.cfd-opportunities-scroll').scrollTop = 0;
  }
  function refresh() {
    config = window.CFValues.loadForView();
    render();
    if (dialog.open && currentRecord) openRecord(currentRecord.id, false);
  }
  document.querySelector('.cfd-body').addEventListener('click', event => { const button = event.target.closest('[data-region]'); if (button) selectRegion(button.dataset.region); });
  document.querySelector('.cfd-additional-reports').addEventListener('keydown', event => {
    const group = event.target.closest('[data-report-region]');
    if (group?.tagName.toLowerCase() === 'g' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); selectRegion(group.dataset.region); }
  });
  $('clear-dashboard-region').addEventListener('click', () => { selection = null; renderOpportunities(); });
  $('clear-report-focus').addEventListener('click', () => { selection = null; renderOpportunities(); });
  $('dashboard-opportunities').addEventListener('click', event => { const button = event.target.closest('[data-open-record]'); if (button) openRecord(button.dataset.openRecord); });
  $('dashboard-scope').addEventListener('change', () => { selection = null; render(); });
  $('dashboard-period').addEventListener('change', () => { selection = null; render(); });
  $('refresh-dashboard').addEventListener('click', () => {
    refresh(); clearTimeout(toastTimer);
    $('dashboard-toast').textContent = 'Dashboard is up to date.';
    $('dashboard-toast').hidden = false;
    toastTimer = setTimeout(() => { $('dashboard-toast').hidden = true; }, 2400);
  });
  dialog.addEventListener('click', event => { if (event.target === dialog && event.clientX < dialog.getBoundingClientRect().left) dialog.close(); });
  dialog.addEventListener('close', () => { if (currentRecord) document.querySelector(`[data-open-record="${currentRecord.id}"]`)?.focus({preventScroll:true}); currentRecord = null; });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refresh(); });
  window.addEventListener('focus', refresh);
  render();
})();
