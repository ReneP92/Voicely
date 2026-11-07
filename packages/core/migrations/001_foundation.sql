CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA app;

CREATE TABLE app.tenants (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  public_catalog boolean NOT NULL DEFAULT false
);

CREATE TABLE app.products (
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL CHECK (currency = 'USD'),
  variants jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  PRIMARY KEY (tenant_id, id)
);

-- Synthetic fixtures are not the future private-order/identity schema.
-- No application role can read this table.
CREATE TABLE app.demo_fixtures (
  tenant_id uuid PRIMARY KEY REFERENCES app.tenants(id),
  version integer NOT NULL,
  fixture jsonb NOT NULL
);

CREATE TABLE app.demo_audits (
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  job_id uuid NOT NULL,
  product_count integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, job_id)
);

ALTER TABLE app.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.products FORCE ROW LEVEL SECURITY;
CREATE POLICY product_tenant ON app.products
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE app.demo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.demo_audits FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_tenant ON app.demo_audits
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

GRANT USAGE ON SCHEMA app TO voicely_api, voicely_worker;
GRANT SELECT ON app.tenants, app.products TO voicely_api, voicely_worker;
GRANT SELECT, INSERT ON app.demo_audits TO voicely_worker;
