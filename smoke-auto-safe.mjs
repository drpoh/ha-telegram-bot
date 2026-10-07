import "dotenv/config";

import { connectMcp, closeMcp } from "./src/mcp/client.mjs";
import { callHA } from "./src/mcp/executor.mjs";
import { askHomeAssistant } from "./src/ai/agent.mjs";

const entityId = "light.kukhnia_svet";

function stateFrom(result) {
  const content = result?.structuredContent ?? result;
  const data = content?.data ?? content;
  return data?.state ?? data?.data?.state ?? data?.entity?.state ?? null;
}

await connectMcp();

try {
  const beforeResult = await callHA("ha_get_state", { entity_id: entityId });
  const before = stateFrom(beforeResult);

  if (!["on", "off"].includes(before)) {
    throw new Error(`Unexpected initial state: ${before}`);
  }

  const target = before === "on" ? "off" : "on";
  const verb = target === "on" ? "Включи" : "Выключи";

  console.log(`SMOKE before=${before} target=${target}`);

  const answer = await askHomeAssistant(
    `${verb} основной свет на кухне`,
    { source: "autonomous" }
  );
  console.log("SMOKE answer=", answer);

  const changedResult = await callHA("ha_get_state", { entity_id: entityId });
  const changed = stateFrom(changedResult);
  console.log(`SMOKE changed=${changed}`);

  if (changed !== target) {
    throw new Error(`AUTO_SAFE verification failed: expected ${target}, got ${changed}`);
  }

  await callHA("ha_call_service", {
    domain: "light",
    service: before === "on" ? "turn_on" : "turn_off",
    entity_id: entityId,
  });

  const restoredResult = await callHA("ha_get_state", { entity_id: entityId });
  const restored = stateFrom(restoredResult);
  console.log(`SMOKE restored=${restored}`);

  if (restored !== before) {
    throw new Error(`Restore verification failed: expected ${before}, got ${restored}`);
  }

  console.log("SMOKE PASS");
} finally {
  await closeMcp();
}
