// Manual, read-only inspection of HA-MCP tool capabilities.
// Uses existing DEV configuration; prints only tool names and input schema keys.
import { connectMcp, closeMcp } from "../../src/mcp/client.mjs";

try {
  const client = await connectMcp();
  const result = await client.listTools();
  const list = result.tools ?? [];
  const selected = list.filter((tool) => /area|registr|device|entit|search|overview/i.test(tool.name));
  for (const tool of selected) {
    const keys = Object.keys(tool.inputSchema?.properties ?? {});
    console.log(JSON.stringify({ name: tool.name, required: tool.inputSchema?.required ?? [], fields: keys }));
  }
  console.log("TOOLS_TOTAL=" + list.length);
  console.log("REGISTRY_DISCOVERY=PASS");
} catch (error) {
  console.error("REGISTRY_DISCOVERY=FAILED", error?.name || "Error");
  process.exitCode = 1;
} finally {
  await closeMcp();
}
