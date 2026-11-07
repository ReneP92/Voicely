import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { conditions: ['development'] },
        test: { name: 'unit', include: ['tests/unit/**/*.test.ts'] },
      },
      {
        resolve: { conditions: ['development'] },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          fileParallelism: false,
          testTimeout: 15000,
          hookTimeout: 15000,
        },
      },
    ],
  },
});
