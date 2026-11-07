import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import {
  adminEnvironment,
  catalogAuditQueue,
  createPool,
  PgBoss,
  readEnvironment,
} from '@voicely/core';

const { DATABASE_ADMIN_URL } = readEnvironment(adminEnvironment);
const pool = createPool(DATABASE_ADMIN_URL, 1);
const client = await pool.connect();
const boss = new PgBoss({
  connectionString: DATABASE_ADMIN_URL,
  supervise: false,
  schedule: false,
});
boss.on('error', (error) => console.error('Queue migration error:', error.message));
try {
  await client.query('SELECT pg_advisory_lock(742819)');
  await client.query(
    'CREATE TABLE IF NOT EXISTS public.schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const directory = new URL('../packages/core/migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()) {
    const sql = await readFile(new URL(name, directory), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const previous = await client.query<{ checksum: string }>(
      'SELECT checksum FROM public.schema_migrations WHERE name = $1',
      [name],
    );
    if (previous.rows[0]) {
      if (previous.rows[0].checksum !== checksum)
        throw new Error(`Applied migration changed: ${name}. Add a new migration.`);
      continue;
    }
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO public.schema_migrations (name, checksum) VALUES ($1, $2)', [
        name,
        checksum,
      ]);
      await client.query('COMMIT');
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
  await boss.start();
  await boss.createQueue(catalogAuditQueue, { retryLimit: 3, retryDelay: 1, expireInSeconds: 60 });
  await client.query('GRANT USAGE ON SCHEMA pgboss TO voicely_api, voicely_worker');
  await client.query(
    'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA pgboss TO voicely_api, voicely_worker',
  );
  await client.query(
    'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA pgboss TO voicely_api, voicely_worker',
  );
  console.log('Database and queue schema ready.');
} finally {
  await boss.stop();
  await client.query('SELECT pg_advisory_unlock(742819)');
  client.release();
  await pool.end();
}
