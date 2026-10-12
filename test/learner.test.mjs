import test from "node:test";
import assert from "node:assert/strict";

import {
  startLearningSession,
  rememberLearningSearch,
  rememberLearningControl,
} from "../src/learning/session.mjs";

import { finalizeLearning } from "../src/learning/learner.mjs";

test("does not learn without search", () => {
  startLearningSession("Включи его");
  rememberLearningControl("light.test");

  assert.equal(finalizeLearning(), false);
});

test("does not learn multiple controlled entities", () => {
  startLearningSession("Включи свет в комнате");

  rememberLearningSearch(
    "комната",
    "light",
    [
      { entity_id: "light.a", friendly_name: "A" },
      { entity_id: "light.b", friendly_name: "B" },
    ]
  );

  rememberLearningControl("light.a");
  rememberLearningControl("light.b");

  assert.equal(finalizeLearning(), false);
});

test("does not learn entity outside search results", () => {
  startLearningSession("Включи свет");

  rememberLearningSearch(
    "комната",
    "light",
    [
      { entity_id: "light.a", friendly_name: "A" },
    ]
  );

  rememberLearningControl("light.other");

  assert.equal(finalizeLearning(), false);
});

test("learns single controlled entity from search", () => {
  startLearningSession("Включи тестовый свет");

  rememberLearningSearch(
    "тестовый свет",
    "light",
    [
      {
        entity_id: "light.learning_test",
        friendly_name: "Learning Test",
      },
      {
        entity_id: "light.other",
        friendly_name: "Other",
      },
    ]
  );

  rememberLearningControl("light.learning_test");

  assert.equal(finalizeLearning(), true);
});
