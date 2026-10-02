import "dotenv/config";
import { Telegraf } from "telegraf";
import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import express from "express";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_ID = Number(process.env.TELEGRAM_ALLOWED_USER_ID);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MCP_URL = process.env.MCP_URL;

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

const conversationHistory = [];
const MAX_HISTORY_MESSAGES = 6;

function addToHistory(role, text) {
  conversationHistory.push({
    role,
    parts: [{ text }]
  });

  while (conversationHistory.length > MAX_HISTORY_MESSAGES) {
    conversationHistory.shift();
  }
}

// Кратковременная память найденных устройств Home Assistant
let deviceMemory = {
  query: null,
  domain: null,
  entities: []
};

// Устройства, которыми реально управляла последняя команда пользователя
let lastControlled = {
  domain: null,
  entities: []
};

function clearDeviceMemory() {
  deviceMemory = {
    query: null,
    domain: null,
    entities: []
  };
}

function getDeviceMemoryText() {
  if (!deviceMemory.entities.length) {
    return "Оперативная память устройств пуста.";
  }

  return `
Последние найденные устройства Home Assistant:
Поиск: ${deviceMemory.query || "неизвестно"}
Домен: ${deviceMemory.domain || "неизвестно"}
Entity:
${deviceMemory.entities
  .map(
    (entity) =>
      `- ${entity.entity_id} | ${entity.friendly_name || ""} | state=${entity.state || "unknown"}`
  )
  .join("\n")}

Используй эти entity без нового ha_search, если текущая команда явно относится к тем же устройствам.
Если пользователь говорит о другом устройстве или другой комнате, выполни новый ha_search.
`;
}

if (!BOT_TOKEN || !ALLOWED_USER_ID || !GEMINI_API_KEY || !MCP_URL) {
  throw new Error("Не заполнены переменные в .env");
}

const bot = new Telegraf(BOT_TOKEN);

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const mcp = new Client({
  name: "ha-telegram-bot",
  version: "1.0.0",
});

await mcp.connect(
  new StreamableHTTPClientTransport(new URL(MCP_URL))
);

console.log("HA-MCP connected");

// ----------------------------------------------------
// Доступные AI инструменты
// Пока ТОЛЬКО ЧТЕНИЕ

// ----------------------------------------------------

const tools = [
  {
    functionDeclarations: [
      {
        name: "ha_search",
        description:
          "Поиск сущностей Home Assistant. Для управления всегда используй domain_filter, если тип устройства известен. Для света используй light, выключателей switch, датчиков sensor, климата climate. Используй короткое название комнаты или устройства в query.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description:
                "Короткий поисковый запрос. Например: коридор, кухня, сауна."
            },
            domain_filter: {
              type: "STRING",
              description:
                "Домен Home Assistant. Например: light, switch, sensor, climate, cover, fan."
            },
            area_filter: {
              type: "STRING",
              description:
                "Комната/area Home Assistant, если она точно известна."
            },
            state_filter: {
              type: "STRING",
              description:
                "Необязательный фильтр состояния. Например: on, off, unavailable."
            },
            limit: {
              type: "INTEGER",
              description:
                "Максимальное количество результатов."
            },
            offset: {
              type: "INTEGER",
              description:
                "Смещение для получения следующей страницы результатов."
            },
            include_hidden: {
              type: "BOOLEAN",
              description:
                "Включать скрытые сущности. Обычно используй false."
            },
            result_fields: {
              type: "ARRAY",
              items: {
                type: "STRING"
              },
              description:
                "Поля результата. Обычно: entity_id, friendly_name, state."
            }
          },
          required: ["query"]
        }
      },

      {
        name: "ha_get_state",
        description:
          "Получить текущее состояние конкретной сущности Home Assistant. Используй, когда известен точный entity_id и состояние ещё неизвестно.",
        parameters: {
          type: "OBJECT",
          properties: {
            entity_id: {
              type: "STRING",
              description:
                "Точный entity_id. Например light.koridor_spot."
            }
          },
          required: ["entity_id"]
        }
      },

      {
        name: "ha_get_overview",
        description:
          "Получить общий обзор Home Assistant. Не используй для обычного поиска света или устройства, если достаточно ha_search.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      },

      {
        name: "ha_call_service",
        description:
          "Вызвать сервис Home Assistant для управления сущностью. Используй только точный entity_id, полученный из Home Assistant. Для нескольких устройств можешь вызвать эту функцию несколько раз.",
        parameters: {
          type: "OBJECT",
          properties: {
            domain: {
              type: "STRING",
              description:
                "Домен Home Assistant. Например light, switch, fan, cover, script, scene."
            },
            service: {
              type: "STRING",
              description:
                "Сервис Home Assistant. Например turn_on, turn_off или toggle."
            },
            entity_id: {
              type: "STRING",
              description:
                "Точный entity_id объекта Home Assistant."
            }
          },
          required: ["domain", "service", "entity_id"]
        }
      }
    ]
  }
];

async function callHA(name, args) {
  console.log(`MCP → ${name}`, args);

  const result = await mcp.callTool({
    name,
    arguments: args,
  });

  // Запоминаем последний успешный поиск устройств
  if (name === "ha_search") {
    const data = result?.structuredContent;

    if (
      data?.success &&
      Array.isArray(data.entities)
    ) {
      // Не сохраняем недоступные устройства
      const availableEntities =
        data.entities.filter(
          (entity) =>
            entity.entity_id &&
            entity.state !== "unavailable" &&
            entity.state !== "unknown"
        );

      if (availableEntities.length > 0) {
        deviceMemory = {
          query:
            data.query ||
            args.query ||
            null,

          domain:
            data.domain_filter ||
            args.domain_filter ||
            null,

          entities: availableEntities.map(
            (entity) => ({
              entity_id: entity.entity_id,
              friendly_name:
                entity.friendly_name || "",
              state:
                entity.state || null,
            })
          ),
        };

        // Временно показываем все сущности,
        // попавшие в оперативную память
        console.log(
          "Memory entities →",
          deviceMemory.entities.map(
            (e) =>
              `${e.entity_id} (${e.friendly_name}) [${e.state}]`
          )
        );

        console.log(
          `Memory → ${deviceMemory.query} / ${deviceMemory.domain} / ${deviceMemory.entities.length} entities`
        );
      }
    }
  }

  return result;
}

async function generateWithFallback(contents) {
  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`Gemini → ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          tools,
        },
      });

      return {
        response,
        model,
      };

    } catch (error) {
      lastError = error;

      const status = error?.status;

      console.error(
        `Gemini ${model} error:`,
        status || error.message
      );

      // 429 = закончилась/ограничена квота
      // 503 = модель временно перегружена
      if (status === 429 || status === 503) {
        console.log(`Fallback → следующая модель`);
        continue;
      }

      // Другие ошибки обычно означают проблему
      // с нашим запросом, поэтому модель менять бессмысленно.
      throw error;
    }
  }

  throw lastError || new Error(
    "Все Gemini модели недоступны"
  );
}

let requestQueue = Promise.resolve();
let requestNumber = 0;

function queueHomeAssistantRequest(userText) {
  const id = ++requestNumber;

  console.log(`Queue #${id} → ${userText}`);

  const request = requestQueue.then(async () => {
    console.log(`Queue #${id} START`);

    try {
      return await askHomeAssistant(userText);
    } finally {
      console.log(`Queue #${id} DONE`);
    }
  });

  requestQueue = request.catch((error) => {
    console.error(`Queue #${id} ERROR:`, error);
  });

  return request;
}

async function askHomeAssistant(userText) {
  const deviceContext = getDeviceMemoryText();

  const contents = [
    ...conversationHistory,
    {
      role: "user",
      parts: [
        {
          text: `
Ты — локальный AI-ассистент умного дома Home Assistant.
Ты управляешь Home Assistant только через предоставленные инструменты MCP.

ТВОЯ ЗАДАЧА
Понять естественную команду пользователя, найти нужные сущности Home Assistant, если это необходимо, выполнить действие и кратко сообщить результат.

ОБЩИЕ ПРАВИЛА
- Отвечай пользователю только по-русски, кратко и естественно.
- Не объясняй внутреннюю работу MCP, entity_id и вызовы инструментов, если пользователь сам об этом не спрашивает.
- Никогда не придумывай entity_id, состояние устройства или результат действия.
- Используй только данные, полученные из Home Assistant или из текущего контекста разговора.
- Не выполняй действия, которых пользователь не просил.
- После успешного действия отвечай одним коротким предложением.

ОПЕРАТИВНАЯ ПАМЯТЬ HOME ASSISTANT
${deviceContext}

ПРАВИЛА ОПЕРАТИВНОЙ ПАМЯТИ
- Если текущая команда явно относится к устройствам из оперативной памяти, используй сохранённые entity_id напрямую.
- В этом случае НЕ выполняй повторный ha_search.
- Слова "его", "её", "их", "там", "обратно", "снова" могут относиться к устройствам из оперативной памяти.
- Если пользователь явно называет другую комнату или другое устройство, оперативная память к нему не относится — выполни новый ha_search.
- Не используй сохранённые entity_id для другой комнаты или другого типа устройства.

КОНТЕКСТ РАЗГОВОРА

КОНТЕКСТ РАЗГОВОРА
- Учитывай предыдущие сообщения пользователя и свои ответы.
- Понимай ссылки на предыдущую команду: "его", "её", "их", "там", "этот", "эти", "тот", "все", "обратно", "снова", "тоже".
- Если пользователь говорит "выключи его", "включи обратно", "сделай там", используй контекст предыдущего запроса.
- Предыдущие сообщения являются только контекстом. Никогда не выполняй старые команды повторно.
- Новая команда пользователя всегда имеет приоритет над предыдущими сообщениями.

ПОИСК СУЩНОСТЕЙ
- Если точный entity_id неизвестен, используй ha_search.
- Выполняй ha_search только когда это действительно необходимо.
- Если первый поиск дал подходящие результаты, не повторяй поиск другими формулировками.
- Используй короткий query с названием устройства или комнаты.
- Например: query="коридор", а не query="коридор свет".
- ВСЕГДА используй domain_filter, если тип устройства понятен.
- Свет: domain_filter="light".
- Выключатель/реле: domain_filter="switch".
- Датчик: domain_filter="sensor".
- Климат: domain_filter="climate".
- Вентилятор: domain_filter="fan".
- Шторы/ворота: domain_filter="cover".
- Для обычного поиска используй include_hidden=false.
- Запрашивай result_fields=["entity_id","friendly_name","state"].
- Игнорируй entity со state="unavailable" или state="unknown".
- Не выбирай sensor, binary_sensor, button, event, automation или helper вместо light, если пользователь просит управлять светом.
- Не выбирай похожую сущность только по названию, если её domain не соответствует требуемому устройству.

СОСТОЯНИЕ
- Если пользователь спрашивает состояние и точный entity_id уже известен, используй ha_get_state.
- Если entity_id неизвестен, сначала используй ha_search.
- Если актуальное состояние уже присутствует в результате ha_search, не вызывай ha_get_state повторно.
- Не проверяй состояние после успешного действия без необходимости.

УПРАВЛЕНИЕ
- Для включения используй service="turn_on".
- Для выключения используй service="turn_off".
- Для переключения используй service="toggle" только если пользователь явно просит переключить.
- В ha_call_service используй только точный entity_id, полученный из Home Assistant.
- Если пользователь говорит "весь свет", "все лампы", "везде в комнате" или аналогично, управляй всеми подходящими доступными light этой комнаты.
- Если пользователь называет конкретную лампу или устройство, управляй только им.
- Не включай дополнительные устройства только потому, что они находятся в той же комнате.

НЕСКОЛЬКО УСТРОЙСТВ
- Если все необходимые entity уже известны, не выполняй новый ha_search.
- Если одинаковое действие нужно выполнить над несколькими entity, вызови ha_call_service для ВСЕХ этих entity в одном ответе Gemini.
- Не делай отдельный шаг Gemini для каждого устройства.
- Сначала определи полный список подходящих entity, затем выполни все необходимые tool calls одновременно.
- После выполнения всех tool calls дай один итоговый ответ.

ЭКОНОМИЯ TOOL CALLS
- Используй минимально необходимое количество вызовов Gemini и MCP.
- Не вызывай инструмент, если необходимая информация уже есть в текущем контексте.
- Не повторяй одинаковый ha_search.
- Не вызывай ha_get_state после ha_search, если состояние уже получено.
- Не проверяй результат ha_call_service дополнительным запросом, если инструмент завершился успешно.
- Не разбивай несколько независимых одинаковых действий на отдельные шаги Gemini.

НЕОДНОЗНАЧНОСТЬ
- Если найден один очевидно подходящий объект, используй его.
- Если найдено несколько объектов и команда относится ко всем, управляй всеми.
- Если найдено несколько разных объектов и невозможно надёжно понять, какой нужен пользователю, задай короткий уточняющий вопрос.
- Не угадывай между существенно разными устройствами.
- Если подходящее устройство не найдено, кратко сообщи об этом.

ВАЖНО
Сначала пойми намерение пользователя.
Затем используй минимально необходимое количество инструментов.
Если нужны несколько независимых tool calls и все параметры уже известны — вызывай их вместе.
После выполнения команды дай только короткий итог пользователю.

Запрос пользователя:
${userText}
`,
        },
      ],
    },
  ];

  // Максимум 10 последовательных шагов Gemini/MCP
  for (let step = 0; step < 10; step++) {
    const { response, model } =
      await generateWithFallback(contents);

    console.log(`Gemini OK → ${model}`);

    const candidate = response.candidates?.[0];

    // Если Gemini не вернул нормальный candidate
    if (!candidate?.content) {
      return response.text || "Gemini не вернул ответ.";
    }

    // Добавляем ответ Gemini в контекст текущего запроса
    contents.push(candidate.content);

    const functionCalls =
      candidate.content.parts?.filter(
        (part) => part.functionCall
      ) || [];

    // Если инструмент больше не нужен — это финальный ответ
    if (functionCalls.length === 0) {
      const finalText =
        response.text || "Готово.";

      // Сохраняем только пользовательский запрос
      // и окончательный ответ Gemini.
      addToHistory("user", userText);
      addToHistory("model", finalText);

      return finalText;
    }

    // Выполняем все MCP-вызовы, которые запросил Gemini
    for (const part of functionCalls) {
      const call = part.functionCall;

      let result;

      try {
        result = await callHA(
          call.name,
          call.args || {}
        );
      } catch (error) {
        console.error(
          "MCP tool error:",
          error
        );

        result = {
          error: String(error),
        };
      }

      // Возвращаем результат MCP обратно Gemini
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: call.name,
              response: {
                result,
              },
            },
          },
        ],
      });
    }
  }

  return "Не удалось завершить запрос за допустимое число шагов.";
}

// Telegram
// HTTP API для голосовых команд Home Assistant

const app = express();

app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const text = req.body?.text?.trim();

    if (!text) {
      return res.status(400).json({
        error: "Поле text обязательно"
      });
    }

    console.log(`Voice/API: ${text}`);

    const answer = await queueHomeAssistantRequest(text);;

    console.log(`Voice/API answer: ${answer}`);

    res.json({
      success: true,
      answer
    });

  } catch (error) {
    console.error("Voice/API error:", error);

    res.status(500).json({
      success: false,
      error: String(error)
    });
  }
});

const HTTP_PORT = 3000;

app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(
    `Voice HTTP API started on port ${HTTP_PORT}`
  );
});

bot.start(async (ctx) => {
  if (ctx.from.id !== ALLOWED_USER_ID) {
    return;
  }

  await ctx.reply(
    "� Home Assistant AI готов.\n\n" +
    "Пока включён безопасный режим: только чтение."
  );
});

bot.on("text", async (ctx) => {
  if (ctx.from.id !== ALLOWED_USER_ID) {
    console.log(`Blocked Telegram user: ${ctx.from.id}`);
    return;
  }

  const text = ctx.message.text;
  console.log(`Telegram: ${text}`);

  try {
    await ctx.sendChatAction("typing");

    const answer = await askHomeAssistant(text);

    await ctx.reply(answer);
  } catch (error) {
    console.error(error);

    await ctx.reply(
      "❌ Ошибка при обращении к Home Assistant."
    );
  }
});

bot.launch();

console.log("Telegram bot started");

process.once("SIGINT", async () => {
  bot.stop("SIGINT");
  await mcp.close();
});

process.once("SIGTERM", async () => {
  bot.stop("SIGTERM");
  await mcp.close();
});
