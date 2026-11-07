import Fastify from 'fastify';
import { withTenant, type Pool } from '@voicely/core';

export function createApp(pool: Pool, logLevel = 'silent') {
  const app = Fastify({
    logger: { level: logLevel, redact: ['req.headers.authorization', 'req.headers.cookie'] },
    bodyLimit: 32768,
    requestTimeout: 15000,
    trustProxy: false,
  });
  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/health/ready', async (_request, reply) => {
    try {
      await pool.query('SELECT id FROM app.tenants LIMIT 1');
      return { status: 'ready' };
    } catch {
      return reply.code(503).send({ status: 'unavailable' });
    }
  });

  app.get<{ Params: { site: string } }>(
    '/v1/demo/:site/products',
    {
      schema: {
        params: {
          type: 'object',
          required: ['site'],
          additionalProperties: false,
          properties: { site: { type: 'string', pattern: '^[a-z0-9-]{1,80}$' } },
        },
        response: {
          200: {
            type: 'object',
            required: ['synthetic', 'products'],
            properties: {
              synthetic: { type: 'boolean' },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'title', 'description', 'priceCents', 'currency', 'variants'],
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priceCents: { type: 'integer' },
                    currency: { type: 'string' },
                    variants: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['sku', 'size', 'color', 'stock'],
                        properties: {
                          sku: { type: 'string' },
                          size: { type: 'string' },
                          color: { type: 'string' },
                          stock: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Public demo catalog only. A site slug never authenticates a shopper or private data.
      const tenant = await pool.query<{ id: string }>(
        'SELECT id FROM app.tenants WHERE slug = $1 AND is_demo = true AND public_catalog = true',
        [request.params.site],
      );
      if (!tenant.rows[0]) return reply.code(404).send({ code: 'SITE_NOT_FOUND' });
      const products = await withTenant(
        pool,
        tenant.rows[0].id,
        async (client) =>
          (
            await client.query(
              'SELECT id, title, description, price_cents AS "priceCents", currency, variants FROM app.products WHERE published = true ORDER BY title',
            )
          ).rows,
      );
      return { synthetic: true, products };
    },
  );

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof Error && 'validation' in error)
      return reply.code(400).send({ code: 'INVALID_REQUEST', requestId: request.id });
    request.log.error({ code: 'REQUEST_FAILED', requestId: request.id }, 'Request failed');
    return reply.code(500).send({ code: 'INTERNAL_ERROR', requestId: request.id });
  });
  return app;
}
