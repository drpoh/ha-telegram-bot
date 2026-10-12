import { callHA } from "../mcp/executor.mjs";
import { resolveArea } from "../home/area-resolver.mjs";
import {
  createAiScene,
  getAiScene,
} from "./store.mjs";

const CAPTURE_DOMAINS = [
  "light",
];

function extractData(result) {
  return result?.structuredContent ?? result;
}

function sanitizeLightAttributes(attributes = {}) {
  const safe = {};

  // Пока сохраняем только то, что manager.mjs уже умеет
  // безопасно восстанавливать.
  if (
    Number.isInteger(attributes.brightness) &&
    attributes.brightness >= 0 &&
    attributes.brightness <= 255
  ) {
    safe.brightness = attributes.brightness;
  }

  return safe;
}

async function getEntitiesInArea(areaId, domain) {
  const result = await callHA("ha_search", {
    area_filter: areaId,
    domain_filter: domain,
    limit: 100,
    include_hidden: false,
    result_fields: [
      "entity_id",
      "friendly_name",
      "domain",
      "state",
      "area",
    ],
    fields: [
      "entities",
      "entity_total_matches",
      "entity_has_more",
    ],
  });

  const data = extractData(result);

  if (data?.entity_has_more) {
    throw new Error(
      `Too many ${domain} entities in area ${areaId}`
    );
  }

  return data?.entities || [];
}

async function readEntityState(entityId) {
  const result = await callHA("ha_get_state", {
    entity_id: entityId,
  });

  const data = extractData(result);

  // Current HA-MCP format:
  // { data: { entity_id, state, attributes, ... }, metadata: {...} }
  if (data?.data?.entity_id === entityId) {
    return data.data;
  }

  // Compatibility with other HA-MCP response formats.
  if (data?.entity_id === entityId) {
    return data;
  }

  if (data?.state?.entity_id === entityId) {
    return data.state;
  }

  if (data?.entity?.entity_id === entityId) {
    return data.entity;
  }

  throw new Error(
    `Cannot read current state for ${entityId}`
  );
}

export async function captureAiScene(
  name,
  areaText
) {
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    throw new Error("AI scene name is required");
  }

  const area = await resolveArea(areaText);

  if (!area) {
    throw new Error(
      `Home Assistant area not found: ${areaText}`
    );
  }

  /*
   * Не перезаписываем существующую AI-сцену автоматически.
   * Позже добавим отдельную безопасную команду update.
   */
  if (getAiScene(cleanName, area.area_id)) {
    throw new Error(
      `AI scene already exists: ${cleanName} / ${area.name}`
    );
  }

  const captured = [];

  for (const domain of CAPTURE_DOMAINS) {
    const found = await getEntitiesInArea(
      area.area_id,
      domain
    );

    for (const searchEntity of found) {
      if (!searchEntity?.entity_id) {
        continue;
      }

      /*
       * Дополнительная защита:
       * ha_search уже ограничен area_filter.
       * Не доверяем LLM список entity_id.
       */
      if (
        searchEntity.domain &&
        searchEntity.domain !== domain
      ) {
        throw new Error(
          `Unexpected domain for ${searchEntity.entity_id}`
        );
      }

      const current = await readEntityState(
        searchEntity.entity_id
      );

      const actualDomain =
        current.entity_id.split(".")[0];

      if (actualDomain !== domain) {
        throw new Error(
          `Domain mismatch for ${current.entity_id}`
        );
      }

      captured.push({
        entity_id: current.entity_id,
        state: current.state,
        attributes:
          domain === "light"
            ? sanitizeLightAttributes(
                current.attributes
              )
            : {},
      });
    }
  }

  if (captured.length === 0) {
    throw new Error(
      `No supported entities found in ${area.name}`
    );
  }

  const scene = createAiScene(
    cleanName,
    area.area_id,
    captured
  );

  console.log(
    `AI Scene captured → "${scene.name}" / ${area.name} (${area.area_id}) / ${captured.length} entities`
  );

  return {
    success: true,
    name: scene.name,
    area_id: area.area_id,
    area_name: area.name,
    entities: captured.length,
    scene,
  };
}
