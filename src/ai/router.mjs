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

export async function generateAI(contents) {
  let lastError;

  for (const provider of providers) {
    try {
      console.log(`AI Router → ${provider.name}`);
      return await provider.generate(contents);
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
