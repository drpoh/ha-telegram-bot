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
            "Ты AI-ассистент умного дома. Отвечай по-русски кратко."
        },
        {
          role: "user",
          content:
            "Ответь одним предложением: OpenRouter успешно работает на Raspberry Pi."
        }
      ],

      temperature: 0.2,
      max_tokens: 100
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

console.log(
  "Answer:",
  data.choices?.[0]?.message?.content
);

console.log(
  "Model:",
  data.model
);

console.log(
  "Usage:",
  data.usage
);
