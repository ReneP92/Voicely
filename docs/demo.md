# Trailside Supply

Trailside Supply is a fictional US-English outdoor clothing/accessories merchant. It is the shared fixture set for local development, evaluations and future demos, not a real customer or validated market segment.

## Included fixtures

`packages/core/src/demo.ts` defines version 1:

- 20 products: jackets, layers, pants, socks, packs and accessories, with variants and an out-of-stock size.
- Two synthetic customers using non-deliverable `example.invalid` addresses.
- Four orders covering a recent delivery, an expired return window, an in-transit order and a final-sale item.
- Returns/exchanges, shipping, warranty and care policies.
- Twelve sales/support scenarios covering advice, compatibility, ambiguity, stock, exchange requests, policy exclusions, identity boundaries, uncertain delivery and unsupported claims.
- A second merchant, Isolation Outfitters, with a distinct catalog for cross-tenant checks.

The demo's unused policies and private synthetic facts are stored in an admin-only fixture table. That JSON is not the production private-order or knowledge schema. API/worker roles cannot read it.

## Reset and clock

```sh
bun run demo:reset
DEMO_CLOCK=2026-11-04T12:00:00Z bun run demo:reset
```

The default clock is the current time. All order ages are relative, preserving in-window/out-of-window examples. IDs and SKUs stay stable. A fixed clock makes tests reproducible. Reset updates only reserved demo IDs and refuses to overwrite a non-demo tenant using those IDs. It does not reset unrelated tenants or delete queue history; stop active demo work before resetting fixtures.

## Demo surfaces

Implemented: public catalog JSON at `/v1/demo/trailside-supply/products`, a durable background catalog audit, and fixture-based test inputs.

Planned: custom-site storefront/widget and a Shopify development store. Shopify development stores require account access, remain password protected and cannot process real transactions. A future public demo must clearly label synthetic data and simulated operational actions. It should use the same application core rather than a separate hard-coded chatbot.

The fixture scenarios are reference expectations, not measured model evaluation scores. Real policy eligibility, order ownership, connector state and handoff semantics require implementation and validation.

Sources: [PER-29](https://linear.app/personal-rp501/issue/PER-29), [Shopify dev stores](https://shopify.dev/docs/apps/build/stores/development-stores).
