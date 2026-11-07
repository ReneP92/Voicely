import { PgBoss, type Db } from 'pg-boss';
import type { PoolClient } from 'pg';

export const catalogAuditQueue = 'demo.catalog-audit';

export function createQueue(connectionString: string, supervise = false): PgBoss {
  return new PgBoss({
    connectionString,
    max: 2,
    connectionTimeoutMillis: 5000,
    migrate: false,
    createSchema: false,
    supervise,
    reindex: false,
    schedule: false,
  });
}

// Enqueue on the caller's existing transaction, never a separate pool connection.
export function transactionDatabase(client: PoolClient): Db {
  return { executeSql: (text, values) => client.query(text, values) };
}

export { PgBoss };
