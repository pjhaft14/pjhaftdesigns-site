(() => {
  const portrait = document.querySelector('.about-portrait, .intro-portrait');
  const image = portrait?.querySelector('img');
  if (!image) return;

  async function initialize() {
    try { await image.decode(); } catch { return; }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1600 1600');
    svg.setAttribute('class', 'portrait-animation');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // Keep the original portrait fixed; overlay the eyes and separately drawn mouth.
    svg.innerHTML = `
      <defs>
        <clipPath id="portrait-eye-left"><path d="M 424 579 Q 443 550 472 548 Q 503 549 529 574 L 525 595 L 424 595 Z"/></clipPath>
        <clipPath id="portrait-eye-right"><path d="M 650 564 Q 680 537 710 539 Q 752 541 802 574 L 802 601 L 650 601 Z"/></clipPath>
      </defs>
      <g class="portrait-figure">
        <image width="1600" height="1600"/>
        <g class="portrait-mouth">
          <path d="M 459 880 C 464 847 488 817 517 817 C 535 816 539 822 552 819 C 588 802 643 828 700 844 L 708 862 L 645 904 L 492 904 Z" fill="#fff"/>
          <g fill="none" stroke="#180f1c" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
            <path class="portrait-lip-upper"/>
            <path class="portrait-lip-line"/>
            <path class="portrait-lip-lower"/>
          </g>
        </g>
        <g clip-path="url(#portrait-eye-left)">
          <rect width="1600" height="1600" fill="#fff"/>
          <g class="portrait-eye-sample" data-eye-center="575">
            <g clip-path="url(#portrait-eye-left)"><image width="1600" height="1600"/><ellipse class="portrait-pupil" cx="474" cy="567" rx="9" ry="10" fill="#000"/></g>
          </g>
          <path class="portrait-eyelid" d="M 430 577 Q 475 594 521 576" fill="none" stroke="#180f1c" stroke-width="5.5" stroke-linecap="round" opacity="0"/>
        </g>
        <g clip-path="url(#portrait-eye-right)">
          <rect width="1600" height="1600" fill="#fff"/>
          <g class="portrait-eye-sample" data-eye-center="571">
            <g clip-path="url(#portrait-eye-right)"><image width="1600" height="1600"/><ellipse class="portrait-pupil" cx="712" cy="560" rx="9" ry="10" fill="#000"/></g>
          </g>
          <path class="portrait-eyelid" d="M 658 570 Q 716 593 792 573" fill="none" stroke="#180f1c" stroke-width="5.5" stroke-linecap="round" opacity="0"/>
        </g>
      </g>`;
    const source = image.currentSrc || image.src;
    const samples = [...svg.querySelectorAll('image')];
    const loaded = samples.map(sample => new Promise((resolve, reject) => {
      sample.addEventListener('load', resolve, { once: true });
      sample.addEventListener('error', reject, { once: true });
      sample.setAttribute('href', source);
    }));
    portrait.append(svg);
    try { await Promise.all(loaded); } catch { svg.remove(); return; }
    portrait.classList.add('portrait-animated');

    const eyes = [...svg.querySelectorAll('.portrait-eye-sample')];
    const lids = [...svg.querySelectorAll('.portrait-eyelid')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let timer;
    let animations = [];
    let followupBlink = false;
    let firstBlink = true;
    let firstSmile = true;
    let smileTimer;
    let smileFrame;
    // Matching Bezier points trace the neutral lips and the separately drawn smile.
    // Interpolate their geometry so there is only one mouth, at full opacity throughout.
    const mouthShapes = [
      ['.portrait-lip-upper', 'M 461 875 C 467 851 492 824 517 823 C 532 822 539 828 552 825 C 588 808 638 835 688 850',
        'M 461 875 C 467 851 492 822 517 821 C 532 820 539 830 552 827 C 588 810 646 834 696 840'],
      ['.portrait-lip-line', 'M 488 857 C 510 852 526 854 541 855 C 559 856 584 850 613 853 C 643 855 671 858 688 850',
        'M 485 843 C 500 852 526 852 541 855 C 559 859 584 853 613 851 C 650 850 680 849 696 840'],
      ['.portrait-lip-lower', 'M 499 876 C 506 900 530 899 555 899 C 586 900 612 889 632 877',
        'M 503 872 C 514 894 541 898 560 894 C 588 892 615 883 636 871']
    ].map(([selector, neutral, smiling]) => ({
      element: svg.querySelector(selector), neutral,
      from: neutral.match(/-?\d+(?:\.\d+)?/g).map(Number),
      to: smiling.match(/-?\d+(?:\.\d+)?/g).map(Number)
    }));
    function drawMouth(amount) {
      mouthShapes.forEach(({ element, neutral, from, to }) => {
        let index = 0;
        element.setAttribute('d', neutral.replace(/-?\d+(?:\.\d+)?/g, () => {
          const i = index++;
          return (from[i] + (to[i] - from[i]) * amount).toFixed(3);
        }));
      });
    }
    drawMouth(0);
    const canMove = () => visible && !document.hidden && !reducedMotion.matches;

    function resetSmile() {
      clearTimeout(smileTimer);
      cancelAnimationFrame(smileFrame);
      smileFrame = undefined;
      drawMouth(0);
    }

    function scheduleSmile() {
      clearTimeout(smileTimer);
      if (!canMove() || smileFrame !== undefined) return;
      smileTimer = setTimeout(smile, firstSmile ? 4000 + Math.random() * 3000 : 12000 + Math.random() * 10000);
    }

    function smile() {
      if (!canMove()) return;
      firstSmile = false;
      const start = performance.now();
      const hold = 1200 + Math.random() * 500;
      const ease = value => (1 - Math.cos(Math.PI * value)) / 2;
      function frame(now) {
        if (!canMove()) { resetSmile(); return; }
        const elapsed = now - start;
        const amount = elapsed < 900 ? ease(elapsed / 900)
          : elapsed < 900 + hold ? 1
          : 1 - ease(Math.min(1, (elapsed - 900 - hold) / 1100));
        drawMouth(amount);
        if (elapsed < 2000 + hold) smileFrame = requestAnimationFrame(frame);
        else { resetSmile(); scheduleSmile(); }
      }
      smileFrame = requestAnimationFrame(frame);
    }

    function scheduleBlink(shortPause = false) {
      clearTimeout(timer);
      if (!canMove()) return;
      const delay = shortPause ? 180 + Math.random() * 120
        : firstBlink ? 600 + Math.random() * 400
        : 1800 + Math.random() * 2400;
      timer = setTimeout(blink, delay);
    }

    async function blink() {
      if (!canMove()) return;
      firstBlink = false;
      const duration = 200 + Math.random() * 50;
      const current = eyes.map(eye => {
        const center = Number(eye.dataset.eyeCenter);
        const closed = `matrix(1, 0, 0, 0.07, 0, ${center * 0.93})`;
        return eye.animate([
          { transform: 'matrix(1, 0, 0, 1, 0, 0)', opacity: 1, offset: 0, easing: 'ease-in' },
          { transform: closed, opacity: 0, offset: 0.32 },
          { transform: closed, opacity: 0, offset: 0.42, easing: 'ease-out' },
          { transform: 'matrix(1, 0, 0, 1, 0, 0)', opacity: 1, offset: 1 }
        ], { duration });
      });
      current.push(...lids.map(lid => lid.animate([
        { opacity: 0, offset: 0, easing: 'ease-in' },
        { opacity: 1, offset: 0.32 },
        { opacity: 1, offset: 0.42, easing: 'ease-out' },
        { opacity: 0, offset: 1 }
      ], { duration })));
      animations = current;
      try { await Promise.all(current.map(animation => animation.finished)); } catch { /* Motion was paused. */ }
      if (animations !== current) return;
      animations = [];
      // Occasionally pair two blinks, without repeating into a flutter.
      followupBlink = !followupBlink && Math.random() < 0.12;
      scheduleBlink(followupBlink);
    }

    function updateMotion() {
      const moving = canMove();
      portrait.classList.toggle('is-moving', moving);
      clearTimeout(timer);
      if (moving) {
        scheduleBlink();
        scheduleSmile();
      }
      else {
        followupBlink = false;
        animations.forEach(animation => animation.cancel());
        animations = [];
        resetSmile();
      }
    }

    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updateMotion();
    }, { threshold: 0.2 }).observe(portrait);
    document.addEventListener('visibilitychange', updateMotion);
    reducedMotion.addEventListener('change', updateMotion);
    updateMotion();
  }
  initialize();
})();
