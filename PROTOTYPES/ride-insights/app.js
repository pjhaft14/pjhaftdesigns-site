/* Sensor values, route timing, inventory, and work requests are illustrative. */
const events = {
  brake: { name: 'Brake actuator', zone: 'Zone 03', side: 'A', severity: 'High', id: 'SM-A-Z03-BA07', location: 'Side A / Zone 03', description: 'The brake is taking longer than normal to respond.', signal: 'Brake response time', value: '420 ms', baseline: '280–340 ms', horizon: '15.3', probability: '92', part: 'Brake actuator assembly', sku: 'BA-204', history: 'Actuator inspection completed · 14 days ago', action: 'Review before next operating day' },
  lift: { name: 'Lift motor', zone: 'Main lift', side: 'A', severity: 'Watch', id: 'SM-A-L01-M02', location: 'Side A / Main lift', description: 'The motor is vibrating more than usual.', signal: 'Vibration', value: '3.8 mm/s', baseline: '1.5–3.0 mm/s', horizon: '32', probability: '76', part: 'Motor bearing assembly', sku: 'MB-118', history: 'Lubrication completed · 21 days ago', action: 'Review trend at next inspection' },
  sensor: { name: 'Proximity sensor', zone: 'Zone 07', side: 'B', severity: 'Watch', id: 'SM-B-Z07-PS03', location: 'Side B / Zone 07', description: 'The sensor signal is less consistent than usual.', signal: 'Signal quality', value: '91%', baseline: '97–100%', horizon: '28', probability: '71', part: 'Proximity sensor', sku: 'PS-072', history: 'Sensor alignment checked · 8 days ago', action: 'Review at next maintenance window' }
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let selectedEvent = 'brake';
let requests = [];
let activeTrack = 'A';
const defaultZoom = 1.2;
let zoom = defaultZoom;
let previousFocus;
let modalReturnFocus;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
const icons = () => {
  window.lucide?.createIcons();
  $$('svg.lucide').forEach(icon => { icon.setAttribute('aria-hidden', 'true'); icon.setAttribute('focusable', 'false'); });
};
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderAlerts() {
  $('#alert-list').innerHTML = Object.entries(events).map(([key, event]) => `<button class="alert-card" data-event="${key}"><div class="alert-meta"><span class="status ${event.severity.toLowerCase()}"><i data-lucide="${event.severity === 'High' ? 'triangle-alert' : 'activity'}"></i>${event.severity === 'High' ? 'High priority' : 'Watch'}</span><span>Side ${event.side} · ${event.zone}</span></div><h3>${event.name}</h3><p>${event.description}</p><div class="alert-bottom"><span class="risk-reading"><span class="risk-label">Estimated downtime risk</span><strong><span class="risk-number">${event.probability}%</span><span class="risk-period">within the next<br>${event.horizon} hours</span></strong></span><span class="review-arrow" aria-hidden="true"><i data-lucide="arrow-right"></i></span></div></button>`).join('');
  icons();
}

function setTrack(side) {
  activeTrack = side;
  $('#map-art').classList.toggle('is-side-b', side === 'B');
  $('#side-label').textContent = `SIDE ${side}`;
  $$('.dispatch-vehicles strong').forEach((label, index) => {
    const number = index + (side === 'B' ? 4 : 1);
    label.textContent = `Vehicle ${String(number).padStart(2, '0')}`;
  });
  $$('[data-track]').forEach(button => {
    button.classList.toggle('active', button.dataset.track === side);
    button.setAttribute('aria-pressed', button.dataset.track === side);
  });
  $('.pin-brake').hidden = side !== 'A';
  $('.pin-lift').hidden = side !== 'A';
  $('.pin-sensor').hidden = side !== 'B';
  $$('[data-callout]').forEach(label => { label.hidden = events[label.dataset.callout].side !== side; });
}

function updateCalloutLines() {
  if ($('#overview-view').hidden) return;
  const canvas = $('.map-viewport').getBoundingClientRect();
  const compact = canvas.width <= 620;
  $$('[data-callout]').forEach(label => {
    const key = label.dataset.callout;
    const line = $(`[data-line="${key}"]`);
    line.style.display = label.hidden ? 'none' : '';
    if (label.hidden) return;
    const box = label.getBoundingClientRect();
    const marker = $(`.pin-${key} .pin-core`).getBoundingClientRect();
    const endX = marker.x + marker.width / 2 - canvas.x;
    const endY = marker.y + marker.height / 2 - canvas.y;
    const left = label.classList.contains('callout-left');
    const startX = (compact ? box.x + box.width / 2 : left ? box.right : box.left) - canvas.x;
    const startY = (compact ? box.bottom : box.y + box.height / 2) - canvas.y;
    const elbowX = compact ? startX : startX + (left ? 24 : -24);
    const elbowY = compact ? startY + 18 : startY;
    line.setAttribute('d', `M${startX} ${startY} L${elbowX} ${elbowY} L${endX} ${endY}`);
  });
}

function brakeDrawer(event, existing) {
  return `<div class="drawer-top"><span>COMPONENT HEALTH / ZONE 03</span><button class="icon-button" data-close-drawer title="Close component details" aria-label="Close component details"><i data-lucide="x"></i></button></div>
    <div class="drawer-content brake-detail">
      <span class="status high">High priority</span>
      <h2 id="drawer-title">Brake actuator</h2>
      <p class="muted">Space Mountain / Side A / Zone 03<br>${event.id}</p>
      <section class="detail-section brake-summary" aria-labelledby="brake-change-title">
        <h3 id="brake-change-title">Brake response is slowing</h3>
        <p>Response time has risen over the last six hours and is now above the normal range.</p>
        <dl class="brake-readings"><div><dt>Latest response</dt><dd>420 <span>ms</span></dd></div><div><dt>Normal range</dt><dd>280–340 <span>ms</span></dd></div></dl>
        <p class="reading-deviation">80 ms above the normal upper limit</p>
      </section>
      <section class="detail-section brake-decision" aria-labelledby="brake-decision-title">
        <h3 id="brake-decision-title">Review urgency before scheduling</h3>
        <div class="decision-row"><span>Estimated downtime risk</span><strong>92% within 15.3 hours</strong></div>
        <div class="decision-row"><span>Tonight's maintenance window</span><strong>23:00–05:00</strong></div>
        <div class="decision-row"><span>Window starts in</span><strong>8h 28m</strong></div>
        <p>The estimate is not a countdown to failure or clearance to keep operating. An engineer must inspect the component and decide whether work can wait.</p>
      </section>
      <section class="detail-section" aria-labelledby="brake-trend-title"><h3 id="brake-trend-title">Response time trend</h3><div class="chart-caption"><span>Last 6 hours · milliseconds</span><span>Sensor connected</span></div>
        <svg class="chart" viewBox="0 0 410 164" role="img" aria-label="Brake response time trend"><rect x="34" width="360" fill="#eaf1eb"/><path d="M34 30H394 M34 75H394 M34 120H394" stroke="#e5ece6"/><text x="3" y="34"></text><text x="3" y="79"></text><text x="3" y="124"></text><path fill="none" stroke="#a33230" stroke-width="2.3"/><circle cx="394" r="4" fill="#a33230" stroke="white" stroke-width="2"/><text x="34" y="148">08:30</text><text x="143" y="148">10:30</text><text x="262" y="148">12:30</text><text x="367" y="148">14:30</text></svg>
        <p class="muted">Shaded band: normal response range, 280–340 ms.</p>
      </section>
      <section class="detail-section"><h3>Next step</h3><p>Create a work request with this component's readings attached, or escalate for immediate engineering review. Scheduling and replacement parts still need confirmation.</p><div class="asset-row"><span>Last maintenance</span><span>${event.history}</span></div></section>
      <p class="prototype-evidence">Illustrative sensor readings and risk estimate.</p>
    </div>
    <div class="drawer-actions"><button class="secondary-button" data-escalate><i data-lucide="flag"></i>Escalate now</button><button class="primary-button" ${existing ? 'data-show-requests' : 'data-create-work'}><i data-lucide="clipboard-plus"></i>${existing ? 'View work request' : 'Create work request'}</button></div>`;
}

function openEvent(key) {
  selectedEvent = key;
  const event = events[key];
  previousFocus = document.activeElement;
  setTrack(event.side);
  const existing = requests.find(request => request.event === key);
  const chartValues = key === 'brake' ? ['300', '350', '420'] : key === 'lift' ? ['1.8', '2.8', '3.8'] : ['100', '95', '91'];
  $('#event-drawer').innerHTML = `<div class="drawer-top"><span>COMPONENT HEALTH / ${event.zone.toUpperCase()}</span><button class="icon-button" data-close-drawer title="Close component details" aria-label="Close component details"><i data-lucide="x"></i></button></div><div class="drawer-content"><span class="status ${event.severity.toLowerCase()}">${event.severity} priority</span><h2 id="drawer-title">${event.name}</h2><p class="muted">Space Mountain / ${event.location}<br>${event.id}</p><div class="detail-metrics risk-summary"><div><small>Estimated downtime risk</small><strong>${event.probability}% <span>within the next ${event.horizon} hours</span></strong></div></div><div class="detail-section"><h3>What changed</h3><p>${event.description} ${key === 'brake' ? 'Response time has increased over the last six hours. Review the readings and inspect the part before deciding when to repair it.' : 'Compare the latest reading with the normal range and inspect the part to find the cause.'}</p></div><div class="detail-section"><h3>${event.signal}</h3><div class="chart-caption"><span>Last 6 hours</span><b>Latest ${event.value}</b></div><svg class="chart" viewBox="0 0 410 164" role="img" aria-label="${event.signal} trend over six hours showing departure from the normal range"><rect x="34" y="75" width="360" height="45" fill="#eaf1eb"/><path d="M34 30H394 M34 75H394 M34 120H394" stroke="#e5ece6" stroke-width="1"/><text x="3" y="34">${chartValues[2]}</text><text x="3" y="79">${chartValues[1]}</text><text x="3" y="124">${chartValues[0]}</text><path d="M34 107 L64 112 L94 103 L124 108 L154 91 L184 93 L214 83 L244 78 L274 62 L304 65 L334 47 L364 37 L394 28" fill="none" stroke="#b86852" stroke-width="2.3"/><circle cx="394" cy="28" r="4" fill="#b86852" stroke="white" stroke-width="2"/><text x="34" y="148">08:30</text><text x="143" y="148">10:30</text><text x="262" y="148">12:30</text><text x="367" y="148">14:30</text></svg><div class="chart-caption"><span>Normal range: ${event.baseline}</span><span>Sensor connected</span></div></div><div class="evidence-note"><i data-lucide="clock-3"></i><span>Tonight's maintenance time starts in 8 hours 28 minutes. This risk estimate does not guarantee when a problem will occur. An engineer must decide how soon to act.</span></div><div class="detail-section"><h3>About this component</h3><div class="asset-row"><span>Latest reading</span><span>${event.value}</span></div><div class="asset-row"><span>Recommended next step</span><span>${event.action}</span></div><div class="asset-row"><span>Last maintenance</span><span>${event.history}</span></div></div></div><div class="drawer-actions"><button class="secondary-button" data-escalate><i data-lucide="flag"></i>Escalate now</button><button class="primary-button" ${existing ? 'data-show-requests' : 'data-create-work'}><i data-lucide="clipboard-plus"></i>${existing ? 'View work request' : 'Create work request'}</button></div>`;
  if (key === 'brake') $('#event-drawer').innerHTML = brakeDrawer(event, existing);
  drawTrend($('.chart'), key);
  $('#event-drawer').hidden = false;
  $('#drawer-backdrop').hidden = false;
  document.body.classList.add('overlay-open');
  $$('.app-header,main,.skip-link').forEach(element => { element.inert = true; });
  icons();
  $('#event-drawer').scrollTop = 0;
  $('.drawer-content').scrollTop = 0;
  $('#drawer-title').tabIndex = -1;
  $('#drawer-title').focus({ preventScroll: true });
}

function drawTrend(chart, key) {
  const series = {
    brake: { min: 260, max: 440, normal: [280, 340], values: [302, 294, 312, 304, 332, 328, 350, 360, 385, 380, 402, 411, 420] },
    lift: { min: 1, max: 4, normal: [1.5, 3], values: [1.9, 1.8, 2.1, 2, 2.4, 2.3, 2.6, 2.8, 3.1, 3, 3.4, 3.6, 3.8] },
    sensor: { min: 90, max: 100, normal: [97, 100], values: [99, 99.4, 98.7, 99, 97.5, 97.8, 96.9, 96.3, 94.7, 95.2, 93.3, 92.2, 91] }
  }[key];
  const y = value => 120 - (value - series.min) / (series.max - series.min) * 90;
  const band = $('rect', chart);
  band.setAttribute('y', y(series.normal[1]));
  band.setAttribute('height', y(series.normal[0]) - y(series.normal[1]));
  $('path[fill="none"]', chart).setAttribute('d', series.values.map((value, index) => `${index ? 'L' : 'M'}${34 + index * 30} ${y(value)}`).join(' '));
  $('circle', chart).setAttribute('cy', y(series.values.at(-1)));
  const ticks = [series.max, (series.min + series.max) / 2, series.min];
  $$('text', chart).slice(0, 3).forEach((text, index) => { text.textContent = ticks[index]; });
  chart.setAttribute('aria-label', `${events[key].signal}: ${series.values[0]} at 08:30, ${events[key].value} at 14:30. Normal range ${events[key].baseline}. Detailed readings follow.`);
  const readings = document.createElement('details');
  readings.className = 'trend-data';
  readings.innerHTML = `<summary>View sensor readings</summary><div class="table-scroll" tabindex="0" role="region" aria-label="${events[key].signal} readings"><table><caption class="sr-only">${events[key].signal}, samples every 30 minutes</caption><thead><tr><th scope="col">Time</th><th scope="col">${events[key].signal} (${key === 'brake' ? 'ms' : key === 'lift' ? 'mm/s' : '%'})</th></tr></thead><tbody>${series.values.map((value, index) => `<tr><th scope="row">${String(8 + Math.floor((index + 1) / 2)).padStart(2, '0')}:${index % 2 ? '00' : '30'}</th><td>${value}</td></tr>`).join('')}</tbody></table></div>`;
  chart.parentElement.append(readings);
  const chartScroll = document.createElement('div');
  chartScroll.className = 'chart-scroll';
  chartScroll.tabIndex = 0;
  chartScroll.setAttribute('role', 'region');
  chartScroll.setAttribute('aria-label', `${events[key].signal} trend chart`);
  chart.before(chartScroll);
  chartScroll.append(chart);
}

function closeDrawer(restoreFocus = true) {
  $('#event-drawer').hidden = true;
  $('#drawer-backdrop').hidden = true;
  document.body.classList.remove('overlay-open');
  $$('.app-header,main,.skip-link').forEach(element => { element.inert = false; });
  if (restoreFocus) previousFocus?.focus({ preventScroll: true });
}

function showView(view) {
  closeDrawer(false);
  $('#overview-view').hidden = view !== 'overview';
  $('#requests-view').hidden = view !== 'requests';
  $$('.nav-link').forEach(button => {
    button.classList.toggle('active', button.dataset.view === view);
    if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (view === 'requests') renderRequests();
  window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = $(`#${view}-view h1`);
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function modal(title, body, actions) {
  if (!$('#request-dialog').open) modalReturnFocus = document.activeElement;
  $('#request-dialog').innerHTML = `<form id="request-form"><div class="modal-header"><h2 id="modal-title">${title}</h2><button type="button" class="icon-button" data-close-modal aria-label="Close dialog" title="Close dialog"><i data-lucide="x"></i></button></div><div class="modal-body">${body}</div><div class="modal-actions">${actions}</div></form>`;
  icons();
  if (!$('#request-dialog').open) $('#request-dialog').showModal();
  $('#request-dialog').scrollTop = 0;
  $('#modal-title').tabIndex = -1;
  $('#modal-title').focus({ preventScroll: true });
  prepareForm();
}

function prepareForm() {
  $$('input,select,textarea', $('#request-form')).forEach(control => {
    control.id = `field-${control.name}`;
    const label = control.closest('label');
    const labelText = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.textContent.trim();
    control.setAttribute('aria-label', labelText);
    if (control.required) {
      const required = document.createElement('span');
      required.className = 'required-label';
      required.textContent = ' (required)';
      label.insertBefore(required, control);
    }
    const helper = $('.field-help', label);
    if (helper) { helper.id = `${control.id}-help`; control.setAttribute('aria-describedby', helper.id); }
    control.addEventListener('invalid', () => {
      control.setAttribute('aria-invalid', 'true');
      let error = $('.field-error', label);
      if (!error) {
        error = document.createElement('span');
        error.className = 'field-error';
        error.id = `${control.id}-error`;
        error.setAttribute('role', 'alert');
        label.append(error);
      }
      error.textContent = control.validity.valueMissing ? `Enter ${labelText.toLowerCase()}.` : control.type === 'number' ? `Enter a whole number between ${control.min} and ${control.max}.` : control.validationMessage;
      control.setAttribute('aria-describedby', [helper?.id, error.id].filter(Boolean).join(' '));
    });
    control.addEventListener('input', () => {
      if (control.validity.valid) {
        control.removeAttribute('aria-invalid');
        $('.field-error', label)?.remove();
        if (helper) control.setAttribute('aria-describedby', helper.id);
        else control.removeAttribute('aria-describedby');
      }
    });
  });
}

$('#request-dialog').addEventListener('close', () => {
  $('#request-dialog').classList.remove('maintenance-flow');
  if (modalReturnFocus?.isConnected && modalReturnFocus.getClientRects().length && !modalReturnFocus.closest('[hidden],[inert]')) modalReturnFocus.focus({ preventScroll: true });
  else if (!$('#event-drawer').hidden) $('#drawer-title').focus({ preventScroll: true });
  else if (!document.activeElement.closest('main,.app-header')) $('.nav-link.active').focus({ preventScroll: true });
});

function createWork(escalated = false) {
  $('#request-dialog').classList.add('maintenance-flow');
  const event = events[selectedEvent];
  const eventKey = selectedEvent;
  const evidence = { component: event.id, signal: event.signal, value: event.value, baseline: event.baseline, probability: event.probability, horizon: event.horizon, sampledAt: '14:30', trendPeriod: '08:30–14:30' };
  modal(escalated ? 'Escalate component issue' : 'Create work request', `
    <div class="modal-context"><i data-lucide="wrench"></i><div><strong>${event.name}</strong><small>Space Mountain · ${event.location}<br>${event.id}</small></div></div>
    <details class="work-evidence"><summary>Health evidence attached <span>View readings</span></summary>
      <dl><div><dt>${event.signal}</dt><dd>${event.value} <span>at 14:30</span></dd></div><div><dt>Normal range</dt><dd>${event.baseline}</dd></div><div><dt>Estimated downtime risk</dt><dd>${event.probability}% within ${event.horizon} hours</dd></div></dl>
      <p>Includes the component alert and six-hour sensor trend.</p>
    </details>
    <label class="field">Work description<input name="description" required maxlength="160" value="Inspect ${event.name.toLowerCase()} and determine corrective work"><span class="field-help">Describe the inspection or maintenance needed.</span></label>
    <label class="field">Proposed maintenance window<select name="window"><option ${escalated ? 'selected' : ''}>Immediate engineering review</option><option ${!escalated ? 'selected' : ''}>Tonight · 23:00–05:00</option><option>Next available window · scheduling review</option></select><span class="field-help">Proposed only. Engineering must confirm urgency and scheduling.</span></label>
    <label class="field">Notes<textarea name="notes" maxlength="1000">${event.description} Check the component and confirm the work and parts needed.</textarea></label>
    <div class="evidence-note"><i data-lucide="info"></i><span>This request does not approve continued operation or reserve replacement parts.</span></div>`, '<button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">Submit work request<i data-lucide="arrow-right"></i></button>');
  $('#request-form').addEventListener('submit', submit => {
    submit.preventDefault();
    const form = new FormData(submit.currentTarget);
    const request = { id: `WR-${String(1245 + requests.length).padStart(5, '0')}`, event: eventKey, description: form.get('description'), window: form.get('window'), notes: form.get('notes'), evidence, parts: null, escalated: form.get('window') === 'Immediate engineering review' };
    requests.unshift(request);
    $('#request-count').textContent = requests.length;
    workCreated(request);
  }, { once: true });
}

function workCreated(request) {
  renderRequests();
  requestPart(request, true);
}

function requestPart(request, fromWork = false) {
  $('#request-dialog').classList.add('maintenance-flow');
  const event = events[request.event];
  modal('Request replacement part', `<div class="parts-handoff">
    ${fromWork ? `<div class="work-saved" role="status"><i data-lucide="circle-check"></i><div><strong>${request.id} submitted</strong><span>Awaiting engineering review. Add a part request now, or skip for now.</span></div></div>` : `<p class="parts-link">Linked work request <strong>${request.id}</strong></p>`}
    <div class="modal-context replacement-part">${request.event === 'brake' ? '<img class="part-photo" src="assets/brake-actuator.png" alt="Illustrative pneumatic brake actuator assembly" width="104" height="104">' : '<i data-lucide="package"></i>'}<div><small>Suggested replacement</small><strong>${event.part}</strong><small>${event.sku} · Illustrative catalog reference</small>${request.event === 'brake' ? '<small class="part-photo-note">Illustrative photo; actual part may differ.</small>' : ''}</div></div>
    <div class="asset-row"><span>For component</span><span>${event.name}<br>${event.id} · ${event.location}</span></div>
    <div class="parts-pending"><i data-lucide="clock-3"></i><div><strong>Availability not yet confirmed</strong><p>The parts team will verify compatibility, stock and delivery timing.</p></div></div>
    <div class="parts-fields"><label class="field">Quantity<input name="quantity" type="number" min="1" max="20" step="1" value="1" required></label><label class="field">Needed by<select name="needed"><option ${!request.escalated && request.window.startsWith('Tonight') ? 'selected' : ''}>Tonight · before 23:00</option><option ${request.escalated ? 'selected' : ''}>As soon as available</option><option ${!request.escalated && !request.window.startsWith('Tonight') ? 'selected' : ''}>Next maintenance window</option></select></label></div>
    <label class="field">Delivery location<select name="destination"><option>Space Mountain · Maintenance workshop</option><option>Central maintenance stores</option></select></label>
    <p class="parts-disclaimer">Submitting requests a part; it does not reserve stock or confirm the repair schedule.</p>
    </div>`, `${fromWork ? '<button type="button" class="secondary-button" data-finish>Skip for now</button>' : '<button type="button" class="secondary-button" data-close-modal>Cancel</button>'}<button type="submit" class="primary-button">Submit parts request<i data-lucide="arrow-right"></i></button>`);
  $('#request-form').onsubmit = submit => {
    submit.preventDefault();
    const form = new FormData(submit.currentTarget);
    request.parts = { id: `PR-${request.id.slice(3)}`, quantity: Number(form.get('quantity')), needed: form.get('needed'), destination: form.get('destination') };
    modal('Parts request submitted', `<div class="success-icon"><i data-lucide="check"></i></div><h3 class="success-heading">${request.parts.id} · Linked to ${request.id}</h3><p>Requested · availability pending</p><div class="summary-block"><div class="asset-row"><span>Requested part</span><span>${request.parts.quantity} × ${event.part}</span></div><div class="asset-row"><span>Needed by</span><span>${escapeHtml(request.parts.needed)}</span></div><div class="asset-row"><span>Delivery location</span><span>${escapeHtml(request.parts.destination)}</span></div><div class="asset-row"><span>Maintenance</span><span>Awaiting ${request.escalated ? 'immediate engineering' : 'maintenance'} review</span></div></div><section class="confirmation-next"><h3>What happens next</h3><p>The parts team checks compatibility and availability, then confirms delivery timing. Engineering still needs to confirm the repair schedule.</p></section>`, '<button type="button" class="primary-button" data-finish>View linked requests<i data-lucide="arrow-right"></i></button>');
    renderRequests();
  };
}

function renderRequests() {
  $('#requests-content').innerHTML = requests.length ? requests.map(request => {
    const event = events[request.event];
    return `<article class="request-item request-handoff" aria-labelledby="title-${request.id}">
      <div class="section-heading"><div><p class="request-id">${request.id} · ${event.location}</p><h2 id="title-${request.id}">${escapeHtml(request.description)}</h2></div><span class="status ${request.escalated ? 'high' : 'watch'}">${request.escalated ? 'Escalated' : 'Awaiting review'}</span></div>
      <button class="request-component" data-event="${request.event}"><i data-lucide="wrench"></i>${event.name} · ${event.id}<i data-lucide="arrow-up-right"></i></button>
      <div class="request-stages">
        <section><h3><i data-lucide="clipboard-check"></i>Engineering review</h3><strong>${request.escalated ? 'Immediate review requested' : 'Awaiting maintenance review'}</strong><p>Engineering confirms urgency and the work needed.</p></section>
        <section><h3><i data-lucide="package"></i>Parts confirmation</h3><strong>${request.parts ? 'Requested · availability pending' : 'Not yet requested'}</strong><p>${request.parts ? `${request.parts.id} · Parts team to confirm compatibility and delivery.` : 'Request a replacement if the inspection indicates one is needed.'}</p></section>
        <section><h3><i data-lucide="calendar-clock"></i>Proposed timing</h3><strong>${escapeHtml(request.window)}</strong><p>Not scheduled. Timing needs engineering confirmation${request.parts ? ' and parts availability' : ''}.</p></section>
      </div>
      ${request.parts ? `<section class="linked-parts"><h3>Linked parts request <span>${request.parts.id}</span></h3><dl><div><dt>Requested part</dt><dd>${request.parts.quantity} × ${event.part}</dd></div><div><dt>Needed by</dt><dd>${escapeHtml(request.parts.needed)}</dd></div><div><dt>Delivery location</dt><dd>${escapeHtml(request.parts.destination)}</dd></div></dl></section>` : ''}
      <details class="request-evidence"><summary>Notes and attached evidence</summary><p>${escapeHtml(request.notes)}</p>${request.evidence ? `<p><strong>${request.evidence.signal}:</strong> ${request.evidence.value} at ${request.evidence.sampledAt} · Normal range ${request.evidence.baseline}</p><p>Estimated downtime risk: ${request.evidence.probability}% within ${request.evidence.horizon} hours. Sensor trend: ${request.evidence.trendPeriod}.</p>` : ''}</details>
      <div class="request-next"><span><strong>Next:</strong> ${request.parts ? 'Await engineering review and parts confirmation.' : 'Await engineering review; request parts if needed.'}</span>${request.parts ? '' : `<button class="secondary-button" data-parts-for="${request.id}"><i data-lucide="package-plus"></i>Request replacement part</button>`}</div>
    </article>`;
  }).join('') : '<div class="empty-state"><i data-lucide="clipboard-list"></i><h2>No work requests yet</h2><p>No maintenance work is currently awaiting review.</p><button class="primary-button" data-view="overview">Review component alerts<i data-lucide="arrow-right"></i></button></div>';
  icons();
}

document.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!target) return;
  if (target.dataset.event) openEvent(target.dataset.event);
  if (target.dataset.track) setTrack(target.dataset.track);
  if (target.dataset.view) showView(target.dataset.view);
  if (target.matches('.brand')) { event.preventDefault(); showView('overview'); }
  if (target.hasAttribute('data-close-drawer')) closeDrawer();
  if (target.hasAttribute('data-create-work')) createWork();
  if (target.hasAttribute('data-escalate')) createWork(true);
  if (target.hasAttribute('data-show-requests')) showView('requests');
  if (target.hasAttribute('data-close-modal')) $('#request-dialog').close();
  if (target.hasAttribute('data-finish')) { $('#request-dialog').close(); showView('requests'); }
  if (target.dataset.partsFor) requestPart(requests.find(request => request.id === target.dataset.partsFor));
});
$('#drawer-backdrop').onclick = () => closeDrawer();
document.addEventListener('keydown', event => {
  if ($('#request-dialog').open) {
    if (event.key === 'Tab') {
      const controls = $$('button:not([disabled]),input,select,textarea,summary,[tabindex="0"]', $('#request-dialog')).filter(element => element.getClientRects().length);
      if (event.shiftKey && (document.activeElement === controls[0] || document.activeElement === $('#modal-title'))) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    }
    return;
  }
  if ($('#event-drawer').hidden) return;
  if (event.key === 'Escape') closeDrawer();
  if (event.key === 'Tab') {
    const focusable = $$('button:not([disabled]),a,input,select,textarea,summary,[tabindex="0"]', $('#event-drawer')).filter(element => element.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#drawer-title'))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function updateZoom() {
  $('#map-art').style.transform = `scale(${zoom})`;
  $('#zoom-in').disabled = zoom >= 1.5;
  $('#zoom-out').disabled = zoom <= .8;
}
$('#zoom-in').onclick = () => { zoom = Math.min(1.5, +(zoom + .1).toFixed(1)); updateZoom(); };
$('#zoom-out').onclick = () => { zoom = Math.max(.8, +(zoom - .1).toFixed(1)); updateZoom(); };
$('#reset-map').onclick = () => { zoom = defaultZoom; updateZoom(); };
motionPreference.addEventListener('change', event => { paused = event.matches; });

/* A traced centerline is separate from the supplied, outlined SVG artwork. */
const route = $('#vehicle-route');
route.setAttribute('d', 'M270 534 C255 534 250 522 250 508 C246 487 263 479 284 458 L295 446 Q302 440 302 434 L304 49 C305 25 273 23 269 49 L237 434 C236 459 275 460 274 434 L257 312 C252 263 298 243 332 266 C365 288 361 330 329 350 C314 360 284 355 263 354 L127 345 C78 340 77 395 107 410 C139 426 169 398 153 366 L92 220 C74 177 115 142 148 142 L320 143 C334 143 345 154 348 166 L395 391 C402 420 377 433 358 422 L264 377 C251 369 247 356 249 343 L264 162 C263 135 297 113 322 133 L377 178 C389 188 394 201 394 214 L398 396 C401 426 365 444 343 423 C332 414 328 400 333 388 L394 165 C399 146 392 132 378 119 C364 108 346 107 330 115 C314 124 305 141 308 158 L320 270 C323 300 355 313 377 294 C389 284 394 272 390 260 C383 230 358 221 337 232 C315 242 308 268 322 290 L361 341 C382 369 418 362 434 340 C444 327 443 307 434 291 L400 225 C387 202 399 183 416 179 C433 177 446 187 450 202 L466 339 C469 355 460 363 448 364 L339 380 C319 383 319 407 336 415 Q341 417 346 415 L414 397 C447 387 467 416 456 444 Q451 458 437 465 L277 534 Z');
const routeLength = route.getTotalLength();
const dispatchSequence = { loading: 3000, interval: 8000, ride: 74000, acceleration: 4000, braking: 10000, hold: 6000 };
const cycleDuration = dispatchSequence.loading + dispatchSequence.interval * 2 + dispatchSequence.ride + dispatchSequence.hold;
let elapsed = 0, lastFrame = 0;
let sequenceElapsed = 0, lastCountdown = '';
const durationLabel = milliseconds => {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

function rideProgress(age) {
  const { ride, acceleration, braking } = dispatchSequence;
  const travel = ride - (acceleration + braking) / 2;
  if (age <= 0) return 0;
  if (age >= ride) return 1;
  if (age < acceleration) return age * age / (2 * acceleration * travel);
  if (age > ride - braking) return 1 - (ride - age) ** 2 / (2 * braking * travel);
  return (age - acceleration / 2) / travel;
}

function positionVehicles() {
  const phase = sequenceElapsed % cycleDuration;
  let running = 0;
  const countdownKey = `${Math.floor(phase / 1000)}:${paused}`;
  [1, 2, 3].forEach((number, index) => {
    const departure = dispatchSequence.loading + index * dispatchSequence.interval;
    const age = phase - departure;
    const waiting = age < 0;
    const complete = age >= dispatchSequence.ride;
    const slowing = !waiting && !complete && age >= dispatchSequence.ride - dispatchSequence.braking;
    if (!waiting && !complete) running++;
    // Each train completes a lap back to its own spaced position in the bay.
    const bayPosition = routeLength - 45 - index * 45;
    const distance = (bayPosition + rideProgress(age) * routeLength) % routeLength;
    const point = route.getPointAtLength(distance);
    const ahead = route.getPointAtLength((distance + 2) % routeLength);
    const behind = route.getPointAtLength((distance - 2 + routeLength) % routeLength);
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
    $(`#vehicle-${number}`).setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    if (countdownKey !== lastCountdown) {
      const status = $(`#vehicle-status-${number}`);
      status.dataset.state = waiting || complete ? 'bay' : slowing ? 'slowing' : 'running';
      status.textContent = waiting ? 'In loading bay' : complete ? 'Ride complete' : slowing ? 'Slowing into bay' : 'On track';
      $(`#vehicle-countdown-${number}`).textContent = waiting ? `Departs in ${durationLabel(departure - phase)}` : complete ? 'Stopped in bay' : `Completes in ${durationLabel(dispatchSequence.ride - age)}`;
    }
  });
  if (countdownKey !== lastCountdown) {
    const nextDeparture = [0, 1, 2].map(index => dispatchSequence.loading + index * dispatchSequence.interval).find(time => time > phase);
    $('#dispatch-countdown').textContent = paused ? 'Sequence paused' : nextDeparture !== undefined ? `${phase < dispatchSequence.loading ? 'First' : 'Next'} departure in ${durationLabel(nextDeparture - phase)}` : running ? `All rides complete in ${durationLabel(cycleDuration - dispatchSequence.hold - phase)}` : `Next cycle in ${durationLabel(cycleDuration - phase)}`;
    $('#running-vehicles').textContent = running;
    $('#bay-summary').textContent = `${3 - running} in loading bay`;
    lastCountdown = countdownKey;
  }
}
$('#restart-sequence').onclick = () => {
  sequenceElapsed = 0;
  lastCountdown = '';
  positionVehicles();
  $('#announcer').textContent = 'Dispatch sequence restarted. All three vehicles are in the loading bay.';
};
function animate(time) {
  const delta = lastFrame ? Math.min(time - lastFrame, 100) : 0;
  lastFrame = time;
  if (!paused && !document.hidden && !$('#overview-view').hidden) { elapsed += delta; sequenceElapsed += delta; }
  positionVehicles();
  updateCalloutLines();
  requestAnimationFrame(animate);
}
renderAlerts();
renderRequests();
updateZoom();
positionVehicles();
$('.nav-link.active').setAttribute('aria-current', 'page');
$('.metrics').setAttribute('role', 'group');
$('.map-controls').setAttribute('role', 'group');
$('.skip-link').addEventListener('click', () => $('#main-content').focus());
$$('.fleet-section th').forEach(header => header.setAttribute('scope', 'col'));
const fleetTable = $('.fleet-section .table-scroll');
fleetTable.tabIndex = 0;
fleetTable.setAttribute('role', 'region');
fleetTable.setAttribute('aria-label', 'Vehicle performance table');
requestAnimationFrame(animate);
setInterval(() => {
  const seconds = Math.floor(elapsed / 1000);
  $('#sample-time').textContent = `14:${String(32 + Math.floor(seconds / 60) % 28).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  $('#telemetry-time').textContent = paused ? 'Playback paused' : 'Sampled just now';
}, 1000);
