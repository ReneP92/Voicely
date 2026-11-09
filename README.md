# Voicely

Voicely is a planned AI sales and support service for B2C SMEs, starting with **physical-product Shopify shops**. Customers interact through a pop-up website chat widget for product advice, verified order enquiries, and return/exchange guidance. Requests needing staff go to an existing helpdesk or the merchant's support email, with human follow-up by email.

**Status: local engineering foundation.** The Bun workspace runs a Fastify API, a separate pg-boss worker process, PostgreSQL/pgvector, and repeatable synthetic demo fixtures. The customer-facing AI application, merchant admin, Shopify integration and external delivery are still planned. The approved first version will be fully functional locally without an AWS account or deployment. Local does not mean fully offline: interactive acceptance requires real model calls with user-configured provider credentials.

## Quick start

Install Bun **1.4.4**, Node **24.19.0** and Docker with Compose. From the repository root:

```sh
bun run setup
bun run dev
```

Setup installs the frozen lockfile, creates `.env` if absent, starts local PostgreSQL, applies migrations, and resets the two synthetic demo tenants. It preserves other tenants. The database binds to localhost on port 54329. The API binds to localhost on port 4100.

- Readiness: <http://127.0.0.1:4100/health/ready>
- Demo catalog: <http://127.0.0.1:4100/v1/demo/trailside-supply/products>
- Full verification: `bun run verify`

Bun manages dependencies and scripts; the API and worker run on the approved Node.js LTS runtime. See [development](docs/development.md) for commands, tests and troubleshooting.

## Source of truth

The [Voicely Linear project](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb) is authoritative for product scope, architecture decisions, milestones, and issue acceptance criteria. These repository docs are a developer-facing summary aligned with that project.

When a decision changes, reconcile the Linear overview and affected issues, then update these docs. Keep implemented behavior, approved scope, and proposed technical choices clearly labeled.

- [Product scope and escalation flow](docs/product.md)
- [Approved system architecture](docs/architecture.md)
- [First-slice screens, API contracts and state transitions (PER-32 v2, local-first amendment)](https://linear.app/personal-rp501/issue/PER-32)
- [Local runtime and adapters, including synthetic commerce (PER-33)](https://linear.app/personal-rp501/issue/PER-33)
- [Complete local acceptance (PER-34)](https://linear.app/personal-rp501/issue/PER-34)
- [Development workflow and verification](docs/development.md)
- [Trailside Supply demo fixtures](docs/demo.md)
- [Brand assets and usage](docs/brand/README.md)

## Approved MVP scope

- **Sales and support:** product comparisons, buying advice, verified order/delivery enquiries, and return/exchange policy guidance.
- **Knowledge:** merchant-uploaded product descriptions, manuals, and policies, with preview, publication/version controls, and cited answers.
- **Data:** Shopify commerce facts, HubSpot-first CRM context with Salesforce second, verified purchase history, and tenant-specific aggregate sales signals. Exact pilot fields and permissions remain validation gates.
- **Distribution:** Shopify storefronts and custom-site widget embedding. Custom operational backends require their own integration contracts.
- **Staff-ready requests:** collect details and prepare complete requests. Automated refunds, replacements, discounts, or other operational changes are follow-on work after workflow validation.
- **Admin:** onboarding, knowledge, configuration, integration setup, preview, conversation review, usage, and handoff delivery diagnostics.

### Human handoff

1. The AI cannot resolve the question, the request needs staff, or the shopper asks for human help.
2. Confirm the shopper's contact email and prepare the request with a summary, transcript, relevant sources, and authorized customer/order context.
3. If a helpdesk is connected, create a ticket. Otherwise, email the merchant's configured support inbox from a Voicely-controlled address with the shopper's contact address as `Reply-To`.
4. Show pending status while queued and confirm submission after the provider acknowledges acceptance.
5. Merchant staff continue by email. Human replies do not return to the widget in the MVP.

Delivery uses durable retries and duplicate prevention. A connected helpdesk outage is distinct from having no integration; the first slice prohibits automatic cross-channel rerouting and blind resend after uncertain acceptance. Provider acceptance, recipient delivery, and customer resolution are separate facts.

The previously discussed admin support inbox, staff assignment, live widget replies, and AI takeover controls are superseded by the email fallback. See [the full flow](docs/product.md#escalation-and-email-follow-up).

## Current implementation

| Area              | Repository baseline                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Active foundation | Bun workspace in `apps/` and `packages/`; Fastify public demo catalog, PostgreSQL migrations/RLS, pg-boss catalog-audit worker, unit/integration/process E2E tests |
| Demo fixtures     | Trailside Supply: 20 products, 4 synthetic orders, 4 policies, 12 evaluation scenarios; separate isolation tenant                                                  |
| Widget and admin  | Planned React interfaces; not yet implemented                                                                                                                      |
| Connectors and AI | Shopify, CRM, AI retrieval, verified shopper access and helpdesk/email workflows remain planned                                                                    |

The foundation's tenant boundaries do not yet implement private shopper conversations. Conversation isolation is tracked in [PER-21](https://linear.app/personal-rp501/issue/PER-21), under [PER-13](https://linear.app/personal-rp501/issue/PER-13).

## Approved architecture

A strict TypeScript modular monolith with separate worker processes, a standalone React admin, and an independently distributed iframe widget. Bun supplies workspace tooling; Node.js/Fastify runs the services. PostgreSQL provides relational data, pgvector/full-text retrieval and pg-boss transactional jobs. Chat will use HTTP submissions and authenticated SSE.

The planned local stack adds the React admin/widget and local storefront, a local OIDC provider with the same application membership/authorization checks, persistent filesystem-backed knowledge storage, and SMTP with Mailpit for destination verification, shopper codes and synthetic support email. A synthetic Trailside commerce adapter will use production domain contracts. Real Shopify and CRM validation can run from local services with provider credentials and a tunnel where required.

AWS `us-east-1` remains the later deployment target: ECS Fargate/ALB, RDS PostgreSQL, S3/CloudFront, Cognito, SES, Secrets Manager and CloudWatch. [PER-30](https://linear.app/personal-rp501/issue/PER-30) owns CDK/OIDC deployment in milestone06 and is blocked by [PER-34 local acceptance](https://linear.app/personal-rp501/issue/PER-34), not a prerequisite for the local product. Application code controls identity, authorization, tools and delivery. See [architecture](docs/architecture.md) for boundaries and remaining validation.

## Repository layout

```text
apps/api/                      Active Fastify API
apps/worker/                   Active pg-boss worker
packages/core/                 Shared configuration, database, queue and demo fixtures
scripts/                       Local setup, migrations, seed and process supervision
tests/                         Unit, real PostgreSQL and built-process E2E checks
.github/                       CI, security checks and pull-request template
compose.yaml                   Active local PostgreSQL/pgvector dependency
docs/                          Product, architecture, development and demo documentation
docs/brand/                    Brand kit and usage guidance
Makefile                       Convenience wrappers around Bun commands
```

## Development baseline

The active workspace uses one `bun.lock`, pinned toolchain versions, strict TypeScript, ESLint, Prettier, Vitest and Playwright. `bun run verify` runs formatting, lint, compilation, unit tests, real PostgreSQL integration tests and built-process API/worker E2E tests. Test failures propagate correctly.

The obsolete `widget/` and `voicely/` prototypes, their lockfiles and legacy Compose configuration have been removed. They remain recoverable from Git history. Current brand assets are retained in `docs/brand/`. Repository cleanup does not migrate or delete externally persisted legacy data.

The foundation and legacy-cleanup PRs have merged with successful remote CI. Required branch checks are not enforced; passing CI does not establish branch protection. Renovate installation still requires confirmation.

## Delivery outline

The Linear milestones cover demand validation, platform foundations, grounded conversations, commerce/CRM identity, aggregate recommendations, and a measured pilot. The first integrated slice runs locally: merchant login, knowledge publication, widget buying advice, guest verification, authorized synthetic order lookup, request review/submission and truthful Mailpit capture status. Browser acceptance will cover restart, tenancy, lost responses, cancellation, duplicate submission and uncertain sending. Preview remains non-dispatching; local demo mail capture is restricted to synthetic tenants. SMTP acceptance does not prove human inbox delivery.

The initial market is US English, physical-product ecommerce. Trailside Supply is a fictional outdoor clothing/accessories demo, not a design partner. HubSpot CRM precedes Salesforce; SES is the later AWS email adapter. Real Shopify/CRM and connected-helpdesk checks remain separate provider-validation gates. Deterministic model doubles support ordinary CI, not interactive AI acceptance or quality claims. Shopper proof, model evaluation, helpdesk capabilities, measured costs and release timing remain open. Consult Linear for current priorities and dependencies.

## Historical references

The [original architecture diagram](docs/Architecture.svg), [users API image](docs/users_api.png), and [organisations API image](docs/organisations_api.png) describe earlier work. They are retained as historical references, not the current product or architecture specification.

## Contributing

Use the Linear project and relevant issue as the scope baseline. Keep documentation and implementation status aligned when submitting changes.

## License

This project is licensed under the MIT License.
