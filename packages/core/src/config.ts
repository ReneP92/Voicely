import { z } from 'zod';

const databaseUrl = z
  .url()
  .refine(
    (value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol),
    'Expected a PostgreSQL URL',
  );

export const apiEnvironment = z.object({
  DATABASE_URL: databaseUrl,
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export function readEnvironment<T>(
  schema: z.ZodType<T>,
  environment: NodeJS.ProcessEnv = process.env,
): T {
  const result = schema.safeParse(environment);
  if (!result.success) {
    // Report field names, never connection strings or submitted values.
    throw new Error(
      `Invalid environment: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}. See .env.example.`,
    );
  }
  return result.data;
}

export const workerEnvironment = z.object({ WORKER_DATABASE_URL: databaseUrl });
export const adminEnvironment = z.object({ DATABASE_ADMIN_URL: databaseUrl });
