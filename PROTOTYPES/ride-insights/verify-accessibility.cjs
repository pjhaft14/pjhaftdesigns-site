const { chromium } = require('C:/Users/pjhaf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
  const results = [];
  async function contrast(state) {
    const result = await page.evaluate(() => {
      const parse = color => (color.match(/[\d.]+/g) || []).map(Number);
      const composite = (top, bottom) => top.slice(0,3).map((v,i) => v * (top[3] ?? 1) + bottom[i] * (1 - (top[3] ?? 1)));
      const luminance = color => color.slice(0,3).map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((s,c,i) => s + c * [.2126,.7152,.0722][i], 0);
      const ratio = (a,b) => (Math.max(luminance(a),luminance(b)) + .05) / (Math.min(luminance(a),luminance(b)) + .05);
      const scope = document.querySelector('dialog[open]') || document.querySelector('#event-drawer:not([hidden])') || document.body;
      const checks = [...scope.querySelectorAll('*')].filter(e => e.getClientRects().length && !e.closest('[hidden],[inert],.sr-only') && !e.disabled && ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || e.matches('input,textarea,select'))).map(e => {
        const style = getComputedStyle(e);
        if (style.visibility !== 'visible' || e.matches('script,style,option')) return null;
        let chain = [], node = e;
        while (node) { chain.unshift(node); node = node.parentElement; }
        let bg = [255,255,255];
        chain.forEach(n => { bg = composite(parse(getComputedStyle(n).backgroundColor), bg); });
        const foreground = composite(parse(e.tagName.toLowerCase() === 'text' ? style.fill : style.color), bg);
        let value = ratio(foreground, bg);
        // Worst-case backgrounds for the chart band and dotted map surface.
        if (e.closest('.chart')) value = Math.min(value, ratio(foreground, [234,241,235]));
        if (e.closest('.map-surface') && !e.closest('.canvas-callout,.map-pin,.station-label')) value = Math.min(value, ratio(foreground,[220,230,225]));
        const threshold = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.667 && +style.fontWeight >= 700) ? 3 : 4.5;
        return { selector: e.id || e.className.baseVal || e.className || e.tagName, text: (e.value || e.textContent).trim().slice(0,50), ratio: +value.toFixed(3), threshold, pass: value >= threshold };
      }).filter(Boolean);
      return { checked: checks.length, minimum: Math.min(...checks.map(c => c.ratio)), failures: checks.filter(c => !c.pass) };
    });
    results.push({ state, ...result });
    console.log(state, JSON.stringify(result));
  }
  await contrast('dashboard');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(e => document.activeElement === e), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('main').evaluate(e => document.activeElement === e), true);
  await page.locator('[data-callout="brake"]').focus();
  await page.keyboard.press('Enter');
  await contrast('drawer');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('[data-create-work]').evaluate(e => document.activeElement === e), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('[data-close-drawer]').evaluate(e => document.activeElement === e), true);
  for (let i=0; i<12; i++) {
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => Boolean(document.activeElement.closest('#event-drawer'))));
  }
  await page.getByRole('button', { name: 'Create work request', exact: true }).click();
  await contrast('work form');
  for (let i=0; i<10; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => Boolean(document.activeElement.closest('#request-dialog')))); }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-create-work]').evaluate(e => document.activeElement === e), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-callout="brake"]').evaluate(e => document.activeElement === e), true);
  await page.locator('[data-callout="brake"]').click();
  await page.getByRole('button', { name: 'Create work request', exact: true }).click();
  await page.getByRole('button', { name: 'Submit work request', exact: true }).click();
  await contrast('work confirmation');
  await page.getByRole('button', { name: 'Request a part', exact: true }).click();
  await contrast('parts form');
  await page.getByRole('button', { name: 'Submit parts request', exact: true }).click();
  await contrast('parts confirmation');
  await page.getByRole('button', { name: 'View linked requests', exact: true }).click();
  await contrast('requests list');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.screenshot({ path: path.join(__dirname,'accessible-200-percent-text.png'), fullPage: true });
  console.log('200% text', await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth })));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Text resize page overflow');
  await page.locator('.pin-lift').click();
  await page.screenshot({ path: path.join(__dirname,'accessible-200-percent-drawer.png') });
  await page.getByRole('button', { name: 'Create work request', exact: true }).click();
  await page.screenshot({ path: path.join(__dirname,'accessible-200-percent-form.png') });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
  await page.screenshot({ path: path.join(__dirname,'accessible-mobile-spacing.png'), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile text spacing page overflow');
  await contrast('mobile text spacing');
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'accessibility-supplement.json'), JSON.stringify(results, null, 2));
  assert.equal(results.flatMap(r => r.failures).length, 0);
  console.log('PASS: supplemental contrast, skip link, keyboard containment, Escape/focus return, 200% text, and mobile text spacing.');
})().catch(error => { console.error(error); process.exit(1); });
