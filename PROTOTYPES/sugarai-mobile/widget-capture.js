const dictateWidget = document.querySelector("#dictate-widget");
const widgetStatus = document.querySelector("#widget-status");
const widgetSheet = document.querySelector("#widget-sheet");
const widgetListeningLabel = document.querySelector("#widget-listening-label");
const widgetTranscript = document.querySelector("#widget-transcript");
const widgetTranscriptText = document.querySelector("#widget-transcript-text");
const widgetSummarySkeleton = document.querySelector("#widget-summary-skeleton");
const widgetSummary = document.querySelector("#widget-summary");
const widgetSend = document.querySelector("#widget-send");
const widgetNotification = document.querySelector("#widget-notification");

const transcript =
  "Customer says compressor vibration at Plant 3 is getting louder. Please log a service follow-up before the July shutdown.";

let transcriptTimer;

function openWidgetSheet() {
  widgetSheet.hidden = false;
  widgetTranscriptText.textContent = "";
  widgetTranscript.classList.remove("is-focused");
  widgetSummarySkeleton.hidden = true;
  widgetSummary.hidden = true;
  widgetNotification.classList.remove("is-visible");
  widgetNotification.setAttribute("aria-hidden", "true");
  widgetSend.disabled = true;
  widgetSend.textContent = "Send to CRM";
  widgetListeningLabel.textContent = "Listening...";
  navigator.vibrate?.(12);

  window.requestAnimationFrame(() => {
    widgetSheet.classList.add("is-open");
  });

  window.setTimeout(() => {
    widgetTranscript.focus();
    widgetTranscript.classList.add("is-focused");
    widgetListeningLabel.textContent = "Ready to dictate";
  }, 1600);

  window.setTimeout(() => {
    widgetSend.disabled = false;
    let characterIndex = 0;
    widgetListeningLabel.textContent = "Listening...";
    transcriptTimer = window.setInterval(() => {
      characterIndex += 2;
      widgetTranscriptText.textContent = transcript.slice(0, characterIndex);

      if (characterIndex >= transcript.length) {
        window.clearInterval(transcriptTimer);
        window.setTimeout(() => {
          widgetListeningLabel.textContent = "Preparing CRM update...";
          widgetSummarySkeleton.hidden = false;
          window.setTimeout(() => {
            widgetSummarySkeleton.hidden = true;
            widgetSummary.hidden = false;
            widgetSend.disabled = false;
          widgetListeningLabel.textContent = "Summary ready";
        }, 1150);
      }, 620);
    }
  }, 58);
  }, 2450);
}

function closeWidgetSheetAfterSync() {
  widgetSheet.classList.remove("is-open");
  widgetStatus.innerHTML = '<span class="widget-sync-badge">Synced to Sugar - service follow-up sent</span>';
  window.setTimeout(() => {
    widgetSheet.hidden = true;
    widgetNotification.setAttribute("aria-hidden", "false");
    widgetNotification.classList.add("is-visible");
  }, 560);
}

dictateWidget.addEventListener("click", openWidgetSheet);

widgetSend.addEventListener("click", () => {
  widgetSend.disabled = true;
  widgetSend.textContent = "Sent to CRM";
  widgetTranscript.classList.remove("is-focused");
  navigator.vibrate?.(18);
  window.setTimeout(closeWidgetSheetAfterSync, 420);
});
