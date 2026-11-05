#!/usr/bin/env node
// Builds the deployable site into dist/.
//
//   node scripts/build.cjs          (or: npm run build)
//
// Starting from the pages below, it follows every local reference (HTML attributes, social-card
// URLs on our own domain, CSS url()/@import, asset paths in scripts) and copies only what is
// reachable, so drafts, prototypes, source images and unused media never ship. Stylesheets are
// minified, and every stylesheet and script reference gets a ?v=<content hash> cache-buster in
// place of hand-edited version strings. The build fails if any reference points at a missing file.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE_ORIGINS = ['https://www.pjhaftdesigns.com/', 'https://pjhaftdesigns.com/'];

// Entry points: every published page, plus files the host reads directly.
const PAGES = ['index', 'about', 'contact', 'resume', 'clubsphere', 'conditional-formatting',
  'maintenance-insights', 'puroresu-project', 'report-builder', 'sugarai-mobile'].map(p => `${p}.html`);
const HOST_FILES = ['_redirects', 'robots.txt', 'sitemap.xml'];

const posix = p => p.split(path.sep).join('/');
const exists = rel => fs.existsSync(path.join(ROOT, rel)) && fs.statSync(path.join(ROOT, rel)).isFile();
const hash = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);

// Resolve a reference found in `fromFile` to a site-relative path, or null if external.
function resolveRef(ref, fromFile) {
  ref = ref.trim();
  for (const origin of SITE_ORIGINS) if (ref.startsWith(origin)) { ref = ref.slice(origin.length); fromFile = 'index.html'; break; }
  if (!ref || /^(?:[a-z][\w+.-]*:|\/\/|#|\$\{)/i.test(ref)) return null;   // http:, mailto:, data:, anchors, templates
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (!clean) return null;
  const base = clean.startsWith('/') ? '' : path.posix.dirname(posix(fromFile));
  let rel = path.posix.normalize(path.posix.join(base, clean.replace(/^\//, '')));
  if (!path.posix.extname(rel) && exists(rel + '.html')) rel += '.html';     // pretty URLs: /about
  if (rel === '' || rel === '.') rel = 'index.html';
  return rel;
}

// ---- Reference scanners -----------------------------------------------------------------
function refsInHtml(html) {
  const out = [];
  for (const m of html.matchAll(/\s(?:src|href|poster|content|data-[\w-]+)="([^"]+)"/g)) out.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) for (const part of m[1].split(',')) out.push(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) out.push(m[1]);           // inline styles
  for (const m of html.matchAll(/"(?:image|url)":\s*"([^"]+)"/g)) out.push(m[1]);                // JSON-LD
  // Only keep values that look like files or pages (attribute values like "true" are ignored).
  return out.filter(r => /\.[a-z0-9]{2,5}(?:[?#].*)?$|^https?:\/\/(?:www\.)?pjhaftdesigns\.com\//i.test(r));
}
const refsInCss = css => [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/g)].map(m => m[1] || m[2]);
const refsInJs = js => [...js.matchAll(/['"`]((?:\.{0,2}\/)?(?:[\w%-]+\/)*[\w%.-]+\.(?:png|jpe?g|webp|avif|gif|svg|mp4|webm|json|woff2?|pdf|html|css|js))(?:[?#][^'"`]*)?['"`]/g)].map(m => m[1]);
const refsInSvg = svg => [...svg.matchAll(/\s(?:href|xlink:href)="([^"#][^"]*)"/g)].map(m => m[1]);
// Paths scripts assemble at runtime, which no static scan can see.
function dynamicRefs(file, text) {
  if (file !== 'testimonials.js') return [];
  // Photos render as "<name>-color.webp" for PNG portraits, otherwise the listed file.
  return [...text.matchAll(/photo: '([^']+)'/g)].map(m => `assets/testimonials/${m[1].replace(/\.png$/, '-color.webp')}`);
}

// ---- Crawl --------------------------------------------------------------------------------
const files = new Set(), missing = [], warnings = [];
const queue = [...PAGES, ...HOST_FILES.filter(exists)];
while (queue.length) {
  const file = queue.shift();
  if (files.has(file)) continue;
  files.add(file);
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.css', '.js', '.svg'].includes(ext)) continue;
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const refs = ext === '.html' ? refsInHtml(text) : ext === '.css' ? refsInCss(text) : ext === '.js' ? [...refsInJs(text), ...dynamicRefs(file, text)] : refsInSvg(text);
  for (const ref of refs) {
    const rel = resolveRef(ref, file);
    if (!rel) continue;
    if (exists(rel)) queue.push(rel);
    // Strings in scripts are a heuristic (they may be data, not paths): warn instead of failing.
    else (ext === '.js' ? warnings : missing).push(`${file} -> ${ref}`);
  }
}
if (missing.length) {
  console.error(`Build failed: ${missing.length} reference(s) point at missing files:\n  ${[...new Set(missing)].join('\n  ')}`);
  process.exit(1);
}
// Licence files travel with the files they cover (e.g. the fonts' SIL Open Font License).
for (const dir of new Set([...files].map(f => path.posix.dirname(f)))) {
  for (const name of fs.readdirSync(path.join(ROOT, dir))) {
    if (/^(?:LICEN[CS]E|OFL|COPYING)|LICEN[CS]E/i.test(name) && exists(path.posix.join(dir, name))) files.add(path.posix.join(dir, name).replace(/^\.\//, ''));
  }
}
if (warnings.length) console.log(`Note: ${warnings.length} script string(s) look like paths but are not files (usually data): ${[...new Set(warnings.map(w => w.split(' -> ')[1]))].join(', ')}`);

// ---- Transform & write ------------------------------------------------------------------
// Conservative CSS minifier: drops comments and redundant whitespace, never touches strings,
// and leaves spaces that matter (descendant combinators, calc() operators) alone.
// Strings and comments are handled in one left-to-right pass, so an apostrophe inside a comment
// ("the case study's…") can never be mistaken for the start of a string.
const STRING_OR_COMMENT = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\/\*[\s\S]*?\*\//g;
function minifyCss(css) {
  const keep = [];
  css = css.replace(STRING_OR_COMMENT, (m, str) => (str ? `\u0000${keep.push(str) - 1}\u0000` : ''));
  css = css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
  return css.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[i]);
}

fs.rmSync(DIST, { recursive: true, force: true });
const versions = {};   // file -> content hash of its output
const out = new Map();
// CSS first, imported sheets before importers, so @import URLs carry the imported file's hash.
const cssFiles = [...files].filter(f => f.endsWith('.css'));
const cssDone = new Set();
function buildCss(f) {
  if (cssDone.has(f)) return;
  cssDone.add(f);
  let css = fs.readFileSync(path.join(ROOT, f), 'utf8');
  css = css.replace(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)/g, (m, ref) => {
    const rel = resolveRef(ref, f);
    buildCss(rel);
    return `@import url("${ref.split('?')[0]}?v=${versions[rel]}")`;
  });
  const min = minifyCss(css);
  // Guard: minification may only remove comments, whitespace and final semicolons. Normalise
  // source and output the same way (strings kept verbatim) and require an exact match.
  const normalise = s => {
    const strs = [];
    return s.replace(STRING_OR_COMMENT, (m, str) => (str ? `\u0000${strs.push(str) - 1}\u0000` : ''))
      .replace(/\s+/g, '').replace(/;}/g, '}').replace(/\u0000(\d+)\u0000/g, (_, i) => strs[i]);
  };
  if (normalise(css) !== normalise(min)) {
    console.error(`Build failed: minifying ${f} changed more than whitespace and comments.`);
    process.exit(1);
  }
  versions[f] = hash(min);
  out.set(f, min);
}
cssFiles.forEach(buildCss);
for (const f of files) if (f.endsWith('.js')) { const js = fs.readFileSync(path.join(ROOT, f)); versions[f] = hash(js); out.set(f, js); }

const stamp = (html, page) => html.replace(/(<(?:link|script)\b[^>]*?\s(?:href|src)=")([^"]+)(")/g, (m, pre, ref, post) => {
  const rel = resolveRef(ref, page);
  if (!rel || !versions[rel]) return m;
  return `${pre}${ref.split('?')[0]}?v=${versions[rel]}${post}`;
});
for (const f of files) if (f.endsWith('.html')) out.set(f, stamp(fs.readFileSync(path.join(ROOT, f), 'utf8'), f));

let bytes = 0;
for (const f of files) {
  const dest = path.join(DIST, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (out.has(f)) fs.writeFileSync(dest, out.get(f)); else fs.copyFileSync(path.join(ROOT, f), dest);
  bytes += fs.statSync(dest).size;
}

// ---- Report -----------------------------------------------------------------------------
const cssBefore = cssFiles.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
const cssAfter = cssFiles.reduce((n, f) => n + Buffer.byteLength(out.get(f)), 0);
const byType = {};
for (const f of files) { const e = path.extname(f) || f; byType[e] = (byType[e] || 0) + fs.statSync(path.join(DIST, f)).size; }
console.log(`dist/: ${files.size} files, ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`CSS minified: ${(cssBefore / 1024).toFixed(0)} KB -> ${(cssAfter / 1024).toFixed(0)} KB across ${cssFiles.length} files`);
console.log('By type: ' + Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e} ${(n / 1048576).toFixed(1)} MB`).join(', '));
