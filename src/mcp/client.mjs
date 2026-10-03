import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { config } from "../config/env.mjs";

let client = null;

export async function connectMcp() {
  if (client) {
    return client;
  }

  client = new Client({
    name: "ha-telegram-bot",
    version: "2.0.0",
  });

  const transport = new StreamableHTTPClientTransport(
    new URL(config.mcp.url)
  );

  await client.connect(transport);

  console.log("HA-MCP connected");

  return client;
}

export function getMcpClient() {
  if (!client) {
    throw new Error("MCP client is not connected");
  }

  return client;
}

export async function closeMcp() {
  if (!client) {
    return;
  }

  await client.close();
  client = null;
}

export function isMcpConnected() {
  return client !== null;
}
