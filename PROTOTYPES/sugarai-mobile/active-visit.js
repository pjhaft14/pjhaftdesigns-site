const visitTimer = document.querySelector("#visit-timer");
const dictationButton = document.querySelector("#dictation-button");
const dictationState = document.querySelector("#dictation-state");
const visitNotes = document.querySelector("#visit-notes");
const captureButtons = document.querySelectorAll("[data-capture]");
const captureCount = document.querySelector("#capture-count");
const captureFeed = document.querySelector("#capture-feed");
const outcomeButtons = document.querySelectorAll(".outcome-options button");
const saveDraftButton = document.querySelector("#save-draft");
const endVisitButton = document.querySelector("#end-visit");
const endVisitSheet = document.querySelector("#end-visit-sheet");
const endVisitCancel = document.querySelector("#end-visit-cancel");
const completeVisit = document.querySelector("#complete-visit");
const toast = document.querySelector("#prototype-toast");

let elapsedSeconds = 60;
let dictationTimer;
let toastTimer;
let captureTotal = 0;

function addCaptureItem(label, detail = "Saved to the visit timeline") {
  if (label.includes("availability checked")) {
    const productMatch = label.match(/(\S+).*?(\d+\s+units)/);
    label = productMatch ? `${productMatch[1]} - ${productMatch[2]}` : "Product availability checked";
    detail = "Inventory checked - quote follow-up created";
  }

  if (label.startsWith("CS-1842 -")) {
    label = "CS-1842 service follow-up";
    detail = "From Ask SugarAI - linked to Kelloway Plant 2";
  }

  captureTotal += 1;
  captureCount.textContent = `${captureTotal} captured`;
  const item = document.createElement("div");
  item.innerHTML = `
    <span class="capture-check" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="m5 12.5 4.3 4.3L19 7" />
      </svg>
    </span>
    <span class="capture-copy">
      <strong>${label}</strong>
      <small>${detail}</small>
    </span>
  `;
  captureFeed.prepend(item);
}

const sampleTranscript =
  "Alisha confirmed the Q2 maintenance scope. Kelloway needs 40 bearings reserved for the July shutdown and wants the revised quote by Friday.";

window.setInterval(() => {
  elapsedSeconds += 1;
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  visitTimer.textContent = `${minutes}:${seconds}`;
  visitTimer.dateTime = `PT${elapsedSeconds}S`;
}, 1000);

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function stopDictation() {
  window.clearInterval(dictationTimer);
  dictationButton.setAttribute("aria-pressed", "false");
  dictationButton.setAttribute("aria-label", "Resume dictation");
  dictationButton.classList.remove("is-recording");
  dictationState.classList.remove("is-recording");
  dictationState.lastElementChild.textContent = "Voice note saved offline";
}

dictationButton.addEventListener("click", () => {
  const isRecording = dictationButton.getAttribute("aria-pressed") === "true";

  if (isRecording) {
    stopDictation();
    navigator.vibrate?.(12);
    return;
  }

  dictationButton.setAttribute("aria-pressed", "true");
  dictationButton.setAttribute("aria-label", "Stop dictation");
  dictationButton.classList.add("is-recording");
  dictationState.classList.add("is-recording");
  dictationState.lastElementChild.textContent = "Listening...";
  navigator.vibrate?.(18);

  let characterIndex = visitNotes.value.length;
  if (characterIndex >= sampleTranscript.length) characterIndex = 0;
  if (characterIndex === 0) visitNotes.value = "";

  window.clearInterval(dictationTimer);
  dictationTimer = window.setInterval(() => {
    characterIndex = Math.min(characterIndex + 2, sampleTranscript.length);
    visitNotes.value = sampleTranscript.slice(0, characterIndex);
    visitNotes.scrollTop = visitNotes.scrollHeight;

    if (characterIndex === sampleTranscript.length) {
      stopDictation();
    }
  }, 34);
});

captureButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addCaptureItem(`${button.dataset.capture} added`, "Saved offline with this visit");
    navigator.vibrate?.(12);
  });
});

const activeParams = new URLSearchParams(window.location.search);
const savedProductCapture = window.localStorage.getItem("sugarai.kellowayProductCapture");
if (savedProductCapture && activeParams.get("product") === "added") {
  const product = JSON.parse(savedProductCapture);
  addCaptureItem(`${product.sku} · ${product.quantity} units · availability checked`);
  if (activeParams.get("product") === "added") {
    window.requestAnimationFrame(() => captureFeed.scrollIntoView({ block: "center" }));
  }
}

const savedAskCapture = window.localStorage.getItem("sugarai.kellowayAskCapture");
if (savedAskCapture && activeParams.get("ask") === "added") {
  const askCapture = JSON.parse(savedAskCapture);
  addCaptureItem(`${askCapture.caseId} - ${askCapture.followup}`);
  if (activeParams.get("ask") === "added") {
    window.requestAnimationFrame(() => captureFeed.scrollIntoView({ block: "center" }));
  }
}

outcomeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    outcomeButtons.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
  });
});

saveDraftButton.addEventListener("click", () => {
  showToast("Visit draft saved offline.");
});

function openEndVisitSheet() {
  endVisitSheet.hidden = false;
  window.requestAnimationFrame(() => {
    endVisitSheet.classList.add("is-open");
    endVisitCancel.focus();
  });
}

function closeEndVisitSheet() {
  endVisitSheet.classList.remove("is-open");
  endVisitSheet.hidden = true;
  endVisitButton.focus();
}

endVisitButton.addEventListener("click", openEndVisitSheet);
endVisitCancel.addEventListener("click", closeEndVisitSheet);
endVisitSheet.addEventListener("click", (event) => {
  if (event.target === endVisitSheet) closeEndVisitSheet();
});

completeVisit.addEventListener("click", () => {
  const selectedOutcome =
    [...outcomeButtons].find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim() ||
    "Scope confirmed";
  const visitDraft = {
    status: "review-pending",
    reviewedAt: null,
    noteCount: visitNotes.value.trim() ? 1 : 0,
    captureTotal,
    outcome: selectedOutcome,
    notes:
      visitNotes.value.trim() ||
      "Alisha confirmed the Q2 maintenance scope. Kelloway needs 40 bearings reserved for the July shutdown and wants the revised quote by Friday.",
  };

  window.localStorage.setItem("sugarai.kellowayVisitDraft", JSON.stringify(visitDraft));
  completeVisit.textContent = "Preparing review";
  completeVisit.disabled = true;
  navigator.vibrate?.(18);
  window.setTimeout(() => {
    window.location.href = "capture-review.html";
  }, 520);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !endVisitSheet.hidden) closeEndVisitSheet();
});
