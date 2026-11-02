# Voicely

Voicely is a planned AI sales and support service for B2C SMEs, starting with **physical-product Shopify shops**. Customers interact through a pop-up website chat widget for product advice, verified order enquiries, and return/exchange guidance. Requests needing staff go to an existing helpdesk or the merchant's support email, with human follow-up by email.

**Status: project restart and prototype.** This repository contains an early React/Socket.io widget and legacy survey-oriented services. The approved product and proposed architecture below describe the delivery direction, not capabilities already implemented.

## Source of truth

The [Voicely Linear project](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb) is authoritative for product scope, architecture decisions, milestones, and issue acceptance criteria. These repository docs are a developer-facing summary aligned with that project.

When a decision changes, reconcile the Linear overview and affected issues, then update these docs. Keep implemented behavior, approved scope, and proposed technical choices clearly labeled.

- [Product scope and escalation flow](docs/product.md)
- [Proposed system architecture](docs/architecture.md)
- [Current widget and development notes](widget/README.md)
- [Existing website frontend](voicely/website/frontend/README.md)

## Approved MVP scope

- **Sales and support:** product comparisons, buying advice, verified order/delivery enquiries, and return/exchange policy guidance.
- **Knowledge:** merchant-uploaded product descriptions, manuals, and policies, with preview, publication/version controls, and cited answers.
- **Data:** Shopify commerce facts, Salesforce/HubSpot customer context, verified purchase history, and tenant-specific aggregate sales signals. CRM delivery order and exact pilot coverage remain open.
- **Distribution:** Shopify storefronts and custom-site widget embedding. Custom operational backends require their own integration contracts.
- **Staff-ready requests:** collect details and prepare complete requests. Automated refunds, replacements, discounts, or other operational changes are follow-on work after workflow validation.
- **Admin:** onboarding, knowledge, configuration, integration setup, preview, conversation review, usage, and handoff delivery diagnostics.

### Human handoff

1. The AI cannot resolve the question, the request needs staff, or the shopper asks for human help.
2. Confirm the shopper's contact email and prepare the request with a summary, transcript, relevant sources, and authorized customer/order context.
3. If a helpdesk is connected, create a ticket. Otherwise, email the merchant's configured support inbox from a Voicely-controlled address with the shopper's contact address as `Reply-To`.
4. Show pending status while queued and confirm submission after the provider acknowledges acceptance.
5. Merchant staff continue by email. Human replies do not return to the widget in the MVP.

Delivery uses durable retries and duplicate prevention. A connected helpdesk outage is distinct from having no integration; uncertain delivery must be reconciled before changing channels. Provider acceptance, recipient delivery, and customer resolution are separate facts.

The previously discussed admin support inbox, staff assignment, live widget replies, and AI takeover controls are superseded by the email fallback. See [the full flow](docs/product.md#escalation-and-email-follow-up).

## Current implementation

| Area | Repository baseline |
| --- | --- |
| Widget UI | React/Vite component with messages, typing indicators, local browser visitor ID, and a prototype `window.MyChatWidget.init` entry point |
| Chat backend | Express/Socket.io; in-memory messages and store-wide rooms using caller-supplied IDs |
| Application services | Legacy Express user, organisation, survey, question, and response services with a MySQL schema |
| Website | Marketing/demo React frontend, not the planned merchant admin |
| Connectors and AI | Salesforce/HubSpot scaffolding; the approved Shopify, AI retrieval, verified shopper, and helpdesk/email workflows are not implemented in the inspected application paths |

The current store-wide broadcast behavior does not provide private per-shopper conversations. Browser visitor IDs do not establish customer identity. The runtime and test baseline must be established in [PER-13](https://linear.app/personal-rp501/issue/PER-13), with conversation isolation tracked in [PER-21](https://linear.app/personal-rp501/issue/PER-21).

## Proposed architecture

A TypeScript modular monolith with a separately deployed background worker, a React admin, and an independently distributed widget. Proposed components include Node.js/Fastify, PostgreSQL with pgvector/full-text search, S3-compatible storage, a PostgreSQL-backed job queue and transactional outbox, and HTTP plus server-sent events for chat streaming.

These are **proposed choices**, to be finalized in [PER-13](https://linear.app/personal-rp501/issue/PER-13). Application code controls identity, authorization, tools, and delivery; the model interprets questions and prepares grounded answers. See [architecture](docs/architecture.md) for boundaries, data flows, and open decisions.

## Repository layout

```text
docs/                          Product and architecture summaries; historical assets
widget/
  backend/                     Prototype Express/Socket.io server
  chat-widget/                 React/Vite widget
  test-env/                    Static prototype host page
  docker-compose.dev.yml       Widget development stack
  docker-compose.prod.yml      Existing static-build configuration
voicely/
  integrations/                Salesforce/HubSpot scaffolding
  website/
    frontend/                  Existing marketing/demo UI
    app/
      db/                      Legacy MySQL schema and test data
      services/                Legacy Express services
deploy/                        Deployment placeholder
docker-compose.yml             Legacy services/database configuration
Makefile                       Existing development command wrappers
```

## Development baseline

Packages have their own manifests and Yarn lockfiles. There is no root package manifest or unified application setup. Inspect the relevant package before installing dependencies or running commands.

Start with [widget development notes](widget/README.md#prototype-development). They document the existing commands and current setup limitations rather than a completed MVP installation.

- `make help` lists the existing wrappers. The root Compose file references `voicely/voicely/app/...`, while services actually live under `voicely/website/app/...`; `make dev` is not yet a validated full-stack onboarding path.
- There is no committed root `.env.local` or widget `.env.example`. Do not rely on the old template-copy instructions.
- `make widget-test` currently invokes lint with failures suppressed; the service test wrapper also suppresses failures. Use package commands directly when establishing test health.

For example, from `widget/chat-widget/`, the existing checks are:

```sh
yarn lint
yarn build
```

The widget package has no test script. Legacy services have package-level Jest scripts; for example, from `voicely/website/app/services/users_service/`, run `yarn test` after installing that package's dependencies. These commands are not a claim that the runtime, builds, or tests currently pass.

## Delivery outline

The Linear milestones cover demand validation, platform foundations, grounded conversations, commerce/CRM identity, aggregate recommendations, and a measured pilot. The first integrated slice is a verified Shopify exchange enquiry delivered once to merchant support email, alongside a buying-advice example and validation of the connected-helpdesk route.

Country/language, first product category, providers, identity details, budget, and timing remain open. Consult Linear for current priorities and dependencies rather than treating this outline as a release schedule.

## Historical references

The [original architecture diagram](docs/Architecture.svg), [users API image](docs/users_api.png), and [organisations API image](docs/organisations_api.png) describe earlier work. They are retained as historical references, not the current product or architecture specification.

## Contributing

Use the Linear project and relevant issue as the scope baseline. Keep documentation and implementation status aligned when submitting changes.

## License

This project is licensed under the MIT License.
