import { getLearningSession } from "./session.mjs";
import { rememberLearnedDevice } from "../memory/learned-devices.mjs";

export function finalizeLearning() {
  const session = getLearningSession();

  if (!session.userText) {
    return false;
  }

  // Без поиска не обучаемся:
  // это мог быть devices.json, previous context и т.п.
  if (
    !session.searchQuery ||
    !session.searchDomain ||
    session.searchedEntities.length === 0
  ) {
    return false;
  }

  // Автоматически учим только однозначное управление.
  if (session.controlledEntities.length !== 1) {
    return false;
  }

  const entityId = session.controlledEntities[0];

  // Управляемый entity обязан присутствовать
  // в результатах текущего поиска.
  const entity = session.searchedEntities.find(
    (item) => item.entity_id === entityId
  );

  if (!entity) {
    return false;
  }

  // Alias берём из поискового запроса MCP.
  // Например: "гостиная", "коридор", "сауна".
  const alias = session.searchQuery
    .toLowerCase()
    .trim();

  if (alias.length < 2) {
    return false;
  }

  rememberLearnedDevice(
    alias,
    entityId,
    session.searchDomain,
    entity.friendly_name || null
  );

  console.log(
    `Learned → "${alias}" = ${entityId}`
  );

  return true;
}
