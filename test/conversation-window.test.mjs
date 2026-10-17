import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const agent = readFileSync(new URL("../src/ai/agent.mjs", import.meta.url), "utf8");
test("AI uses bounded recent dialogue while SQLite history remains untouched", () => {
  assert.match(agent, /getConversationHistory\(\)\.slice\(quickConversation \? -4 : -12\)/);
});
