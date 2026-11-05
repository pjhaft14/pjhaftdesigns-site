# Accessibility verification

Target: WCAG 2.2 Level AA for the interactive prototype. This is an implementation and test record, not a complete conformance certification.

## Changes

- Primary content uses 14-16px type and supporting labels generally use 13px, expressed in rem units. Headings retain their hierarchy.
- Darkened text and status colors, input boundaries, map leaders, and track artwork. Status includes words rather than color alone.
- Reserved the browser scrollbar gutter. Opening the drawer preserves the dashboard width, position, and page scroll offset.
- The drawer has independent content scrolling with separate header and actions, keeping controls from covering scrollable content.
- Background content is inert while the drawer is open. Both overlay types contain keyboard focus, support Escape, and restore focus to a valid control on dismissal.
- Dialog steps and view changes move focus to their headings. Added a skip link, current-page navigation semantics, named scroll regions, and table header scopes.
- Form fields identify required inputs and show associated validation messages. Error state clears when the input is valid.
- Added a readable sensor-data table as an alternative to each chart. Chart scroll regions preserve legible axis labels on narrow screens.
- Most controls have 44px minimum targets. Map markers provide 44px hit areas at default map scale, with equivalent full-size callout buttons.
- Motion remains pausable and starts paused for reduced-motion preferences. Added forced-colors styles.

## Verified

`audit-accessibility.cjs` uses axe-core 4.10.3 in Chromium-based Microsoft Edge. WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA rule tags report **zero violations in 17 states**:

- Both dashboard sides; all three component drawers; expanded sensor readings.
- Work-request and parts forms, invalid-input states, confirmations, and populated work-request list.
- 320px dashboard, drawer, and escalation form; desktop text-spacing overrides.

The scanner marks some SVG, patterned-surface, and modal text contrast as inconclusive. `verify-accessibility.cjs` separately checks computed foreground/background color pairs, including worst-case chart-band and dotted-map backgrounds. Eight sampled states pass these supplementary checks; the lowest measured text ratio is approximately **4.82:1**. This calculation does not model arbitrary imagery, antialiasing, or every possible visual occlusion.

Additional checks:

- Keyboard activation, skip link, focus containment, Escape, and focus restoration.
- Exact dashboard bounding-box and scroll-position equality before/after opening the drawer.
- Layout at 1440, 1024, 768, 390, and 320 CSS pixels.
- 200% root text enlargement, plus visual inspection of dashboard, drawer, and form.
- Text-spacing overrides: line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em, including 320px layout.
- Functional regression tests for vehicle movement/pause, reduced motion, track selection, zoom, maintenance requests, escalation, and linked parts requests.

Machine-readable results are in `accessibility-results.json` and `accessibility-supplement.json`. Test scripts and axe are verification assets and are not loaded by the application.

## Remaining manual validation

No hands-on NVDA/JAWS/VoiceOver test or disabled-user usability study has been performed. Screen-reader announcement quality, other browser/platform combinations, actual high-contrast themes, and additional user font preferences need human validation before claiming complete WCAG conformance. The full WCAG standard includes criteria that automated scanners cannot establish.

## References

- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
