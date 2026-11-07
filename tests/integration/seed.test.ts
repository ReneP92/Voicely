import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import { adminEnvironment, createPool, demoTenantId, readEnvironment } from '@voicely/core';

const exec = promisify(execFile);
it('repeats migrations and reset without duplicating fixtures or modifying another tenant', async () => {
  const pool = createPool(readEnvironment(adminEnvironment).DATABASE_ADMIN_URL, 1);
  const outsider = randomUUID();
  try {
    await pool.query('INSERT INTO app.tenants (id, slug, name) VALUES ($1, $2, $3)', [
      outsider,
      outsider,
      'Preserve me',
    ]);
    for (let pass = 0; pass < 2; pass++) {
      await exec(process.execPath, ['--conditions=development', 'scripts/migrate.ts'], {
        env: process.env,
      });
      await exec(process.execPath, ['--conditions=development', 'scripts/seed.ts'], {
        env: { ...process.env, DEMO_CLOCK: '2026-11-04T12:00:00Z' },
      });
    }
    expect(
      (await pool.query('SELECT title FROM app.products WHERE tenant_id = $1', [demoTenantId]))
        .rowCount,
    ).toBe(20);
    expect(
      (await pool.query('SELECT name FROM app.tenants WHERE id = $1', [outsider])).rows,
    ).toEqual([{ name: 'Preserve me' }]);
    const saved = await pool.query<{ fixture: { generatedAt: string } }>(
      'SELECT fixture FROM app.demo_fixtures WHERE tenant_id = $1',
      [demoTenantId],
    );
    expect(saved.rows[0]!.fixture.generatedAt).toBe('2026-11-04T12:00:00.000Z');
  } finally {
    await pool.query('DELETE FROM app.tenants WHERE id = $1', [outsider]);
    await pool.end();
  }
}, 30000);
