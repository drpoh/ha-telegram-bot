import { Telegraf } from "telegraf";

import { config } from "../config/env.mjs";
import { queueHomeAssistantRequest } from "../utils/queue.mjs";
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

import { getHealthStatus } from "../status/health.mjs";

let bot = null;

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
      "/clear — очистить память"
    );
  });

bot.command("status", async (ctx) => {
  if (!isAllowed(ctx)) return;

  const status = getHealthStatus();

  await ctx.reply(
    "🏠 Home Assistant AI Bot v2\n\n" +
    `HA-MCP: ${status.mcp ? "🟢 connected" : "🔴 disconnected"}\n` +
    `Queue: ${status.queue.active} active / ${status.queue.pending} pending\n` +
    `Requests: ${status.queue.total}\n` +
    `Uptime: ${status.uptime}\n` +
    `Node: ${status.node}\n` +
    `PID: ${status.pid}`
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

    clearConversationHistory();
    clearDeviceMemory();
    clearControlledMemory();

    console.log("Memory → cleared");

    await ctx.reply(
      "🧹 Память разговора и устройств очищена."
    );
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

      const answer =
        await queueHomeAssistantRequest(text);

      await ctx.reply(answer);
    } catch (error) {
      console.error("Telegram error:", error);

      await ctx.reply(
        "❌ Ошибка при обращении к Home Assistant."
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
