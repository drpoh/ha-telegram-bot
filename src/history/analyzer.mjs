export function summarizeNumericSeries(samples = []) {
  const values = samples
    .map((sample) => Number(sample?.value ?? sample?.state ?? sample))
    .filter(Number.isFinite);

  if (values.length === 0) {
    return { count: 0, min: null, max: null, average: null };
  }

  const sum = values.reduce((total, value) => total + value, 0);

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: sum / values.length,
  };
}
