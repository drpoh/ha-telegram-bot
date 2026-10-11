import "dotenv/config";

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY отсутствует в .env");
}

const response = await fetch(
  "https://api.deepseek.com/chat/completions",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      model: "deepseek-chat",

      messages: [
        {
          role: "system",
          content:
            "Ты домашний AI-ассистент. Отвечай кратко по-русски.",
        },
        {
          role: "user",
          content:
            "Ответь одним предложением: DeepSeek успешно работает на Raspberry Pi.",
        },
      ],

      temperature: 0.2,
      max_tokens: 100,
    }),
  }
);

const text = await response.text();

if (!response.ok) {
  console.error(
    `DeepSeek HTTP ${response.status}:`,
    text
  );
  process.exit(1);
}

const data = JSON.parse(text);

console.log(
  "DeepSeek:",
  data.choices?.[0]?.message?.content
);

console.log(
  "Model:",
  data.model
);

console.log(
  "Tokens:",
  data.usage
);
