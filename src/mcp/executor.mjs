import { getMcpClient } from "./client.mjs";
import { updateDeviceMemory, getDeviceMemory } from "../memory/devices.mjs";
import { rememberLearningSearch, rememberLearningControl } from "../learning/session.mjs";
import { rememberOperationalAction } from "../memory/operational.mjs";
import {
  expectedStateForService,
  verifyActionStates,
} from "../decision/verifier.mjs";

import { summarizeMcpRequest, summarizeMcpResponse } from "./log-summary.mjs";

function logMcpResult(name, result) {
  console.log("MCP ←", summarizeMcpResponse(name, result));
}

export async function callHA(name, args = {}, { mcpClient = null } = {}) {
  console.log("MCP →", summarizeMcpRequest(name));

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

      rememberLearningSearch(
        memory.query,
        memory.domain,
        memory.entities
      );

      console.log("Memory → updated entity count", memory.entities.length);

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

      console.log("VERIFY →", { status: verification.status, entityCount: verification.entities.length });
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
