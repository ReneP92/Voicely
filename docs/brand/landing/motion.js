const sceneNames = new Set(['product-advice', 'grounded-answers', 'human-handoff']);
const mounted = new WeakMap();
const maxDuration = 4000;

function milliseconds(value, fallback, maximum) {
  const number = value === undefined ? fallback : Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(0, number)) : fallback;
}

/**
 * Enhance a scene once. Returns { ready, replay, pause, resume, destroy }.
 * `ready` resolves after loading (including static fallback on failure).
 * `destroy()` is synchronous, aborts loading and restores the original image.
 * Repeated mounts return the same controller until it is destroyed.
 * Serve this ES module and its three trusted SVG assets over HTTP(S).
 */
export function mountScene(element) {
  if (mounted.has(element)) return mounted.get(element);

  const name = element.dataset.motionScene;
  const image = element.querySelector('[data-scene-art] img');
  const replayButton = element.querySelector('[data-motion-replay]');
  const pauseButton = element.querySelector('[data-motion-pause]');
  const status = element.querySelector('[data-motion-status]');
  if (!sceneNames.has(name) || !image || !replayButton || !pauseButton || !status) {
    throw new TypeError('A motion scene needs a known name, image and controls.');
  }

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let svg;
  let animations = [];
  let restoreStyles = [];
  let generation = 0;
  let destroyed = false;
  let failed = false;
  let played = media.matches;
  let manuallyPaused = false;
  let inView = !('IntersectionObserver' in window);
  let active = false;

  function render() {
    replayButton.disabled = !svg || failed || media.matches;
    pauseButton.disabled = !active || media.matches;
    pauseButton.textContent = manuallyPaused ? 'Resume' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    if (media.matches) {
      status.textContent = 'Static illustration - reduced motion';
    } else if (failed) {
      status.textContent = 'Static illustration - animation unavailable';
    } else if (active) {
      status.textContent = manuallyPaused
        ? 'Animation paused'
        : document.hidden
          ? 'Animation paused while page is hidden'
          : !inView
            ? 'Animation paused while offscreen'
            : 'Animation playing';
    } else {
      status.textContent = played ? 'Animation complete' : 'Static illustration';
    }
  }

  function clearAnimation() {
    generation += 1;
    active = false;
    for (const animation of animations) animation.cancel();
    animations = [];
    for (const restore of restoreStyles) restore();
    restoreStyles = [];
  }

  function report(error) {
    clearAnimation();
    manuallyPaused = false;
    if (!failed) console.error(`Could not animate the ${name} illustration.`, error);
    failed = true;
    render();
  }

  function syncPlayback() {
    if (destroyed) return;
    if (media.matches) {
      clearAnimation();
      played = true;
      manuallyPaused = false;
    } else if (active) {
      const shouldPause = manuallyPaused || !inView || document.hidden;
      for (const animation of animations) {
        if (shouldPause && animation.playState === 'running') animation.pause();
        if (!shouldPause && animation.playState === 'paused') animation.play();
      }
    } else if (!played && svg && inView && !document.hidden && !failed) {
      replay();
      return;
    }
    render();
  }

  function replay() {
    if (destroyed || !svg || failed || media.matches) return;
    clearAnimation();
    played = true;
    manuallyPaused = false;
    active = true;
    const currentGeneration = generation;
    const completions = [];

    try {
      for (const node of svg.querySelectorAll('[data-motion]')) {
        const kind = node.dataset.motion;
        if (!['reveal', 'trace', 'accent'].includes(kind)) continue;
        const delay = milliseconds(node.dataset.delay, 0, maxDuration - 1);
        const duration = milliseconds(
          node.dataset.duration,
          Math.min(650, maxDuration - delay),
          maxDuration - delay,
        );
        const opacity = getComputedStyle(node).opacity;
        let keyframes;
        if (kind === 'trace') {
          if (typeof node.getTotalLength !== 'function') continue;
          const length = node.pathLength?.baseVal.value || node.getTotalLength();
          if (!Number.isFinite(length) || length <= 0) continue;
          keyframes = [
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 },
          ];
        } else {
          const originalStyle = node.getAttribute('style');
          restoreStyles.push(() => {
            if (originalStyle === null) node.removeAttribute('style');
            else node.setAttribute('style', originalStyle);
          });
          node.style.transformBox = 'fill-box';
          node.style.transformOrigin = 'center';
          // Individual transform properties preserve authored SVG transforms.
          keyframes =
            kind === 'reveal'
              ? [
                  { opacity: 0, translate: '0 8px' },
                  { opacity, translate: '0 0' },
                ]
              : [
                  { opacity, scale: '1' },
                  { opacity: Number(opacity) * 0.88, scale: '1.025' },
                  { opacity, scale: '1' },
                ];
        }
        const animation = node.animate(keyframes, {
          delay,
          duration,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
          iterations: 1,
        });
        animation.pause();
        animation.currentTime = 0;
        animations.push(animation);
        // Observe rejection immediately, including cancellation during setup.
        completions.push(
          animation.finished.catch((error) => {
            if (error.name !== 'AbortError') report(error);
          }),
        );
      }
      Promise.all(completions).then(() => {
        if (destroyed || generation !== currentGeneration) return;
        clearAnimation();
        manuallyPaused = false;
        render();
      });
      syncPlayback();
    } catch (error) {
      report(error);
    }
  }

  function pause() {
    if (destroyed || !active) return;
    manuallyPaused = true;
    syncPlayback();
  }

  function resume() {
    if (destroyed || !active) return;
    manuallyPaused = false;
    syncPlayback();
  }

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1].isIntersecting;
          syncPlayback();
        })
      : null;
  observer?.observe(element.querySelector('[data-scene-art]'));
  replayButton.addEventListener('click', replay, { signal: events.signal });
  pauseButton.addEventListener('click', () => (manuallyPaused ? resume() : pause()), {
    signal: events.signal,
  });
  media.addEventListener('change', syncPlayback, { signal: events.signal });
  document.addEventListener('visibilitychange', syncPlayback, {
    signal: events.signal,
  });

  async function load() {
    try {
      if (typeof Element.prototype.animate !== 'function') {
        failed = true;
        render();
        return;
      }
      const response = await fetch(new URL(`./${name}.svg`, import.meta.url), {
        signal: events.signal,
      });
      if (!response.ok) throw new Error(`SVG request returned ${response.status}`);
      const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      const root = parsed.documentElement;
      if (
        parsed.querySelector('parsererror') ||
        root.localName !== 'svg' ||
        root.namespaceURI !== 'http://www.w3.org/2000/svg'
      ) {
        throw new Error('The illustration is not a valid SVG.');
      }
      if (destroyed) return;
      svg = document.importNode(root, true);
      image.replaceWith(svg);
      syncPlayback();
    } catch (error) {
      if (destroyed && error.name === 'AbortError') return;
      report(error);
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    events.abort();
    observer?.disconnect();
    clearAnimation();
    svg?.replaceWith(image);
    replayButton.disabled = true;
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
    pauseButton.setAttribute('aria-pressed', 'false');
    status.textContent = 'Static illustration';
    mounted.delete(element);
  }

  const controller = { ready: load(), replay, pause, resume, destroy };
  mounted.set(element, controller);
  render();
  return controller;
}

function mountPage() {
  for (const element of document.querySelectorAll('[data-motion-scene]')) {
    mountScene(element);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountPage, { once: true });
} else {
  mountPage();
}
