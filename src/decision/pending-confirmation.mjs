import crypto from "node:crypto";

const DEFAULT_TTL_MS = 60_000;
const pending = new Map();

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
  return cloneAction(entry);
}

export function peekPendingConfirmation({ userId, chatId, now = Date.now() } = {}) {
  const key = keyFor(userId, chatId);
  const entry = pending.get(key);
  if (!entry) return null;
  if (isExpired(entry, now)) {
    pending.delete(key);
    return null;
  }
  return cloneAction(entry);
}

export function consumePendingConfirmation({ userId, chatId, token, now = Date.now() } = {}) {
  const key = keyFor(userId, chatId);
  const entry = pending.get(key);
  if (!entry) return null;

  if (isExpired(entry, now)) {
    pending.delete(key);
    return null;
  }

  if (!token || token !== entry.token) return null;

  pending.delete(key);
  return cloneAction(entry);
}

export function cancelPendingConfirmation({ userId, chatId } = {}) {
  return pending.delete(keyFor(userId, chatId));
}

export function clearPendingConfirmations() {
  pending.clear();
}

export { DEFAULT_TTL_MS };
