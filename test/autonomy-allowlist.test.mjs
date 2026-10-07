import test from "node:test";
import assert from "node:assert/strict";

import { decide } from "../src/decision/engine.mjs";
import { autonomyPolicy } from "../src/policy/config.mjs";

function proposal(entityId, service) {
  return {
    action: `${entityId.split(".")[0]}.${service}`,
    policyKey: entityId,
    args: {
      domain: entityId.split(".")[0],
      service,
      entity_id: entityId,
    },
  };
}

test("allowlisted kitchen light permits autonomous turn_on", () => {
  const result = decide(
    proposal("light.kukhnia_svet", "turn_on"),
    autonomyPolicy
  );
  assert.equal(result.outcome, "approve");
  assert.equal(result.executable, true);
});

test("allowlisted bathroom switch permits autonomous turn_off", () => {
  const result = decide(
    proposal("switch.vannaia_svet", "turn_off"),
    autonomyPolicy
  );
  assert.equal(result.executable, true);
});

test("allowlisted WLED rejects unlisted toggle service", () => {
  const result = decide(
    proposal("light.wled_gledopto", "toggle"),
    autonomyPolicy
  );
  assert.equal(result.executable, false);
  assert.equal(result.policy.serviceAllowed, false);
});

test("unknown entity remains suggest and blocked", () => {
  const result = decide(
    proposal("light.unknown", "turn_off"),
    autonomyPolicy
  );
  assert.equal(result.outcome, "suggest");
  assert.equal(result.executable, false);
});
