// Native document scrolling with a short, frame-rate-independent wheel glide.
// Touch, keyboard, scrollbar dragging and reduced motion stay browser-native.
(() => {
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, target = 0, position = 0, previous = 0;
  let limit = 0;
  const clamp = value => Math.max(0, Math.min(limit, value));
  const measure = () => {
    limit = Math.max(0, root.scrollHeight - innerHeight);
    target = clamp(target);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('wheel-gliding');
    position = target = scrollY;
  };
  const tick = now => {
    const elapsed = Math.min(64, now - previous);
    previous = now;
    position += (target - position) * (1 - Math.exp(-elapsed / 115));
    if (Math.abs(target - position) < 0.5) {
      window.scrollTo({ top: target, behavior: 'instant' });
      stop();
      return;
    }
    window.scrollTo({ top: position, behavior: 'instant' });
    frame = requestAnimationFrame(tick);
  };
  const nestedScroller = (element, delta) => {
    for (let node = element; node instanceof Element && node !== document.body; node = node.parentElement) {
      if (node.matches('input, textarea, select, [contenteditable="true"], [data-native-scroll]')) return true;
      if (node.scrollHeight > node.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(node).overflowY)) {
        if (delta < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
      }
    }
    return false;
  };
  window.addEventListener('wheel', event => {
    if (motion.matches || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!event.deltaY || nestedScroller(event.target, event.deltaY)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!frame) position = target = scrollY;
    // Reverse immediately instead of continuing in the old direction.
    if ((target - position) * delta < 0) target = position;
    const next = clamp(target + delta);
    if (next === target && !frame) return;
    event.preventDefault();
    target = next;
    if (!frame) {
      root.classList.add('wheel-gliding');
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }, { passive: false });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(event.key)) stop();
  });
  // Stop before anchor navigation or the ink effect captures the current page.
  document.addEventListener('click', stop, true);
  window.addEventListener('hashchange', stop);
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', stop);
  motion.addEventListener('change', stop);
  window.addEventListener('resize', measure, { passive: true });
  new ResizeObserver(measure).observe(document.body);
  window.addEventListener('load', () => {
    if (!window.location.hash || window.location.hash === '#home') {
      window.scrollTo(0, 0);
      position = target = 0;
    }
  });
  measure();
})();
