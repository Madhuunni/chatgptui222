# Angular 21 Chat UI

A standalone, zoneless Angular 21 project with a ChatGPT-inspired sidebar and central chat panel. This is an independent UI implementation, not an official OpenAI application.

## Run

This version supports Node.js 22.14.0. Angular 21 requires Node.js ^20.19.0, ^22.12.0, or ^24.0.0. The included `.nvmrc` selects 22.14.0 when using nvm.

```bash
npm install
npm start
```

Open http://localhost:4200. For a different port: `npm start -- --port 4300`.

```bash
npm run build
```

Production output: `dist/angular-chat-ui/browser/`.

## Included

- Responsive left sidebar with a mobile drawer and collapse controls.
- Central chat panel with welcome prompts and multi-line message composer.
- Enter to send; Shift+Enter for a new line; IME composition support.
- New conversations, search, select and delete history.
- Local browser persistence for conversations and appearance.
- Light and dark themes, copy response, request loading and stop controls.
- Accessible labels, keyboard focus states and reduced-motion support.
- Angular signals, standalone components, strict template checking, and CSS without a UI framework.

## Structure

```text
src/app/
  app.component.ts            Main layout and composer behavior
  app.component.html          Welcome, messages, composer
  sidebar/                    Menu, history, search, theme controls
  shared/icon.component.ts    Local SVG icons
  core/chat.models.ts         Conversation and message types
  core/chat.store.ts          State, persistence and request cancellation
  core/chat.service.ts        HTTP chat service and configurable endpoint
src/styles.css                Themes and responsive styles
```

## Chat backend and response formats

Messages POST to `/api/chat`. The server selects the UI using `type`: `text`, `download`, `json`, or `json_download`. PDF, XLS and XLSX downloads are supported.

See [docs/chat-api.md](docs/chat-api.md) for the request/response examples, endpoint configuration, development proxy, download headers, and error handling. Start your backend on port 8000 or update `proxy.conf.json`.

Chats remain stored under `angular-chat-ui.conversations.v1`; older messages are migrated when loaded.

## Verification

Run `npm test` and `npm run build`. Contract tests cover all four response types, PDF/Excel metadata, invalid responses, HTTP/network errors, cancellation, timeouts, and legacy history migration. Backend integration tests use mocked HTTP responses; a live backend is required for end-to-end use.
