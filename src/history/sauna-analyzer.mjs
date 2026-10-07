import { normalizeHistorySamples } from "./analyzer.mjs";

function numericPoints(samples = []) {
  return normalizeHistorySamples(samples)
    .map((sample) => ({
      temperature: Number(sample.state),
      timestamp: sample.timestamp,
      timeMs: Date.parse(sample.timestamp),
    }))
    .filter((point) => Number.isFinite(point.temperature) && Number.isFinite(point.timeMs))
    .sort((a, b) => a.timeMs - b.timeMs);
}

function splitContinuous(points, maxGapMinutes) {
  const maxGapMs = maxGapMinutes * 60_000;
  const segments = [];
  let current = [];

  for (const point of points) {
    const previous = current.at(-1);
    if (previous && point.timeMs - previous.timeMs > maxGapMs) {
      if (current.length) segments.push(current);
      current = [];
    }
    current.push(point);
  }

  if (current.length) segments.push(current);
  return segments;
}

export function findSaunaHeatingCycles(
  samples = [],
  {
    targetTemperature = 85,
    minimumRise = 5,
    lookbackMinutes = 90,
    maxGapMinutes = 5,
  } = {}
) {
  const segments = splitContinuous(numericPoints(samples), maxGapMinutes);
  const cycles = [];

  for (const points of segments) {
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const target = points[i];

      if (!(previous.temperature < targetTemperature && target.temperature >= targetTemperature)) {
        continue;
      }

      const lookbackMs = lookbackMinutes * 60_000;
      const candidates = points
        .slice(0, i)
        .filter((point) =>
          target.timeMs - point.timeMs <= lookbackMs &&
          target.temperature - point.temperature >= minimumRise
        );

      if (!candidates.length) continue;

      const start = candidates.reduce((lowest, point) =>
        point.temperature < lowest.temperature ? point : lowest
      );

      const durationMinutes = (target.timeMs - start.timeMs) / 60_000;
      if (!(durationMinutes > 0)) continue;

      const rise = target.temperature - start.temperature;
      cycles.push({
        targetTemperature,
        startTemperature: start.temperature,
        startTime: start.timestamp,
        reachedTemperature: target.temperature,
        reachedTime: target.timestamp,
        durationMinutes,
        rise,
        rateCPerMinute: rise / durationMinutes,
        complete: true,
      });
    }
  }

  return cycles;
}

export function analyzeSaunaHeating(samples = [], options = {}) {
  return findSaunaHeatingCycles(samples, options).at(-1) ?? null;
}

export function estimateMinutesToTarget(
  samples = [],
  {
    targetTemperature = 85,
    windowMinutes = 15,
    minimumRate = 0.05,
    maxGapMinutes = 5,
  } = {}
) {
  const segments = splitContinuous(numericPoints(samples), maxGapMinutes);
  const points = segments.at(-1) ?? [];
  if (points.length < 2) return null;

  const current = points.at(-1);
  if (current.temperature >= targetTemperature) {
    return { currentTemperature: current.temperature, targetTemperature, minutesRemaining: 0, rateCPerMinute: null };
  }

  const cutoff = current.timeMs - windowMinutes * 60_000;
  const recent = points.filter((point) => point.timeMs >= cutoff);
  if (recent.length < 2) return null;

  const first = recent[0];
  const elapsedMinutes = (current.timeMs - first.timeMs) / 60_000;
  if (!(elapsedMinutes > 0)) return null;

  const rate = (current.temperature - first.temperature) / elapsedMinutes;
  if (rate < minimumRate) return null;

  return {
    currentTemperature: current.temperature,
    targetTemperature,
    rateCPerMinute: rate,
    minutesRemaining: (targetTemperature - current.temperature) / rate,
  };
}
