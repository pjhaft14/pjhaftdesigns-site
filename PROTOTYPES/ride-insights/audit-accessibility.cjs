const { chromium } = require('C:/Users/pjhaf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
  await page.addScriptTag({ path: path.join(__dirname, 'axe.min.js') });
  const report = [];
  async function audit(state) {
    const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] } }));
    const entry = { state, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), needsReview: result.incomplete.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) };
    report.push(entry);
    console.log(JSON.stringify(entry));
  }
  await audit('Desktop dashboard Side A');
  await page.locator('[data-track="B"]').click();
  await audit('Desktop dashboard Side B');
  await page.locator('[data-track="A"]').click();
  const geometry = () => page.evaluate(() => ({ x: document.querySelector('main').getBoundingClientRect().x, width: document.querySelector('main').getBoundingClientRect().width, mapX: document.querySelector('.map-surface').getBoundingClientRect().x, mapWidth: document.querySelector('.map-surface').getBoundingClientRect().width, scroll: scrollY }));
  await page.evaluate(() => { window.scrollTo(0, 150); });
  const before = await geometry();
  await page.locator('.pin-brake').evaluate(element => { element.focus({ preventScroll: true }); element.click(); });
  assert.deepEqual(await geometry(), before, 'Drawer must not shift the page or scroll position');
  assert(await page.locator('main').evaluate(element => element.inert));
  await audit('Brake detail');
  await page.locator('.trend-data summary').click();
  await audit('Brake readings expanded');
  await page.getByRole('button', { name: 'Create work request', exact: true }).click();
  await audit('Work request form');
  await page.locator('[name=description]').fill('');
  await page.getByRole('button', { name: 'Submit work request', exact: true }).click();
  assert.equal(await page.locator('[name=description]').getAttribute('aria-invalid'), 'true');
  await audit('Work request validation');
  await page.locator('[name=description]').fill('Inspect brake actuator');
  await page.getByRole('button', { name: 'Submit work request', exact: true }).click();
  assert.equal(await page.locator('#modal-title').evaluate(element => document.activeElement === element), true);
  await audit('Work request confirmation');
  await page.getByRole('button', { name: 'Request a part', exact: true }).click();
  await audit('Parts form');
  await page.locator('[name=quantity]').fill('0');
  await page.getByRole('button', { name: 'Submit parts request', exact: true }).click();
  await audit('Parts validation');
  await page.locator('[name=quantity]').fill('1');
  await page.getByRole('button', { name: 'Submit parts request', exact: true }).click();
  await audit('Parts confirmation');
  await page.getByRole('button', { name: 'View linked requests', exact: true }).click();
  await audit('Work requests list');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  for (const key of ['lift', 'sensor']) {
    await page.locator(`.alert-card[data-event="${key}"]`).click();
    await audit(`${key} detail`);
    await page.keyboard.press('Escape');
  }
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('[data-track="A"]').click();
    await page.screenshot({ path: path.join(__dirname, `accessible-${width}.png`), fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
    if (width === 320) await audit('320px dashboard (400% equivalent reflow)');
  }
  await page.locator('.pin-lift').click();
  await audit('320px drawer');
  await page.getByRole('button', { name: 'Escalate now', exact: true }).click();
  await audit('320px escalation form');
  await page.screenshot({ path: path.join(__dirname, 'accessible-mobile-form.png'), fullPage: true });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
  await page.screenshot({ path: path.join(__dirname, 'accessible-text-spacing.png'), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Text spacing overflow');
  await audit('WCAG text spacing override');
  fs.writeFileSync(path.join(__dirname, 'accessibility-results.json'), JSON.stringify({ report, errors }, null, 2));
  await browser.close();
  assert.deepEqual(errors, []);
  assert.equal(report.reduce((sum, r) => sum + r.violations.length, 0), 0, 'Axe violations remain');
  console.log('PASS: automated WCAG A/AA scans, stable drawer geometry, inert background, form errors, focus transitions, responsive reflow, and text spacing.');
})().catch(error => { console.error(error); process.exit(1); });
