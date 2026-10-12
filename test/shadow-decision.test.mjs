import test from "node:test";
import assert from "node:assert/strict";

import {
  isStateChangingToolCall,
  proposalFromToolCall,
  shadowEvaluateToolCall,
} from "../src/decision/shadow.mjs";

test("shadow ignores read-only MCP calls", () => {
  assert.equal(
    isStateChangingToolCall("ha_get_state", { entity_id: "light.kitchen" }),
    false
  );
  assert.equal(
    shadowEvaluateToolCall("ha_search", { query: "кухня" }),
    null
  );
});

test("shadow converts HA service call into entity-scoped proposal", () => {
  const proposal = proposalFromToolCall("ha_call_service", {
    domain: "light",
    service: "turn_off",
    entity_id: "light.kitchen",
  });

  assert.equal(proposal.action, "light.turn_off");
  assert.equal(proposal.policyKey, "light.kitchen");
  assert.equal(proposal.args.entity_id, "light.kitchen");
});

test("shadow defaults unknown entity policy to suggest", () => {
  const shadow = shadowEvaluateToolCall("ha_call_service", {
    domain: "light",
    service: "turn_off",
    entity_id: "light.kitchen",
  });

  assert.equal(shadow.mode, "shadow");
  assert.equal(shadow.outcome, "suggest");
  assert.equal(shadow.wouldExecute, false);
  assert.equal(shadow.executedByShadow, false);
});

test("shadow reports auto_safe approval without executing", () => {
  const shadow = shadowEvaluateToolCall(
    "ha_call_service",
    {
      domain: "light",
      service: "turn_off",
      entity_id: "light.hall",
    },
    { "light.hall": "auto_safe" }
  );

  assert.equal(shadow.outcome, "approve");
  assert.equal(shadow.wouldExecute, true);
  assert.equal(shadow.executedByShadow, false);
});
