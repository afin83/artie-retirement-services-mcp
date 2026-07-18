# Project Log

## Goal

Create a proof of concept showing ARTie Retirement Guide inside ChatGPT, rather than in a standalone website.

The strategic message:

> ART does not need to build another destination. ART can become the trusted retirement service inside the conversation members are already having.

## What was built

A small Node.js MCP server with synthetic member data and ART-style retirement tools.

The server exposes:

- `GET /health`
- `POST /mcp`
- `GET /sse` legacy local testing endpoint
- `POST /message` legacy SSE message endpoint

ChatGPT developer-mode apps use:

```text
https://HOSTNAME/mcp
```

## What was proven

- ChatGPT developer mode can add an unverified private connector.
- The connector permission screen appears inside ChatGPT.
- The app can be named `ARTie Retirement Guide`.
- ChatGPT can discover the tools exposed by the server.
- ChatGPT can answer the demo prompt using synthetic ARTie data.

## Key learning

The important endpoint is `/mcp`, not `/sse`.

`localhost` is rejected by ChatGPT as unsafe, so local testing needs either:

- ChatGPT secure tunnel mode, if available, or
- an HTTPS tunnel such as Cloudflare Tunnel, or
- a hosted HTTPS deployment.

## Current limitations

- The server is local unless deployed.
- Cloudflare quick tunnels are temporary and not reliable for demos.
- There is no authentication.
- There is no real ART data.
- The projection is intentionally simplified.
- Version 0.2.0 tunes the tool descriptions and tool results so ChatGPT is nudged to say it checked ARTie Retirement Guide rather than speaking as ARTie.
