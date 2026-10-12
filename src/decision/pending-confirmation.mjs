import crypto from "node:crypto";
import {
  deleteMemory,
  getMemory,
  setMemory,
} from "../db/database.mjs";

const DEFAULT_TTL_MS = 60_000;
const MEMORY_KEY = "pendingConfirmations";
const pending = new Map();
let persistenceDbPath;

function keyFor(userId, chatId) {
  if (userId === undefined || userId === null) throw new Error("userId is required");
  if (chatId === undefined || chatId === null) throw new Error("chatId is required");
  return `${userId}:${chatId}`;
}

function cloneAction(action) {
  return structuredClone(action);
}

function isExpired(entry, now = Date.now()) {
  return now >= entry.expiresAt;
}

function persist() {
  if (pending.size === 0) {
    deleteMemory(MEMORY_KEY, persistenceDbPath);
    return;
  }
  setMemory(MEMORY_KEY, [...pending.values()], persistenceDbPath);
}

function removeEntry(key) {
  const removed = pending.delete(key);
  if (removed) persist();
  return removed;
}

export function loadPendingConfirmations({
  now = Date.now(),
  dbPath,
} = {}) {
  persistenceDbPath = dbPath;
  pending.clear();

  const saved = getMemory(MEMORY_KEY, persistenceDbPath);
  if (!Array.isArray(saved)) return 0;

  for (const entry of saved) {
    if (
      entry?.token &&
      entry?.action?.name &&
      entry?.action?.args &&
      entry?.userId != null &&
      entry?.chatId != null &&
      Number.isFinite(entry?.expiresAt) &&
      !isExpired(entry, now)
    ) {
      pending.set(keyFor(entry.userId, entry.chatId), Object.freeze(cloneAction(entry)));
    }
  }

  persist();
  if (pending.size) console.log(`Pending confirmations loaded → ${pending.size}`);
  return pending.size;
}

export function createPendingConfirmation({
  userId,
  chatId,
  action,
  ttlMs = DEFAULT_TTL_MS,
  now = Date.now(),
} = {}) {
  if (!action?.name || !action?.args) throw new Error("Exact action name and args are required");
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new Error("ttlMs must be positive");

  const key = keyFor(userId, chatId);
  const entry = Object.freeze({
    token: crypto.randomUUID(),
    userId,
    chatId,
    action: cloneAction(action),
    createdAt: now,
    expiresAt: now + ttlMs,
  });

  pending.set(key, entry);
  persist();
  return cloneAction(entry);
}

export function peekPendingConfirmation({ userId, chatId, now = Date.now() } = {}) {
  const key = keyFor(userId, chatId);
  const entry = pending.get(key);
  if (!entry) return null;
  if (isExpired(entry, now)) {
    removeEntry(key);
    return null;
  }
  return cloneAction(entry);
}

export function consumePendingConfirmation({ userId, chatId, token, now = Date.now() } = {}) {
  const key = keyFor(userId, chatId);
  const entry = pending.get(key);
  if (!entry) return null;

  if (isExpired(entry, now)) {
    removeEntry(key);
    return null;
  }

  if (!token || token !== entry.token) return null;

  removeEntry(key);
  return cloneAction(entry);
}

export function cancelPendingConfirmation({ userId, chatId } = {}) {
  return removeEntry(keyFor(userId, chatId));
}

export function clearPendingConfirmations({ persist: shouldPersist = true } = {}) {
  pending.clear();
  if (shouldPersist) persist();
}

export function setPendingConfirmationPersistence(dbPath) {
  persistenceDbPath = dbPath;
}

export { DEFAULT_TTL_MS };
