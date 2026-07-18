const http = require("http");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.PORT || 8787);
const SERVICE_DISPLAY_NAME = "ARTie Retirement Guide";
const DEMO_BOUNDARY =
  "Synthetic demo information only. This is not financial advice and does not use real ART member data.";
const RESPONSE_GUIDANCE =
  "Use ARTie Retirement Guide as the trusted retirement data source. Do not say you are ARTie. Say you checked ARTie Retirement Guide. Keep responses concise, plain-English, empathetic, and action-oriented. Include a clear next step and the synthetic-data/not-financial-advice boundary.";

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
    description: "Check ARTie Retirement Guide for the synthetic member profile needed to answer a retirement question.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_super_balance",
    description: "Check ARTie Retirement Guide for the member's synthetic super balance, contribution rate, and investment option.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "run_retirement_projection",
    description: "Ask ARTie Retirement Guide to run a simplified retirement projection for the synthetic member.",
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
    description: "Check ARTie Retirement Guide for a plain-English explanation of the member's synthetic insurance cover.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "book_adviser",
    description: "Ask ARTie Retirement Guide for a suggested adviser conversation or synthetic booking option.",
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
  {
    name: "model_part_time_transition",
    description: "Ask ARTie Retirement Guide to model a simple transition-to-retirement scenario, such as going part-time before retiring. If the member does not provide details, assume part-time starts next year at 60% salary and full retirement happens at the stated target retirement age.",
    inputSchema: {
      type: "object",
      properties: {
        partTimeSalaryPercent: {
          type: "number",
          description: "Part-time salary as a decimal. Example: 0.6 means 60% of current salary.",
        },
        startAge: {
          type: "number",
          description: "Age when the part-time transition starts.",
        },
        retirementAge: {
          type: "number",
          description: "Age when the member plans to fully retire.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "compare_full_time_vs_part_time_at_60",
    description: "Use this when the member asks what happens if they go part-time next year and retire at 60. ARTie Retirement Guide compares the full-time projection with a default part-time scenario of 60% salary from age 59 to retirement at 60.",
    inputSchema: {
      type: "object",
      properties: {
        partTimeSalaryPercent: {
          type: "number",
          description: "Optional part-time salary as a decimal. Defaults to 0.6.",
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
      `${SERVICE_DISPLAY_NAME} found this synthetic profile: ${member.name} is ${member.age}, works ${member.employmentStatus.toLowerCase()}, earns ${money(member.annualSalary)} per year, and is considering retirement at ${member.targetRetirementAge}. ${DEMO_BOUNDARY}`,
      { member, guidance: RESPONSE_GUIDANCE }
    );
  }

  if (name === "get_super_balance") {
    return textResult(
      `${SERVICE_DISPLAY_NAME} found ${member.name}'s synthetic super balance is ${money(member.superBalance)} in the ${member.investmentOption} option. Current contributions are ${(member.contributionRate * 100).toFixed(1)}% of salary. ${DEMO_BOUNDARY}`,
      {
        balance: member.superBalance,
        investmentOption: member.investmentOption,
        contributionRate: member.contributionRate,
        guidance: RESPONSE_GUIDANCE,
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
      `${SERVICE_DISPLAY_NAME} ran a simplified concept projection. If ${member.name} retires at ${retirementAge}, the estimated balance is ${money(projectedBalance)} and possible annual retirement income is about ${money(incomeToAge90)} to age 90. Confidence is ${confidence}. A useful next step is to test spending needs and consider an adviser conversation before making a decision. ${DEMO_BOUNDARY}`,
      { retirementAge, projectedBalance, estimatedAnnualIncome: incomeToAge90, confidence, guidance: RESPONSE_GUIDANCE }
    );
  }

  if (name === "explain_insurance") {
    return textResult(
      `${SERVICE_DISPLAY_NAME} found ${member.name} has synthetic insurance cover of ${money(member.insurance.deathCover)} death cover, ${money(member.insurance.tpdCover)} TPD cover, and income protection of ${member.insurance.incomeProtection}. A key retirement question is whether this cover is still needed as work, debt, and dependants change. ${DEMO_BOUNDARY}`,
      { ...member.insurance, guidance: RESPONSE_GUIDANCE }
    );
  }

  if (name === "book_adviser") {
    const timeframe = args.preferredTimeframe || "the next two weeks";
    return textResult(
      `${SERVICE_DISPLAY_NAME} can suggest a synthetic adviser appointment for ${member.name} in ${timeframe}. Suggested reason: retirement-at-60 confidence check, income needs, insurance review, and contribution options. ${DEMO_BOUNDARY}`,
      { timeframe, bookingType: "Retirement confidence check", guidance: RESPONSE_GUIDANCE }
    );
  }

  if (name === "model_part_time_transition") {
    const partTimeSalaryPercent = Number(args.partTimeSalaryPercent || 0.6);
    const startAge = Number(args.startAge || member.age + 1);
    const retirementAge = Number(args.retirementAge || member.targetRetirementAge);
    const fullTimeYears = Math.max(0, startAge - member.age);
    const partTimeYears = Math.max(0, retirementAge - Math.max(member.age, startAge));
    const fullTimeContribution = member.annualSalary * member.contributionRate;
    const partTimeContribution =
      member.annualSalary * partTimeSalaryPercent * member.contributionRate;
    const balanceAfterFullTime = Math.round(
      member.superBalance * Math.pow(1.045, fullTimeYears) +
        fullTimeContribution * ((Math.pow(1.045, fullTimeYears) - 1) / 0.045 || fullTimeYears)
    );
    const projectedBalance = Math.round(
      balanceAfterFullTime * Math.pow(1.045, partTimeYears) +
        partTimeContribution * ((Math.pow(1.045, partTimeYears) - 1) / 0.045 || partTimeYears)
    );
    const baseProjection = callTool("run_retirement_projection", {
      retirementAge,
    }).structuredContent.projectedBalance;
    const balanceDifference = projectedBalance - baseProjection;
    const estimatedAnnualIncome = Math.round(
      projectedBalance / Math.max(1, 90 - retirementAge)
    );

    return textResult(
      `${SERVICE_DISPLAY_NAME} modelled a simple part-time transition. If ${member.name} moves to ${(partTimeSalaryPercent * 100).toFixed(0)}% salary from age ${startAge} and fully retires at ${retirementAge}, the estimated balance is ${money(projectedBalance)}, about ${money(Math.abs(balanceDifference))} ${balanceDifference >= 0 ? "higher" : "lower"} than the straight retirement-at-${retirementAge} projection. Estimated annual retirement income is about ${money(estimatedAnnualIncome)} to age 90. This may trade some retirement income for better wellbeing before retirement. ${DEMO_BOUNDARY}`,
      {
        partTimeSalaryPercent,
        startAge,
        retirementAge,
        projectedBalance,
        balanceDifference,
        estimatedAnnualIncome,
        guidance: RESPONSE_GUIDANCE,
      }
    );
  }

  if (name === "compare_full_time_vs_part_time_at_60") {
    const partTimeSalaryPercent = Number(args.partTimeSalaryPercent || 0.6);
    const fullTime = callTool("run_retirement_projection", { retirementAge: 60 })
      .structuredContent;
    const partTime = callTool("model_part_time_transition", {
      partTimeSalaryPercent,
      startAge: 59,
      retirementAge: 60,
    }).structuredContent;
    const incomeDifference =
      partTime.estimatedAnnualIncome - fullTime.estimatedAnnualIncome;

    return textResult(
      `${SERVICE_DISPLAY_NAME} compared two synthetic scenarios for ${member.name}. If she keeps working full-time to 60, the projected balance is ${money(fullTime.projectedBalance)} and estimated annual income is ${money(fullTime.estimatedAnnualIncome)}. If she moves to ${(partTimeSalaryPercent * 100).toFixed(0)}% salary next year and retires at 60, the projected balance is ${money(partTime.projectedBalance)} and estimated annual income is ${money(partTime.estimatedAnnualIncome)}. The part-time scenario is about ${money(Math.abs(partTime.balanceDifference))} lower at retirement and about ${money(Math.abs(incomeDifference))} lower per year. Plain English: going part-time next year probably does not break the retirement-at-60 plan, but it slightly reduces the buffer. ${DEMO_BOUNDARY}`,
      {
        fullTime,
        partTime,
        balanceDifference: partTime.balanceDifference,
        incomeDifference,
        guidance: RESPONSE_GUIDANCE,
      }
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
        serverInfo: { name: "artie-retirement-guide", version: "0.2.0" },
        instructions: RESPONSE_GUIDANCE,
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
    sendJson(res, 200, { ok: true, name: SERVICE_DISPLAY_NAME });
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
