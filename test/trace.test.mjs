import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeTraceData, traceDecision } from "../src/decision/trace.mjs";

test("trace excludes prompts evidence and raw payloads", () => {
  assert.deepEqual(sanitizeTraceData({ action: "light.turn_off", risk: "R1", prompt: "secret", evidence: ["raw"], payload: { x: 1 } }), { action: "light.turn_off", risk: "R1" });
});

test("trace emits structured factual stage", () => {
  let line;
  let data;
  const clean = traceDecision("policy", { policy: "auto_safe", outcome: "approve" }, { logger: (message, value) => { line = message; data = value; } });
  assert.equal(line, "TRACE POLICY →");
  assert.deepEqual(data, { policy: "auto_safe", outcome: "approve" });
  assert.deepEqual(clean, data);
});
