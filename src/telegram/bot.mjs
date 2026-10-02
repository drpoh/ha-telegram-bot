import { Telegraf } from "telegraf";

import { config } from "../config/env.mjs";
import { queueHomeAssistantRequest } from "../utils/queue.mjs";

import {
  clearConversationHistory,
} from "../memory/conversation.mjs";

import {
  clearDeviceMemory,
} from "../memory/devices.mjs";

import {
  clearControlledMemory,
} from "../memory/controlled.mjs";

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

    await ctx.reply(
      "🟢 Home Assistant AI Bot работает\n" +
      "MCP: подключён\n" +
      "HTTP API: активен\n" +
      "Telegram: активен"
    );
  });

  bot.command("model", async (ctx) => {
    if (!isAllowed(ctx)) return;

    await ctx.reply(
      "🤖 AI configuration\n\n" +
      "Primary: Gemini\n" +
      "Model: gemini-3.5-flash-lite\n" +
      "Fallback: OpenRouter\n" +
      "OpenRouter model: nvidia/nemotron-3.5-lightning:free"
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
