import { getMcpClient } from "./client.mjs";
import { updateDeviceMemory, getDeviceMemory } from "../memory/devices.mjs";
import { rememberLearningSearch, rememberLearningControl } from "../learning/session.mjs";
import { rememberOperationalAction } from "../memory/operational.mjs";
import {
  expectedStateForService,
  verifyActionStates,
} from "../decision/verifier.mjs";

function logMcpResult(name, result) {
  const content = result?.structuredContent ?? result;

  if (name === "ha_get_history") {
    const data = content?.data ?? content ?? {};
    const entities = Array.isArray(data?.entities) ? data.entities : [];
    const records = entities.reduce(
      (sum, entity) => sum + (entity.states?.length ?? entity.statistics?.length ?? 0),
      0
    );
    const first = entities[0] ?? {};

    console.log("MCP ← ha_get_history", {
      entities: entities.length,
      records,
      total_count: first.total_count ?? null,
      offset: first.offset ?? null,
      has_more: first.has_more ?? false,
      next_offset: first.next_offset ?? null,
      period: first.period ?? data?.period ?? null,
    });
    return;
  }

  const data = content?.data ?? content;
  console.log(`MCP ← ${name}`, {
    success: content?.success ?? !result?.isError,
    matches: data?.entity_total_matches ?? null,
    returned: Array.isArray(data?.entities) ? data.entities.length : null,
    has_more: data?.entity_has_more ?? null,
  });
}

export async function callHA(name, args = {}, { mcpClient = null } = {}) {
  console.log(`MCP → ${name}`, args);

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

      console.log(
        `Memory → ${memory.query} / ${memory.domain} / ${memory.entities.length} entities`
      );

      // Avoid logging device names and states from private homes.
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
