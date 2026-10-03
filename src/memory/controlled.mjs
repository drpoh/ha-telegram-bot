import {
  getMemory,
  setMemory,
  deleteMemory,
} from "../db/database.mjs";

const MEMORY_KEY = "lastControlled";

let lastControlled = {
  domain: null,
  entities: [],
};

export function loadControlledMemory() {
  try {
    const saved = getMemory(MEMORY_KEY);

    if (
      saved &&
      typeof saved === "object" &&
      Array.isArray(saved.entities)
    ) {
      lastControlled = {
        domain: saved.domain || null,
        entities: [...saved.entities],
      };

      console.log(
        `Controlled memory loaded → ${lastControlled.domain} / ${lastControlled.entities.join(", ")}`
      );

      return true;
    }
  } catch (error) {
    console.error(
      "Controlled memory load failed:",
      error?.message || error
    );
  }

  return false;
}

function persist() {
  try {
    setMemory(MEMORY_KEY, lastControlled);
  } catch (error) {
    console.error(
      "Controlled memory save failed:",
      error?.message || error
    );
  }
}

export function rememberControlled(domain, entityId) {
  lastControlled = {
    domain,
    entities: [entityId],
  };

  persist();
}

export function rememberControlledMany(domain, entityIds) {
  lastControlled = {
    domain,
    entities: [...new Set(entityIds)],
  };

  persist();
}

export function getLastControlled() {
  return {
    domain: lastControlled.domain,
    entities: [...lastControlled.entities],
  };
}

export function clearControlledMemory() {
  lastControlled = {
    domain: null,
    entities: [],
  };

  try {
    deleteMemory(MEMORY_KEY);
  } catch (error) {
    console.error(
      "Controlled memory delete failed:",
      error?.message || error
    );
  }
}

export function getLastControlledText() {
  if (!lastControlled.entities.length) {
    return "Нет недавно управляемых устройств.";
  }

  return `
Последние устройства, которыми реально управлял ассистент:
Домен: ${lastControlled.domain}
Entity:
${lastControlled.entities.map((id) => `- ${id}`).join("\n")}

Если пользователь говорит "его", "её", "их", "обратно", "снова" или "теперь выключи/включи", в первую очередь используй эти entity.
Не используй весь список результатов предыдущего поиска вместо реально управляемых устройств.
`;
}
