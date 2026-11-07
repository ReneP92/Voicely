import pg from 'pg';
import { z } from 'zod';

export function createPool(connectionString: string, max = 5): pg.Pool {
  return new pg.Pool({
    connectionString,
    max,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    statement_timeout: 10000,
    application_name: 'voicely',
  });
}

export async function withTenant<T>(
  pool: pg.Pool,
  tenantId: string,
  action: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  z.uuid().parse(tenantId);
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}

export type { Pool, PoolClient } from 'pg';
