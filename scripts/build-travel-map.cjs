/* Build-time only. The portfolio serves the resulting SVG without D3 or map APIs.
 * Geography: public-domain Natural Earth, https://www.naturalearthdata.com/about/terms-of-use/
 * Projection/path generation: D3 7.9.0, ISC, https://github.com/d3/d3/blob/main/LICENSE
 * Run from the portfolio root: node scripts/build-travel-map.cjs
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

async function cached(relative, url) {
  const target = path.join(root, relative);
  try { return await fs.readFile(target, 'utf8'); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  const text = await response.text();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, text);
  return text;
}

(async () => {
  const [geography, library] = await Promise.all([
    cached('tmp/travel-map/natural-earth-countries-50m.geojson', 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'),
    cached('tmp/travel-map/d3.min.js', 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js')
  ]);
  const context = {};
  vm.runInNewContext(library, context);
  // These same projection constants are used by project() in travel-map.js.
  const projection = context.d3.geoEquirectangular().scale(153).translate([500, 238]);
  const draw = context.d3.geoPath(projection).digits(2);
  const countries = JSON.parse(geography).features.filter(feature => feature.properties.ADMIN !== 'Antarctica');
  const paths = countries.map(feature => `<path vector-effect="non-scaling-stroke" d="${draw(feature)}"/>`).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 420" fill="none" stroke="#cecece" stroke-width=".8"><title>World country outlines</title><desc>Public-domain Natural Earth country boundaries. Antarctica is outside this map.</desc><g id="travel-countries" fill="none" stroke-linecap="round" stroke-linejoin="round">\n${paths}\n</g></svg>\n`;
  await fs.mkdir(path.join(root, 'assets/travel'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets/travel/world-map.svg'), svg);
  console.log(`Built world-map.svg: ${countries.length} countries, ${Buffer.byteLength(svg)} bytes`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
