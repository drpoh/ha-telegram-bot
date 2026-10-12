import test from "node:test";
import assert from "node:assert/strict";

import {
  initSceneDatabase,
  createAiScene,
  getAiScene,
  listAiScenes,
  deleteAiScene,
} from "../src/scenes/store.mjs";

initSceneDatabase();

const NAME = "__AI_SCENE_TEST__";
const AREA1 = "__test_living_room__";
const AREA2 = "__test_bathroom__";

function cleanup() {
  deleteAiScene(NAME, AREA1);
  deleteAiScene(NAME, AREA2);
}

test("AI scene create/read/delete with area", () => {
  cleanup();

  const created = createAiScene(NAME, AREA1, [
    {
      entity_id: "light.test_light",
      state: "on",
      attributes: { brightness: 100 },
    },
  ]);

  assert.equal(created.name, NAME);
  assert.equal(created.area_id, AREA1);
  assert.equal(created.entities.length, 1);
  assert.equal(
    created.entities[0].entity_id,
    "light.test_light"
  );
  assert.equal(
    created.entities[0].attributes.brightness,
    100
  );

  assert.equal(
    getAiScene(NAME, AREA1).area_id,
    AREA1
  );

  assert.equal(deleteAiScene(NAME, AREA1), true);
  assert.equal(getAiScene(NAME, AREA1), null);
});

test("same AI scene name is allowed in different areas", () => {
  cleanup();

  createAiScene(NAME, AREA1, [
    {
      entity_id: "light.living_test",
      state: "on",
    },
  ]);

  createAiScene(NAME, AREA2, [
    {
      entity_id: "light.bathroom_test",
      state: "off",
    },
  ]);

  assert.equal(getAiScene(NAME, AREA1).area_id, AREA1);
  assert.equal(getAiScene(NAME, AREA2).area_id, AREA2);

  const area1Scenes = listAiScenes(AREA1);

  assert.equal(
    area1Scenes.some(
      (scene) =>
        scene.name === NAME &&
        scene.area_id === AREA1
    ),
    true
  );

  cleanup();
});

test("duplicate AI scene in same area is rejected", () => {
  cleanup();

  createAiScene(NAME, AREA1, []);

  assert.throws(
    () => createAiScene(NAME, AREA1, []),
    /already exists/
  );

  cleanup();
});

test("AI scene requires an area", () => {
  assert.throws(
    () => createAiScene(NAME, "", []),
    /requires area_id/
  );
});

test("HA scene cannot be confused with AI scene", () => {
  assert.equal(
    getAiScene("scene.sauna", AREA1),
    null
  );

  assert.equal(
    deleteAiScene("scene.sauna", AREA1),
    false
  );
});


test("AI scene execution is blocked before area resolution or HA actuation", async () => {
  const { callAiSceneTool } = await import("../src/scenes/tools.mjs");
  const result = await callAiSceneTool("ai_scene_run", {
    name: "__must_not_execute__",
    area: "__unresolved_area__",
  });
  assert.equal(result.success, false);
  assert.equal(result.blocked, true);
  assert.equal(result.outcome, "scene_operation_not_authorized");
});

test("AI scene create and delete fail closed without modifying stored scenes", async () => {
 const { callAiSceneTool } = await import("../src/scenes/tools.mjs");
 const name = "__AI_SCENE_MUTATION_GUARD__";
 const area = "__test_living_room__";
 deleteAiScene(name, area);
 for (const tool of ["ai_scene_capture", "ai_scene_delete"]) {
  const result = await callAiSceneTool(tool, { name, area });
  assert.equal(result.blocked, true, tool);
  assert.equal(result.outcome, "scene_operation_not_authorized", tool);
 }
 assert.equal(getAiScene(name, area), null);
});
