# Development foundation

## Supported toolchain

Bun 1.4.4 manages dependencies and scripts. Node 24.19.0 runs API/worker code in development and compiled JavaScript in process E2E checks. Docker Compose supplies PostgreSQL 17 with pgvector 0.8.1. Versions are pinned in the root manifests/version files and Compose configuration.

The active workspace contains `apps/api`, `apps/worker` and `packages/core`. Build references compile shared code before entry points. Source imports use the `development` export condition; built processes resolve compiled exports. Historical `widget/` and `voicely/` packages have been removed; consult Git history if needed.

## Commands

| Command                    | Behavior                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `bun run setup`            | Check toolchain, frozen install, create missing `.env`, start DB, migrate, reset synthetic fixtures |
| `bun run dev`              | Start API and worker with Node watch mode; stop the sibling if either exits                         |
| `bun run build`            | Compile workspace projects                                                                          |
| `bun run check`            | Formatting, ESLint, strict compilation and tool/test type checking                                  |
| `bun run test`             | Fast unit tests, no database or paid provider                                                       |
| `bun run test:integration` | Real DB role isolation, transaction rollback/commit, repeatable migrations/reset                    |
| `bun run test:e2e`         | Start compiled API/worker, exercise HTTP and durable queue consumption using Playwright             |
| `bun run verify`           | All checks above; setup must have succeeded first                                                   |
| `bun run db:migrate`       | Apply checksum-verified migrations and initialize pg-boss with admin credentials                    |
| `bun run demo:reset`       | Reset only the reserved synthetic tenants, preserving other tenants                                 |
| `bun run db:stop`          | Stop local PostgreSQL without deleting data                                                         |

API-only E2E tests do not download or launch a browser. Add actual browser coverage when the widget/admin is implemented. The tests currently establish foundation behavior, not a verified customer exchange, model quality or provider delivery.

## Approved local product workflow (planned)

[PER-33](https://linear.app/personal-rp501/issue/PER-33) owns the local runtime/adapters, including synthetic commerce; [PER-34](https://linear.app/personal-rp501/issue/PER-34) owns complete local acceptance. Follow the [PER-32 v2 local-first amendment](https://linear.app/personal-rp501/issue/PER-32). Local synthetic guest proof belongs to [PER-17](https://linear.app/personal-rp501/issue/PER-17); actual provider proof belongs to [PER-27](https://linear.app/personal-rp501/issue/PER-27).

The first complete version must run locally from a fresh checkout without an AWS account or deployment. The existing commands above still provision only the foundation. Planned additions are:

- React admin, widget and local storefront served by the local application stack.
- Local OIDC for staff login, enforcing the same application membership and role checks as the later Cognito adapter.
- Persistent filesystem-backed knowledge uploads/source storage, with tenant authorization and restart persistence; S3 follows later.
- SMTP and Mailpit for destination verification, trusted-order-contact shopper codes and synthetic support-request capture; SES follows later.
- A repeatable synthetic Trailside commerce adapter behind production domain contracts, separate from real Shopify/CRM validation.

Interactive acceptance requires real model calls using user-configured provider credentials. Local does not mean fully offline. Ordinary CI uses deterministic model doubles without paid-provider calls; those tests cannot establish answer quality. Real Shopify and CRM integrations can be exercised from local services with provider credentials and a tunnel where callbacks/webhooks require one.

Planned browser E2E covers fresh-checkout staff login, knowledge upload/publication, widget advice, guest verification, authorized order lookup, request review/submission and accurate Mailpit status. Verify destination setup, persistent state after restart, tenancy/shopper isolation, lost responses, cancellation, duplicate submission, worker fencing and uncertain sends. Preview remains non-dispatching. Local demo/runtime mail capture is restricted to synthetic tenants and does not prove human inbox delivery. Preserve PER-32 uncertainty handling, no blind resend, no automatic rerouting and provider-specific evidence.

## Configuration and data

Copy `.env.example` only if `.env` does not exist; setup does this automatically. Runtime configuration errors identify invalid fields without echoing credentials. Environment variables override the file. For an isolated checkout, set `COMPOSE_PROJECT_NAME`, `POSTGRES_PORT`, and all three database URLs consistently before setup.

- Admin credentials apply migrations and reset fixtures. They never belong in API/worker containers.
- API and worker use distinct non-owner database roles with no superuser/RLS bypass.
- Tenant scope uses `set_config(..., true)` inside a transaction. Connection reuse after success and failure is tested.
- Public site slugs authorize only explicitly public demo catalogs. No shopper, order or fixture-export endpoint exists.
- The worker handles `demo.catalog-audit`, recording counts under tenant scope. Its job-ID uniqueness makes the local database effect retry-safe. This is not an external service request.
- Queue schemas/queues are created by migrations. Runtime queue clients cannot migrate schema. The worker supervises expiration/retry; automatic index rebuilds are disabled for its non-owner role.
- Queue access is internal trusted process access. Do not expose pg-boss APIs directly to shoppers or merchants.

Migrations are append-only. The runner uses an advisory lock and validates previously applied checksums. Add a new migration instead of changing an applied file. Production backups, restore, expand/contract rollout and maintenance-role procedures remain PER-30/PER-22 gates.

## CI and repository settings

`Foundation CI / Verify foundation` runs the same setup and verification from a clean GitHub runner. Separate dependency and secret workflows run Bun audit at high severity and Gitleaks over repository history. No paid providers are called by ordinary CI.

The foundation and legacy-cleanup PRs have merged with successful remote CI. Required branch checks are not enforced. Configure branch protection to require `Verify foundation`, `Audit dependencies` and `Scan for secrets`, plus PR review and resolved conversations. Passing workflows do not establish those settings. Confirm installation/activation of Renovate for the checked-in configuration; major updates are not auto-merged.

The current dependency audit reports one moderate development-only minimatch advisory through ESLint/type tooling (GHSA-g3hv-75wg-m249). Its fixed major removes APIs, so no incompatible forced override is applied. High/critical checks pass. Track the upstream-compatible update via dependency maintenance; untrusted glob patterns must not be fed into the lint tooling.

GitHub deployment OIDC, image promotion and AWS staging are tracked in [PER-30](https://linear.app/personal-rp501/issue/PER-30), now in milestone06 and blocked by PER-34, not a prerequisite for the local product. Neither current local setup nor the approved complete local workflow requires AWS credentials. No AWS deployment is included in this foundation.

## Troubleshooting

- Docker unavailable: start Docker, then rerun setup. The command preserves existing `.env` and propagates failures.
- Port 54329 occupied: choose another `POSTGRES_PORT` and update all DB URLs consistently.
- Database roles missing in an existing volume: Docker initialization scripts only run on first creation. Inspect the volume rather than silently deleting it; local role SQL is in `scripts/local-roles.sql`.
- Migration checksum failure: restore the original migration and add a new one. Do not edit the migration ledger to hide drift.
- API readiness returns 503: check DB connectivity and migrations. Liveness does not depend on database availability.
- A stopped development process leaves PostgreSQL running intentionally. Use `bun run db:stop` when finished.

## Completion criteria

Use a bounded Linear issue, verify its actual behavior and failure cases, update affected Notion/repository summaries, and report the evidence. Synthetic data, local tests and approved designs do not establish real connector behavior or commercial demand.
