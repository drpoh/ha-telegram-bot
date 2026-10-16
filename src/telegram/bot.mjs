import { Telegraf } from "telegraf";
import { getMcpClient } from "../mcp/client.mjs";
import { probeMcp } from "../status/mcp-probe.mjs";
import { createClearAuthorization } from "./clear-authorization.mjs";

import { config } from "../config/env.mjs";
import {
  cancelQueuedConfirmation,
  queueConfirmedAction,
  queueHomeAssistantRequest,
} from "../utils/queue.mjs";
import { getAIStatus } from "../ai/router.mjs";
import {
  clearConversationHistory,
} from "../memory/conversation.mjs";

import {
  clearDeviceMemory,
} from "../memory/devices.mjs";

import {
  clearControlledMemory,
} from "../memory/controlled.mjs";
import { clearPendingConfirmations } from "../decision/pending-confirmation.mjs";
import { getDecisionAudit, getDecisionAuditSummary } from "../decision/audit.mjs";

import { getHealthStatus, getLocalDiagnostics } from "../status/health.mjs";
import {
  clearBehaviorCorrectionsForEntity,
  getBehaviorAuditSnapshot,
} from "../learning/corrections.mjs";

let bot = null;
const clearAuthorization = createClearAuthorization();

function isAllowed(ctx) {
  return ctx.from?.id === config.telegram.allowedUserId;
}

export function startTelegram() {
  bot = new Telegraf(config.telegram.botToken);

  bot.start(async (ctx) => {
    if (!isAllowed(ctx)) return;

    await ctx.reply(
      "🏠 Home Assistant AI готов.\n\n" +
      "/status — состояние бота\n" +
      "/model — AI-конфигурация\n" +
      "/help — список команд"
    );
  });

bot.command("status", async (ctx) => {
  if (!isAllowed(ctx)) return;

  const status = getHealthStatus();
  const ai = getAIStatus();
  const aiDescription = ai.model
    ? `${ai.provider} / ${ai.model}`
    : "ещё не использовался";
  const lastAi = ai.timestamp
    ? new Date(ai.timestamp).toLocaleString("ru-RU", { timeZone: "Europe/Helsinki" })
    : "нет данных";

  await ctx.reply(
    "🏠 RS Home AI — состояние\n\n" +
    `Версия RS Home AI: ${process.env.RS_HOME_AI_VERSION || "V2.1.0-rc3 DEV"}\n` +
    `Версия Node: ${status.node}\n` +
    `Резервный AI: ${config.openrouter.apiKey ? "настроен (доступность не проверялась)" : "не настроен"}\n` +
    `HA-MCP: ${status.mcp ? "🟢 подключён" : "🔴 отключён"}\n` +
    `AI: ${aiDescription}\n` +
    `Последний успешный AI-вызов: ${lastAi}\n` +
    `Очередь: ${status.queue.active} активных / ${status.queue.pending} ожидают\n` +
    `Запросов с запуска: ${status.queue.total}\n` +
    `Сцен: ${getLocalDiagnostics().scenes ?? "н/д"}\n` +
    `SQLite: ${getLocalDiagnostics().database}\n` +
    `Память процесса: ${status.memoryMb} МБ\n` +
    `Время работы: ${status.uptime}\n` +
    `PID: ${status.pid}`
  );
});

  bot.command("help", async (ctx) => {
    if (!isAllowed(ctx)) return;
    await ctx.reply(
      "🏠 RS Home AI — помощь\n\n" +
      "/status — состояние бота\n" +
      "/diagnostics — техническая диагностика\n" +
      "/model — AI-модели\n" +
      "/decisions — аудит решений\n" +
      "/behavior — коррекции поведения\n" +
      "/behavior_reset light.entity_id — сброс коррекции\n" +
      "/clear — запросить очистку памяти\n" +
      "/clear_confirm — подтвердить очистку (60 секунд)\n" +
      "/clear_cancel — отменить очистку\n" +
      "/help — справка\n\n" +
      "Примеры:\n" +
      "• Сколько градусов в сауне?\n" +
      "• Какие сцены есть в гостиной?\n" +
      "• Запомни освещение в гостиной как Вечер\n" +
      "• Запусти сцену Вечер в гостиной\n" +
      "• Удали сцену Вечер в гостиной\n\n" +
      "Команды управления могут изменить состояние устройств."
    );
  });

  bot.command("diagnostics", async (ctx) => {
    if (!isAllowed(ctx)) return;
    const status = getHealthStatus();
    const local = getLocalDiagnostics();
    const last = status.queue.lastRequest;
    let mcpClient = null;
    try { mcpClient = getMcpClient(); } catch { /* disconnected */ }
    const probe = await probeMcp({ client: mcpClient });
    await ctx.reply(
      "🔧 RS Home AI — диагностика DEV\n\n" +
      `HA-MCP (клиент): ${status.mcp ? "подключён" : "отключён"}\n` +
      `HA-MCP (ответ HA): ${probe.status}${probe.latencyMs != null ? `, ${probe.latencyMs} мс` : ""}\n` +
      `SQLite: ${local.database}\n` +
      `Сцен: ${local.scenes ?? "недоступно"}\n` +
      `Свободно на разделе БД: ${local.diskFreeGb ?? "н/д"} ГБ\n` +
      `Последний запрос: ${last ? (last.status === "ok" ? "успешно" : "ошибка") : "нет данных"}\n` +
      `Длительность запроса: ${last ? last.durationMs + " мс" : "н/д"}\n` +
      `Процесс: PID ${status.pid}, Node ${status.node}\n` +
      `Память RSS: ${status.memoryMb} МБ\n` +
      `Время работы: ${status.uptime}`
    );
  });

  bot.command("decisions", async (ctx) => {
    if (!isAllowed(ctx)) return;

    const summary = getDecisionAuditSummary();
    const items = getDecisionAudit(10);

    const header =
      "🧭 Decision audit\n\n" +
      `Buffer: ${summary.total} | authorized: ${summary.authorized}\n` +
      `24h: ${summary.recent.total} | authorized: ${summary.recent.authorized}\n` +
      `24h outcomes: approve ${summary.recent.approve} | suggest ${summary.recent.suggest} | confirm ${summary.recent.confirm} | deny ${summary.recent.deny}`;

    if (!items.length) {
      await ctx.reply(header + "\n\nРешений пока нет.");
      return;
    }

    const lines = items.map((item) => {
      const mark = item.authorized ? "✅" : "⏸️";
      const entity = Array.isArray(item.entity_id)
        ? item.entity_id.join(",")
        : item.entity_id || "-";
      const verification = item.verification ? ` | verify:${item.verification}` : "";
      return `${mark} ${item.outcome} | ${item.action} | ${entity} | ${item.source} | exec:${item.execution || "-"}${verification}`;
    });

    await ctx.reply(header + "\n\nПоследние решения:\n" + lines.join("\n"));
  });

  bot.command("behavior", async (ctx) => {
    if (!isAllowed(ctx)) return;

    const items = getBehaviorAuditSnapshot();
    if (!items.length) {
      await ctx.reply("🧠 Behavioral learning: коррекций пока нет.");
      return;
    }

    const lines = items.slice(0, 20).map((item) =>
      `${item.autonomy_reduced ? "⚠️" : "ℹ️"} ${item.entity_id}: ${item.corrections} correction(s), autonomy ${item.autonomy_reduced ? "SUGGEST" : "AUTO_SAFE eligible"}`
    );
    await ctx.reply("🧠 Behavioral learning\n\n" + lines.join("\n"));
  });

  bot.command("behavior_reset", async (ctx) => {
    if (!isAllowed(ctx)) return;

    const entityId = String(ctx.message?.text || "")
      .split(/\s+/)
      .slice(1)
      .join(" ")
      .trim();
    if (!entityId) {
      await ctx.reply("Использование: /behavior_reset light.entity_id");
      return;
    }

    const removed = clearBehaviorCorrectionsForEntity(entityId);
    await ctx.reply(
      removed
        ? `✅ ${entityId}: удалено behavioral corrections: ${removed}.`
        : `ℹ️ ${entityId}: behavioral corrections не найдены.`
    );
  });

  bot.command("model", async (ctx) => {
    if (!isAllowed(ctx)) return;

    const ai = getAIStatus();

    let lastUsed = "never";

    if (ai.timestamp) {
      const seconds = Math.floor(
        (Date.now() - ai.timestamp) / 1000
      );

      if (seconds < 60) {
        lastUsed = `${seconds}s ago`;
      } else {
        lastUsed = `${Math.floor(seconds / 60)}m ago`;
      }
    }

    await ctx.reply(
      "🤖 AI status\n\n" +
      `Primary: ${ai.primary}\n` +
      `Fallback: ${ai.fallback.join(", ") || "none"}\n\n` +
      `Last provider: ${ai.provider || "none"}\n` +
      `Last model: ${ai.model || "none"}\n` +
      `Last used: ${lastUsed}`
    );
  });

  bot.command("clear", async (ctx) => {
    if (!isAllowed(ctx)) return;
    clearAuthorization.request(ctx.from.id);
    await ctx.reply("⚠️ Очистить память разговора и устройств? Для подтверждения отправьте /clear_confirm в течение 60 секунд. Для отмены — /clear_cancel. Сцены не удаляются.");
  });

  bot.command("clear_cancel", async (ctx) => {
    if (!isAllowed(ctx)) return;
    clearAuthorization.cancel(ctx.from.id);
    await ctx.reply("Очистка памяти отменена.");
  });

  bot.command("clear_confirm", async (ctx) => {
    if (!isAllowed(ctx)) return;
    if (!clearAuthorization.consume(ctx.from.id)) {
      await ctx.reply("Подтверждение истекло или отсутствует. Сначала отправьте /clear.");
      return;
    }
    clearConversationHistory();
    clearDeviceMemory();
    clearControlledMemory();
    clearPendingConfirmations();
    console.log("Memory → cleared by explicit confirmation");
    await ctx.reply("🧹 Память разговора и устройств очищена. AI-сцены сохранены.");
  });

  bot.on("text", async (ctx) => {
    if (!isAllowed(ctx)) {
      console.log(
        `Blocked Telegram user: ${ctx.from?.id}`
      );
      return;
    }

    const text = ctx.message.text.trim();

    // Не передаём неизвестные /команды AI.
    if (!text || text.startsWith("/")) {
      return;
    }

    console.log(`Telegram → ${text}`);

    try {
      await ctx.sendChatAction("typing");

      const actor = {
        userId: ctx.from.id,
        chatId: ctx.chat.id,
      };
      const normalized = text.toLowerCase().trim();

      if (/^(да|подтверждаю|подтвердить)$/.test(normalized)) {
        const confirmation = await queueConfirmedAction(actor);
        await ctx.reply(
          confirmation.status === "executed"
            ? "✅ Подтверждённое действие выполнено и проверено."
            : confirmation.status === "accepted"
              ? "✅ Команда принята Home Assistant; отдельная проверка состояния для этого действия пока не поддерживается."
              : confirmation.status === "pending"
                ? "⏳ Команда принята, но Home Assistant ещё не подтвердил новое состояние."
                : confirmation.status === "failed" || confirmation.status === "error"
                  ? "❌ Подтверждённое действие не удалось выполнить."
                  : "ℹ️ Нет активного подтверждения или оно уже истекло."
        );
        return;
      }

      if (/^(нет|отмена|отменить)$/.test(normalized)) {
        const cancelled = cancelQueuedConfirmation(actor);
        await ctx.reply(
          cancelled
            ? "❎ Действие отменено."
            : "ℹ️ Нет активного действия для отмены."
        );
        return;
      }

      const answer = await queueHomeAssistantRequest(text, {
        actor,
      });

      await ctx.reply(answer);
    } catch (error) {
      console.error("Telegram error:", error);

      await ctx.reply(
        /OPENROUTER_API_KEY отсутствует|high demand|503|UNAVAILABLE|No AI provider available|All Gemini models are unavailable/i.test(String(error?.message || ""))
          ? "⏳ AI-сервис сейчас недоступен. Ничего не выполнено. Повторите запрос позже."
          : "❌ Не удалось обработать запрос. Проверьте журнал DEV-бота."
      );
    }
  });

  bot.launch();

  console.log("Telegram bot started");
}

export function stopTelegram(signal = "shutdown") {
  if (!bot) return;

  bot.stop(signal);
  bot = null;
}
