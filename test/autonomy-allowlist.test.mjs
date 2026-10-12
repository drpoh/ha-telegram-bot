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

test("allowlisted living room chandelier permits autonomous turn_off", () => {
  const result = decide(
    proposal("light.liustra", "turn_off"),
    autonomyPolicy
  );
  assert.equal(result.executable, true);
});

test("living room accent lights permit autonomous turn_on", () => {
  for (const entityId of ["light.podsvetka", "light.podsvetka_2"]) {
    const result = decide(
      proposal(entityId, "turn_on"),
      autonomyPolicy
    );
    assert.equal(result.executable, true);
  }
});

test("bathroom and sauna are no longer auto_safe", () => {
  for (const entityId of ["switch.vannaia_svet", "light.wled_gledopto"]) {
    const result = decide(
      proposal(entityId, "turn_off"),
      autonomyPolicy
    );
    assert.equal(result.outcome, "suggest");
    assert.equal(result.executable, false);
  }
});

test("allowlisted living room light rejects unlisted toggle service", () => {
  const result = decide(
    proposal("light.liustra", "toggle"),
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


test("AI proposal preconditions cannot become trusted policy preconditions", () => {
  const input = proposal("light.kukhnia_svet", "turn_on");
  input.preconditions = [{ entity_id: "binary_sensor.fake", state: "off" }];
  const result = decide(input, autonomyPolicy);
  assert.deepEqual(result.proposal.preconditions, input.preconditions);
  assert.deepEqual(result.policy.preconditions, []);
});

test("only deterministic policy entry supplies trusted preconditions", () => {
  const policy = {
    default: "suggest",
    entities: {
      "light.test": {
        level: "auto_safe",
        services: ["turn_on"],
        preconditions: [{ entity_id: "binary_sensor.presence", state: "off" }],
      },
    },
  };
  const result = decide(proposal("light.test", "turn_on"), policy);
  assert.deepEqual(result.policy.preconditions, [
    { entity_id: "binary_sensor.presence", state: "off" },
  ]);
});
