import test from "node:test";
import assert from "node:assert/strict";
import { classifyFreshness, FRESHNESS } from "../src/context/freshness.mjs";

test("classifies live recent stale and unknown state age", () => {
  const now = 100000;
  assert.equal(classifyFreshness({ observedAt: 99000, now }).freshness, FRESHNESS.LIVE);
  assert.equal(classifyFreshness({ observedAt: 90000, now }).freshness, FRESHNESS.RECENT);
  assert.equal(classifyFreshness({ observedAt: 1000, now }).freshness, FRESHNESS.STALE);
  assert.equal(classifyFreshness({ observedAt: null, now }).freshness, FRESHNESS.UNKNOWN);
});

test("future timestamp is unknown", () => {
  const result = classifyFreshness({ observedAt: 101000, now: 100000 });
  assert.equal(result.freshness, FRESHNESS.UNKNOWN);
  assert.equal(result.age_ms, null);
});
