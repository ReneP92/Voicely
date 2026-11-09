// Export helper, invoked by build.py. Uses the workspace's pinned Playwright.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const jobs: { source: string; destination: string; width: number; height: number }[] = JSON.parse(
  await readFile(process.argv[2]!, 'utf8'),
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const job of jobs) {
    const svg = await readFile(join(root, job.source), 'utf8');
    await page.setViewportSize({ width: job.width, height: job.height });
    await page.setContent(
      `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`,
    );
    const png = await page.screenshot({ omitBackground: true });
    await writeFile(join(root, job.destination), png);
  }
} finally {
  await browser.close();
}
