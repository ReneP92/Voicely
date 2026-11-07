import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  adminEnvironment,
  apiEnvironment,
  catalogAuditQueue,
  createPool,
  createQueue,
  demoTenantId,
  isolationTenantId,
  readEnvironment,
  transactionDatabase,
  withTenant,
  workerEnvironment,
} from '@voicely/core';

const admin = createPool(readEnvironment(adminEnvironment).DATABASE_ADMIN_URL, 1);
const api = createPool(readEnvironment(apiEnvironment).DATABASE_URL, 1);
const worker = createPool(readEnvironment(workerEnvironment).WORKER_DATABASE_URL, 1);
const boss = createQueue(readEnvironment(workerEnvironment).WORKER_DATABASE_URL);
const jobIds: string[] = [];

beforeAll(async () => {
  await boss.start();
});
afterAll(async () => {
  for (const id of jobIds) {
    await boss.deleteJob(catalogAuditQueue, id);
    await admin.query('DELETE FROM app.demo_audits WHERE job_id = $1', [id]);
  }
  await boss.stop();
  await Promise.all([api.end(), worker.end(), admin.end()]);
});

describe('real database tenant boundaries', () => {
  it('runs API and worker roles without ownership, superuser or RLS bypass', async () => {
    for (const pool of [api, worker]) {
      const role = await pool.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
        'SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user',
      );
      expect(role.rows[0]).toEqual({ rolsuper: false, rolbypassrls: false });
      const ownership = await pool.query(
        'SELECT 1 FROM pg_tables WHERE schemaname = $1 AND tableowner = current_user',
        ['app'],
      );
      expect(ownership.rowCount).toBe(0);
      await expect(pool.query('SELECT fixture FROM app.demo_fixtures')).rejects.toThrow(
        'permission denied',
      );
    }
    const extension = await admin.query('SELECT extversion FROM pg_extension WHERE extname = $1', [
      'vector',
    ]);
    expect(extension.rowCount).toBe(1);
  });

  it('isolates both roles and clears tenant context after commit and rollback on the same pooled connection', async () => {
    for (const pool of [api, worker]) {
      expect((await pool.query('SELECT * FROM app.products')).rowCount).toBe(0);
      const first = await withTenant(pool, demoTenantId, (client) =>
        client.query('SELECT title FROM app.products'),
      );
      expect(first.rowCount).toBe(20);
      expect((await pool.query('SELECT * FROM app.products')).rowCount).toBe(0);
      await expect(
        withTenant(pool, demoTenantId, async (client) => {
          await client.query('SELECT * FROM app.products');
          throw new Error('Simulated interrupted operation');
        }),
      ).rejects.toThrow('interrupted');
      const second = await withTenant(pool, isolationTenantId, (client) =>
        client.query('SELECT title FROM app.products'),
      );
      expect(second.rows).toEqual([{ title: 'Isolation-only sample' }]);
      expect((await pool.query('SELECT * FROM app.products')).rowCount).toBe(0);
    }
  });

  it('rejects cross-tenant writes even when the worker knows the target tenant ID', async () => {
    await expect(
      withTenant(worker, demoTenantId, (client) =>
        client.query(
          'INSERT INTO app.demo_audits (tenant_id, job_id, product_count) VALUES ($1, $2, 0)',
          [isolationTenantId, randomUUID()],
        ),
      ),
    ).rejects.toThrow('row-level security');
  });
});

describe('transactional scheduling', () => {
  it('allows runtime worker maintenance without schema ownership', async () => {
    await expect(boss.supervise(catalogAuditQueue)).resolves.toBeUndefined();
  });

  it('rolls back both the business write and queue enqueue', async () => {
    const businessId = randomUUID();
    let jobId: string | null = null;
    await expect(
      withTenant(worker, demoTenantId, async (client) => {
        await client.query(
          'INSERT INTO app.demo_audits (tenant_id, job_id, product_count) VALUES ($1, $2, 20)',
          [demoTenantId, businessId],
        );
        jobId = await boss.send(
          catalogAuditQueue,
          { tenantId: demoTenantId },
          { db: transactionDatabase(client) },
        );
        throw new Error('Simulated rollback');
      }),
    ).rejects.toThrow('Simulated rollback');
    expect(jobId).not.toBeNull();
    expect(
      (await admin.query('SELECT * FROM app.demo_audits WHERE job_id = $1', [businessId])).rowCount,
    ).toBe(0);
    expect((await admin.query('SELECT id FROM pgboss.job WHERE id = $1', [jobId])).rowCount).toBe(
      0,
    );
  });

  it('commits a business write and its job together', async () => {
    await withTenant(worker, demoTenantId, async (client) => {
      const jobId = await boss.send(
        catalogAuditQueue,
        { tenantId: demoTenantId },
        { db: transactionDatabase(client) },
      );
      expect(jobId).not.toBeNull();
      jobIds.push(jobId!);
      await client.query(
        'INSERT INTO app.demo_audits (tenant_id, job_id, product_count) VALUES ($1, $2, 20)',
        [demoTenantId, jobId],
      );
    });
    const id = jobIds.at(-1)!;
    expect(
      (await admin.query('SELECT * FROM app.demo_audits WHERE job_id = $1', [id])).rowCount,
    ).toBe(1);
    expect((await admin.query('SELECT id FROM pgboss.job WHERE id = $1', [id])).rowCount).toBe(1);
  });
});
