# Chat Proxy Server Setup

The chat proxy server in `chat-proxy-server.mjs` depends on Node.js packages declared in `package.json`.

## Prerequisites

- Node.js 18+
- npm 9+
- Python environment with this repository installed (for `/sherlock` command support)

## Install dependencies

```bash
npm install
```

## Required environment variables

- `CLOUDFLARE_API_ENDPOINT` — upstream chat endpoint URL
- `CLOUDFLARE_API_KEY` — bearer token for the upstream API
- `PORT` (optional) — defaults to `3000`

## Run the proxy

```bash
npm start
```

Then send chat requests to `POST /chat` with JSON payload:

```json
{ "message": "hello" }
```

To invoke the optional tool path:

```json
{ "message": "/sherlock some_username" }
```
