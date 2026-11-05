(() => {
  'use strict';
  const { escape, storageKey, badge } = window.CFValues;
  const $ = id => document.getElementById(id);
  const opportunityIcon = document.querySelector('.cfl-page-heading .cfp-title-icon').innerHTML;
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const { today, records } = window.CFOpportunities;
  let config = window.CFValues.loadForView();
  let view = 'all';
  let sort = { field: 'close', direction: 1 };
  const sortLabels = { name: 'Opportunity', region: 'Region', stage: 'Sales stage', amount: 'Amount', close: 'Expected close', owner: 'Assigned to' };
  const textOrder = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
  const regions = new Set();
  const selected = new Set();
  let currentRecord = null;
  let toastTimer;
  const dialog = $('record-dialog');
  const iconize = () => window.lucide?.createIcons();
  const regionChoice = key => config.choices.find(choice => choice.key.toLowerCase() === key) || { labels: { en: key.toUpperCase() }, style: null };
  const regionBadge = key => badge(regionChoice(key), config.enabled);
  const dateText = date => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  const sortValue = record => sort.field === 'region' ? regionChoice(record.region).labels.en : record[sort.field];
  function filteredRecords() {
    const query = $('list-search').value.trim().toLowerCase();
    return records.filter(record =>
      (view !== 'mine' || record.owner === 'Maya Chen') &&
      (view !== 'month' || (record.close.getMonth() === today.getMonth() && record.close.getFullYear() === today.getFullYear())) &&
      (!regions.size || regions.has(record.region)) &&
      (!query || `${record.name} ${record.account} ${regionChoice(record.region).labels.en} ${record.stage} ${record.owner}`.toLowerCase().includes(query))
    ).sort((a, b) => {
      const left = sortValue(a), right = sortValue(b);
      const comparison = typeof left === 'string' ? textOrder.compare(left, right) : left - right;
      return comparison * sort.direction || textOrder.compare(a.name, b.name);
    });
  }
  function renderOptions() {
    const keys = [...new Set(records.map(record => record.region))];
    $('region-options').innerHTML = keys.map(key => `<label><input type="checkbox" value="${key}" ${regions.has(key) ? 'checked' : ''} aria-label="${escape(regionChoice(key).labels.en)}">${regionBadge(key)}</label>`).join('');
    iconize();
  }
  function updateSelection(visible) {
    $('selected-summary').hidden = selected.size === 0;
    $('selected-summary').textContent = `${selected.size} selected`;
    $('select-all').checked = visible.length > 0 && visible.every(record => selected.has(record.id));
    $('select-all').indeterminate = visible.some(record => selected.has(record.id)) && !$('select-all').checked;
    $('select-all').disabled = !visible.length;
  }
  function render(resetScroll = false) {
    const results = filteredRecords();
    const visible = results;
    $('opportunity-rows').innerHTML = visible.map(record => `<tr class="${selected.has(record.id) ? 'is-selected' : ''}"><td class="cfl-select-cell"><input type="checkbox" data-select="${record.id}" aria-label="Select ${escape(record.name)}" ${selected.has(record.id) ? 'checked' : ''}></td><td><button class="cfl-name" type="button" data-open="${record.id}">${escape(record.name)}</button><span class="cfl-account">${escape(record.account)}</span></td><td class="cfl-region">${regionBadge(record.region)}</td><td><span class="cfl-stage">${record.stage}</span></td><td class="cfl-amount">${money(record.amount)}</td><td class="cfl-close">${dateText(record.close)}</td><td><span class="cfl-owner"><span class="cfl-avatar" aria-hidden="true">${record.initials}</span>${record.owner}</span></td><td class="cfl-preview-cell"><button type="button" class="cfp-icon-button" data-open="${record.id}" aria-label="Preview ${escape(record.name)}"><i data-lucide="chevron-right" aria-hidden="true"></i></button></td></tr>`).join('');
    $('total-count').textContent = records.length;
    $('result-summary').innerHTML = `<strong>${results.length} ${results.length === 1 ? 'opportunity' : 'opportunities'}</strong> <span aria-hidden="true">·</span> ${money(results.reduce((sum, record) => sum + record.amount, 0))} in pipeline`;
    $('list-count').textContent = `${results.length} of ${records.length} opportunities`;
    $('list-empty').hidden = results.length !== 0;
    const hasFilters = regions.size > 0 || Boolean($('list-search').value);
    $('clear-filters').hidden = !hasFilters;
    $('filter-label').textContent = regions.size === 1 ? regionChoice([...regions][0]).labels.en : regions.size ? `Region (${regions.size})` : 'Region';
    $('region-filter').classList.toggle('is-filtered', regions.size > 0);
    document.querySelectorAll('[data-sort]').forEach(button => {
      const active = sort.field === button.dataset.sort;
      button.closest('th').setAttribute('aria-sort', active ? sort.direction === 1 ? 'ascending' : 'descending' : 'none');
      button.innerHTML = `${sortLabels[button.dataset.sort]} <i data-lucide="${active ? sort.direction === 1 ? 'arrow-up' : 'arrow-down' : 'arrow-up-down'}" aria-hidden="true"></i>`;
    });
    updateSelection(visible);
    if (resetScroll) document.querySelector('.cfl-table-scroll').scrollTop = 0;
    iconize();
  }
  function showRecord(id, open = true) {
    currentRecord = records.find(record => record.id === id);
    if (!currentRecord) return;
    const r = currentRecord;
    $('record-content').innerHTML = `<header class="cfl-record-header"><span>Opportunity preview</span><button class="cfp-icon-button" type="button" id="close-record" aria-label="Close opportunity preview"><i data-lucide="x" aria-hidden="true"></i></button></header><div class="cfl-record-body"><span class="cfp-title-icon">${opportunityIcon}</span><h2 id="record-name">${escape(r.name)}</h2><p class="cfl-record-account">${escape(r.account)}</p><dl class="cfl-record-fields"><div><dt>Region</dt><dd>${regionBadge(r.region)}</dd></div><div><dt>Sales stage</dt><dd><span class="cfl-stage">${r.stage}</span></dd></div><div><dt>Amount</dt><dd>${money(r.amount)}</dd></div><div><dt>Expected close</dt><dd>${dateText(r.close)}</dd></div><div><dt>Assigned to</dt><dd><span class="cfl-owner"><span class="cfl-avatar" aria-hidden="true">${r.initials}</span>${r.owner}</span></dd></div></dl><section class="cfl-record-note"><h3>Next step</h3><p>${escape(r.note)}</p></section></div>`;
    $('close-record').addEventListener('click', () => dialog.close());
    iconize();
    if (open) dialog.showModal();
  }
  function setView(next) {
    view = next;
    document.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active) $('list-content').setAttribute('aria-labelledby', button.id);
    });
    render(true);
  }
  function setFilterOpen(open) {
    $('filter-panel').hidden = !open;
    $('region-filter').setAttribute('aria-expanded', String(open));
  }
  function resetFilters() { regions.clear(); $('list-search').value = ''; renderOptions(); render(true); }
  function refreshConfig() {
    config = window.CFValues.loadForView();
    renderOptions();
    render();
    if (dialog.open && currentRecord) showRecord(currentRecord.id, false);
  }
  $('list-search').addEventListener('input', () => render(true));
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
    button.addEventListener('keydown', event => {
      const tabs = [...document.querySelectorAll('[data-view]')];
      let index = tabs.indexOf(button);
      if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[index].focus(); setView(tabs[index].dataset.view);
    });
  });
  $('region-filter').addEventListener('click', () => setFilterOpen($('filter-panel').hidden));
  $('region-options').addEventListener('change', event => { if (event.target.checked) regions.add(event.target.value); else regions.delete(event.target.value); render(true); });
  $('clear-regions').addEventListener('click', () => { regions.clear(); renderOptions(); render(true); });
  $('clear-filters').addEventListener('click', resetFilters);
  $('reset-empty').addEventListener('click', resetFilters);
  document.addEventListener('click', event => { if (!event.target.closest('.cfl-filter-host')) setFilterOpen(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('filter-panel').hidden) { setFilterOpen(false); $('region-filter').focus(); } });
  $('opportunity-rows').addEventListener('click', event => { const button = event.target.closest('[data-open]'); if (button) showRecord(button.dataset.open); });
  $('opportunity-rows').addEventListener('change', event => { if (!event.target.dataset.select) return; if (event.target.checked) selected.add(event.target.dataset.select); else selected.delete(event.target.dataset.select); render(); });
  $('select-all').addEventListener('change', event => { filteredRecords().forEach(record => event.target.checked ? selected.add(record.id) : selected.delete(record.id)); render(); });
  document.querySelectorAll('[data-sort]').forEach(button => button.addEventListener('click', () => { sort = { field: button.dataset.sort, direction: sort.field === button.dataset.sort ? -sort.direction : button.dataset.sort === 'amount' ? -1 : 1 }; render(true); }));
  $('refresh-list').addEventListener('click', () => { refreshConfig(); clearTimeout(toastTimer); $('list-toast').textContent = 'Opportunity list is up to date.'; $('list-toast').hidden = false; toastTimer = setTimeout(() => { $('list-toast').hidden = true; }, 2400); });
  dialog.addEventListener('click', event => { if (event.target === dialog && event.clientX < dialog.getBoundingClientRect().left) dialog.close(); });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refreshConfig(); });
  window.addEventListener('focus', refreshConfig);
  renderOptions();
  render();
})();
