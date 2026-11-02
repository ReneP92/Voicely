# Voicely widget

The widget is the planned customer-facing chat surface for Voicely's AI sales and support agent. The current implementation is an early React/Vite and Express/Socket.io messaging prototype.

The [Linear project](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb) is the source of truth. See the [product scope](../docs/product.md) and [proposed architecture](../docs/architecture.md) for the delivery direction.

## Approved experience - planned

- Embed a pop-up chat on Shopify storefronts and custom websites.
- Answer buying and product-support questions using published product information and policies with citations.
- Verify the shopper before accessing their private commerce/CRM records. A contact email or browser visitor ID alone is not proof of order ownership.
- Prepare requests for staff when the AI cannot resolve an enquiry, an operational change needs staff, or the shopper asks for human help.
- Create a ticket in the connected helpdesk, or email the merchant's support inbox if no helpdesk is connected. Merchant-email delivery uses a Voicely-controlled sender and the shopper's confirmed contact address as `Reply-To`.
- Show pending, acknowledged submission, and failure honestly. Human follow-up is by email rather than replies returning to the widget.

The merchant admin covers configuration, knowledge, integration setup, conversation review, and delivery diagnostics. A fallback staff inbox, live staff chat, assignment, and AI takeover controls are superseded MVP alternatives.

The proposed delivery mechanism is an asynchronous script loader with iframe isolation and versioned assets. HTTP plus server-sent events is the proposed conversation transport. Neither replaces the current Socket.io prototype until the architecture is specified and implemented.

## Current implementation

| Path | Purpose |
| --- | --- |
| `backend/server.js` | Express/Socket.io server, default port 4000; `GET /health` returns a simple health message |
| `chat-widget/src/ChatWidget.jsx` | React chat UI; sends messages and typing events with `storeId` and a local-storage `userId` |
| `chat-widget/src/main.jsx` | Defines `window.MyChatWidget.init(config)` and a development-mode mount |
| `test-env/index.html` | Static prototype host page served by Nginx, default port 8080 |
| `docker-compose.dev.yml` | Backend, Vite development server, and static test host |
| `docker-compose.prod.yml` | Backend, built static frontend, and static test host |

Messages are held in memory and broadcast to everyone in the same store room. There is no implemented agent, durable private conversation ownership, verified shopper access, or helpdesk/email handoff in this prototype. Its client-supplied IDs are not authentication.

## Prototype development

The following describes existing configuration. A clean runtime/build/test baseline is still work in [PER-13](https://linear.app/personal-rp501/issue/PER-13).

### Environment configuration

There is no committed `.env.example`. If using a local `widget/.env.dev`, create it explicitly with values such as:

```dotenv
BACKEND_PORT=4000
CORS_ORIGIN=http://localhost:5173
WIDGET_PORT=5173
VITE_SOCKET_URL=http://localhost:4000
TEST_ENV_PORT=8080
```

`CORS_ORIGIN` should match the page used to exercise the prototype. For the static test host, that is `http://localhost:8080` with the default port.

| Variable | Current consumer |
| --- | --- |
| `BACKEND_PORT` | Compose host mapping to backend container port 4000 |
| `CORS_ORIGIN` | Backend HTTP and Socket.io CORS configuration; defaults to `*` |
| `WIDGET_PORT` | Compose host mapping to Vite port 5173 in development, static server port 4173 in the production file |
| `VITE_SOCKET_URL` | Frontend `import.meta.env` value; defaults to `http://localhost:4000` |
| `TEST_ENV_PORT` | Compose host mapping to the static Nginx host |

From `widget/`, explicitly pass the environment file:

```sh
docker compose --env-file .env.dev -f docker-compose.dev.yml config
docker compose --env-file .env.dev -f docker-compose.dev.yml up --build
```

Compose does not automatically select `.env.dev` or `.env.prod`. The existing `make widget-dev` wrapper omits `--env-file`; it uses exported variables, Compose's default `.env` handling, or the YAML defaults. The commands above assume the local file has been created.

### Known setup gaps

Static inspection identified these gaps to address when establishing the prototype baseline:

- The development mount creates `<ChatWidget />` without a `storeId`, while the backend rejects connections without both `storeId` and `userId`.
- The test page references a hard-coded hashed bundle at `localhost:3000`; it is not automatically connected to the Vite server or current output bundle. It also needs the generated stylesheet for the built UI.
- The test page supplies `user: { id: ... }`, but the component currently reads only `storeId` and generates its own visitor ID.
- The backend imports `cors`, but its package manifest does not declare that direct dependency.
- `VITE_SOCKET_URL` is compiled into the production bundle at build time. The production Compose runtime environment alone does not configure the URL in already-built assets; the current Dockerfile does not pass a build argument for it.

These are source-level observations, not a completed runtime verification. The production-named Compose file is an existing build configuration, not proof of production readiness.

### Package commands

The frontend's package scripts, run from `widget/chat-widget/` after installing that package's dependencies, are:

```sh
yarn dev --host
yarn lint
yarn build
yarn preview --host
```

The package has no test script. `make widget-test` runs lint with failures suppressed, so it cannot establish a passing test baseline. See [the frontend package notes](chat-widget/README.md) for entry points.

The backend entry command is `node server.js`, run from `widget/backend/` with its dependencies installed and the setup gaps above addressed.

## Planned acceptance checks

These are requirements for the new implementation, not existing tests:

- Shopify and custom-site installation, style isolation, responsive layout, keyboard/focus behavior, and accessible status announcements.
- Tenant/session isolation, guest/customer verification, logout/account switching, and recovery without reliance on third-party cookies.
- Grounded sales/support answers, citations, streaming, reconnect, cancellation, and retry-safe message submission.
- Helpdesk and merchant-email escalation with shopper review, correct contact details, one request across repeated submits, and transparent delivery status.
- No claim of completed refunds/exchanges or resolved support based solely on request delivery. A temporary helpdesk outage must not cause blind duplicate email delivery.

See [PER-16](https://linear.app/personal-rp501/issue/PER-16), [PER-21](https://linear.app/personal-rp501/issue/PER-21), [PER-26](https://linear.app/personal-rp501/issue/PER-26), and [PER-27](https://linear.app/personal-rp501/issue/PER-27) for authoritative acceptance criteria.
