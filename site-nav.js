const siteHeader = document.querySelector(".site-header");
const navigationToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (siteHeader && navigationToggle && primaryNavigation) {
  const closeNavigation = () => {
    siteHeader.classList.remove("nav-open");
    navigationToggle.setAttribute("aria-expanded", "false");
  };

  navigationToggle.addEventListener("click", () => {
    const willOpen = navigationToggle.getAttribute("aria-expanded") !== "true";
    siteHeader.classList.toggle("nav-open", willOpen);
    navigationToggle.setAttribute("aria-expanded", String(willOpen));
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteHeader.classList.contains("nav-open")) {
      closeNavigation();
      navigationToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
      closeNavigation();
    }
  });
}

const caseTocLinks = [...document.querySelectorAll(".case-toc a[href^='#']")];

if (caseTocLinks.length) {
  const tocTargets = caseTocLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActiveTocLink = (id) => {
    caseTocLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  let lockedTocId = "";
  let tocLockTimer;

  const updateActiveTocLink = () => {
    if (lockedTocId) return;

    const readingLine = window.scrollY + 140;
    const activeTarget = tocTargets.reduce((current, target) => {
      return target.offsetTop <= readingLine ? target : current;
    }, tocTargets[0]);

    if (activeTarget?.id) {
      setActiveTocLink(activeTarget.id);
    }
  };

  let tocFrame;

  const requestTocUpdate = () => {
    cancelAnimationFrame(tocFrame);
    tocFrame = requestAnimationFrame(updateActiveTocLink);
  };

  caseTocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      lockedTocId = link.getAttribute("href").slice(1);
      setActiveTocLink(lockedTocId);
      clearTimeout(tocLockTimer);
      tocLockTimer = setTimeout(() => {
        lockedTocId = "";
        updateActiveTocLink();
      }, 2600);
      requestTocUpdate();
    });
  });

  window.addEventListener("scroll", requestTocUpdate, { passive: true });
  window.addEventListener("scrollend", () => {
    lockedTocId = "";
    clearTimeout(tocLockTimer);
    updateActiveTocLink();
  });
  window.addEventListener("resize", requestTocUpdate);
  updateActiveTocLink();
}

const socialCarouselCards = [...document.querySelectorAll(".puro-social-phone-card")];

if (socialCarouselCards.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let socialCarouselTimer;

  const setSocialCarouselSlides = (advance = false) => {
    socialCarouselCards.forEach((card) => {
      const carousel = card.querySelector(".puro-social-carousel");
      const track = card.querySelector(".puro-social-carousel__track");
      const slides = [...card.querySelectorAll(".puro-social-carousel__track img")];
      const dots = [...card.querySelectorAll(".puro-social-dots i")];
      const previousSlide = Number(carousel?.dataset.activeSlide || 0);
      const activeSlide = advance
        ? (previousSlide + 1) % slides.length
        : 0;

      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === activeSlide);
        slide.classList.toggle("is-previous", advance && index === previousSlide);
      });
      if (carousel) {
        carousel.dataset.activeSlide = String(activeSlide);
      }
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeSlide);
      });
      track?.setAttribute("aria-hidden", "true");
    });
  };

  const advanceSocialCarousels = () => {
    setSocialCarouselSlides(true);
  };

  const startSocialCarousels = () => {
    if (socialCarouselTimer) return;
    setSocialCarouselSlides();
    socialCarouselTimer = window.setInterval(advanceSocialCarousels, 3200);
  };

  const socialCarouselSection = document.querySelector(".puro-social-system");

  if ("IntersectionObserver" in window && socialCarouselSection) {
    const socialCarouselObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      socialCarouselObserver.disconnect();
      startSocialCarousels();
    }, { threshold: 0.25 });

    socialCarouselObserver.observe(socialCarouselSection);
  } else {
    startSocialCarousels();
  }
}
