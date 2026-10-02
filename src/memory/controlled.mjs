let lastControlled = {
  domain: null,
  entities: [],
};

export function rememberControlled(domain, entityId) {
  if (
    lastControlled.domain !== domain ||
    !lastControlled.entities.includes(entityId)
  ) {
    lastControlled = {
      domain,
      entities: [entityId],
    };
  }
}

export function rememberControlledMany(domain, entityIds) {
  lastControlled = {
    domain,
    entities: [...new Set(entityIds)],
  };
}

export function getLastControlled() {
  return {
    domain: lastControlled.domain,
    entities: [...lastControlled.entities],
  };
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

export function clearControlledMemory() {
  lastControlled = {
    domain: null,
    entities: [],
  };
}
