import { GoogleGenAI } from "@google/genai";

import { config } from "../../config/env.mjs";
import { GEMINI_MODELS } from "../../config/models.mjs";
import { tools } from "../../mcp/tools.mjs";

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
});

export async function generateWithGemini(contents, { allowTools = true } = {}) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Gemini → ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          ...(allowTools ? { tools } : {}),
        },
      });

      return {
        response,
        model,
        provider: "gemini",
      };
    } catch (error) {
      lastError = error;

      const status = error?.status;

      console.error(
        `Gemini ${model} error:`,
        status || error.message
      );

      if (status === 429 || status === 503) {
        console.log("Gemini fallback → next model");
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("All Gemini models are unavailable");
}
