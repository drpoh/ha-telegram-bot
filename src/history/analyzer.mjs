function toTimestamp(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function normalizeHistorySamples(samples = []) {
  return samples
    .map((sample) => {
      if (sample == null) return null;

      if (typeof sample !== "object") {
        return { state: String(sample), timestamp: null, attributes: {} };
      }

      return {
        state: sample.state ?? sample.value ?? null,
        timestamp:
          sample.timestamp ??
          sample.last_changed ??
          sample.last_updated ??
          sample.time ??
          null,
        attributes: sample.attributes ?? {},
      };
    })
    .filter(Boolean);
}

export function summarizeNumericSeries(samples = []) {
  const normalized = normalizeHistorySamples(samples);
  const values = normalized
    .map((sample) => Number(sample.state))
    .filter(Number.isFinite);

  if (values.length === 0) {
    return { count: 0, min: null, max: null, average: null, first: null, last: null };
  }

  const sum = values.reduce((total, value) => total + value, 0);

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: sum / values.length,
    first: values[0],
    last: values.at(-1),
  };
}

export function summarizeStateDurations(samples = [], { endTime = null } = {}) {
  const normalized = normalizeHistorySamples(samples)
    .map((sample) => ({ ...sample, timeMs: toTimestamp(sample.timestamp) }))
    .filter((sample) => sample.state != null && sample.timeMs != null)
    .sort((a, b) => a.timeMs - b.timeMs);

  const durationsMs = {};
  let transitions = 0;

  for (let index = 0; index < normalized.length; index++) {
    const current = normalized[index];
    const next = normalized[index + 1];

    let nextTime = next?.timeMs;
    if (nextTime == null && endTime) nextTime = toTimestamp(endTime);
    if (nextTime == null || nextTime < current.timeMs) continue;

    durationsMs[current.state] =
      (durationsMs[current.state] || 0) + (nextTime - current.timeMs);

    if (next && next.state !== current.state) transitions += 1;
  }

  return {
    samples: normalized.length,
    transitions,
    durationsSeconds: Object.fromEntries(
      Object.entries(durationsMs).map(([state, ms]) => [state, ms / 1000])
    ),
    firstState: normalized[0]?.state ?? null,
    lastState: normalized.at(-1)?.state ?? null,
  };
}

export function buildHistoryFact(entityId, samples = [], options = {}) {
  const numeric = summarizeNumericSeries(samples);
  const states = summarizeStateDurations(samples, options);

  return {
    entityId,
    sampleCount: normalizeHistorySamples(samples).length,
    numeric: numeric.count > 0 ? numeric : null,
    states,
    period: {
      start: options.startTime ?? null,
      end: options.endTime ?? null,
    },
  };
}
