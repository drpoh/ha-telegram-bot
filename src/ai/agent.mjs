import { generateWithGemini } from "./providers/gemini.mjs";
import { buildSystemPrompt } from "./prompt.mjs";

import {
  addToHistory,
  getConversationHistory,
} from "../memory/conversation.mjs";

import {
  getDeviceMemoryText,
} from "../memory/devices.mjs";

import { callHA } from "../mcp/executor.mjs";

const MAX_AGENT_STEPS = 10;

export async function askHomeAssistant(userText) {
  const deviceContext = getDeviceMemoryText();

  const contents = [
    ...getConversationHistory(),
    {
      role: "user",
      parts: [
        {
          text: buildSystemPrompt(
            userText,
            deviceContext
          ),
        },
      ],
    },
  ];

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const { response, model, provider } =
      await generateWithGemini(contents);

    console.log(`${provider} OK → ${model}`);

    const candidate = response.candidates?.[0];

    if (!candidate?.content) {
      return response.text || "AI не вернул ответ.";
    }

    contents.push(candidate.content);

    const functionCalls =
      candidate.content.parts?.filter(
        (part) => part.functionCall
      ) || [];

    if (functionCalls.length === 0) {
      const finalText = response.text || "Готово.";

      addToHistory("user", userText);
      addToHistory("model", finalText);

      return finalText;
    }

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
          `MCP tool ${call.name} error:`,
          error
        );

        result = {
          error: String(error),
        };
      }

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
