import { generateWithGemini } from "./providers/gemini.mjs";
import { generateWithOpenRouter } from "./providers/openrouter.mjs";

const providers = [
  {
    name: "gemini",
    generate: generateWithGemini,
  },
  {
    name: "openrouter",
    generate: generateWithOpenRouter,
  },
];

let lastAI = {
  provider: null,
  model: null,
  timestamp: null,
};

export async function generateAI(contents) {
  let lastError;

  for (const provider of providers) {
    try {
      console.log(`AI Router → ${provider.name}`);

      const result = await provider.generate(contents);

      lastAI = {
        provider: result.provider || provider.name,
        model: result.model || "unknown",
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `AI provider ${provider.name} failed:`,
        error?.message || error
      );

      console.log("AI Router fallback → next provider");
    }
  }

  throw lastError || new Error("No AI provider available");
}

export function getAIStatus() {
  return {
    ...lastAI,
    primary: providers[0].name,
    fallback: providers.slice(1).map(
      (provider) => provider.name
    ),
  };
}
