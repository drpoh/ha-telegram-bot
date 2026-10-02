import { Telegraf } from "telegraf";

import { config } from "../config/env.mjs";
import { queueHomeAssistantRequest } from "../utils/queue.mjs";

let bot = null;

export function startTelegram() {
  bot = new Telegraf(config.telegram.botToken);

  bot.start(async (ctx) => {
    if (ctx.from.id !== config.telegram.allowedUserId) {
      return;
    }

    await ctx.reply("🏠 Home Assistant AI готов.");
  });

  bot.on("text", async (ctx) => {
    if (ctx.from.id !== config.telegram.allowedUserId) {
      console.log(`Blocked Telegram user: ${ctx.from.id}`);
      return;
    }

    const text = ctx.message.text.trim();

    if (!text) {
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
  if (!bot) {
    return;
  }

  bot.stop(signal);
  bot = null;
}
