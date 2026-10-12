import { getAiScene } from "./store.mjs";
import { callHA } from "../mcp/executor.mjs";

const SAFE_DOMAINS = new Set([
  "light",
  "media_player",
  "select",
  "input_select",
]);

function assertSafeEntity(entity) {
  if (!entity?.entity_id) {
    throw new Error("AI scene entity has no entity_id");
  }

  const domain = entity.entity_id.split(".")[0];

  if (!SAFE_DOMAINS.has(domain)) {
    throw new Error(
      `AI scene is not allowed to control domain: ${domain}`
    );
  }
}

async function restoreEntity(entity) {
  assertSafeEntity(entity);

  const domain = entity.entity_id.split(".")[0];

  if (domain === "light") {
    const service =
      entity.state === "on" ? "turn_on" : "turn_off";

    const args = {
      domain,
      service,
      entity_id: entity.entity_id,
    };

    if (service === "turn_on") {
      const brightness =
        entity.attributes?.brightness;

      if (
        Number.isInteger(brightness) &&
        brightness >= 0 &&
        brightness <= 255
      ) {
        args.brightness = brightness;
      }
    }

    return callHA("ha_call_service", args);
  }

  if (domain === "media_player") {
    if (entity.state === "off") {
      return callHA("ha_call_service", {
        domain,
        service: "turn_off",
        entity_id: entity.entity_id,
      });
    }

    if (entity.state === "on") {
      await callHA("ha_call_service", {
        domain,
        service: "turn_on",
        entity_id: entity.entity_id,
      });

      const volume =
        entity.attributes?.volume_level;

      if (
        typeof volume === "number" &&
        volume >= 0 &&
        volume <= 1
      ) {
        await callHA("ha_call_service", {
          domain,
          service: "volume_set",
          entity_id: entity.entity_id,
          volume_level: volume,
        });
      }
    }

    return;
  }

  if (
    domain === "select" ||
    domain === "input_select"
  ) {
    const option =
      entity.attributes?.option ??
      (entity.state !== "unknown" &&
       entity.state !== "unavailable"
        ? entity.state
        : null);

    if (!option) {
      throw new Error(
        `No option stored for ${entity.entity_id}`
      );
    }

    return callHA("ha_call_service", {
      domain,
      service: "select_option",
      entity_id: entity.entity_id,
      option,
    });
  }
}

export async function runAiScene(name, areaId) {
  const scene = getAiScene(name, areaId);

  if (!scene) {
    throw new Error(`AI scene not found: ${name}`);
  }

  // Проверяем ВСЮ сцену до первого действия.
  // Если хотя бы один объект запрещён — ничего не запускаем.
  for (const entity of scene.entities) {
    assertSafeEntity(entity);
  }

  for (const entity of scene.entities) {
    await restoreEntity(entity);
  }

  return {
    success: true,
    name: scene.name,
    entities: scene.entities.length,
  };
}

export function getAllowedAiSceneDomains() {
  return [...SAFE_DOMAINS];
}

export function isAllowedAiSceneEntity(entityId) {
  if (!entityId || !String(entityId).includes(".")) {
    return false;
  }

  const domain = String(entityId).split(".")[0];

  return SAFE_DOMAINS.has(domain);
}
