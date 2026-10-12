import {
  executeSql,
  escapeSql,
} from "../db/database.mjs";

export function initSceneDatabase() {
  executeSql(`
    CREATE TABLE IF NOT EXISTS ai_scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      area_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(normalized_name, area_id)
    );

    CREATE TABLE IF NOT EXISTS ai_scene_entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id INTEGER NOT NULL,
      entity_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      state TEXT NOT NULL,
      attributes TEXT NOT NULL DEFAULT '{}',

      UNIQUE(scene_id, entity_id),

      FOREIGN KEY(scene_id)
        REFERENCES ai_scenes(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ai_scenes_normalized_name
      ON ai_scenes(normalized_name);

    CREATE INDEX IF NOT EXISTS idx_ai_scenes_area_id
      ON ai_scenes(area_id);

    CREATE INDEX IF NOT EXISTS idx_ai_scene_entities_scene_id
      ON ai_scene_entities(scene_id);
  `);
}

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function validateName(name) {
  const clean = String(name || "").trim();

  if (!clean) {
    throw new Error("Scene name is required");
  }

  if (clean.length > 100) {
    throw new Error("Scene name is too long");
  }

  return clean;
}

function validateAreaId(areaId) {
  const clean = String(areaId || "").trim();

  if (!clean) {
    throw new Error("AI scene requires area_id");
  }

  if (clean === "__legacy__") {
    throw new Error("Legacy area cannot be used for new AI scenes");
  }

  return clean;
}

function validateEntity(entity) {
  const entityId = String(entity?.entity_id || "").trim();

  if (!entityId.includes(".")) {
    throw new Error(`Invalid entity_id: ${entityId}`);
  }

  const domain = entityId.split(".")[0];

  return {
    entity_id: entityId,
    domain,
    state: String(entity?.state ?? "off"),
    attributes:
      entity?.attributes &&
      typeof entity.attributes === "object"
        ? entity.attributes
        : {},
  };
}

export function createAiScene(name, areaId, entities = []) {
  const cleanName = validateName(name);
  const cleanAreaId = validateAreaId(areaId);
  const normalizedName = normalizeName(cleanName);

  if (getAiScene(cleanName, cleanAreaId)) {
    throw new Error(
      `AI scene already exists: ${cleanName} / ${cleanAreaId}`
    );
  }

  executeSql(`
    INSERT INTO ai_scenes (
      name,
      normalized_name,
      area_id
    )
    VALUES (
      ${escapeSql(cleanName)},
      ${escapeSql(normalizedName)},
      ${escapeSql(cleanAreaId)}
    );
  `);

  const scene = getAiScene(cleanName, cleanAreaId);

  try {
    for (const rawEntity of entities) {
      const entity = validateEntity(rawEntity);

      executeSql(`
        INSERT INTO ai_scene_entities (
          scene_id,
          entity_id,
          domain,
          state,
          attributes
        )
        VALUES (
          ${scene.id},
          ${escapeSql(entity.entity_id)},
          ${escapeSql(entity.domain)},
          ${escapeSql(entity.state)},
          ${escapeSql(JSON.stringify(entity.attributes))}
        );
      `);
    }
  } catch (error) {
    // Не оставляем полусозданную AI-сцену.
    executeSql(`
      DELETE FROM ai_scene_entities
      WHERE scene_id = ${scene.id};

      DELETE FROM ai_scenes
      WHERE id = ${scene.id};
    `);

    throw error;
  }

  return getAiScene(cleanName, cleanAreaId);
}

export function getAiScene(name, areaId) {
  const normalizedName = normalizeName(name);
  const cleanAreaId = validateAreaId(areaId);

  const row = executeSql(`
    SELECT
      id || char(31) ||
      name || char(31) ||
      normalized_name || char(31) ||
      area_id || char(31) ||
      created_at || char(31) ||
      updated_at
    FROM ai_scenes
    WHERE normalized_name = ${escapeSql(normalizedName)}
      AND area_id = ${escapeSql(cleanAreaId)}
    LIMIT 1;
  `);

  if (!row) {
    return null;
  }

  const [
    id,
    sceneName,
    sceneNormalizedName,
    sceneAreaId,
    createdAt,
    updatedAt,
  ] = row.split(String.fromCharCode(31));

  const entitiesRaw = executeSql(`
    SELECT
      entity_id || char(31) ||
      domain || char(31) ||
      state || char(31) ||
      attributes
    FROM ai_scene_entities
    WHERE scene_id = ${Number(id)}
    ORDER BY id;
  `);

  const entities = entitiesRaw
    ? entitiesRaw.split("\n").map((line) => {
        const [
          entity_id,
          domain,
          state,
          attributes,
        ] = line.split(String.fromCharCode(31));

        return {
          entity_id,
          domain,
          state,
          attributes: JSON.parse(attributes || "{}"),
        };
      })
    : [];

  return {
    id: Number(id),
    name: sceneName,
    normalized_name: sceneNormalizedName,
    area_id: sceneAreaId,
    entities,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function listAiScenes(areaId = null) {
  const where = areaId
    ? `WHERE area_id = ${escapeSql(validateAreaId(areaId))}`
    : `WHERE area_id != '__legacy__'`;

  const rows = executeSql(`
    SELECT
      name || char(31) || area_id
    FROM ai_scenes
    ${where}
    ORDER BY area_id, name COLLATE NOCASE;
  `);

  if (!rows) {
    return [];
  }

  return rows
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, sceneAreaId] =
        line.split(String.fromCharCode(31));

      return getAiScene(name, sceneAreaId);
    });
}

export function deleteAiScene(name, areaId) {
  const scene = getAiScene(name, areaId);

  if (!scene) {
    return false;
  }

  /*
   * Удаляются исключительно записи наших таблиц ai_*.
   * Home Assistant scene.* здесь не используются.
   */
  executeSql(`
    BEGIN IMMEDIATE;

    DELETE FROM ai_scene_entities
    WHERE scene_id = ${scene.id};

    DELETE FROM ai_scenes
    WHERE id = ${scene.id};

    COMMIT;
  `);

  return true;
}
