# Existing website frontend

**Historical prototype, outside the active Bun workspace.** New application work starts from the root README. Useful visual assets may be reused, but this is not the active admin implementation.

This React/Vite package currently contains marketing/demo components assembled by `src/App.jsx`. It is not the planned Voicely merchant admin panel.

The [Linear project](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb) is the source of truth. See the [root README](../../../README.md), [product scope](../../../docs/product.md), and [approved architecture](../../../docs/architecture.md).

## Planned admin scope

[PER-18](https://linear.app/personal-rp501/issue/PER-18) covers merchant onboarding, staff access/roles, product/manual/policy uploads, agent settings, cited preview, integration and handoff configuration, installation guidance, conversation review, usage, and delivery diagnostics.

Escalations go to a connected helpdesk or the merchant's support email. Staff continue by email. A fallback support inbox, staff assignment, reply composer, live widget replies, and takeover controls are superseded MVP alternatives.

Whether this existing frontend is adapted or replaced is a decision in [PER-13](https://linear.app/personal-rp501/issue/PER-13).

## Existing package commands

Run from this directory after installing the package dependencies with Yarn:

```sh
yarn dev
yarn lint
yarn build
yarn preview
```

These scripts belong to the current marketing/demo package; they do not start an implemented merchant admin or the planned application API. A fresh-install/build/runtime baseline remains to be established.
