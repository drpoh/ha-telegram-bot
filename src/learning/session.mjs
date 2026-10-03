let session = {
  userText: null,
  originalUserText: null,
  searchQuery: null,
  searchDomain: null,
  searchedEntities: [],
  controlledEntities: [],
};

export function startLearningSession(userText) {
  const hasPendingSearch =
    session.searchQuery &&
    session.searchDomain &&
    session.searchedEntities.length > 0 &&
    session.controlledEntities.length === 0;

  // Предыдущий запрос сделал поиск, но устройство ещё не было выбрано.
  // Сохраняем результаты поиска для следующего уточнения:
  // "Включи свет в гостиной" → "Люстра".
  if (hasPendingSearch) {
    session = {
      ...session,
      userText,
      controlledEntities: [],
    };

    console.log(
      `Learning continuation → "${session.searchQuery}" + "${userText}"`
    );

    return;
  }

  // Обычный новый запрос — начинаем чистую learning-session.
  session = {
    userText,
    originalUserText: userText,
    searchQuery: null,
    searchDomain: null,
    searchedEntities: [],
    controlledEntities: [],
  };
}

export function rememberLearningSearch(
  query,
  domain,
  entities = []
) {
  session.searchQuery = query || null;
  session.searchDomain = domain || null;

  session.searchedEntities = entities
    .map((entity) => ({
      entity_id: entity.entity_id,
      friendly_name: entity.friendly_name || "",
    }))
    .filter((entity) => entity.entity_id);
}

export function rememberLearningControl(entityId) {
  if (
    entityId &&
    !session.controlledEntities.includes(entityId)
  ) {
    session.controlledEntities.push(entityId);
  }
}

export function getLearningSession() {
  return {
    ...session,
    searchedEntities: [...session.searchedEntities],
    controlledEntities: [...session.controlledEntities],
  };
}
