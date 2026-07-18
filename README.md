# ARTie Retirement Guide MCP Demo

Synthetic MCP server for demonstrating an ARTie Retirement Guide connector inside ChatGPT.

This project proves the experience pattern:

> A member asks a retirement question in ChatGPT. ChatGPT connects to ARTie Retirement Guide. ARTie provides trusted retirement capabilities. ChatGPT answers in plain English.

The current data is synthetic only. This is not financial advice and does not connect to ART systems.

## Current status

Working proof of concept:

- Runs locally with Node.js.
- Exposes a ChatGPT-compatible MCP endpoint at `/mcp`.
- Can be exposed temporarily with Cloudflare Tunnel.
- Has been successfully connected inside ChatGPT as `ARTie Retirement Guide`.
- ChatGPT can call the tools and answer the demo retirement question.

## Run locally

```powershell
node server.js
```

Local MCP URL:

```text
http://localhost:8787/mcp
```

Health check:

```text
http://localhost:8787/health
```

## ChatGPT plugin fields

Name:

```text
ARTie Retirement Guide
```

Description:

```text
Provides synthetic retirement guidance for the ARTie concept demo.
```

Connection:

```text
http://localhost:8787/mcp
```

Authentication:

```text
No authentication
```

## Demo prompt

```text
I am Mia and I am 58 and exhausted. Can I afford to retire at 60?
```

This server uses fake member data only. It is not financial advice and does not connect to ART systems.

## Available tools

- `get_member_profile`
- `get_super_balance`
- `run_retirement_projection`
- `explain_insurance`
- `book_adviser`
- `model_part_time_transition`

## Temporary ChatGPT connection

For local testing, expose the local server with Cloudflare Tunnel:

```powershell
.\cloudflared.exe tunnel --url http://localhost:8787
```

Use the generated HTTPS URL with `/mcp`:

```text
https://example.trycloudflare.com/mcp
```

Do not use `/sse` for ChatGPT developer-mode apps. ChatGPT expects the `/mcp` endpoint.

## Next direction

The next step is to remove the local dependency by deploying the server to a stable HTTPS host. See [docs/NEXT_STEP_PLAN.md](docs/NEXT_STEP_PLAN.md).
