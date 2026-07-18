# Next Step Plan

## Objective

Move ARTie Retirement Services from a local proof of concept to a stable hosted MCP server that can be used from ChatGPT on desktop, web, and iOS.

## Recommended next step

Deploy the current Node.js MCP server to a stable HTTPS host.

Best fit for the current code:

1. Railway or Render
2. Fly.io
3. Cloudflare Worker, after adapting the server to Worker APIs
4. Vercel only if the deployment supports the required MCP HTTP behavior cleanly

For speed, use Railway or Render first. The current `server.js` already supports a hosted `PORT` environment variable and does not need a database.

## Why this is the next step

The proof of concept works, but it depends on:

- a local PowerShell running `node server.js`
- a second PowerShell running Cloudflare Tunnel
- a temporary `trycloudflare.com` URL

That is fine for proving the idea, but weak for showing it reliably on iOS or in a live executive setting.

## Target end state

A stable URL such as:

```text
https://artie-retirement-services-mcp.example.com/mcp
```

Then ChatGPT is configured once with that URL.

Once the app is linked in ChatGPT web/desktop, it should be available in ChatGPT mobile clients as the same connected app. Validate on iOS before relying on it for the presentation.

## Plan

1. Create a hosted deployment for the existing Node server.
2. Confirm `/health` works over HTTPS.
3. Confirm `/mcp` responds to `initialize` and `tools/list`.
4. Update the ChatGPT developer-mode app connection URL to the hosted `/mcp` endpoint.
5. Refresh the app metadata in ChatGPT.
6. Test the demo prompt on desktop/web.
7. Open ChatGPT on iOS and confirm `ARTie Retirement Services` appears in available tools.
8. Run the demo prompt on iOS.
9. Tune the tool descriptions and server instructions so ChatGPT says it checked ARTie rather than speaking as ARTie.
10. Add lightweight authentication only after the hosted demo is stable.

## Hosting notes

The hosted service needs:

- HTTPS
- public reachability from ChatGPT
- support for HTTP POST to `/mcp`
- no request buffering problems
- a stable URL

No Supabase is needed yet. Add Supabase only if synthetic member records need to be edited without changing code.

## Demo quality improvements

Improve before executive use:

- Add server instructions that position ARTie as the data source, not the speaking assistant.
- Add a clearer "not financial advice" boundary.
- Add more emotionally realistic member scenarios.
- Add one concise next-best-action recommendation.
- Add a second synthetic member only if it strengthens the story.

## Security boundary

For now:

- synthetic data only
- no real member data
- no production ART systems
- no financial advice

For a real production pathway:

- identity and consent
- member authentication
- entitlement checks
- audit logging
- advice boundaries
- risk and compliance review
- admin controls for connector availability
