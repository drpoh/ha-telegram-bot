const MAX_HISTORY_MESSAGES = 6;

const conversationHistory = [];

export function addToHistory(role, text) {
  conversationHistory.push({
    role,
    parts: [{ text }],
  });

  while (conversationHistory.length > MAX_HISTORY_MESSAGES) {
    conversationHistory.shift();
  }
}

export function getConversationHistory() {
  return [...conversationHistory];
}

export function clearConversationHistory() {
  conversationHistory.length = 0;
}
export function clearControlledMemory() {
  lastControlled = {
    domain: null,
    entities: [],
  };
}
