import "dotenv/config";

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  telegram: {
    botToken: required("TELEGRAM_BOT_TOKEN"),
    allowedUserId: Number(required("TELEGRAM_ALLOWED_USER_ID")),
  },

  gemini: {
    apiKey: required("GEMINI_API_KEY"),
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || null,
  },

  mcp: {
    url: required("MCP_URL"),
  },

  http: {
    port: Number(process.env.HTTP_PORT || 3000),
    apiToken: process.env.HTTP_API_TOKEN || null,
  },
};
