export const FRESHNESS = Object.freeze({
  LIVE: "live",
  RECENT: "recent",
  STALE: "stale",
  UNKNOWN: "unknown",
});

export const DEFAULT_LIVE_MS = 5000;
export const DEFAULT_RECENT_MS = 60000;

export function classifyFreshness({
  observedAt,
  now = Date.now(),
  liveMs = DEFAULT_LIVE_MS,
  recentMs = DEFAULT_RECENT_MS,
} = {}) {
  const observed = typeof observedAt === "number"
    ? observedAt
    : Date.parse(observedAt || "");

  if (!Number.isFinite(observed) || observed > now) {
    return { freshness: FRESHNESS.UNKNOWN, age_ms: null };
  }

  const ageMs = now - observed;
  if (ageMs <= liveMs) return { freshness: FRESHNESS.LIVE, age_ms: ageMs };
  if (ageMs <= recentMs) return { freshness: FRESHNESS.RECENT, age_ms: ageMs };
  return { freshness: FRESHNESS.STALE, age_ms: ageMs };
}
