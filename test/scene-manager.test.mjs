import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllowedAiSceneDomains,
  isAllowedAiSceneEntity,
} from "../src/scenes/manager.mjs";

test("AI scene allows safe domains", () => {
  assert.equal(
    isAllowedAiSceneEntity("light.liustra"),
    true
  );

  assert.equal(
    isAllowedAiSceneEntity("media_player.louder"),
    true
  );

  assert.equal(
    isAllowedAiSceneEntity("select.wled_preset"),
    true
  );

  assert.equal(
    isAllowedAiSceneEntity("input_select.bathroom_profile"),
    true
  );
});

test("AI scene blocks unsafe domains", () => {
  assert.equal(
    isAllowedAiSceneEntity("switch.sauna_heater"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("climate.house"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("lock.front_door"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("cover.garage"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("scene.sauna"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("script.sauna"),
    false
  );
});

test("AI scene rejects invalid entity ids", () => {
  assert.equal(
    isAllowedAiSceneEntity(""),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity("light"),
    false
  );

  assert.equal(
    isAllowedAiSceneEntity(null),
    false
  );
});

test("AI scene domain allowlist is exact", () => {
  assert.deepEqual(
    getAllowedAiSceneDomains().sort(),
    [
      "input_select",
      "light",
      "media_player",
      "select",
    ].sort()
  );
});
