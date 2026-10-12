// MANUAL ONLY: invokes live Home Assistant actions. Never run via npm test.
import "dotenv/config";
import { connectMcp, closeMcp } from "../../src/mcp/client.mjs";
import { callHA } from "../../src/mcp/executor.mjs";
import { askHomeAssistant } from "../../src/ai/agent.mjs";
import { ACTION_SOURCES } from "../../src/policy/engine.mjs";

if (process.env.HA_ALLOW_LIVE_SMOKE !== "I_APPROVE_REAL_LIGHT_CHANGES" ||
    !process.argv.includes("--live-ha-approved")) {
  throw new Error("LIVE smoke test blocked. Requires explicit operator approval and environment opt-in.");
}

const entities = ["light.podsvetka", "light.podsvetka_2"];
const cases = [
  { target: "light.podsvetka", phrase: "Включи гостиную подсветку" },
  { target: "light.podsvetka_2", phrase: "Включи гостиная спот" },
];

function stateFrom(result) {
  const content = result?.structuredContent ?? result;
  const data = content?.data ?? content;
  return data?.state ?? data?.data?.state ?? data?.entity?.state ?? null;
}

async function getState(entityId) {
  return stateFrom(await callHA("ha_get_state", { entity_id: entityId }));
}

async function waitForState(entityId, expected, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  let state = null;
  while (Date.now() <= deadline) {
    state = await getState(entityId);
    if (state === expected) return state;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return state;
}

async function snapshot() {
  return Object.fromEntries(await Promise.all(entities.map(async (id) => [id, await getState(id)])));
}

async function withTimeout(promise, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function restore(states) {
  for (const id of entities) {
    await callHA("ha_call_service", {
      domain: "light",
      service: states[id] === "on" ? "turn_on" : "turn_off",
      entity_id: id,
    });
    const restored = await waitForState(id, states[id]);
    if (restored !== states[id]) throw new Error(`${id}: restore expected ${states[id]}, got ${restored}`);
  }
}

await connectMcp();
try {
  for (const c of cases) {
    const before = await snapshot();
    if (Object.values(before).some((s) => !["on", "off"].includes(s))) throw new Error("Unexpected initial state");
    const other = entities.find((id) => id !== c.target);
    const targetState = before[c.target] === "on" ? "off" : "on";
    const verb = targetState === "on" ? "Включи" : "Выключи";
    const phrase = c.phrase.replace(/^Включи|^Выключи/, verb);

    console.log("ISOLATION before", c.target, before);
    try {
      const answer = await withTimeout(
        askHomeAssistant(phrase, { source: ACTION_SOURCES.AUTONOMOUS }),
        15000,
        `AI action for ${c.target}`
      );
      console.log("ISOLATION answer", answer);
      const targetAfter = await waitForState(c.target, targetState);
      const otherAfter = await getState(other);
      console.log("ISOLATION after", { target: targetAfter, other: otherAfter });
      if (targetAfter !== targetState) throw new Error(`${c.target}: expected ${targetState}, got ${targetAfter}`);
      if (otherAfter !== before[other]) throw new Error(`${other}: changed unexpectedly from ${before[other]} to ${otherAfter}`);
    } finally {
      await restore(before);
      console.log("ISOLATION restored", await snapshot());
    }
  }
  console.log("LIVING ROOM ISOLATION PASS");
} finally {
  await closeMcp();
}
