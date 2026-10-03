import { generateAI } from "./router.mjs";
import { buildSystemPrompt } from "./prompt.mjs";
import { getKnownDeviceContext } from "../home/entity-resolver.mjs";


import {
  addToHistory,
  getConversationHistory,
} from "../memory/conversation.mjs";

import {
  getDeviceMemoryText,
} from "../memory/devices.mjs";

import { callHA } from "../mcp/executor.mjs";
import { rememberControlledMany } from "../memory/controlled.mjs";
import { startLearningSession } from "../learning/session.mjs";
import { getLastControlledText } from "../memory/controlled.mjs";
import { finalizeLearning } from "../learning/learner.mjs";

const MAX_AGENT_STEPS = 10;

export async function askHomeAssistant(userText) {
  startLearningSession(userText);
  const deviceContext = getDeviceMemoryText();
  const controlledContext = getLastControlledText();
  const knownDeviceContext = getKnownDeviceContext(userText);
  const contents = [
    ...getConversationHistory(),
    {
      role: "user",
      parts: [
        {
          text: buildSystemPrompt(
            userText,
            deviceContext,
            controlledContext,
            knownDeviceContext
          ),
        },
      ],
    },
  ];

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const { response, model, provider } =
      await generateAI(contents);

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
      finalizeLearning();

      return finalText;
    }

    const controlledByDomain = new Map();
    for (const part of functionCalls) {
      const call = part.functionCall;

      let result;

      try {
        result = await callHA(
          call.name,
          call.args || {}
        );
        
        if (
          call.name === "ha_call_service" &&
          call.args?.domain &&
          call.args?.entity_id &&
          !result?.isError
        ) {
          const entities =
            controlledByDomain.get(call.args.domain) || [];

          entities.push(call.args.entity_id);

          controlledByDomain.set(
            call.args.domain,
            entities
          );
        }
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
              id: call.id,
              name: call.name,
              response: {
                result,
              },
            },
          },
        ],
      });
    }
    for (const [domain, entityIds] of controlledByDomain) {
      rememberControlledMany(domain, entityIds);

      console.log(
        `Controlled → ${domain} / ${entityIds.join(", ")}`
      );
    }
  }

  return "Не удалось завершить запрос за допустимое число шагов.";
}
