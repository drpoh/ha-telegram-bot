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

export function analyzeSaunaHeating(
  samples = [],
  {
    targetTemperature = 85,
    minimumRise = 5,
    lookbackMinutes = 30,
  } = {}
) {
  const points = numericPoints(samples);
  if (points.length < 2) return null;

  const targetIndex = points.findIndex((point) => point.temperature >= targetTemperature);
  if (targetIndex < 1) return null;

  const target = points[targetIndex];
  const lookbackMs = lookbackMinutes * 60_000;
  const candidates = points
    .slice(0, targetIndex)
    .filter((point) =>
      target.timeMs - point.timeMs <= lookbackMs &&
      target.temperature - point.temperature >= minimumRise
    );

  if (candidates.length === 0) return null;

  const start = candidates.reduce((lowest, point) =>
    point.temperature < lowest.temperature ? point : lowest
  );

  const durationMinutes = (target.timeMs - start.timeMs) / 60_000;
  if (!(durationMinutes > 0)) return null;

  const rise = target.temperature - start.temperature;
  const rateCPerMinute = rise / durationMinutes;

  return {
    targetTemperature,
    startTemperature: start.temperature,
    startTime: start.timestamp,
    reachedTemperature: target.temperature,
    reachedTime: target.timestamp,
    durationMinutes,
    rise,
    rateCPerMinute,
  };
}

export function estimateMinutesToTarget(
  samples = [],
  {
    targetTemperature = 85,
    windowMinutes = 15,
    minimumRate = 0.05,
  } = {}
) {
  const points = numericPoints(samples);
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
