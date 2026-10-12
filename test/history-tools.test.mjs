import test from "node:test";
import assert from "node:assert/strict";

import { callAiHistoryTool, isAiHistoryTool } from "../src/history/tools.mjs";

test("recognizes only the safe AI history tool", () => {
  assert.equal(isAiHistoryTool("ai_history_summary"), true);
  assert.equal(isAiHistoryTool("ha_get_history"), false);
});

test("rejects unsupported history subjects before fetching data", async () => {
  let called = false;

  await assert.rejects(
    callAiHistoryTool(
      "ai_history_summary",
      { subject: "door_lock" },
      { fetchEntityHistory: async () => { called = true; } }
    ),
    /Unsupported history subject/
  );

  assert.equal(called, false);
});

test("builds compact sauna history context without live Home Assistant", async () => {
  let receivedEntity = null;
  let receivedOptions = null;

  const states = [
    { state: "30", last_changed: "2026-10-03T18:00:00+03:00" },
    { state: "35", last_changed: "2026-10-03T18:05:00+03:00" },
    { state: "40", last_changed: "2026-10-03T18:10:00+03:00" },
    { state: "45", last_changed: "2026-10-03T18:15:00+03:00" },
    { state: "50", last_changed: "2026-10-03T18:20:00+03:00" },
    { state: "55", last_changed: "2026-10-03T18:25:00+03:00" },
    { state: "60", last_changed: "2026-10-03T18:30:00+03:00" },
    { state: "65", last_changed: "2026-10-03T18:35:00+03:00" },
    { state: "70", last_changed: "2026-10-03T18:40:00+03:00" },
    { state: "75", last_changed: "2026-10-03T18:45:00+03:00" },
    { state: "80", last_changed: "2026-10-03T18:50:00+03:00" },
    { state: "83", last_changed: "2026-10-03T18:55:00+03:00" },
    { state: "85", last_changed: "2026-10-03T19:00:00+03:00" },
    { state: "80", last_changed: "2026-10-03T20:00:00+03:00" },
    { state: "82", last_changed: "2026-10-03T20:05:00+03:00" },
    { state: "85", last_changed: "2026-10-03T20:10:00+03:00" },
  ];

  const result = await callAiHistoryTool(
    "ai_history_summary",
    { subject: "sauna", start_time: "7d" },
    {
      fetchEntityHistory: async (entityId, options) => {
        receivedEntity = entityId;
        receivedOptions = options;
        return {
          states,
          period: { start: "2026-10-01T00:00:00Z", end: "2026-10-08T00:00:00Z" },
        };
      },
    }
  );

  assert.equal(receivedEntity, "sensor.sauna_te_sauna_temperature");
  assert.equal(receivedOptions.startTime, "7d");
  assert.equal(receivedOptions.allPages, true);
  assert.equal(receivedOptions.maxRecords, 10000);
  assert.equal(result.success, true);
  assert.equal(result.subject, "sauna");
  assert.equal(result.summary.fullCycles, 1);
  assert.equal(result.summary.reheatCycles, 1);
  assert.equal(result.summary.enoughData, false);
  assert.match(result.context, /60\.0 мин/);
  assert.match(result.context, /Данных пока недостаточно/);
  assert.match(result.context, /догревов уже теплой сауны: 1/);
});
