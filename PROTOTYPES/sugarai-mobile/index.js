const params = new URLSearchParams(window.location.search);
const requestedState = params.get("state");
const showCompletedState = requestedState === "complete" || params.get("visit") === "completed";

if (params.get("reset") === "1" || !showCompletedState) {
  window.localStorage.removeItem("sugarai.kellowayVisit");
  window.sessionStorage.removeItem("sugarai.justCompleted");
}

const completedVisit = window.localStorage.getItem("sugarai.kellowayVisit");
const justCompleted = window.sessionStorage.getItem("sugarai.justCompleted") === "true";

if (showCompletedState && params.get("reset") !== "1") {
  const visit = completedVisit
    ? JSON.parse(completedVisit)
    : {
        noteCount: 1,
        captureTotal: 1,
        outcome: "Follow-up needed",
      };
  const title = document.querySelector("#today-title");
  const summary = document.querySelector("#today-summary");
  const progress = document.querySelector("#today-progress");
  const sync = document.querySelector("#today-sync");
  const completionBanner = document.querySelector("#visit-completion-banner");
  const completionSummary = document.querySelector("#completion-summary");
  const completedRouteStop = document.querySelector("#completed-route-stop");
  const nextVisitTime = document.querySelector("#next-visit-time");
  const nextVisitLink = document.querySelector("#next-visit-link");
  const nextSiteMark = document.querySelector("#next-site-mark");
  const nextVisitTitle = document.querySelector("#next-visit-title");
  const nextAccountName = document.querySelector("#next-account-name");
  const nextVisitAddress = document.querySelector("#next-visit-address");
  const nextDriveTime = document.querySelector("#next-drive-time");
  const nextNavigate = document.querySelector("#next-navigate");
  const nextPrep = document.querySelector("#next-prep");
  const routeProgress = document.querySelector("#route-progress");
  const captureLabel = visit.captureTotal === 1 ? "capture" : "captures";

  document.body.classList.add("visit-completed");
  if (justCompleted) document.body.classList.add("visit-completed--fresh");

  title.textContent = "Nice work, Alex.";
  summary.textContent = "Kelloway is complete and saved. Arcadia Foods is your next visit at 1:30 PM.";
  progress.lastChild.textContent = " 1 of 3 visits complete";
  sync.textContent = "Synced just now";

  completionSummary.textContent =
    `${visit.noteCount} voice note, ${visit.captureTotal} ${captureLabel}, ${visit.outcome.toLowerCase()}`;
  completionBanner.hidden = false;
  completedRouteStop.hidden = false;

  nextVisitTime.textContent = "1:30 PM";
  nextVisitLink.removeAttribute("href");
  nextVisitLink.setAttribute("aria-disabled", "true");
  nextVisitLink.setAttribute("aria-label", "Arcadia Foods Plant 2 visit brief");
  nextSiteMark.textContent = "A";
  nextVisitTitle.textContent = "Arcadia Foods Plant 2";
  nextAccountName.textContent = "Arcadia Foods";
  nextVisitAddress.textContent = "8800 Commerce Way, Dayton, OH";
  nextDriveTime.textContent = "28 min drive";
  nextNavigate.href = "https://maps.apple.com/?daddr=8800+Commerce+Way,+Dayton,+OH";
  nextPrep.removeAttribute("href");
  nextPrep.setAttribute("aria-disabled", "true");
  routeProgress.textContent = "1 of 3 complete \u00b7 51 min remaining";

  window.sessionStorage.removeItem("sugarai.justCompleted");
}
