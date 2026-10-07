import test from "node:test";
import assert from "node:assert/strict";

import { callHA } from "../src/mcp/executor.mjs";

test("executor attaches confirmed verification after stale state", async () => {
  const calls = [];
  const states = ["off", "on"];
  const mcpClient = {
    async callTool(request) {
      calls.push(request);
      if (request.name === "ha_call_service") {
        return { structuredContent: { success: true } };
      }
      if (request.name === "ha_get_state") {
        return { structuredContent: { data: { state: states.shift() } } };
      }
      throw new Error(`Unexpected tool: ${request.name}`);
    },
  };

  const result = await callHA(
    "ha_call_service",
    {
      domain: "light",
      service: "turn_on",
      entity_id: "light.test",
    },
    { mcpClient }
  );

  assert.equal(result.verification.status, "confirmed");
  assert.equal(result.verification.observedState, "on");
  assert.deepEqual(
    calls.map((call) => call.name),
    ["ha_call_service", "ha_get_state", "ha_get_state"]
  );
});

test("executor leaves stale successful state pending without retrying service", async () => {
  let serviceCalls = 0;
  let stateCalls = 0;
  const mcpClient = {
    async callTool(request) {
      if (request.name === "ha_call_service") {
        serviceCalls++;
        return { structuredContent: { success: true } };
      }
      if (request.name === "ha_get_state") {
        stateCalls++;
        return { structuredContent: { data: { state: "on" } } };
      }
      throw new Error(`Unexpected tool: ${request.name}`);
    },
  };

  const result = await callHA(
    "ha_call_service",
    {
      domain: "light",
      service: "turn_off",
      entity_id: "light.test",
    },
    { mcpClient }
  );

  assert.equal(result.verification.status, "pending");
  assert.equal(serviceCalls, 1);
  assert.equal(stateCalls, 3);
});
