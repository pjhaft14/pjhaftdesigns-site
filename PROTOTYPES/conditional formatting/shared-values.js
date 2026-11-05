(() => {
  'use strict';
  const presets = {
    purple: { label: 'Purple', background: '#E4D7FC', text: '#6239A9', iconColor: '#6239A9', line: '#9070C6' },
    blue: { label: 'Blue', background: '#D7E7FC', text: '#2258AB', iconColor: '#2258AB', line: '#6D9FE7' },
    teal: { label: 'Teal', background: '#C7EADD', text: '#09685E', iconColor: '#09685E', line: '#53A89B' },
    amber: { label: 'Amber', background: '#FCE4B3', text: '#8A5606', iconColor: '#8A5606', line: '#B28843' },
    rose: { label: 'Rose', background: '#FFE1E8', text: '#9F2447', iconColor: '#9F2447', line: '#C1667F' },
    coral: { label: 'Coral', background: '#FFDED1', text: '#9C4A2F', iconColor: '#9C4A2F', line: '#D98E72' },
    indigo: { label: 'Indigo', background: '#DEE2FF', text: '#4543A2', iconColor: '#4543A2', line: '#8B88D7' }
  };
  const storageKey = 'portfolio.conditional-formatting.dropdown.v1';
  const regionNames = {
    apac: 'Asia-Pacific',
    emea: 'Europe, Middle East, and Africa',
    amer: 'Americas',
    latam: 'Latin America',
    na: 'North America',
    ssa: 'Sub-Saharan Africa',
    mena: 'Middle East and North Africa'
  };
  const iconsAllowed = ['circle', 'globe', 'map-pin', 'flag', 'target', 'check', 'x', 'triangle-alert', 'circle-alert', 'clock', 'star', 'trending-up', 'trending-down'];
  const chartDefaults = {
    apac: { ...presets.blue, preset: 'blue' },
    emea: { ...presets.teal, preset: 'teal' },
    amer: { ...presets.coral, preset: 'coral' },
    latam: { ...presets.amber, preset: 'amber' },
    na: { ...presets.purple, preset: 'purple' },
    ssa: { ...presets.rose, preset: 'rose' },
    mena: { ...presets.indigo, preset: 'indigo' }
  };
  const hex = value => /^#[0-9a-f]{6}$/i.test(value);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const initial = { regionStyleDefaultsVersion: 1, paletteDefaultsVersion: 2, iconDefaultsVersion: 1, name: 'region_dom', enabled: true, regionOptionsVersion: 2, choices: [
    { id: 'region-apac', key: 'apac', labels: { en: 'APAC', fr: 'APAC' }, style: { ...presets.purple, preset: 'purple', icon: 'circle', bold: false, italic: false, underline: false, strike: false } },
    { id: 'region-emea', key: 'emea', labels: { en: 'EMEA', fr: 'EMEA' }, style: { ...presets.blue, preset: 'blue', icon: 'check', bold: false, italic: false, underline: false, strike: false } },
    { id: 'region-amer', key: 'amer', labels: { en: 'AMER', fr: 'AMER' }, style: { ...presets.teal, preset: 'teal', icon: 'flag', bold: false, italic: false, underline: false, strike: false } },
    ...['latam', 'na', 'ssa', 'mena'].map(key => ({ id: `region-${key}`, key, labels: { en: key.toUpperCase(), fr: key.toUpperCase() }, style: null }))
  ] };
  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored && typeof stored.name === 'string' && typeof stored.enabled === 'boolean' && Array.isArray(stored.choices) && stored.choices.length && stored.choices.every(choice =>
        typeof choice.id === 'string' && typeof choice.key === 'string' && typeof choice.labels?.en === 'string' && typeof choice.labels?.fr === 'string' &&
        (!choice.style || (hex(choice.style.background) && hex(choice.style.text) && hex(choice.style.iconColor) && (choice.style.icon === '' || iconsAllowed.includes(choice.style.icon))))) &&
        new Set(stored.choices.map(choice => choice.id)).size === stored.choices.length) {
        if ((Number(stored.regionOptionsVersion) || 0) < 2) {
          const existingKeys = new Set(stored.choices.map(choice => choice.key.trim().toLowerCase()));
          const ids = new Set(stored.choices.map(choice => choice.id));
          ['apac', 'emea', 'latam', 'na', 'ssa', 'mena'].forEach(key => {
            if (existingKeys.has(key)) return;
            let id = `region-${key}`;
            while (ids.has(id)) id += '-option';
            ids.add(id);
            stored.choices.push({ id, key, labels: { en: key.toUpperCase(), fr: key.toUpperCase() }, style: null });
          });
          stored.regionOptionsVersion = 2;
          try { localStorage.setItem(storageKey, JSON.stringify(stored)); } catch { /* Keep the expanded choices usable for this session. */ }
        }
        if ((Number(stored.iconDefaultsVersion) || 0) < 1) {
          const previousIcons = { purple: '#8057D5', blue: '#3478DC', teal: '#148578', amber: '#C78414', rose: '#D64B71' };
          stored.choices.forEach(({style}) => {
            const preset = style && presets[style.preset];
            if (preset && style.background.toUpperCase() === preset.background && style.text.toUpperCase() === preset.text && style.iconColor.toUpperCase() === previousIcons[style.preset]) style.iconColor = style.text;
          });
          stored.iconDefaultsVersion = 1;
          try { localStorage.setItem(storageKey, JSON.stringify(stored)); } catch { /* Retain the defaults in memory if storage is unavailable. */ }
        }
        if ((Number(stored.paletteDefaultsVersion) || 0) < 2) {
          const previous = {
            purple: ['#9070C6', '#21102F'], blue: ['#6D9FE7', '#102C50'],
            teal: ['#53A89B', '#10352F'], amber: ['#B28843', '#2E2009'], rose: ['#C1667F', '#2B0E1B']
          };
          stored.choices.forEach(({style}) => {
            const old = style && previous[style.preset];
            if (old && style.background.toUpperCase() === old[0] && style.text.toUpperCase() === old[1] && style.iconColor.toUpperCase() === old[1]) Object.assign(style, presets[style.preset]);
          });
          stored.paletteDefaultsVersion = 2;
          try { localStorage.setItem(storageKey, JSON.stringify(stored)); } catch { /* Retain the palette in memory if storage is unavailable. */ }
        }
        if ((Number(stored.regionStyleDefaultsVersion) || 0) < 1) {
          const regionPresets = { apac: 'purple', emea: 'blue', amer: 'teal' };
          stored.choices.forEach(choice => {
            const preset = regionPresets[choice.key.trim().toLowerCase()];
            if (!preset) return;
            choice.style = {
              icon: 'circle', bold: false, italic: false, underline: false, strike: false,
              ...choice.style, ...presets[preset], preset
            };
          });
          stored.regionStyleDefaultsVersion = 1;
          try { localStorage.setItem(storageKey, JSON.stringify(stored)); } catch { /* Retain the requested region colors in memory. */ }
        }
        return stored;
      }
    } catch { /* Start with the example when browser storage is unavailable. */ }
    return JSON.parse(JSON.stringify(initial));
  }
  function badge(choice, enabled = true, language = 'en') {
    const text = escape(choice.labels[language] || choice.labels.en);
    const style = enabled && choice.style;
    if (!style) return `<span class="cfp-badge is-plain"><span>${text}</span></span>`;
    const decoration = [style.underline && 'underline', style.strike && 'line-through'].filter(Boolean).join(' ') || 'none';
    return `<span class="cfp-badge" title="${text}" style="background:${style.background};color:${style.text};font-weight:${style.bold ? 700 : 500};font-style:${style.italic ? 'italic' : 'normal'};text-decoration:${decoration}">${style.icon ? `<i data-lucide="${style.icon}" aria-hidden="true" style="color:${style.iconColor};${style.icon === 'circle' ? 'width:6px;height:6px;fill:currentColor;stroke-width:0;' : ''}"></i>` : ''}<span>${text}</span></span>`;
  }
  function loadForView() {
    const config = load();
    // Consumption screens show the walkthrough's finished example until a setup is saved.
    // The editor retains its unstyled starting state; saved choices then take precedence.
    if (!config.formattingConfigured) {
      config.choices.forEach(choice => {
        const style = chartDefaults[choice.key.trim().toLowerCase()];
        if (style) choice.style = { ...style, icon: 'circle', bold: false, italic: false, underline: false, strike: false };
      });
    }
    return config;
  }
  const choiceFor = (config, key) => config.choices.find(choice => choice.key.toLowerCase() === key) || { labels: { en: key.toUpperCase() }, style: null };
  const chartStyle = (config, key) => {
    const style = config.enabled && choiceFor(config, key).style || chartDefaults[key] || chartDefaults.apac;
    const preset = presets[style.preset];
    const line = preset && style.background.toUpperCase() === preset.background && style.iconColor.toUpperCase() === preset.iconColor
      ? preset.line : `color-mix(in srgb, ${style.iconColor} 65%, ${style.background})`;
    return { ...style, line };
  };
  window.CFValues = { presets, storageKey, regionNames, iconsAllowed, hex, escape, load, loadForView, badge, choiceFor, chartStyle };
})();
