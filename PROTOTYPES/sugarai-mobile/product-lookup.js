const params = new URLSearchParams(window.location.search);
const source = params.get("from") === "brief" ? "brief" : "active";
const backButton = document.querySelector("#product-back");
const productShell = document.querySelector(".product-shell");
const searchView = document.querySelector("#product-search-view");
const detailView = document.querySelector("#product-detail-view");
const searchForm = document.querySelector("#product-search-form");
const productQuery = document.querySelector("#product-query");
const searchButton = searchForm.querySelector("button[type='submit']");
const productEmptyState = document.querySelector("#product-empty-state");
const productResults = document.querySelector("#product-results");
const resultCount = document.querySelector("#result-count");
const productResultSkeleton = document.querySelector("#product-result-skeleton");
const productResult = document.querySelector("#product-result");
const availabilityButton = document.querySelector("#availability-button");
const availabilityModal = document.querySelector("#availability-modal");
const availabilityClose = document.querySelector("#availability-close");
const quantityMinus = document.querySelector("#quantity-minus");
const quantityPlus = document.querySelector("#quantity-plus");
const quantityOutput = document.querySelector("#quantity");
const addProductButton = document.querySelector("#add-product");

let quantity = 40;
let autoTypeTimer;
let autoFocusTimer;
let autoTypingStartTimer;
let searchTimer;
const demoPartNumber = "6205-2RS";
backButton.href = source === "brief" ? "visit-brief.html" : "active-visit.html";

function cancelAutoEntry() {
  window.clearTimeout(autoFocusTimer);
  window.clearTimeout(autoTypingStartTimer);
  window.clearInterval(autoTypeTimer);
  productQuery.classList.remove("is-auto-clicked");
}

function playPartNumberEntry() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  autoFocusTimer = window.setTimeout(() => {
    productQuery.focus();
    productQuery.classList.add("is-auto-clicked");
    window.setTimeout(() => productQuery.classList.remove("is-auto-clicked"), 360);

    if (reducedMotion) {
      autoTypingStartTimer = window.setTimeout(() => {
        productQuery.value = demoPartNumber;
      }, 420);
      return;
    }

    autoTypingStartTimer = window.setTimeout(() => {
      let characterIndex = 0;
      autoTypeTimer = window.setInterval(() => {
        characterIndex += 1;
        productQuery.value = demoPartNumber.slice(0, characterIndex);
        if (characterIndex === demoPartNumber.length) window.clearInterval(autoTypeTimer);
      }, 105);
    }, 420);
  }, 1250);
}

function updateQuantity(nextQuantity) {
  quantity = Math.max(10, Math.min(100, nextQuantity));
  quantityOutput.textContent = quantity;
  addProductButton.textContent = `Add ${quantity} to visit`;
}

function openAvailability() {
  availabilityModal.hidden = false;
  window.requestAnimationFrame(() => {
    availabilityModal.classList.add("is-open");
    availabilityClose.focus();
  });
}

function closeAvailability() {
  availabilityModal.classList.remove("is-open");
  availabilityModal.hidden = true;
  availabilityButton.focus();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  cancelAutoEntry();
  window.clearTimeout(searchTimer);

  if (!productQuery.value.trim()) {
    productQuery.focus();
    return;
  }

  productResults.hidden = false;
  productEmptyState.hidden = true;
  resultCount.textContent = "Searching catalog";
  productResultSkeleton.hidden = false;
  productResult.hidden = true;
  searchButton.disabled = true;
  navigator.vibrate?.(10);

  const loadingDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 200 : 900;
  searchTimer = window.setTimeout(() => {
    productResultSkeleton.hidden = true;
    productResult.hidden = false;
    resultCount.textContent = "1 exact match";
    searchButton.disabled = false;
    productResult.focus();
  }, loadingDelay);
});

productResult.addEventListener("click", () => {
  searchView.hidden = true;
  detailView.hidden = false;
  productShell.classList.add("is-detail");
  productShell.scrollTop = 0;
});

availabilityButton.addEventListener("click", openAvailability);
availabilityClose.addEventListener("click", closeAvailability);
availabilityModal.addEventListener("click", (event) => {
  if (event.target === availabilityModal) closeAvailability();
});

quantityMinus.addEventListener("click", () => updateQuantity(quantity - 10));
quantityPlus.addEventListener("click", () => updateQuantity(quantity + 10));

addProductButton.addEventListener("click", () => {
  const productCapture = {
    sku: "6205-2RS",
    quantity,
    availability: "Columbus · arrives Thursday",
    quoteFollowup: document.querySelector("#quote-followup").checked,
  };
  window.localStorage.setItem("sugarai.kellowayProductCapture", JSON.stringify(productCapture));
  addProductButton.textContent = "Added to visit";
  addProductButton.disabled = true;
  navigator.vibrate?.(18);
  window.setTimeout(() => {
    window.location.href = "active-visit.html?product=added";
  }, 520);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !availabilityModal.hidden) closeAvailability();
});

productQuery.addEventListener("input", (event) => {
  if (event.isTrusted) cancelAutoEntry();
});

productQuery.addEventListener("pointerdown", cancelAutoEntry);

playPartNumberEntry();
