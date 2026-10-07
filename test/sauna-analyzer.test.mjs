import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSaunaHeating, estimateMinutesToTarget, findSaunaHeatingCycles } from "../src/history/sauna-analyzer.mjs";

const heating = [
  { state: "60", last_changed: "2026-10-07T18:00:00+03:00" },
  { state: "65", last_changed: "2026-10-07T18:10:00+03:00" },
  { state: "75", last_changed: "2026-10-07T18:20:00+03:00" },
  { state: "85", last_changed: "2026-10-07T18:30:00+03:00" },
];

test("detects sauna heating to target", () => {
  const result = analyzeSaunaHeating(heating, { maxGapMinutes: 15 });
  assert.equal(result.startTemperature, 60);
  assert.equal(result.reachedTemperature, 85);
  assert.equal(result.durationMinutes, 30);
  assert.equal(result.rateCPerMinute, 25 / 30);
});

test("ignores a hot return after a long unavailable gap", () => {
  const samples = [
    { state: "27.75", last_changed: "2026-10-05T09:45:20+03:00" },
    { state: "unavailable", last_changed: "2026-10-05T09:46:00+03:00" },
    { state: "89.125", last_changed: "2026-10-06T19:45:07+03:00" },
    { state: "84", last_changed: "2026-10-06T20:30:00+03:00" },
    { state: "85", last_changed: "2026-10-06T20:31:00+03:00" },
  ];
  assert.equal(findSaunaHeatingCycles(samples).length, 0);
});

test("finds a later real cycle even when history starts above target", () => {
  const samples = [
    { state: "89", last_changed: "2026-10-03T17:00:00+03:00" },
    { state: "80", last_changed: "2026-10-03T17:10:00+03:00" },
    { state: "60", last_changed: "2026-10-03T18:00:00+03:00" },
    { state: "70", last_changed: "2026-10-03T18:10:00+03:00" },
    { state: "80", last_changed: "2026-10-03T18:20:00+03:00" },
    { state: "85", last_changed: "2026-10-03T18:30:00+03:00" },
  ];
  const cycles = findSaunaHeatingCycles(samples, { maxGapMinutes: 15 });
  assert.equal(cycles.length, 1);
  assert.equal(cycles[0].startTemperature, 60);
  assert.equal(cycles[0].durationMinutes, 30);
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
  ], { maxGapMinutes: 15 });
  assert.equal(result, null);
});
