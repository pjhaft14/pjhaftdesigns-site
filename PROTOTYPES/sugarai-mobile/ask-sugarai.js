const askForm = document.querySelector("#ask-form");
const askQuery = document.querySelector("#ask-query");
const askSubmit = document.querySelector("#ask-submit");
const askEmptyState = document.querySelector("#ask-empty-state");
const askResults = document.querySelector("#ask-results");
const askResultCount = document.querySelector("#ask-result-count");
const askSkeleton = document.querySelector("#ask-skeleton");
const askAnswerCard = document.querySelector("#ask-answer-card");
const addContextButton = document.querySelector("#add-context");

const demoQuestion = "What is happening with the compressor vibration case at Plant 2?";
let autoFocusTimer;
let autoTypingStartTimer;
let autoTypeTimer;
let answerTimer;

function cancelAutoQuestion() {
  window.clearTimeout(autoFocusTimer);
  window.clearTimeout(autoTypingStartTimer);
  window.clearInterval(autoTypeTimer);
  askQuery.classList.remove("is-auto-clicked");
}

function playQuestionEntry() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  autoFocusTimer = window.setTimeout(() => {
    askQuery.focus();
    askQuery.classList.add("is-auto-clicked");
    window.setTimeout(() => askQuery.classList.remove("is-auto-clicked"), 360);

    autoTypingStartTimer = window.setTimeout(() => {
      if (reducedMotion) {
        askQuery.value = demoQuestion;
        return;
      }

      let characterIndex = 0;
      autoTypeTimer = window.setInterval(() => {
        characterIndex += 2;
        askQuery.value = demoQuestion.slice(0, characterIndex);
        askQuery.scrollTop = askQuery.scrollHeight;
        if (characterIndex >= demoQuestion.length) window.clearInterval(autoTypeTimer);
      }, 42);
    }, 520);
  }, 1350);
}

askForm.addEventListener("submit", (event) => {
  event.preventDefault();
  cancelAutoQuestion();
  window.clearTimeout(answerTimer);

  if (!askQuery.value.trim()) {
    askQuery.focus();
    return;
  }

  askResults.hidden = false;
  askEmptyState.hidden = true;
  askResultCount.textContent = "Searching account context";
  askSkeleton.hidden = false;
  askAnswerCard.hidden = true;
  askSubmit.disabled = true;
  navigator.vibrate?.(10);

  const loadingDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 200 : 1050;
  answerTimer = window.setTimeout(() => {
    askSkeleton.hidden = true;
    askAnswerCard.hidden = false;
    askResultCount.textContent = "3 source records found";
    askSubmit.disabled = false;
    addContextButton.focus();
  }, loadingDelay);
});

addContextButton.addEventListener("click", () => {
  const askCapture = {
    caseId: "CS-1842",
    followup: "service-window follow-up added",
  };
  window.localStorage.setItem("sugarai.kellowayAskCapture", JSON.stringify(askCapture));
  addContextButton.textContent = "Added to visit";
  addContextButton.disabled = true;
  navigator.vibrate?.(18);
  window.setTimeout(() => {
    window.location.href = "active-visit.html?ask=added";
  }, 520);
});

askQuery.addEventListener("input", (event) => {
  if (event.isTrusted) cancelAutoQuestion();
});

askQuery.addEventListener("pointerdown", cancelAutoQuestion);

playQuestionEntry();
