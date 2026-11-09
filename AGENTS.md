# Voicely engineering

- Linear project P-PER-1 owns scope, decisions and acceptance criteria. Notion is the knowledge hub; repository docs describe executable behavior.
- Use Bun 1.4.4 for dependency management and scripts. API/worker run on Node 24 LTS. Do not introduce npm, Yarn or pnpm lockfiles into the active workspace.
- Start at README.md. `bun run setup` provisions local dependencies; `bun run verify` is the completion gate. Required checks must propagate failures.
- Active code lives in apps/ and packages/. Removed historical prototypes are available in Git history; inspect before reusing them. Current brand assets live in docs/brand/.
- Keep application entry points thin. Shared modules do not import apps. Keep domain ownership explicit as the product modules grow.
- Deliver the approved first version locally without AWS: local OIDC with application membership checks, persistent filesystem knowledge storage, SMTP/Mailpit and synthetic commerce behind production domain contracts. These product adapters remain planned under [PER-33](https://linear.app/personal-rp501/issue/PER-33); [PER-34](https://linear.app/personal-rp501/issue/PER-34) owns complete local acceptance. PER-30 owns later AWS deployment in milestone06, blocked by PER-34.
- Treat site IDs as public configuration, never authentication. Authorize shopper and tenant access before tools or models. Use transaction-local tenant context and test real database roles.
- Persist business records independently of queue retention. Enqueue jobs in the same transaction; external effects still require provider-specific idempotency/reconciliation.
- Use runtime request/response schemas. Never log credentials, private transcripts or raw provider payloads by default.
- Keep demo data synthetic, reproducible and separate from actual merchant data. Never equate fixtures or mocks with provider validation.
- Keep preview non-dispatching. Local demo mail capture is for synthetic tenants only; SMTP acceptance is not human inbox delivery. Preserve delivery uncertainty, fencing, no blind resend and no automatic rerouting across adapters.
- Interactive local acceptance requires real models with user-configured provider credentials. Deterministic model doubles belong in ordinary CI, not AI quality claims. Validate real Shopify/CRM separately, using local services and credentials/tunnels where needed.
- Add migrations instead of editing applied migrations. Verify compatibility and recovery before rollout.
- Use meaningful unit, PostgreSQL integration and end-to-end tests. No swallowed failures, arbitrary sleeps or assertions that merely mirror source text.
- Keep implemented, approved, proposed and unvalidated states explicit. No commits, pushes or cloud deployment unless requested.
