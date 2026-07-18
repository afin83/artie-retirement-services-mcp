# Demo Script

## Setup

1. Start the MCP server.
2. Make sure the ChatGPT app connector is connected.
3. Start a new ChatGPT conversation.
4. Add/select `ARTie Retirement Guide` from ChatGPT tools if needed.

## Primary Prompt

```text
Using ARTie Retirement Guide, I am Mia and I am 58 and exhausted. Can I afford to retire at 60?
```

## Secondary Prompts

```text
Using ARTie Retirement Guide, what happens if I go part-time next year and retire at 60?
```

Expected behaviour: ARTie Retirement Guide should model a simple default scenario if the member does not provide exact part-time salary or contribution assumptions.

The connector includes a dedicated comparison tool for this prompt, so the answer should not say ARTie cannot model part-time.

```text
Using ARTie Retirement Guide, should I review my insurance before I retire?
```

```text
Using ARTie Retirement Guide, should I book an adviser conversation before deciding?
```

## Intended story

The member does not navigate an ART portal.

The member asks a life question in ChatGPT.

ChatGPT asks ARTie Retirement Guide for the trusted retirement facts and calculations.

The answer becomes personal, contextual, and action-oriented.

## Executive line

> The future is not another chatbot. The future is ART becoming a trusted retirement capability inside the conversations members already have.

## Watchouts

Avoid explaining MCP, APIs, tunnels, or implementation during the presentation.

Do not overstate this as production-ready. It is a concept demo using synthetic data.

If asked about security, say:

> This proof of concept uses synthetic data. A production version would require proper authentication, consent, audit, advice controls, and approved ART data boundaries.
