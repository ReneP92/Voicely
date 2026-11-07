import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:4101', trace: 'retain-on-failure' },
  webServer: {
    command: 'bun run build && bun scripts/dev.ts --production',
    env: { HOST: '127.0.0.1', PORT: '4101', LOG_LEVEL: 'warn' },
    url: 'http://127.0.0.1:4101/health/ready',
    reuseExistingServer: false,
    timeout: 60000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 20000 },
  },
});
