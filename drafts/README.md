# drafts/ — Maintenance Insights assets (live)

Maintenance Insights is published at https://www.pjhaftdesigns.com/maintenance-insights
(source: `../maintenance-insights.html`, linked from the home page and listed in `sitemap.xml`).

This folder began as the local-only editorial draft, but the live page still loads its
stylesheet and media from here, so **do not delete or rename this folder**:

- `maintenance-insights.css` — case-study styles
- `assets/maintenance-insights/` — screenshots, posters and story videos

`drafts/maintenance-insights.html` is the old draft page. It is not part of the build
(`scripts/build.cjs` only ships files reachable from published pages), and `_redirects`
sends `/drafts/maintenance-insights` to `/maintenance-insights`.

If you ever tidy this up, move the CSS and assets next to the other case-study files,
update the references in `maintenance-insights.html`, then remove this folder.
