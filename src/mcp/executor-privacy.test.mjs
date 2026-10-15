import test from "node:test";
import assert from "node:assert/strict";
import { callHA } from "./executor.mjs";

test("MCP adapter returns original read result without logging private input or response", async () => {
  const secret = "PRIVATE_HA_PAYLOAD_DO_NOT_LOG";
  const logs = [];
  const original = console.log;
  const result = { structuredContent: { entity_id: "sensor.test", state: secret } };
  const client = {
    async callTool(payload) {
      assert.equal(payload.name, "ha_get_state");
      assert.equal(payload.arguments.entity_id, secret);
      return result;
    },
  };
  try {
    console.log = (...args) => logs.push(args.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" "));
    const actual = await callHA("ha_get_state", { entity_id: secret }, { mcpClient: client });
    assert.equal(actual, result);
  } finally {
    console.log = original;
  }
  assert.doesNotMatch(logs.join("\n"), /PRIVATE_HA_PAYLOAD_DO_NOT_LOG/);
  assert.match(logs.join("\n"), /ha_get_state/);
});
