import {
  adminEnvironment,
  createDemoFixtures,
  createPool,
  demoTenantId,
  isolationTenantId,
  readEnvironment,
} from '@voicely/core';

const { DATABASE_ADMIN_URL } = readEnvironment(adminEnvironment);
const fixture = createDemoFixtures(
  process.env.DEMO_CLOCK ? new Date(process.env.DEMO_CLOCK) : new Date(),
);
const pool = createPool(DATABASE_ADMIN_URL, 1);
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(742820)');
  for (const tenant of [
    fixture.merchant,
    { id: isolationTenantId, slug: 'isolation-outfitters', name: 'Isolation Outfitters' },
  ]) {
    const existing = await client.query<{ is_demo: boolean }>(
      'SELECT is_demo FROM app.tenants WHERE id = $1',
      [tenant.id],
    );
    if (existing.rows[0] && !existing.rows[0].is_demo)
      throw new Error('Fixture ID belongs to a non-demo tenant; refusing reset.');
    await client.query(
      'INSERT INTO app.tenants (id, slug, name, is_demo, public_catalog) VALUES ($1, $2, $3, true, true) ON CONFLICT (id) DO UPDATE SET slug = excluded.slug, name = excluded.name',
      [tenant.id, tenant.slug, tenant.name],
    );
    await client.query('DELETE FROM app.products WHERE tenant_id = $1', [tenant.id]);
    await client.query('DELETE FROM app.demo_audits WHERE tenant_id = $1', [tenant.id]);
    const products =
      tenant.id === demoTenantId
        ? fixture.products
        : [
            {
              ...fixture.products[0]!,
              title: 'Isolation-only sample',
              description: 'A second merchant fixture for tenant boundary checks.',
            },
          ];
    for (const product of products) {
      await client.query(
        'INSERT INTO app.products (tenant_id, id, title, description, price_cents, currency, variants, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          tenant.id,
          product.id,
          product.title,
          product.description,
          product.priceCents,
          product.currency,
          JSON.stringify(product.variants),
          product.published,
        ],
      );
    }
  }
  await client.query(
    'INSERT INTO app.demo_fixtures (tenant_id, version, fixture) VALUES ($1, $2, $3) ON CONFLICT (tenant_id) DO UPDATE SET version = excluded.version, fixture = excluded.fixture',
    [demoTenantId, fixture.version, JSON.stringify(fixture)],
  );
  await client.query('COMMIT');
  console.log(
    `Trailside Supply v${fixture.version}: ${fixture.products.length} products, ${fixture.orders.length} synthetic orders, ${fixture.scenarios.length} evaluation cases. Clock: ${fixture.generatedAt}`,
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
