const draft = JSON.parse(window.localStorage.getItem("sugarai.kellowayVisitDraft") || "null") || {
  noteCount: 1,
  captureTotal: 3,
  outcome: "Scope confirmed",
};

const reviewCount = document.querySelector("#review-count");
const approvedCount = document.querySelector("#approved-count");
const reviewOutcome = document.querySelector("#review-outcome");
const generatedSummary = document.querySelector("#generated-summary");
const editSummary = document.querySelector("#edit-summary");
const saveReview = document.querySelector("#save-review");
const sourceCount = document.querySelector("#source-count");
const updateChecks = document.querySelectorAll(".review-update-item input");
const toast = document.querySelector("#prototype-toast");

let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function updateApprovedCount() {
  const approved = [...updateChecks].filter((input) => input.checked).length;
  approvedCount.textContent = `${approved} approved`;
  reviewCount.textContent = `${approved + 2} updates`;
}

reviewOutcome.textContent = draft.outcome || "Scope confirmed";
sourceCount.textContent = `${Math.max(draft.captureTotal || 0, 3)} items`;
updateApprovedCount();

updateChecks.forEach((input) => input.addEventListener("change", updateApprovedCount));

editSummary.addEventListener("click", () => {
  const isEditing = generatedSummary.getAttribute("contenteditable") === "true";

  if (isEditing) {
    generatedSummary.removeAttribute("contenteditable");
    generatedSummary.classList.remove("is-editing");
    editSummary.setAttribute("aria-label", "Edit summary");
    showToast("Summary updated.");
    return;
  }

  generatedSummary.setAttribute("contenteditable", "true");
  generatedSummary.classList.add("is-editing");
  editSummary.setAttribute("aria-label", "Save summary edits");
  generatedSummary.focus();
  document.getSelection()?.selectAllChildren(generatedSummary);
});

saveReview.addEventListener("click", () => {
  const approved = [...updateChecks].filter((input) => input.checked).length;
  const visitResult = {
    status: "completed",
    completedAt: "10:18 AM",
    noteCount: draft.noteCount || 1,
    captureTotal: Math.max(draft.captureTotal || 0, 3),
    outcome: draft.outcome || "Scope confirmed",
    approvedUpdates: approved,
    summary: generatedSummary.textContent.trim(),
  };

  window.localStorage.setItem("sugarai.kellowayVisit", JSON.stringify(visitResult));
  window.localStorage.removeItem("sugarai.kellowayVisitDraft");
  window.sessionStorage.setItem("sugarai.justCompleted", "true");
  saveReview.textContent = "Saved";
  saveReview.disabled = true;
  navigator.vibrate?.(18);
  window.setTimeout(() => {
    window.location.href = "index.html?state=complete";
  }, 560);
});
