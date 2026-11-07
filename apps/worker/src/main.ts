import {
  catalogAuditQueue,
  createPool,
  createQueue,
  readEnvironment,
  withTenant,
  workerEnvironment,
} from '@voicely/core';

const config = readEnvironment(workerEnvironment);
const pool = createPool(config.WORKER_DATABASE_URL, 2);
const boss = createQueue(config.WORKER_DATABASE_URL, true);
pool.on('error', () => console.error(JSON.stringify({ event: 'worker.database_error' })));
boss.on('error', () => console.error(JSON.stringify({ event: 'worker.queue_error' })));
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 15000).unref();
  try {
    await boss.stop({ graceful: true, timeout: 10000 });
    await pool.end();
    clearTimeout(deadline);
  } catch {
    process.exitCode = 1;
  }
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
try {
  await boss.start();
  await boss.work<{ tenantId: string }>(
    catalogAuditQueue,
    { pollingIntervalSeconds: 1, batchSize: 1 },
    async (jobs) => {
      for (const job of jobs) {
        await withTenant(pool, job.data.tenantId, async (client) => {
          const count = await client.query<{ count: number }>(
            'SELECT count(*)::int AS count FROM app.products WHERE published = true',
          );
          await client.query(
            'INSERT INTO app.demo_audits (tenant_id, job_id, product_count) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [job.data.tenantId, job.id, count.rows[0]!.count],
          );
        });
        console.log(JSON.stringify({ event: 'worker.catalog_audited', jobId: job.id }));
      }
    },
  );
  console.log(JSON.stringify({ event: 'worker.ready' }));
} catch (error) {
  await stop();
  throw error;
}
