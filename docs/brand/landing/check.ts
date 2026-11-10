// Browser verification for the authoring kit, independent of the product API.
import assert from 'node:assert/strict';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 0,
  async fetch(request) {
    const path = resolve(root, `.${decodeURIComponent(new URL(request.url).pathname)}`);
    if (!path.startsWith(root + sep)) return new Response('Not found', { status: 404 });
    const file = Bun.file(path);
    return (await file.exists()) ? new Response(file) : new Response('Not found', { status: 404 });
  },
});
let browser;
try {
  browser = await chromium.launch();
  const base = `http://127.0.0.1:${server.port}`;
  const errors: string[] = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`${base}/landing/index.html`);
  await expect(page.locator('[data-scene-art] svg')).toHaveCount(3);

  for (const name of ['product-advice', 'grounded-answers', 'human-handoff']) {
    const scene = page.locator(`[data-motion-scene="${name}"]`);
    await scene.scrollIntoViewIfNeeded();
    await scene.locator('[data-motion-replay]').click();
    await scene.locator('[data-motion-pause]').click();
    await expect(scene.locator('[data-motion-status]')).toHaveText('Animation paused');
    const frozen = await scene.evaluate(async (element) => {
      const animations = element.getAnimations({ subtree: true });
      // WAAPI pause settles on the next animation frame; observe its ready promise.
      await Promise.all(animations.map((animation) => animation.ready));
      const times = animations.map((animation) => animation.currentTime);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return (
        animations.length > 0 &&
        animations.every(
          (animation, index) =>
            animation.playState === 'paused' && animation.currentTime === times[index],
        )
      );
    });
    assert(frozen, `${name}: pause must freeze the timeline`);
    await scene.locator('[data-motion-pause]').click();
    await expect(scene.locator('[data-motion-status]')).toHaveText('Animation complete', {
      timeout: 6000,
    });
    assert.equal(
      await scene.evaluate((element) => element.getAnimations({ subtree: true }).length),
      0,
    );
    console.log(`${name}: replay, pause/resume, finite playback and cleanup passed`);
  }

  const first = page.locator('[data-motion-scene="product-advice"]');
  await first.scrollIntoViewIfNeeded();
  await first.locator('[data-motion-replay]').click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(first.locator('[data-motion-status]')).toHaveText(
    'Animation paused while offscreen',
  );
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('[data-motion-status]')).toHaveText('Animation playing');
  await first.locator('[data-motion-pause]').click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('[data-motion-status]')).toHaveText('Animation paused');
  console.log('Offscreen pause/resume preserves manual pause');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(first.locator('[data-motion-status]')).toHaveText(
    'Static illustration - reduced motion',
  );
  await expect(first.locator('[data-motion-replay]')).toBeDisabled();
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(first.locator('[data-motion-replay]')).toBeEnabled();
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  console.log('Runtime reduced-motion changes settle all scenes without auto-restarting');

  await page.evaluate(async () => {
    const moduleUrl = new URL('/landing/motion.js', location.href).href;
    const { mountScene } = await import(moduleUrl);
    const element = document.querySelector('[data-motion-scene="product-advice"]')!;
    const controller = mountScene(element);
    await controller.ready;
    controller.replay();
    controller.destroy();
    if (
      !element.querySelector('[data-scene-art] img') ||
      element.getAnimations({ subtree: true }).length
    ) {
      throw new Error('Destroy did not restore the static fallback');
    }
    const remounted = mountScene(element);
    await remounted.ready;
    remounted.destroy();
  });
  console.log('Destroy during playback and remount passed');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/landing/index.html', '/preview.html']) {
      await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('img').first()).toBeVisible();
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        missingImages: [...document.images].filter(
          (image) => !image.complete || !image.naturalWidth,
        ).length,
      }));
      assert(layout.scroll <= width, `${path}: horizontal overflow at ${width}px`);
      assert.equal(layout.missingImages, 0, `${path}: missing images`);
    }
  }
  console.log('Gallery and brand preview: 320/390/768/1440px layouts passed');
  assert.deepEqual(errors, []);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 600 } });
  await mobile.goto(`${base}/landing/index.html`);
  const belowFold = mobile.locator('[data-motion-scene="grounded-answers"]');
  await expect(belowFold.locator('svg')).toHaveCount(1);
  await belowFold.evaluate(async (element) => {
    scrollTo(0, element.getBoundingClientRect().top + scrollY - 300);
    // Allow the scroll/layout and its IntersectionObserver delivery to settle.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assert(
    await belowFold
      .locator('[data-scene-art]')
      .evaluate((element) => element.getBoundingClientRect().top > innerHeight),
  );
  await expect(belowFold.locator('[data-motion-status]')).toHaveText('Static illustration');
  assert.equal(
    await belowFold.evaluate((element) => element.getAnimations({ subtree: true }).length),
    0,
  );
  await belowFold.locator('[data-scene-art]').scrollIntoViewIfNeeded();
  await expect(belowFold.locator('[data-motion-status]')).toHaveText('Animation playing');
  await expect(belowFold.locator('[data-motion-status]')).toHaveText('Animation complete', {
    timeout: 6000,
  });
  await mobile.close();
  console.log('Mobile copy-only visibility leaves artwork unplayed until it enters the viewport');

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${base}/landing/index.html`);
  await expect(staticPage.locator('[data-scene-art] img')).toHaveCount(3);
  assert(
    await staticPage
      .locator('[data-scene-art] img')
      .evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  );
  await noJs.close();
  console.log('No-JavaScript static fallback passed');

  const failurePage = await browser.newPage();
  await failurePage.route('**/grounded-answers.svg', (route) =>
    route.request().resourceType() === 'fetch'
      ? route.fulfill({ status: 503, body: 'Injected SVG fetch failure' })
      : route.continue(),
  );
  await failurePage.goto(`${base}/landing/index.html`);
  const failed = failurePage.locator('[data-motion-scene="grounded-answers"]');
  await expect(failed.locator('[data-motion-status]')).toHaveText(
    'Static illustration - animation unavailable',
  );
  await expect(failed.locator('[data-scene-art] img')).toBeVisible();
  await expect(failed.locator('[data-motion-replay]')).toBeDisabled();
  await failurePage.close();
  console.log('Failed SVG enhancement retains the static illustration');
} finally {
  await browser?.close();
  server.stop(true);
}
