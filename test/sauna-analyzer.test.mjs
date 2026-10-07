import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSaunaHeating, estimateMinutesToTarget } from "../src/history/sauna-analyzer.mjs";

const heating = [
  { state: "60", last_changed: "2026-10-07T18:00:00+03:00" },
  { state: "65", last_changed: "2026-10-07T18:10:00+03:00" },
  { state: "75", last_changed: "2026-10-07T18:20:00+03:00" },
  { state: "85", last_changed: "2026-10-07T18:30:00+03:00" },
];

test("detects sauna heating to target", () => {
  const result = analyzeSaunaHeating(heating);
  assert.equal(result.startTemperature, 60);
  assert.equal(result.reachedTemperature, 85);
  assert.equal(result.durationMinutes, 30);
  assert.equal(result.rateCPerMinute, 25 / 30);
});

test("estimates remaining sauna heating time", () => {
  const result = estimateMinutesToTarget([
    { state: "65", last_changed: "2026-10-07T18:00:00+03:00" },
    { state: "70", last_changed: "2026-10-07T18:05:00+03:00" },
    { state: "75", last_changed: "2026-10-07T18:10:00+03:00" },
  ]);
  assert.equal(result.rateCPerMinute, 1);
  assert.equal(result.minutesRemaining, 10);
});

test("does not forecast when temperature is not rising", () => {
  const result = estimateMinutesToTarget([
    { state: "75", last_changed: "2026-10-07T18:00:00+03:00" },
    { state: "74", last_changed: "2026-10-07T18:10:00+03:00" },
  ]);
  assert.equal(result, null);
});
