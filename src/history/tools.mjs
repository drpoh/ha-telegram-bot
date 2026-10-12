import { fetchEntityHistory } from "./ha-history.mjs";
import { findSaunaHeatingCycles, summarizeSaunaHeating } from "./sauna-analyzer.mjs";
import { buildHomeContext, renderHomeContext } from "../context/builder.mjs";

const SAUNA_TEMPERATURE_ENTITY = "sensor.sauna_te_sauna_temperature";

export function isAiHistoryTool(name) {
  return name === "ai_history_summary";
}

function saunaFacts(summary) {
  const facts = [];
  if (summary.lastFullCycle) {
    facts.push(`Последний полностью измеренный прогрев сауны до ${summary.lastFullCycle.targetTemperature} °C занял ${summary.lastFullCycle.durationMinutes.toFixed(1)} мин: с ${summary.lastFullCycle.startTemperature.toFixed(1)} °C до ${summary.lastFullCycle.reachedTemperature.toFixed(1)} °C.`);
  }
  if (summary.enoughData) {
    facts.push(`Среднее время полного прогрева сауны: ${summary.averageDurationMinutes.toFixed(1)} мин по ${summary.fullCycles} полным циклам.`);
  } else {
    facts.push(`Полных измеренных циклов: ${summary.fullCycles}. Данных пока недостаточно для надежного среднего времени прогрева.`);
  }
  if (summary.reheatCycles) facts.push(`Отдельно обнаружено догревов уже теплой сауны: ${summary.reheatCycles}.`);
  return facts;
}

export async function callAiHistoryTool(name, args = {}, dependencies = {}) {
  if (!isAiHistoryTool(name)) throw new Error(`Unknown AI history tool: ${name}`);
  if (args.subject !== "sauna") throw new Error(`Unsupported history subject: ${args.subject}`);

  const fetchHistory = dependencies.fetchEntityHistory ?? fetchEntityHistory;
  const history = await fetchHistory(SAUNA_TEMPERATURE_ENTITY, {
    startTime: args.start_time || "7d",
    limit: 1000,
    allPages: true,
    maxRecords: 10000,
    order: "asc",
  });
  const cycles = findSaunaHeatingCycles(history.states);
  const summary = summarizeSaunaHeating(cycles);
  const facts = saunaFacts(summary);
  const context = buildHomeContext({ historyFacts: facts });

  return {
    success: true,
    subject: "sauna",
    period: history.period,
    summary,
    context: renderHomeContext(context),
  };
}
