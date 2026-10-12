import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: "Ответь одним коротким предложением по-русски: связь с Gemini работает.",
  });

  console.log(response.text);
} catch (error) {
  console.error("GEMINI ERROR:");
  console.error(error);
}
