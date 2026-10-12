export class MemoryStore {
  async remember(_memory) {
    throw new Error("MemoryStore.remember() not implemented");
  }

  async search(_query, _options = {}) {
    throw new Error("MemoryStore.search() not implemented");
  }

  async recordOutcome(_outcome) {
    throw new Error("MemoryStore.recordOutcome() not implemented");
  }
}
