let deviceMemory = {
  query: null,
  domain: null,
  entities: [],
};

export function clearDeviceMemory() {
  deviceMemory = {
    query: null,
    domain: null,
    entities: [],
  };
}

export function updateDeviceMemory(data, args = {}) {
  if (!data?.success || !Array.isArray(data.entities)) {
    return false;
  }

  const availableEntities = data.entities.filter(
    (entity) =>
      entity.entity_id &&
      entity.state !== "unavailable" &&
      entity.state !== "unknown"
  );

  if (availableEntities.length === 0) {
    return false;
  }

  deviceMemory = {
    query: data.query || args.query || null,
    domain: data.domain_filter || args.domain_filter || null,

    entities: availableEntities.map((entity) => ({
      entity_id: entity.entity_id,
      friendly_name: entity.friendly_name || "",
      state: entity.state || null,
    })),
  };

  return true;
}

export function getDeviceMemory() {
  return {
    ...deviceMemory,
    entities: [...deviceMemory.entities],
  };
}

export function getDeviceMemoryText() {
  if (!deviceMemory.entities.length) {
    return "Оперативная память устройств пуста.";
  }

  return `
Последние найденные устройства Home Assistant:
Поиск: ${deviceMemory.query || "неизвестно"}
Домен: ${deviceMemory.domain || "неизвестно"}
Entity:
${deviceMemory.entities
  .map(
    (entity) =>
      `- ${entity.entity_id} | ${entity.friendly_name || ""} | state=${entity.state || "unknown"}`
  )
  .join("\n")}

Используй эти entity без нового ha_search, если текущая команда явно относится к тем же устройствам.
Если пользователь говорит о другом устройстве или другой комнате, выполни новый ha_search.
`;
}
