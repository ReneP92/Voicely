import { apiEnvironment, createPool, readEnvironment } from '@voicely/core';
import { createApp } from './app.ts';

const config = readEnvironment(apiEnvironment);
const pool = createPool(config.DATABASE_URL);
const app = createApp(pool, config.LOG_LEVEL);
pool.on('error', () => app.log.error('Database pool connection failed'));
app.addHook('onClose', async () => pool.end());
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000).unref();
    void app
      .close()
      .then(() => clearTimeout(deadline))
      .catch(() => process.exit(1));
  });
}
try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  await app.close();
  throw error;
}
