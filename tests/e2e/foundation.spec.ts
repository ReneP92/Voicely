import { expect, test } from '@playwright/test';
import {
  adminEnvironment,
  catalogAuditQueue,
  createPool,
  createQueue,
  demoTenantId,
  readEnvironment,
  workerEnvironment,
} from '@voicely/core';

test('built API serves only the selected public demo catalog', async ({ request }) => {
  expect((await request.get('/health/live')).status()).toBe(200);
  const first = await request.get('/v1/demo/trailside-supply/products');
  expect(first.status()).toBe(200);
  const body = await first.json();
  expect(body.synthetic).toBe(true);
  expect(body.products).toHaveLength(20);
  expect(
    body.products.some((product: { title: string }) => product.title === 'Rainline Shell'),
  ).toBe(true);
  expect(JSON.stringify(body)).not.toContain('example.invalid');
  expect(JSON.stringify(body)).not.toContain('TS-1001');
  const second = await request.get('/v1/demo/isolation-outfitters/products');
  expect((await second.json()).products.map((product: { title: string }) => product.title)).toEqual(
    ['Isolation-only sample'],
  );
  expect((await request.get('/v1/demo/unknown/products')).status()).toBe(404);
  expect((await request.get('/v1/demo/INVALID/products')).status()).toBe(400);
  expect((await request.get('/v1/demo/trailside-supply/orders')).status()).toBe(404);
});

test('separately running worker consumes a durable job and records the tenant-scoped result', async () => {
  const boss = createQueue(readEnvironment(workerEnvironment).WORKER_DATABASE_URL);
  const admin = createPool(readEnvironment(adminEnvironment).DATABASE_ADMIN_URL, 1);
  let id: string | null = null;
  try {
    await boss.start();
    id = await boss.send(catalogAuditQueue, { tenantId: demoTenantId });
    expect(id).not.toBeNull();
    await expect
      .poll(
        async () =>
          (
            await admin.query(
              'SELECT product_count FROM app.demo_audits WHERE tenant_id = $1 AND job_id = $2',
              [demoTenantId, id],
            )
          ).rows,
        { timeout: 15000 },
      )
      .toEqual([{ product_count: 20 }]);
    await expect
      .poll(
        async () =>
          (await admin.query('SELECT state FROM pgboss.job WHERE id = $1', [id])).rows[0]?.state,
        { timeout: 15000 },
      )
      .toBe('completed');
  } finally {
    if (id) {
      await boss.deleteJob(catalogAuditQueue, id);
      await admin.query('DELETE FROM app.demo_audits WHERE job_id = $1', [id]);
    }
    await boss.stop();
    await admin.end();
  }
});
