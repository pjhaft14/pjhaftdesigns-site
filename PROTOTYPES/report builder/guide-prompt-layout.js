(function () {
  const kickoffPrompt = 'Show me open opportunities closing this quarter, grouped by sales stage.';
  const refinementPrompt = 'Only show opportunities over $250K.';

  function copyText(text, label) {
    const done = () => showGuideToast(label + ' copied');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      return;
    }
    fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (_) {}
    area.remove();
    done();
  }

  function showGuideToast(message) {
    let toast = document.querySelector('.rb-guide-copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'rb-guide-copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(showGuideToast.timer);
    showGuideToast.timer = setTimeout(() => toast.classList.remove('is-on'), 1500);
  }

  function setNativeTextareaValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function typePromptIntoActiveInput(text) {
    const input = document.activeElement && document.activeElement.matches?.('textarea.sai__input')
      ? document.activeElement
      : document.querySelector('textarea.sai__input:not(:disabled)');
    if (!input || input.disabled || input.dataset.demoTyping === 'true') return;

    input.dataset.demoTyping = 'true';
    input.focus();
    setNativeTextareaValue(input, '');

    let index = 0;
    const tick = () => {
      setNativeTextareaValue(input, text.slice(0, index + 1));
      index += 1;
      if (index >= text.length) {
        delete input.dataset.demoTyping;
        return;
      }

      const character = text[index - 1];
      const delay = character === ',' || character === '.' ? 190 : character === ' ' ? 82 : 108;
      window.setTimeout(tick, delay);
    };
    tick();
  }

  function installDemoTypingShortcut() {
    if (window.__rbDemoTypingShortcut) return;
    window.__rbDemoTypingShortcut = true;
    document.addEventListener('keydown', (event) => {
      const isDemoShortcut =
        event.key === 'F2' ||
        (event.ctrlKey && event.shiftKey && event.key === '1') ||
        (event.altKey && event.key === '1');
      if (!isDemoShortcut) return;
      if (!document.activeElement?.matches?.('textarea.sai__input')) return;
      event.preventDefault();
      event.stopPropagation();
      typePromptIntoActiveInput(kickoffPrompt);
    }, true);
  }

  function promptCard(kind, label, text) {
    const card = document.createElement('div');
    card.className = 'rb-help__prompt rb-help__prompt--inline' + (kind === 'refine' ? ' rb-help__prompt--refine' : '');

    const top = document.createElement('div');
    top.className = 'rb-help__prompt-top';

    const title = document.createElement('span');
    title.textContent = label;

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'rb-help__copy';
    copy.textContent = 'Copy';
    copy.setAttribute('aria-label', 'Copy ' + label.toLowerCase());
    copy.addEventListener('click', () => copyText(text, label));

    const body = document.createElement('p');
    body.textContent = text;

    top.append(title, copy);
    card.append(top, body);
    return card;
  }

  function applyGuidePromptLayout() {
    const guide = document.querySelector('.rb-help');
    if (!guide || guide.dataset.promptLayout === 'stepCards') return;

    const steps = guide.querySelectorAll('.rb-help__steps li');
    if (steps.length < 6) return;

    guide.querySelectorAll(':scope > .rb-help__prompt').forEach((card) => card.remove());

    steps[0].classList.add('rb-help__step-with-prompt');
    steps[5].classList.add('rb-help__step-with-prompt');
    if (steps[1]?.childNodes[1]) {
      steps[1].childNodes[1].textContent = 'Paste and submit the copied kickoff prompt.';
    }
    steps[0].appendChild(promptCard('kickoff', 'Kickoff prompt', kickoffPrompt));
    steps[5].appendChild(promptCard('refine', 'Refinement prompt', refinementPrompt));

    guide.dataset.promptLayout = 'stepCards';
  }

  function enhanceChangeHistoryRestore() {
    const overlay = document.querySelector('.workspace-overlay__panel');
    const title = overlay?.querySelector('.workspace-overlay__title');
    if (!overlay || title?.textContent?.trim() !== 'Change history') return;

    const undoButton = Array.from(document.querySelectorAll('button'))
      .find((button) => button.textContent.trim() === 'Undo');
    const rows = Array.from(overlay.querySelectorAll('.overlay-list-item'));

    rows.forEach((row) => {
      const label = row.querySelector('b')?.textContent?.trim();
      if (label !== 'SugarAI refinement' || row.querySelector('.rb-history-revert')) return;
      row.classList.add('rb-history-item--with-revert');

      const revert = document.createElement('button');
      revert.type = 'button';
      revert.className = 'rb-history-revert';
      revert.textContent = 'Revert';
      revert.setAttribute('aria-label', 'Revert this report change');
      revert.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const activeUndo = Array.from(document.querySelectorAll('button'))
          .find((button) => button.textContent.trim() === 'Undo');
        if (!activeUndo) return;
        activeUndo.click();
        overlay.querySelector('.workspace-overlay__close')?.click();
      });

      row.appendChild(revert);
    });
  }

  function installStyles() {
    if (document.getElementById('guide-prompt-layout-styles')) return;
    const style = document.createElement('style');
    style.id = 'guide-prompt-layout-styles';
    style.textContent = `
      .rb-help__steps li.rb-help__step-with-prompt { grid-template-columns: 22px 1fr; }
      .rb-help__prompt--inline { grid-column: 2; margin-top: 8px; }
      .rb-help__prompt-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
      .rb-help__prompt-top > span { color: #475569; font: 700 10px/1 var(--font); text-transform: uppercase; letter-spacing: .04em; }
      .rb-help__copy { flex: 0 0 auto; height: 22px; padding: 0 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #334155; font: 700 10px/1 var(--font); }
      .rb-help__copy:hover { border-color: #94a3b8; background: #f8fafc; color: #0f172a; }
      .rb-guide-copy-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(10px); z-index: 700; opacity: 0; pointer-events: none; background: #0f172a; color: #fff; padding: 9px 12px; border-radius: 9px; box-shadow: 0 12px 28px rgba(15,23,42,.18); font: 600 12px/1 var(--font); transition: opacity 160ms var(--ease), transform 160ms var(--ease); }
      .rb-guide-copy-toast.is-on { opacity: 1; transform: translateX(-50%) translateY(0); }
      .lbc-bstep--done .lbc-bstep__dot,
      .tstep--done .tstep__dot {
        border-color: #22c55e !important;
        background: #22c55e !important;
        color: #fff !important;
      }
      .lbc-bstep--done .lbc-bstep__dot > *,
      .tstep--done .tstep__dot > * {
        display: none !important;
      }
      .lbc-bstep--done .lbc-bstep__dot::before,
      .tstep--done .tstep__dot::before {
        content: "";
        width: 10px;
        height: 10px;
        display: block;
        background: center / 10px 10px no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
      }
      .lbc {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 92px);
        min-height: 0;
      }
      .lbc__head,
      .lbc__compose {
        flex: 0 0 auto;
      }
      .lbc__thread {
        flex: 1 1 auto;
        min-height: 0;
        max-height: none !important;
        overflow-y: auto !important;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
      }
      .rb-history-item--with-revert {
        grid-template-columns: 22px minmax(0, 1fr) auto !important;
        align-items: center;
      }
      .rb-history-revert {
        height: 28px;
        padding: 0 10px;
        border: 1px solid #bfdbfe;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
        font: 700 10px/1 var(--font);
        cursor: pointer;
      }
      .rb-history-revert:hover:not(:disabled) {
        border-color: #93c5fd;
        background: #dbeafe;
      }
      .rb-history-revert:disabled {
        opacity: .45;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    installStyles();
    installDemoTypingShortcut();
    applyGuidePromptLayout();
    enhanceChangeHistoryRestore();
    const observer = new MutationObserver(() => {
      applyGuidePromptLayout();
      enhanceChangeHistoryRestore();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
