(() => {
  const diagram = document.querySelector('.architecture-system');
  if (!diagram || !('IntersectionObserver' in window)) return;

  const mobile = diagram.querySelector('.architecture-mobile');
  const ns = 'http://www.w3.org/2000/svg';
  const makePath = (d, className, delay, route, step) => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className);
    path.setAttribute('pathLength', '1');
    path.style.setProperty('--d', `${delay}s`);
    if (route !== undefined) {
      path.style.setProperty('--r', route);
      path.style.setProperty('--k', step);
    }
    return path;
  };
  const roundedPath = points => {
    let d = `M ${points[0].join(' ')}`;
    for (let i = 1; i < points.length - 1; i++) {
      const [a, b, c] = [points[i - 1], points[i], points[i + 1]];
      const incoming = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const outgoing = Math.hypot(c[0] - b[0], c[1] - b[1]);
      if (!incoming || !outgoing) continue;
      const radius = Math.min(12, incoming / 2, outgoing / 2);
      const before = b.map((value, axis) => value + (a[axis] - value) * radius / incoming);
      const after = b.map((value, axis) => value + (c[axis] - value) * radius / outgoing);
      d += ` L ${before.join(' ')} Q ${b.join(' ')} ${after.join(' ')}`;
    }
    return `${d} L ${points.at(-1).join(' ')}`;
  };

  if (mobile && 'ResizeObserver' in window) {
    const overlay = document.createElementNS(ns, 'svg');
    overlay.setAttribute('class', 'architecture-mobile-connections');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('focusable', 'false');
    mobile.prepend(overlay);
    diagram.classList.add('mobile-connections-ready');
    const root = mobile.querySelector('.architecture-root');
    root.classList.add('architecture-node');
    root.style.setProperty('--d', '.1s');
    const branches = [...mobile.querySelectorAll('.architecture-branch')];
    const routeGroups = [0, 1, 1];
    branches.forEach((branch, index) => {
      branch.querySelector('h3').classList.add('architecture-node');
      branch.querySelector('h3').style.setProperty('--d', `${.17 + index * .07}s`);
      branch.querySelectorAll('ul > li').forEach((feature, featureIndex) => {
        feature.classList.add('architecture-node');
        feature.style.setProperty('--d', `${.4 + index * .025 + featureIndex * .07}s`);
      });
    });
    const draw = () => {
      if (!matchMedia('(max-width: 820px)').matches) return;
      const bounds = mobile.getBoundingClientRect();
      overlay.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const box = element => {
        const r = element.getBoundingClientRect();
        return { left: r.left - bounds.left, top: r.top - bounds.top, bottom: r.bottom - bounds.top, cx: r.left + r.width / 2 - bounds.left, cy: r.top + r.height / 2 - bounds.top };
      };
      const rootBox = box(root);
      const baseLayer = document.createElementNS(ns, 'g');
      const routeLayer = document.createElementNS(ns, 'g');
      baseLayer.setAttribute('class', 'architecture-mobile-base');
      routeLayer.setAttribute('class', 'architecture-mobile-routes');
      const addConnection = (points, branchIndex, step) => {
        const d = roundedPath(points);
        baseLayer.append(makePath(d, 'architecture-edge', .17 + branchIndex * .07 + step * .03));
        routeLayer.append(makePath(d, `architecture-route route-${routeGroups[branchIndex]}`, 0, routeGroups[branchIndex], step));
      };
      branches.forEach((branch, index) => {
        const heading = box(branch.querySelector('h3'));
        const trunk = heading.left - (matchMedia('(max-width: 520px)').matches ? 18 : 10);
        addConnection([[rootBox.cx, rootBox.bottom], [rootBox.cx, rootBox.bottom + 24], [trunk, rootBox.bottom + 24], [trunk, heading.cy], [heading.left, heading.cy]], index, 0);
        branch.querySelectorAll('ul > li').forEach((feature, featureIndex) => {
          const target = box(feature);
          const featureTrunk = target.left - 18;
          addConnection([[featureTrunk, heading.bottom], [featureTrunk, target.cy], [target.left, target.cy]], index, featureIndex + 1);
        });
      });
      // Match desktop: every gray connection is painted before any highlight.
      overlay.replaceChildren(baseLayer, routeLayer);
    };
    const resize = new ResizeObserver(draw);
    resize.observe(mobile);
    resize.observe(root);
    branches.forEach(branch => resize.observe(branch));
    document.fonts?.ready.then(draw);
    draw();
  }

  // Preserve the complete static chart if scripting is unavailable.
  diagram.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    diagram.classList.add('in-view');
    observer.disconnect();
  }, { threshold: 0.05 });
  // A tall mobile tree cannot reach a percentage threshold on the whole figure.
  observer.observe(diagram.querySelector('.architecture-key') || diagram);
  if (mobile) {
    observer.observe(mobile.querySelector('.architecture-root'));
    observer.observe(mobile.querySelector('.architecture-branch h3'));
  }
})();
