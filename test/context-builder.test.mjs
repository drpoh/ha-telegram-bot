import test from "node:test";
import assert from "node:assert/strict";

import { buildHomeContext, contextStats, renderHomeContext } from "../src/context/builder.mjs";

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


test("renders history facts as compact AI context", () => {
  const context = buildHomeContext({
    historyFacts: [
      "Последний полный прогрев сауны до 85 °C занял 60.8 мин.",
      "Недостаточно полных циклов для надежного среднего.",
    ],
  });

  const text = renderHomeContext(context);
  assert.match(text, /ФАКТЫ ИЗ ИСТОРИИ HOME ASSISTANT/);
  assert.match(text, /60\.8 мин/);
  assert.match(text, /Недостаточно полных циклов/);
  assert.doesNotMatch(text, /undefined/);
});
