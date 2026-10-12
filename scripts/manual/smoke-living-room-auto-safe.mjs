// MANUAL ONLY: invokes live Home Assistant actions. Never run via npm test.
import "dotenv/config";

import { connectMcp, closeMcp } from "../../src/mcp/client.mjs";
import { callHA } from "../../src/mcp/executor.mjs";
import { askHomeAssistant } from "../../src/ai/agent.mjs";

if (process.env.HA_ALLOW_LIVE_SMOKE !== "I_APPROVE_REAL_LIGHT_CHANGES" ||
    !process.argv.includes("--live-ha-approved")) {
  throw new Error("LIVE smoke test blocked. Requires explicit operator approval and environment opt-in.");
}

const targets = [
  ["light.liustra", "люстру в гостиной"],
  ["light.podsvetka", "подсветку в гостиной"],
  ["light.podsvetka_2", "вторую подсветку в гостиной"],
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

await connectMcp();

try {
  for (const [entityId, spokenName] of targets) {
    const before = await getState(entityId);
    if (!["on", "off"].includes(before)) {
      throw new Error(`${entityId}: unexpected initial state ${before}`);
    }

    const target = before === "on" ? "off" : "on";
    const verb = target === "on" ? "Включи" : "Выключи";
    console.log(`SMOKE ${entityId} before=${before} target=${target}`);

    try {
      const answer = await askHomeAssistant(
        `${verb} ${spokenName}`,
        { source: "autonomous" }
      );
      console.log(`SMOKE ${entityId} answer=`, answer);

      const changed = await waitForState(entityId, target);
      console.log(`SMOKE ${entityId} changed=${changed}`);
      if (changed !== target) {
        throw new Error(`${entityId}: expected ${target}, got ${changed}`);
      }
    } finally {
      await callHA("ha_call_service", {
        domain: "light",
        service: before === "on" ? "turn_on" : "turn_off",
        entity_id: entityId,
      });
      const restored = await waitForState(entityId, before);
      console.log(`SMOKE ${entityId} restored=${restored}`);
      if (restored !== before) {
        throw new Error(`${entityId}: restore expected ${before}, got ${restored}`);
      }
    }
  }

  console.log("LIVING ROOM SMOKE PASS");
} finally {
  await closeMcp();
}
