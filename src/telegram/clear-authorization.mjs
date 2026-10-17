// An isolated, one-use confirmation window for destructive memory clearing.
export function createClearAuthorization({ now = Date.now, windowMs = 60000 } = {}) {
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error("Invalid confirmation window");
  const requests = new Map();
  const validId = id => Number.isSafeInteger(id) && id > 0;
  return {
    request(id) { if (!validId(id)) return false; requests.set(id, now() + windowMs); return true; },
    cancel(id) { if (!validId(id)) return false; return requests.delete(id); },
    consume(id) {
      if (!validId(id)) return false;
      const expiry = requests.get(id);
      requests.delete(id);
      return Number.isFinite(expiry) && now() <= expiry;
    },
  };
}
