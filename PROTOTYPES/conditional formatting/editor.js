(() => {
  'use strict';
  const { presets, storageKey, iconsAllowed, hex, escape } = window.CFValues;
  const iconLabels = { x: 'X', 'triangle-alert': 'Caution', 'circle-alert': 'Alert', clock: 'Clock', star: 'Star', 'trending-up': 'Trending up', 'trending-down': 'Trending down' };
  const plainStyle = () => ({ preset: 'custom', background: '#F1F5F9', text: '#334155', icon: '', iconColor: '#334155', bold: false, italic: false, underline: false, strike: false });
  const clone = value => JSON.parse(JSON.stringify(value));
  let saved = window.CFValues.load();
  // Start the setup walkthrough without pre-applied styles, including older demo data.
  // Run once so subsequent styles explicitly saved in the editor remain available.
  if (!saved.editorUnstyledStartVersion) {
    saved.choices.forEach(choice => { choice.style = null; });
    saved.enabled = true;
    saved.editorUnstyledStartVersion = 1;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Keep the clean setup available in memory. */ }
  }
  let draft = clone(saved);
  const language = 'en';
  let selectedId = null;
  let pendingRemove = null;
  let pointerDrag = null;
  let toastTimer;
  const colorErrors = new Set();
  const $ = id => document.getElementById(id);
  const rows = $('choice-rows');
  const panel = $('style-panel');
  const mobilePanel = matchMedia('(max-width: 1099px)');
  const label = choice => choice.labels[language];
  const getChoice = id => draft.choices.find(choice => choice.id === id);
  const icons = () => window.lucide?.createIcons();
  const announce = text => { $('announcements').textContent = text; };
  const dirty = () => JSON.stringify(draft) !== JSON.stringify(saved);
  const rowFor = id => [...rows.children].find(row => row.dataset.id === id);
  const regionName = choice => window.CFValues.regionNames[choice.key.trim().toLowerCase()] || '';

  const badge = choice => window.CFValues.badge(choice, draft.enabled, language);
  function validationErrors() {
    const errors = [];
    if (!draft.name.trim()) errors.push('Enter a dropdown name.');
    if (!draft.choices.length) errors.push('Add at least one choice before saving.');
    const keys = draft.choices.map(choice => choice.key.trim().toLowerCase());
    if (keys.some(key => !key)) errors.push('Each choice needs an item name.');
    if (new Set(keys).size !== keys.length) errors.push('Item names must be unique.');
    if (draft.choices.some(choice => !choice.labels.en.trim() || !choice.labels.fr.trim())) errors.push('Each choice needs a display label.');
    if (colorErrors.size) errors.push('Use a valid 6-digit HEX color, such as #6239A9.');
    return errors;
  }
  function updateStatus() {
    const changed = dirty();
    const errors = validationErrors();
    $('save').disabled = !changed || errors.length > 0;
    $('discard').disabled = !changed;
    $('save-state').textContent = changed ? 'Unsaved changes' : 'All changes saved';
    $('save-state').classList.toggle('is-dirty', changed);
    $('validation').hidden = !errors.length;
    $('validation').textContent = errors.join(' ');
    const keys = draft.choices.map(choice => choice.key.trim().toLowerCase());
    rows.querySelectorAll('[data-edit="key"]').forEach(input => {
      const value = input.value.trim().toLowerCase();
      input.setAttribute('aria-invalid', String(!value || keys.filter(key => key === value).length > 1));
    });
    rows.querySelectorAll('[data-edit="label"]').forEach(input => input.setAttribute('aria-invalid', String(!input.value.trim())));
  }
  function renderRows() {
    const query = $('choice-search').value.trim().toLowerCase();
    const choices = draft.choices.filter(choice => `${choice.key} ${label(choice)} ${regionName(choice)}`.toLowerCase().includes(query));
    rows.innerHTML = choices.map(choice => `<div role="row" class="cfp-choice-row${selectedId === choice.id ? ' is-selected' : ''}" data-id="${escape(choice.id)}" aria-selected="${selectedId === choice.id}" tabindex="${draft.enabled ? '0' : '-1'}" data-style-selectable="${draft.enabled}">
      <div role="cell" class="cfp-drag-cell"><button class="cfp-icon-button cfp-drag-handle" type="button" data-drag-id="${escape(choice.id)}" aria-label="Reorder ${escape(label(choice))}. Use Up and Down arrow keys." title="Drag to reorder"><i data-lucide="grip-vertical" aria-hidden="true"></i></button></div>
      <div role="cell" class="cfp-key-cell" data-label="Item name"><input class="cfp-choice-key" data-edit="key" value="${escape(choice.key)}" aria-label="Item name for ${escape(label(choice))}" autocomplete="off" spellcheck="false"></div>
      <div role="cell" class="cfp-label-cell" data-label="Display label"><input data-edit="label" value="${escape(label(choice))}" aria-label="Display label for ${escape(choice.key)}" autocomplete="off"></div>
      <div role="cell" class="cfp-preview-cell"><div class="cfp-choice-preview">${badge(choice)}</div></div>
      <div role="cell" class="cfp-row-actions"><button class="cfp-icon-button" type="button" data-action="remove" aria-label="Remove ${escape(label(choice))}" title="Remove choice"><i data-lucide="trash-2" aria-hidden="true"></i></button></div>
    </div>`).join('');
    $('choice-count').textContent = draft.choices.length;
    $('list-summary').textContent = query ? `${choices.length} of ${draft.choices.length} choices` : `${draft.choices.length} choices`;
    $('empty-results').hidden = choices.length > 0;
    icons();
    updateStatus();
    if (!mobilePanel.matches && draft.enabled && draft.choices.length && !getChoice(selectedId)) {
      openPanel(choices[0]?.id || draft.choices[0].id, { focusPanel: false });
    }
  }
  function refreshPreviews() {
    draft.choices.forEach(choice => {
      const row = rowFor(choice.id);
      if (row) {
        row.querySelector('.cfp-choice-preview').innerHTML = badge(choice);
        row.querySelector('[data-action="remove"]').setAttribute('aria-label', `Remove ${label(choice)}`);
        row.querySelector('[data-drag-id]').setAttribute('aria-label', `Reorder ${label(choice)}. Use Up and Down arrow keys.`);
      }
    });
    const selected = getChoice(selectedId);
    if (selected && !panel.hidden) panel.querySelector('.cfp-panel-preview > div').innerHTML = badge(selected);
    icons();
    updateStatus();
  }
  function ensureStyle(choice) {
    if (!choice.style) choice.style = plainStyle();
    return choice.style;
  }
  function setModalState() {
    const modal = !panel.hidden && mobilePanel.matches;
    document.querySelector('.cfp-editor-pane').inert = modal;
    document.querySelector('.cfp-page-heading').inert = modal;
    document.querySelector('.topbar').inert = modal;
    document.querySelector('.left-nav').inert = modal;
    if (modal) { panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); }
    else { panel.removeAttribute('role'); panel.removeAttribute('aria-modal'); }
  }
  function renderPanel() {
    const choice = getChoice(selectedId);
    if (!choice) return;
    const focused = document.activeElement?.dataset.control;
    const style = choice.style || plainStyle();
    const preset = choice.style?.preset || 'none';
    const colorField = (name, title) => `<label class="cfp-color-field"><span>${title}</span><span class="cfp-color-input"><input type="color" data-color="${name}" value="${style[name]}" aria-label="${title}"><input type="text" data-hex="${name}" data-control="hex-${name}" value="${style[name]}" aria-label="${title} HEX" spellcheck="false" maxlength="7"></span></label>`;
    panel.innerHTML = `<header class="cfp-panel-heading"><div class="cfp-panel-title"><h2 id="style-title" tabindex="-1">Style value</h2><p>${escape(label(choice))}</p></div><div class="cfp-panel-header-actions"><div class="cfp-panel-preview"><p>Live preview</p><div>${badge(choice)}</div></div><button class="cfp-icon-button" type="button" data-action="close-panel" aria-label="Close style panel"><i data-lucide="x" aria-hidden="true"></i></button></div></header>
      <div class="cfp-panel-body">
      <section class="cfp-panel-section"><h3>Style preset</h3><div class="cfp-preset-grid" role="group" aria-label="Style presets"><button class="cfp-preset" type="button" data-preset="none" data-control="preset-none" aria-pressed="${preset === 'none'}"><span class="cfp-preset-sample" style="background:#f1f5f9;color:#64748b">Aa</span><span>None</span></button>${Object.entries(presets).map(([key, value]) => `<button class="cfp-preset" type="button" data-preset="${key}" data-control="preset-${key}" aria-pressed="${preset === key}"><span class="cfp-preset-sample" style="background:${value.background};color:${value.text}">Aa</span><span>${value.label}</span></button>`).join('')}</div></section>
      <section class="cfp-panel-section"><h3>Text styling</h3><div class="cfp-text-tools" role="group" aria-label="Text styling">${[['bold', 'Bold', 'bold'], ['italic', 'Italic', 'italic'], ['underline', 'Underline', 'underline'], ['strike', 'Strikethrough', 'strikethrough']].map(([key, title, icon]) => `<button type="button" data-text="${key}" data-control="text-${key}" aria-label="${title}" aria-pressed="${Boolean(style[key])}" title="${title}"><i data-lucide="${icon}" aria-hidden="true"></i></button>`).join('')}</div></section>
      <section class="cfp-panel-section"><div class="cfp-color-fields">${colorField('text', 'Text color')}${colorField('background', 'Background')}</div><p class="cfp-field-error" id="color-error" role="alert" hidden>Use a 6-digit HEX color, such as #6239A9.</p></section>
      <section class="cfp-panel-section"><h3>Icon</h3><div class="cfp-icon-grid" role="group" aria-label="Value icon"><button type="button" data-icon="none" data-control="icon-none" aria-label="No icon" aria-pressed="${!style.icon}" title="No icon"><i data-lucide="minus" aria-hidden="true"></i></button>${iconsAllowed.map(icon => `<button type="button" data-icon="${icon}" data-control="icon-${icon}" aria-label="${iconLabels[icon] || icon.replaceAll('-', ' ')} icon" aria-pressed="${style.icon === icon}" title="${iconLabels[icon] || icon.replaceAll('-', ' ')}"><i data-lucide="${icon}" aria-hidden="true"></i></button>`).join('')}</div></section>
      <section class="cfp-panel-section"><div class="cfp-color-fields">${colorField('iconColor', 'Icon color')}</div></section></div>
      <footer class="cfp-panel-footer"><button class="btn btn--ghost" type="button" data-action="clear-style"><i data-lucide="eraser" aria-hidden="true"></i>Remove styling</button><button class="btn btn--primary" type="button" data-action="close-panel">Done</button></footer>`;
    icons();
    if (focused) panel.querySelector(`[data-control="${focused}"]`)?.focus();
  }
  function openPanel(id, { focusPanel = true } = {}) {
    if (!draft.enabled || !getChoice(id)) return;
    selectedId = id;
    colorErrors.clear();
    panel.hidden = false;
    $('editor-layout').classList.add('has-panel');
    // Keep the existing inputs mounted so selecting a row does not interrupt editing.
    [...rows.children].forEach(row => {
      const selected = row.dataset.id === id;
      row.classList.toggle('is-selected', selected);
      row.setAttribute('aria-selected', String(selected));
    });
    updateStatus();
    renderPanel();
    setModalState();
    if (focusPanel || mobilePanel.matches) $('style-title').focus({ preventScroll: true });
  }
  function closePanel(restoreFocus = true) {
    const previousId = selectedId;
    selectedId = null;
    colorErrors.clear();
    panel.hidden = true;
    panel.innerHTML = '';
    $('editor-layout').classList.remove('has-panel');
    setModalState();
    renderRows();
    if (restoreFocus) rowFor(previousId)?.focus();
  }
  function reorder(id, toIndex, focus = false) {
    const fromIndex = draft.choices.findIndex(choice => choice.id === id);
    if (fromIndex < 0 || toIndex < 0 || toIndex >= draft.choices.length || fromIndex === toIndex) return;
    const [choice] = draft.choices.splice(fromIndex, 1);
    draft.choices.splice(toIndex, 0, choice);
    $('sort-choices').value = 'manual';
    renderRows();
    announce(`${label(choice)} moved to position ${toIndex + 1} of ${draft.choices.length}.`);
    if (focus) rowFor(id)?.querySelector('[data-drag-id]')?.focus();
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500);
  }

  rows.addEventListener('input', event => {
    const input = event.target.closest('[data-edit]');
    if (!input) return;
    const choice = getChoice(input.closest('[data-id]').dataset.id);
    if (input.dataset.edit === 'key') choice.key = input.value;
    else choice.labels[language] = input.value;
    refreshPreviews();
    if (selectedId === choice.id) panel.querySelector('.cfp-panel-title p').textContent = label(choice);
  });
  rows.addEventListener('click', event => {
    const row = event.target.closest('.cfp-choice-row');
    if (!row) return;
    const choice = getChoice(row.dataset.id);
    const button = event.target.closest('[data-action]');
    if (!button) {
      if (!event.target.closest('button') && selectedId !== choice.id) {
        openPanel(choice.id, { focusPanel: !event.target.closest('input') });
      }
      return;
    }
    if (button.dataset.action === 'remove') {
      pendingRemove = choice.id;
      $('remove-title').textContent = `Remove ${label(choice)}?`;
      $('remove-dialog').showModal();
    }
  });
  rows.addEventListener('keydown', event => {
    if (event.target.matches('.cfp-choice-row') && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openPanel(event.target.dataset.id);
      return;
    }
    const handle = event.target.closest('[data-drag-id]');
    if (!handle || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const index = draft.choices.findIndex(choice => choice.id === handle.dataset.dragId);
    reorder(handle.dataset.dragId, index + (event.key === 'ArrowUp' ? -1 : 1), true);
  });
  rows.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-drag-id]');
    if (!handle || event.button !== 0) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    pointerDrag = { id: handle.dataset.dragId, startY: event.clientY, handle, pointerId: event.pointerId, moved: false, targetIndex: draft.choices.findIndex(choice => choice.id === handle.dataset.dragId) };
  });
  rows.addEventListener('pointermove', event => {
    if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
    const delta = event.clientY - pointerDrag.startY;
    if (!pointerDrag.moved && Math.abs(delta) < 4) return;
    pointerDrag.moved = true;
    const source = rowFor(pointerDrag.id);
    source.classList.add('is-dragging');
    source.style.transform = `translateY(${delta}px)`;
    let nearest = null;
    let distance = Infinity;
    [...rows.children].forEach(row => {
      row.classList.remove('is-drop-target');
      const rect = row.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - (row === source ? delta : 0);
      const currentDistance = Math.abs(event.clientY - center);
      if (currentDistance < distance) { distance = currentDistance; nearest = row; }
    });
    if (nearest) {
      pointerDrag.targetIndex = draft.choices.findIndex(choice => choice.id === nearest.dataset.id);
      if (nearest !== source) nearest.classList.add('is-drop-target');
    }
  });
  function finishDrag(cancelled = false) {
    if (!pointerDrag) return;
    const drag = pointerDrag;
    pointerDrag = null;
    if (drag.handle.hasPointerCapture(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId);
    rows.querySelectorAll('.is-dragging,.is-drop-target').forEach(row => { row.classList.remove('is-dragging', 'is-drop-target'); row.style.transform = ''; });
    if (!cancelled && drag.moved) reorder(drag.id, drag.targetIndex, true);
  }
  rows.addEventListener('pointerup', () => finishDrag());
  rows.addEventListener('pointercancel', () => finishDrag(true));
  panel.addEventListener('click', event => {
    const button = event.target.closest('button');
    const choice = getChoice(selectedId);
    if (!button || !choice) return;
    if (button.dataset.action === 'close-panel') { closePanel(); return; }
    if (button.dataset.action === 'clear-style' || button.dataset.preset === 'none') choice.style = null;
    else if (button.dataset.preset) choice.style = { ...plainStyle(), ...presets[button.dataset.preset], preset: button.dataset.preset, icon: 'circle' };
    else if (button.dataset.text) { const style = ensureStyle(choice); style[button.dataset.text] = !style[button.dataset.text]; }
    else if (button.dataset.icon) ensureStyle(choice).icon = button.dataset.icon === 'none' ? '' : button.dataset.icon;
    else return;
    colorErrors.clear();
    renderPanel();
    refreshPreviews();
  });
  function setColor(input) {
    const choice = getChoice(selectedId);
    if (!choice) return;
    const key = input.dataset.color || input.dataset.hex;
    const value = input.value.toUpperCase();
    if (!hex(value)) {
      colorErrors.add(key);
      input.setAttribute('aria-invalid', 'true');
      $('color-error').hidden = false;
      updateStatus();
      return;
    }
    colorErrors.delete(key);
    input.setAttribute('aria-invalid', 'false');
    const style = ensureStyle(choice);
    style[key] = value;
    style.preset = 'custom';
    panel.querySelector(`[data-hex="${key}"]`).value = value;
    panel.querySelector(`[data-hex="${key}"]`).setAttribute('aria-invalid', 'false');
    panel.querySelector(`[data-color="${key}"]`).value = value;
    panel.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    $('color-error').hidden = colorErrors.size === 0;
    refreshPreviews();
  }
  panel.addEventListener('input', event => { if (event.target.matches('[data-color],[data-hex]')) setColor(event.target); });
  panel.addEventListener('change', event => { if (event.target.matches('[data-hex]')) setColor(event.target); });
  document.addEventListener('keydown', event => {
    if (panel.hidden || $('remove-dialog').open) return;
    if (event.key === 'Escape' && mobilePanel.matches) { event.preventDefault(); closePanel(); }
    if (event.key === 'Tab' && mobilePanel.matches) {
      const focusable = [...panel.querySelectorAll('button:not(:disabled),input,select')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === $('style-title'))) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  mobilePanel.addEventListener('change', () => {
    if (mobilePanel.matches) closePanel(false);
    else renderRows();
    setModalState();
  });
  $('remove-dialog').addEventListener('close', () => {
    if ($('remove-dialog').returnValue === 'remove' && pendingRemove) {
      const choice = getChoice(pendingRemove);
      draft.choices = draft.choices.filter(value => value.id !== pendingRemove);
      if (selectedId === pendingRemove) closePanel(false);
      renderRows();
      announce(`${label(choice)} removed. Save changes to update the dropdown.`);
      $('add-choice').focus();
    }
    pendingRemove = null;
  });
  $('choice-search').addEventListener('input', renderRows);
  $('dropdown-name').addEventListener('input', event => { draft.name = event.target.value; updateStatus(); });
  $('styling-enabled').addEventListener('change', event => {
    draft.enabled = event.target.checked;
    if (!draft.enabled) closePanel(false);
    renderRows();
  });
  $('sort-choices').addEventListener('change', event => {
    if (event.target.value === 'manual') return;
    const direction = event.target.value === 'asc' ? 1 : -1;
    draft.choices.sort((a, b) => label(a).localeCompare(label(b), language, { sensitivity: 'base' }) * direction);
    renderRows();
    announce('Choices sorted by display label.');
  });
  $('add-choice').addEventListener('click', () => {
    $('add-form').hidden = false;
    $('add-error').hidden = true;
    $('new-key').focus();
  });
  $('cancel-add').addEventListener('click', () => { $('add-form').hidden = true; $('add-form').reset(); $('add-choice').focus(); });
  $('add-form').addEventListener('submit', event => {
    event.preventDefault();
    const key = $('new-key').value.trim();
    const text = $('new-label').value.trim();
    const message = !key || !text ? 'Enter an item name and display label.' : draft.choices.some(choice => choice.key.trim().toLowerCase() === key.toLowerCase()) ? 'That item name already exists. Choose a unique name.' : '';
    if (message) { $('add-error').textContent = message; $('add-error').hidden = false; return; }
    draft.choices.push({ id: crypto.randomUUID(), key, labels: { en: text, fr: text }, style: null });
    $('choice-search').value = '';
    $('sort-choices').value = 'manual';
    $('add-form').reset();
    $('add-form').hidden = true;
    renderRows();
    announce(`${text} added to the dropdown.`);
    $('add-choice').focus();
  });
  $('discard').addEventListener('click', () => {
    draft = clone(saved);
    $('dropdown-name').value = draft.name;
    $('styling-enabled').checked = draft.enabled;
    $('add-form').hidden = true;
    closePanel(false);
    renderRows();
    toast('Unsaved changes discarded.');
  });
  $('save').addEventListener('click', () => {
    if (validationErrors().length) { updateStatus(); return; }
    draft.name = draft.name.trim();
    draft.choices.forEach(choice => { choice.key = choice.key.trim(); });
    draft.formattingConfigured = true;
    saved = clone(draft);
    let persisted = true;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { persisted = false; }
    closePanel(false);
    renderRows();
    toast(persisted ? 'Dropdown saved. Your team will see the updated labels and styling.' : 'Changes saved for this session.');
  });
  document.querySelectorAll('[data-list-link],[data-dashboard-link]').forEach(link => link.addEventListener('click', event => {
    if (dirty() && !window.confirm('You have unsaved changes. Leave the editor without saving?')) event.preventDefault();
  }));
  document.addEventListener('cf:before-navigate', event => {
    if (dirty() && !window.confirm('You have unsaved changes. Leave the editor without saving?')) event.preventDefault();
  });
  $('dropdown-name').value = draft.name;
  $('styling-enabled').checked = draft.enabled;
  renderRows();
})();
