# Technical Notes

## Runtime

- Node.js
- No npm dependencies
- Uses the built-in `http` module
- Uses `PORT` from the environment, defaulting to `8787`

## Main files

- `server.js`: MCP server and synthetic tools
- `test-client.js`: local MCP smoke test
- `README.md`: run and connection instructions

## MCP endpoint

ChatGPT developer-mode apps should connect to:

```text
https://HOSTNAME/mcp
```

The endpoint accepts JSON-RPC over HTTP POST.

Supported methods:

- `initialize`
- `notifications/initialized`
- `tools/list`
- `tools/call`

## Synthetic member

The current demo member is:

- Name: Mia Thompson
- Age: 58
- Salary: AUD 142,000
- Super balance: AUD 684,500
- Investment option: Balanced
- Target retirement age: 60

## Current tool list

- `get_member_profile`
- `get_super_balance`
- `run_retirement_projection`
- `explain_insurance`
- `book_adviser`
- `model_part_time_transition`
- `compare_full_time_vs_part_time_at_60`

`model_part_time_transition` accepts optional inputs. If omitted, it assumes part-time starts next year at 60% salary and full retirement happens at the member's target retirement age.

## Local tunnel command

```powershell
.\cloudflared.exe tunnel --url http://localhost:8787
```

Use the generated HTTPS URL with `/mcp`.

## Useful local checks

Health:

```powershell
Invoke-RestMethod -Uri http://localhost:8787/health
```

Run smoke test:

```powershell
node test-client.js
```
