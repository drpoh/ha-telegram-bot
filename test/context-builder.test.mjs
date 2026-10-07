import test from "node:test";
import assert from "node:assert/strict";

import { buildHomeContext, contextStats } from "../src/context/builder.mjs";

test("bounds context sections before sending them to AI", () => {
  const context = buildHomeContext({
    conversation: [1, 2, 3],
    currentState: [1, 2, 3],
    memories: [1, 2, 3],
    historyFacts: [1, 2, 3],
    limits: {
      conversation: 2,
      currentState: 1,
      memories: 2,
      historyFacts: 1,
    },
  });

  assert.deepEqual(context.conversation, [1, 2]);
  assert.deepEqual(context.currentState, [1]);
  assert.deepEqual(context.memories, [1, 2]);
  assert.deepEqual(context.historyFacts, [1]);

  assert.deepEqual(contextStats(context), {
    conversation: 2,
    currentState: 1,
    memories: 2,
    historyFacts: 1,
  });
});
