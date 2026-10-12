function compactList(items, limit) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, Math.max(0, limit));
}

export function buildHomeContext({
  conversation = [],
  currentState = [],
  memories = [],
  historyFacts = [],
  limits = {},
} = {}) {
  const resolved = {
    conversation: limits.conversation ?? 12,
    currentState: limits.currentState ?? 30,
    memories: limits.memories ?? 20,
    historyFacts: limits.historyFacts ?? 20,
  };

  return {
    conversation: compactList(conversation, resolved.conversation),
    currentState: compactList(currentState, resolved.currentState),
    memories: compactList(memories, resolved.memories),
    historyFacts: compactList(historyFacts, resolved.historyFacts),
    builtAt: new Date().toISOString(),
  };
}

export function contextStats(context = {}) {
  return {
    conversation: context.conversation?.length ?? 0,
    currentState: context.currentState?.length ?? 0,
    memories: context.memories?.length ?? 0,
    historyFacts: context.historyFacts?.length ?? 0,
  };
}

function renderSection(title, items = []) {
  if (!items.length) return `${title}\nнет данных`;
  return `${title}\n${items.map((item) =>
    typeof item === "string" ? `- ${item}` : `- ${JSON.stringify(item)}`
  ).join("\n")}`;
}

export function renderHomeContext(context = {}) {
  return [
    renderSection("ТЕКУЩЕЕ СОСТОЯНИЕ ДОМА", context.currentState),
    renderSection("ПАМЯТЬ О ДОМЕ", context.memories),
    renderSection("ФАКТЫ ИЗ ИСТОРИИ HOME ASSISTANT", context.historyFacts),
  ].join("\n\n");
}
