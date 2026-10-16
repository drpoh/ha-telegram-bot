import { config } from "../../config/env.mjs";
import { tools as geminiTools } from "../../mcp/tools.mjs";
import { OPENROUTER_MODEL } from "../../config/models.mjs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const MODEL = OPENROUTER_MODEL;

function convertTools() {
  const declarations =
    geminiTools[0]?.functionDeclarations || [];

  return declarations.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: normalizeSchema(tool.parameters),
    },
  }));
}

function normalizeSchema(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeSchema);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result = {};

  for (const [key, child] of Object.entries(value)) {
    if (key === "type" && typeof child === "string") {
      result[key] = child.toLowerCase();
    } else {
      result[key] = normalizeSchema(child);
    }
  }

  return result;
}

function contentsToMessages(contents) {
  const messages = [];

  for (const content of contents) {
    const textParts = content.parts
      ?.filter((part) => typeof part.text === "string")
      .map((part) => part.text)
      .join("\n");

    if (textParts?.trim()) {
      messages.push({
        role:
          content.role === "model"
            ? "assistant"
            : "user",
        content: textParts,
      });
    }

    const functionCalls =
      content.parts?.filter(
        (part) => part.functionCall
      ) || [];

    if (functionCalls.length) {
      messages.push({
        role: "assistant",
        content: null,
        tool_calls: functionCalls.map(
          (part, index) => ({
            id:
              part.functionCall.id ||
              `call_${index}`,
            type: "function",
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(
                part.functionCall.args || {}
              ),
            },
          })
        ),
      });
    }

    const functionResponses =
      content.parts?.filter(
        (part) => part.functionResponse
      ) || [];

    for (let index = 0; index < functionResponses.length; index++) {
      const part = functionResponses[index];

      messages.push({
        role: "tool",
        tool_call_id:
          part.functionResponse.id ||
          `call_${index}`,
        name: part.functionResponse.name,
        content: JSON.stringify(
          part.functionResponse.response ?? {}
        ),
      });
    }
  }

  return messages;
}
function createGeminiCompatibleResponse(message) {
  const parts = [];

  if (message?.content) {
    parts.push({
      text: message.content,
    });
  }

  for (const toolCall of message?.tool_calls || []) {
    let args = {};

    try {
      args = JSON.parse(
        toolCall.function?.arguments || "{}"
      );
    } catch {
      args = {};
    }

    parts.push({
      functionCall: {
        id: toolCall.id,
        name: toolCall.function?.name,
        args,
      },
    });
  }

  return {
    candidates: [
      {
        content: {
          role: "model",
          parts,
        },
      },
    ],

    get text() {
      return message?.content || "";
    },
  };
}

export async function generateWithOpenRouter(contents, { allowTools = true } = {}) {
  if (!config.openrouter.apiKey) {
    throw new Error("OPENROUTER_API_KEY отсутствует");
  }

  console.log(`OpenRouter → ${MODEL}`);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",

    headers: {
      Authorization:
        `Bearer ${config.openrouter.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Robert Home Assistant",
    },

    body: JSON.stringify({
      model: MODEL,
      messages: contentsToMessages(contents),
      ...(allowTools ? { tools: convertTools() } : {}),
      ...(allowTools ? { tool_choice: "auto" } : {}),
      temperature: 0,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenRouter HTTP ${response.status}: ${text}`
    );
  }

  const data = JSON.parse(text);
  const message = data.choices?.[0]?.message;

  if (!message) {
    throw new Error("OpenRouter returned no message");
  }

  return {
    response: createGeminiCompatibleResponse(message),
    model: data.model || MODEL,
    provider: "openrouter",
  };
}
