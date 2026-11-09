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

Planned: a fully functional local React storefront/widget and merchant admin using the same application core and production domain contracts. A synthetic Trailside commerce adapter will supply repeatable authorized commerce facts. Local OIDC will enforce staff memberships/roles, knowledge uploads will persist through a filesystem-backed adapter, and SMTP/Mailpit will capture destination verification, trusted-order-contact shopper codes and support email for synthetic tenants only. None of these product surfaces/adapters is implemented by the foundation.

The planned browser journey starts from a fresh checkout: staff login, upload/publish knowledge, widget advice, guest verification, authorized order lookup, request review/submit and truthful Mailpit status. Include restart persistence, tenancy/shopper isolation, lost responses, cancellation, duplicate submission, worker fencing and uncertain sends. Preview is non-dispatching; the synthetic local storefront/runtime is the dispatch-capable demo. SMTP acceptance and Mailpit capture are not human inbox delivery or resolution. Keep PER-32's no-blind-resend/no-reroute rules and provider-specific evidence.

Interactive acceptance requires real models with user-configured provider credentials; deterministic model doubles are for ordinary CI, not AI quality claims. No AWS account/deployment is required, but local does not mean fully offline. PER-30 owns later AWS deployment and Cognito/S3/SES adapters.

A Shopify development store and real CRM connections remain separate provider-validation paths that can run against local services with credentials and a tunnel where needed. Shopify development stores require account access, remain password protected and cannot process real transactions. Synthetic commerce/mail capture does not validate those providers. A future public demo must clearly label synthetic data and simulated operational actions and use the same application core rather than a separate hard-coded chatbot.

The fixture scenarios are reference expectations, not measured model evaluation scores. Real policy eligibility, order ownership, connector state and handoff semantics require implementation and validation.

Ownership: [PER-33 local runtime/adapters and synthetic commerce](https://linear.app/personal-rp501/issue/PER-33), [PER-34 complete local acceptance](https://linear.app/personal-rp501/issue/PER-34), [PER-17 local synthetic guest proof](https://linear.app/personal-rp501/issue/PER-17), and [PER-27 actual provider proof](https://linear.app/personal-rp501/issue/PER-27). [PER-30 AWS deployment](https://linear.app/personal-rp501/issue/PER-30) is in milestone06, blocked by PER-34.

Sources: [PER-29](https://linear.app/personal-rp501/issue/PER-29), [PER-32 v2 local-first amendment](https://linear.app/personal-rp501/issue/PER-32), [Shopify dev stores](https://shopify.dev/docs/apps/build/stores/development-stores).
