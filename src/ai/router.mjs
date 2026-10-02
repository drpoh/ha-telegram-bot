import { generateWithGemini } from "./providers/gemini.mjs";

const providers = {
  gemini: generateWithGemini,
};

const PRIMARY_PROVIDER = "gemini";

export async function generateAI(contents) {
  const provider = providers[PRIMARY_PROVIDER];

  if (!provider) {
    throw new Error(
      `Unknown AI provider: ${PRIMARY_PROVIDER}`
    );
  }

  return provider(contents);
}
