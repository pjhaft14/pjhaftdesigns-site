const stockButton = document.querySelector("#stock-button");
const stockSheet = document.querySelector("#stock-sheet");
const stockClose = document.querySelector("#stock-close");
const startVisitButton = document.querySelector("#start-visit-button");
const visitState = document.querySelector("#visit-state");
const productNext = document.querySelector("#product-next");
const toast = document.querySelector("#prototype-toast");
const navigateButton = document.querySelector("#navigate-button");
const mapsSheet = document.querySelector("#maps-sheet");
const mapsCancel = document.querySelector("#maps-cancel");
const mapsOpen = document.querySelector("#maps-open");
const callButtons = document.querySelectorAll(".contact-call");
const callSheet = document.querySelector("#call-sheet");
const callContactName = document.querySelector("#call-contact-name");
const callContactPhone = document.querySelector("#call-contact-phone");
const callCancel = document.querySelector("#call-cancel");
const callConfirm = document.querySelector("#call-confirm");
const emailButtons = document.querySelectorAll(".contact-email");
const emailSheet = document.querySelector("#email-sheet");
const emailContactName = document.querySelector("#email-contact-name");
const emailTo = document.querySelector("#email-to");
const emailSubject = document.querySelector("#email-subject");
const emailMessage = document.querySelector("#email-message");
const emailClose = document.querySelector("#email-close");
const emailSend = document.querySelector("#email-send");
const visitActionBar = document.querySelector("#visit-action-bar");

let toastTimer;
let emailTypingTimer;
let activeCallTrigger;
let activeEmailTrigger;
let visitIsLaunching = false;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function openSheet(sheet, focusTarget) {
  sheet.hidden = false;
  window.requestAnimationFrame(() => {
    sheet.classList.add("is-open");
    focusTarget.focus();
  });
}

function closeSheet(sheet, returnFocus) {
  if (sheet === emailSheet) {
    window.clearInterval(emailTypingTimer);
  }
  sheet.classList.remove("is-open");
  sheet.hidden = true;
  returnFocus.focus();
}

function typeEmailDraft(firstName) {
  const draft = `Hi ${firstName},

Looking forward to meeting at Kelloway Plant 3 today. I’ll bring the updated Q2 maintenance quote and current bearing availability so we can review both during the visit.

Best,
Alex`;

  window.clearInterval(emailTypingTimer);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    emailMessage.value = draft;
    return;
  }

  let characterIndex = 0;
  emailMessage.value = "";
  emailTypingTimer = window.setInterval(() => {
    characterIndex = Math.min(characterIndex + 2, draft.length);
    emailMessage.value = draft.slice(0, characterIndex);
    emailMessage.scrollTop = emailMessage.scrollHeight;

    if (characterIndex === draft.length) {
      window.clearInterval(emailTypingTimer);
    }
  }, 28);
}

stockButton.addEventListener("click", () => {
  openSheet(stockSheet, stockClose);
});

stockClose.addEventListener("click", () => closeSheet(stockSheet, stockButton));
stockSheet.addEventListener("click", (event) => {
  if (event.target === stockSheet) closeSheet(stockSheet, stockButton);
});

navigateButton.addEventListener("click", () => {
  openSheet(mapsSheet, mapsCancel);
});

mapsCancel.addEventListener("click", () => closeSheet(mapsSheet, navigateButton));
mapsSheet.addEventListener("click", (event) => {
  if (event.target === mapsSheet) closeSheet(mapsSheet, navigateButton);
});
mapsOpen.addEventListener("click", () => {
  mapsSheet.classList.remove("is-open");
  mapsSheet.hidden = true;
});

callButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCallTrigger = button;
    callContactName.textContent = button.dataset.name;
    callContactPhone.textContent = button.dataset.phone;
    callConfirm.href = `tel:${button.dataset.tel}`;
    openSheet(callSheet, callCancel);
  });
});

callCancel.addEventListener("click", () => closeSheet(callSheet, activeCallTrigger));
callSheet.addEventListener("click", (event) => {
  if (event.target === callSheet) closeSheet(callSheet, activeCallTrigger);
});
callConfirm.addEventListener("click", () => {
  callSheet.classList.remove("is-open");
  callSheet.hidden = true;
});

emailButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const firstName = button.dataset.name.split(" ")[0];
    activeEmailTrigger = button;
    emailContactName.textContent = button.dataset.name;
    emailTo.value = button.dataset.email;
    openSheet(emailSheet, emailClose);
    typeEmailDraft(firstName);
  });
});

emailClose.addEventListener("click", () => closeSheet(emailSheet, activeEmailTrigger));
emailSheet.addEventListener("click", (event) => {
  if (event.target === emailSheet) closeSheet(emailSheet, activeEmailTrigger);
});
emailSend.addEventListener("click", () => {
  const recipient = emailContactName.textContent;
  closeSheet(emailSheet, activeEmailTrigger);
  showToast(`Email sent to ${recipient}.`);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!stockSheet.hidden) closeSheet(stockSheet, stockButton);
  if (!mapsSheet.hidden) closeSheet(mapsSheet, navigateButton);
  if (!callSheet.hidden) closeSheet(callSheet, activeCallTrigger);
  if (!emailSheet.hidden) closeSheet(emailSheet, activeEmailTrigger);
});

startVisitButton.addEventListener("click", () => {
  if (visitIsLaunching) return;

  visitIsLaunching = true;
  window.localStorage.removeItem("sugarai.kellowayVisit");
  window.localStorage.removeItem("sugarai.kellowayProductCapture");
  startVisitButton.setAttribute("aria-pressed", "true");
  startVisitButton.classList.add("is-started", "is-launching");
  startVisitButton.innerHTML = `
    <svg class="visit-confirm-check" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.3 4.3L19 7" />
    </svg>
    <span>Visit started</span>
  `;
  visitActionBar.classList.add("is-confirming");
  visitState.textContent = "Started at 10:02 AM";
  navigator.vibrate?.(18);

  const transitionDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 620;
  window.setTimeout(() => {
    window.location.href = "active-visit.html";
  }, transitionDelay);
});

productNext.addEventListener("click", () => {
  window.location.href = "product-lookup.html?from=brief";
});
