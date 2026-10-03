import { getMcpClient } from "./client.mjs";
import { updateDeviceMemory, getDeviceMemory } from "../memory/devices.mjs";

export async function callHA(name, args = {}) {
  console.log(`MCP → ${name}`, args);

  const mcp = getMcpClient();

  const result = await mcp.callTool({
    name,
    arguments: args,
  });
  console.log(`MCP ← ${name}`, JSON.stringify(result?.structuredContent ?? result, null, 2));


  if (name === "ha_search") {
    const updated = updateDeviceMemory(
      result?.structuredContent,
      args
    );

    if (updated) {
      const memory = getDeviceMemory();

      console.log(
        `Memory → ${memory.query} / ${memory.domain} / ${memory.entities.length} entities`
      );

      console.log(
        "Memory entities →",
        memory.entities.map(
          (e) =>
            `${e.entity_id} (${e.friendly_name}) [${e.state}]`
        )
      );
    }
  }

  return result;
}
