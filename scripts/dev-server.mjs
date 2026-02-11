import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const port = Number.parseInt(process.env.PORT ?? "5173", 10);
const root = process.cwd();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolveFile(urlPath) {
  const clean = urlPath === "/" ? "/index.html" : urlPath;
  return path.join(root, clean);
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleRpcProxy(req, res) {
  try {
    const bodyRaw = await readBody(req);
    const body = JSON.parse(bodyRaw || "{}");

    const endpoint = String(body.endpoint ?? "").trim();
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");
    const method = String(body.method ?? "").trim();
    const params = Array.isArray(body.params) ? body.params : [];

    if (!endpoint || !method) {
      sendJson(res, 400, { message: "endpoint и method обязательны" });
      return;
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const rpcResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        jsonrpc: "1.0",
        id: "bitcoin-adapter",
        method,
        params
      })
    });

    const rpcPayload = await rpcResponse.json();

    if (!rpcResponse.ok) {
      sendJson(res, rpcResponse.status, {
        message: rpcPayload?.error?.message ?? `RPC HTTP error ${rpcResponse.status}`,
        error: rpcPayload?.error ?? null
      });
      return;
    }

    sendJson(res, 200, rpcPayload);
  } catch (error) {
    sendJson(res, 500, { message: `RPC proxy failure: ${error.message}` });
  }
}

const server = http.createServer((req, res) => {
  const pathname = req.url.split("?")[0];

  if (req.method === "POST" && pathname === "/api/rpc") {
    handleRpcProxy(req, res);
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const filePath = resolveFile(pathname);

  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Dev server running on http://localhost:${port}`);
});
