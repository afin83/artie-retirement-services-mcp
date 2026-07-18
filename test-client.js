const http = require("http");

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 8787,
        path,
        method,
        headers: body
          ? {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(JSON.stringify(body)),
            }
          : undefined,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, data }));
      }
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function openSse() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 8787,
        path: "/sse",
        method: "GET",
        headers: { accept: "text/event-stream" },
      },
      (res) => {
        let buffer = "";
        res.on("data", (chunk) => {
          buffer += chunk.toString();
          const endpointMatch = buffer.match(/event: endpoint\ndata: "([^"]+)"/);
          if (endpointMatch) resolve({ req, res, endpoint: endpointMatch[1] });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const { req, endpoint } = await openSse();
  console.log(`endpoint ${endpoint}`);

  await request("POST", endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
  });

  await request("POST", endpoint, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });

  const result = await request("POST", endpoint, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "run_retirement_projection",
      arguments: { retirementAge: 60 },
    },
  });

  console.log(`tool call post ${result.status}`);
  req.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
