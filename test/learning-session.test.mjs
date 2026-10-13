import test from "node:test";
import assert from "node:assert/strict";

import {
  startLearningSession,
  rememberLearningSearch,
  rememberLearningControl,
  getLearningSession,
} from "../src/learning/session.mjs";

test("starts clean learning session", () => {
  startLearningSession("Включи свет в гостиной");

  assert.deepEqual(getLearningSession(), {
    userText: "Включи свет в гостиной",
    originalUserText: "Включи свет в гостиной",
    searchQuery: null,
    searchDomain: null,
    searchedEntities: [],
    controlledEntities: [],
  });
});

test("stores search results", () => {
  startLearningSession("Включи свет в гостиной");

  rememberLearningSearch(
    "гостиная",
    "light",
    [
      {
        entity_id: "light.liustra",
        friendly_name: "Люстра",
      },
      {
        entity_id: "light.podsvetka",
        friendly_name: "Подсветка",
      },
    ]
  );

  const session = getLearningSession();

  assert.equal(session.searchQuery, "гостиная");
  assert.equal(session.searchDomain, "light");
  assert.equal(session.searchedEntities.length, 2);
});

test("stores only controlled entities without duplicates", () => {
  startLearningSession("Включи свет");

  rememberLearningControl("light.liustra");
  rememberLearningControl("light.liustra");

  assert.deepEqual(
    getLearningSession().controlledEntities,
    ["light.liustra"]
  );
});

test("new request clears completed learning session", () => {
  startLearningSession("Включи свет");
  rememberLearningControl("light.liustra");

  startLearningSession("Выключи телевизор");

  const session = getLearningSession();

  assert.equal(session.userText, "Выключи телевизор");
  assert.equal(session.searchQuery, null);
  assert.deepEqual(session.searchedEntities, []);
  assert.deepEqual(session.controlledEntities, []);
});

test("clarification preserves pending search", () => {
  startLearningSession("Включи свет в гостиной");

  rememberLearningSearch(
    "гостиная",
    "light",
    [
      {
        entity_id: "light.liustra",
        friendly_name: "Люстра",
      },
      {
        entity_id: "light.podsvetka",
        friendly_name: "Подсветка",
      },
    ]
  );

  startLearningSession("Люстра");

  const session = getLearningSession();

  assert.equal(session.userText, "Люстра");
  assert.equal(
    session.originalUserText,
    "Включи свет в гостиной"
  );
  assert.equal(session.searchQuery, "гостиная");
  assert.equal(session.searchDomain, "light");
  assert.equal(session.searchedEntities.length, 2);
  assert.deepEqual(session.controlledEntities, []);
});
