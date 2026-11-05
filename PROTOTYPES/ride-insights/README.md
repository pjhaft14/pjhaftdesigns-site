# Maintenance Insights prototype

Open `index.html` directly in a browser. No server, install, or network connection is required. Requests are held in memory and reset on reload; no orders or maintenance requests are sent externally.

## Scope

Dashboard-first redesign of the Space Mountain maintenance concept. Includes simulated vehicle movement, track selection, component health details, immediate escalation or proposed maintenance scheduling, work requests, and linked parts requests.

Vehicle playback begins with three vehicles in the loading bay. After a 3-second loading pause, vehicles depart 8 seconds apart. Each illustrative lap lasts 74 seconds, with acceleration over the first 4 seconds and braking over the final 10 seconds. After all vehicles return to their spaced bay positions, the sequence holds for 6 seconds and repeats. The dispatch strip shows per-vehicle countdowns and includes a restart control. Pause freezes movement and countdowns together.

The lead designer owned research, persona interviews, workflows, and the high-level experience. A junior designer supported production assets. The original project reached pilot. The research described reactive email notifications, broad fault location, and network dependence. The proposed system added component-level sensing.

## Sources and assumptions

- `assets/track.svg`: exact copy of user-supplied Frame 2.svg.
- `assets/track-annotated.svg`: exact copy of user-supplied Frame 1.svg, retained as reference.
- Supplied export shows one track schematic. Side B currently reuses that schematic; a distinct Side B asset and verified component positions are needed for fidelity.
- Motion follows a manually traced illustrative centerline, not a validated track topology. Timings and displayed positions are simulated.
- Data, component IDs, part numbers, sensor trends, probabilities, and maintenance windows are illustrative.
- The parts-request workflow is a new design exploration, not verified historical pilot functionality. Compatibility and inventory remain pending review.
- Engineer-reviewed scheduling, immediate escalation, and parts-team fulfillment are prototype assumptions. Predicted time horizons do not establish safe operating limits.
- Reduced-motion users start with vehicle playback paused.
- Lucide 0.468.0 is bundled locally for interface icons (ISC license; see bundle header).

No pilot outcomes or measured downtime reductions are asserted.

## Accessibility

See `ACCESSIBILITY.md` for the WCAG 2.2 AA implementation changes, automated and supplementary test results, and remaining manual validation. The prototype does not claim complete accessibility certification.
