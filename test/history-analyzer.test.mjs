import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeHistorySamples,
  summarizeNumericSeries,
  summarizeStateDurations,
  buildHistoryFact,
} from "../src/history/analyzer.mjs";

test("normalizes common Home Assistant history fields", () => {
  const result = normalizeHistorySamples([
    { state: "21.5", last_changed: "2026-10-07T10:00:00Z" },
    { value: 22, timestamp: "2026-10-07T10:05:00Z" },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].state, "21.5");
  assert.equal(result[1].state, 22);
});

test("summarizes numeric history", () => {
  const result = summarizeNumericSeries([
    { state: "20" },
    { state: "25" },
    { state: "unavailable" },
    { state: "30" },
  ]);

  assert.deepEqual(result, {
    count: 3,
    min: 20,
    max: 30,
    average: 25,
    first: 20,
    last: 30,
  });
});

test("calculates state durations and transitions", () => {
  const result = summarizeStateDurations(
    [
      { state: "off", last_changed: "2026-10-07T10:00:00Z" },
      { state: "on", last_changed: "2026-10-07T10:10:00Z" },
      { state: "off", last_changed: "2026-10-07T10:25:00Z" },
    ],
    { endTime: "2026-10-07T10:30:00Z" }
  );

  assert.equal(result.transitions, 2);
  assert.equal(result.durationsSeconds.off, 900);
  assert.equal(result.durationsSeconds.on, 900);
  assert.equal(result.firstState, "off");
  assert.equal(result.lastState, "off");
});

test("builds compact history fact for context", () => {
  const fact = buildHistoryFact(
    "sensor.sauna_temperature",
    [
      { state: "60", last_changed: "2026-10-07T10:00:00Z" },
      { state: "70", last_changed: "2026-10-07T10:10:00Z" },
      { state: "85", last_changed: "2026-10-07T10:20:00Z" },
    ],
    {
      startTime: "2026-10-07T10:00:00Z",
      endTime: "2026-10-07T10:20:00Z",
    }
  );

  assert.equal(fact.entityId, "sensor.sauna_temperature");
  assert.equal(fact.numeric.average, 215 / 3);
  assert.equal(fact.sampleCount, 3);
});
