import { initSceneDatabase } from "./scenes/store.mjs";
import { initDatabase } from "./db/database.mjs";
import { loadControlledMemory } from "./memory/controlled.mjs";
import { loadConversationHistory } from "./memory/conversation.mjs";
import { loadPendingConfirmations } from "./decision/pending-confirmation.mjs";
import { loadOperationalMemory } from "./memory/operational.mjs";
import { connectMcp, closeMcp } from "./mcp/client.mjs";
import {
  startTelegram,
  stopTelegram,
} from "./telegram/bot.mjs";
import {
  startHttpServer,
  stopHttpServer,
} from "./api/server.mjs";

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`Shutdown → ${signal}`);

  stopTelegram(signal);

  try {
    await stopHttpServer();
  } catch (error) {
    console.error("HTTP shutdown error:", error);
  }

  try {
    await closeMcp();
  } catch (error) {
    console.error("MCP shutdown error:", error);
  }

  process.exit(0);
}

initDatabase();
initSceneDatabase();
loadControlledMemory();
loadConversationHistory();
loadPendingConfirmations();
loadOperationalMemory();

await connectMcp();

startHttpServer();
startTelegram();

console.log("Home Assistant AI Bot v2 started");

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
