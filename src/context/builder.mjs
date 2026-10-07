export function buildHomeContext({
  conversation = [],
  currentState = [],
  memories = [],
  historyFacts = [],
} = {}) {
  return {
    conversation,
    currentState,
    memories,
    historyFacts,
    builtAt: new Date().toISOString(),
  };
}
