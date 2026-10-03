import { getMcpClient } from "./client.mjs";
import { updateDeviceMemory, getDeviceMemory } from "../memory/devices.mjs";
import { rememberLearningSearch, rememberLearningControl } from "../learning/session.mjs";

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

      rememberLearningSearch(
        memory.query,
        memory.domain,
        memory.entities
      );

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

  if (
    name === "ha_call_service" &&
    args?.entity_id &&
    result?.structuredContent?.success === true
  ) {
    const entityIds = Array.isArray(args.entity_id)
      ? args.entity_id
      : String(args.entity_id)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);

    for (const entityId of entityIds) {
      rememberLearningControl(entityId);
    }
  }

  return result;
}
