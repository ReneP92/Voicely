# Widget frontend prototype

React/Vite frontend for the current Socket.io messaging prototype. The planned AI, verified customer context, and helpdesk/email handoff are not implemented here yet.

See [widget setup and limitations](../README.md), [approved product scope](../../docs/product.md), and the [Linear source of truth](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb).

## Entry points

- `src/main.jsx` defines `window.MyChatWidget.init(config)` and the development mount.
- `src/ChatWidget.jsx` accepts `storeId`, generates a visitor ID in local storage, and connects to `VITE_SOCKET_URL` (default `http://localhost:4000`).
- `src/index.css` supplies the widget styles.
- `vite.config.js` configures React, Tailwind, and the `@` source alias.

The development mount currently omits `storeId`, while the backend requires it. The static host page also uses a hard-coded bundle URL. See the parent README before treating either path as a working end-to-end installation.

## Existing package commands

Run from this directory after installing the package dependencies with Yarn:

```sh
yarn dev --host
yarn lint
yarn build
yarn preview --host
```

There is no package test script. `VITE_SOCKET_URL` is read by Vite and compiled into built assets; changing a static server's runtime environment does not rewrite it.

The proposed async loader/iframe and HTTP/server-sent-event architecture is tracked in [PER-13](https://linear.app/personal-rp501/issue/PER-13) and [PER-16](https://linear.app/personal-rp501/issue/PER-16). The approved widget handoff leads to human email follow-up rather than live staff replies in chat.
