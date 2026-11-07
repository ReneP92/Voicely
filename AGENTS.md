# Voicely engineering

- Linear project P-PER-1 owns scope, decisions and acceptance criteria. Notion is the knowledge hub; repository docs describe executable behavior.
- Use Bun 1.4.4 for dependency management and scripts. API/worker run on Node 24 LTS. Do not introduce npm, Yarn or pnpm lockfiles into the active workspace.
- Start at README.md. `bun run setup` provisions local dependencies; `bun run verify` is the completion gate. Required checks must propagate failures.
- Active code lives in apps/ and packages/. widget/ and voicely/ are replaceable historical prototypes, excluded from the new workspace. Inspect before reusing them.
- Keep application entry points thin. Shared modules do not import apps. Keep domain ownership explicit as the product modules grow.
- Treat site IDs as public configuration, never authentication. Authorize shopper and tenant access before tools or models. Use transaction-local tenant context and test real database roles.
- Persist business records independently of queue retention. Enqueue jobs in the same transaction; external effects still require provider-specific idempotency/reconciliation.
- Use runtime request/response schemas. Never log credentials, private transcripts or raw provider payloads by default.
- Keep demo data synthetic, reproducible and separate from actual merchant data. Never equate fixtures or mocks with provider validation.
- Add migrations instead of editing applied migrations. Verify compatibility and recovery before rollout.
- Use meaningful unit, PostgreSQL integration and end-to-end tests. No swallowed failures, arbitrary sleeps or assertions that merely mirror source text.
- Keep implemented, approved, proposed and unvalidated states explicit. No commits, pushes or cloud deployment unless requested.
