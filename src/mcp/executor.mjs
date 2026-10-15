import { getMcpClient } from "./client.mjs";
import { updateDeviceMemory, getDeviceMemory } from "../memory/devices.mjs";
import { rememberLearningSearch, rememberLearningControl } from "../learning/session.mjs";
import { rememberOperationalAction } from "../memory/operational.mjs";
import {
  expectedStateForService,
  verifyActionStates,
} from "../decision/verifier.mjs";

// Never log raw tool payloads: they may contain private HA states and histories.
function logMcpResult(name, result) {
  const outcome = result?.isError === true ? "error" : "received";
  console.log("MCP result", { tool: name, outcome });
}

export async function callHA(name, args = {}, { mcpClient = null } = {}) {
  console.log("MCP request", { tool: name });

  const mcp = mcpClient ?? getMcpClient();

  let result = await mcp.callTool({
    name,
    arguments: args,
  });
  logMcpResult(name, result);


  if (name === "ha_search") {
    const updated = updateDeviceMemory(
      result?.structuredContent,
      args
    );

    if (updated) {
      const memory = getDeviceMemory();
      rememberLearningSearch(memory.query, memory.domain, memory.entities);
      console.log("MCP search memory updated", { count: memory.entities.length });
    }
  }

  if (
    name === "ha_call_service" &&
    args?.entity_id
  ) {
    const entityIds = Array.isArray(args.entity_id)
      ? args.entity_id
      : String(args.entity_id)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
    const expectedState = expectedStateForService(args.domain, args.service);

    if (entityIds.length && expectedState) {
      const verification = await verifyActionStates({
        serviceResult: result,
        entityIds,
        expectedState,
        readState: (entityId) =>
          mcp.callTool({
            name: "ha_get_state",
            arguments: { entity_id: entityId },
          }),
        attempts: 3,
        intervalMs: 250,
      });

      result = {
        ...result,
        verification,
      };

      console.log("VERIFY →", {
        entity_ids: entityIds,
        expected: expectedState,
        status: verification.status,
        entities: verification.entities.map((item) => ({
          entity_id: item.entityId,
          observed: item.observedState,
          status: item.status,
        })),
      });
    }

    if (result?.structuredContent?.success === true) {
      for (const entityId of entityIds) {
        rememberLearningControl(entityId);
      }
    }

    rememberOperationalAction({ name, args, result });
  }

  return result;
}
