const http = require("http");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.PORT || 8787);

const member = {
  id: "ART-DEMO-001",
  name: "Mia Thompson",
  age: 58,
  targetRetirementAge: 60,
  employmentStatus: "Full-time",
  annualSalary: 142000,
  superBalance: 684500,
  contributionRate: 0.12,
  investmentOption: "Balanced",
  insurance: {
    deathCover: 420000,
    tpdCover: 300000,
    incomeProtection: "75% of salary for up to 2 years",
  },
};

const sessions = new Map();

const tools = [
  {
    name: "get_member_profile",
    description: "Return the synthetic ARTie demo member profile.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_super_balance",
    description: "Return the synthetic member super balance and investment option.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "run_retirement_projection",
    description: "Run a simplified retirement projection for the synthetic member.",
    inputSchema: {
      type: "object",
      properties: {
        retirementAge: {
          type: "number",
          description: "The age the member wants to retire.",
        },
      },
      required: ["retirementAge"],
      additionalProperties: false,
    },
  },
  {
    name: "explain_insurance",
    description: "Explain the synthetic member insurance cover in plain English.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "book_adviser",
    description: "Offer a synthetic adviser booking option for the member.",
    inputSchema: {
      type: "object",
      properties: {
        preferredTimeframe: {
          type: "string",
          description: "Preferred booking timeframe, such as this week or next month.",
        },
      },
      additionalProperties: false,
    },
  },
];

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function textResult(text, extra = {}) {
  return {
    content: [{ type: "text", text }],
    structuredContent: extra,
  };
}

function callTool(name, args = {}) {
  if (name === "get_member_profile") {
    return textResult(
      `${member.name} is ${member.age}, works ${member.employmentStatus.toLowerCase()}, earns ${money(member.annualSalary)} per year, and is considering retirement at ${member.targetRetirementAge}.`,
      { member }
    );
  }

  if (name === "get_super_balance") {
    return textResult(
      `${member.name}'s synthetic ART super balance is ${money(member.superBalance)} in the ${member.investmentOption} option. Current contributions are ${(member.contributionRate * 100).toFixed(1)}% of salary.`,
      {
        balance: member.superBalance,
        investmentOption: member.investmentOption,
        contributionRate: member.contributionRate,
      }
    );
  }

  if (name === "run_retirement_projection") {
    const retirementAge = Number(args.retirementAge || member.targetRetirementAge);
    const years = Math.max(0, retirementAge - member.age);
    const annualContribution = member.annualSalary * member.contributionRate;
    const projectedBalance = Math.round(
      member.superBalance * Math.pow(1.045, years) +
        annualContribution * ((Math.pow(1.045, years) - 1) / 0.045 || years)
    );
    const incomeToAge90 = Math.round(projectedBalance / Math.max(1, 90 - retirementAge));
    const confidence =
      retirementAge < 60
        ? "low"
        : retirementAge < 63
          ? "moderate"
          : "strong";

    return textResult(
      `If ${member.name} retires at ${retirementAge}, this simplified concept projection estimates a balance of ${money(projectedBalance)} and possible annual retirement income of about ${money(incomeToAge90)} to age 90. Confidence is ${confidence}. This is synthetic demo information, not financial advice.`,
      { retirementAge, projectedBalance, estimatedAnnualIncome: incomeToAge90, confidence }
    );
  }

  if (name === "explain_insurance") {
    return textResult(
      `${member.name} has synthetic insurance cover of ${money(member.insurance.deathCover)} death cover, ${money(member.insurance.tpdCover)} TPD cover, and income protection of ${member.insurance.incomeProtection}. A key retirement question is whether this cover is still needed as work and debt reduce.`,
      member.insurance
    );
  }

  if (name === "book_adviser") {
    const timeframe = args.preferredTimeframe || "the next two weeks";
    return textResult(
      `I can offer ${member.name} a synthetic ART adviser appointment in ${timeframe}. Suggested reason: retirement-at-60 confidence check, income needs, insurance review, and contribution options.`,
      { timeframe, bookingType: "Retirement confidence check" }
    );
  }

  throw new Error(`Unknown tool: ${name}`);
}

function sendSse(res, event, data, raw = false) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${raw ? data : JSON.stringify(data)}\n\n`);
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, accept, mcp-session-id",
    "access-control-expose-headers": "mcp-session-id",
  });
  res.end(JSON.stringify(data));
}

function handleRpc(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "artie-retirement-services", version: "0.1.0" },
      },
    };
  }

  if (method === "notifications/initialized") {
    return null;
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools } };
  }

  if (method === "tools/call") {
    try {
      const result = callTool(params.name, params.arguments || {});
      return { jsonrpc: "2.0", id, result };
    } catch (error) {
      return { jsonrpc: "2.0", id, error: { code: -32000, message: error.message } };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, accept, mcp-session-id",
      "access-control-max-age": "86400",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, name: "ARTie Retirement Services" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/sse") {
    const sessionId = randomUUID();
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    sessions.set(sessionId, res);
    sendSse(res, "endpoint", `/message?sessionId=${sessionId}`, true);
    req.on("close", () => sessions.delete(sessionId));
    return;
  }

  if (req.method === "POST" && url.pathname === "/mcp") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const message = JSON.parse(body);
        const response = Array.isArray(message)
          ? message.map(handleRpc).filter(Boolean)
          : handleRpc(message);

        const headers = {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type, accept, mcp-session-id",
          "access-control-expose-headers": "mcp-session-id",
        };
        if (message.method === "initialize") {
          headers["mcp-session-id"] = randomUUID();
        }

        if (!response || (Array.isArray(response) && response.length === 0)) {
          res.writeHead(202, headers);
          res.end();
          return;
        }

        res.writeHead(200, headers);
        res.end(JSON.stringify(response));
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/mcp") {
    res.writeHead(405, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    res.end(JSON.stringify({ error: "Use POST for this demo MCP endpoint." }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/message") {
    const sessionId = url.searchParams.get("sessionId");
    const sse = sessions.get(sessionId);
    if (!sse) {
      sendJson(res, 404, { error: "Unknown or expired sessionId" });
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const message = JSON.parse(body);
        const response = handleRpc(message);
        if (response) sendSse(sse, "message", response);
        sendJson(res, 202, { ok: true });
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
    });
    return;
  }

  sendJson(res, 404, {
    error: "Not found",
    endpoints: ["/health", "/mcp", "/sse", "/message?sessionId=..."],
  });
});

server.listen(PORT, () => {
  console.log(`ARTie MCP server listening on http://localhost:${PORT}/mcp`);
  console.log(`Legacy SSE endpoint available at http://localhost:${PORT}/sse`);
});
