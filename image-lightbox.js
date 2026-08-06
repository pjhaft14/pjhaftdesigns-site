document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll("[data-lightbox-target]");

  triggers.forEach((trigger) => {
    const dialogId = trigger.dataset.lightboxTarget;
    const dialog = document.getElementById(dialogId);

    if (!dialog) {
      return;
    }

    const closeButton = dialog.querySelector(".image-lightbox__close");
    const viewport = dialog.querySelector(".image-lightbox__viewport");
    const image = dialog.querySelector(".image-lightbox__image");

    const resetZoom = () => {
      image.classList.remove("is-zoomed");
      viewport.scrollTo({ top: 0, left: 0 });
    };

    const closeDialog = () => {
      dialog.close();
    };

    trigger.addEventListener("click", () => {
      dialog.showModal();
      document.documentElement.classList.add("has-image-lightbox");
      closeButton.focus();
    });

    closeButton.addEventListener("click", closeDialog);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
    });

    image.addEventListener("click", () => {
      const wasZoomed = image.classList.toggle("is-zoomed");

      if (wasZoomed) {
        const centeredLeft = Math.max(0, (image.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTo({ top: 0, left: centeredLeft });
      } else {
        viewport.scrollTo({ top: 0, left: 0 });
      }
    });

    dialog.addEventListener("cancel", () => {
      document.documentElement.classList.remove("has-image-lightbox");
      resetZoom();
    });

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("has-image-lightbox");
      resetZoom();
      trigger.focus();
    });
  });
});
