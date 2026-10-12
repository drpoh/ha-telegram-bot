import "dotenv/config";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY отсутствует в .env");
}

const response = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",

    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Robert Home Assistant"
    },

    body: JSON.stringify({
      model: "openrouter/free",

      messages: [
        {
          role: "system",
          content:
            "Ты управляешь Home Assistant. Если пользователь просит найти устройство, обязательно используй предоставленный инструмент."
        },
        {
          role: "user",
          content: "Найди свет в коридоре."
        }
      ],

      tools: [
        {
          type: "function",
          function: {
            name: "ha_search",
            description:
              "Поиск сущностей Home Assistant.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "Название комнаты или устройства."
                },
                domain_filter: {
                  type: "string",
                  description:
                    "Домен Home Assistant."
                }
              },
              required: ["query", "domain_filter"]
            }
          }
        }
      ],

      tool_choice: "auto",
      temperature: 0
    })
  }
);

const text = await response.text();

if (!response.ok) {
  console.error(
    `OpenRouter HTTP ${response.status}:`,
    text
  );
  process.exit(1);
}

const data = JSON.parse(text);

const message = data.choices?.[0]?.message;

console.log("Model:", data.model);
console.log("Content:", message?.content);
console.log(
  "Tool calls:",
  JSON.stringify(message?.tool_calls, null, 2)
);
console.log("Cost:", data.usage?.cost);
