import express from "express";

import { config } from "../config/env.mjs";
import { queueHomeAssistantRequest } from "../utils/queue.mjs";
import { getHealthStatus } from "../status/health.mjs";

let server = null;

export function startHttpServer() {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      ...getHealthStatus(),
    });
  });

  app.post("/ask", async (req, res) => {
    try {
      const text = req.body?.text?.trim();

      if (!text) {
        return res.status(400).json({
          success: false,
          error: "Поле text обязательно",
        });
      }

      console.log(`HTTP → ${text}`);

      const answer =
        await queueHomeAssistantRequest(text);

      res.json({
        success: true,
        answer,
      });
    } catch (error) {
      console.error("HTTP error:", error);

      res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  });

  server = app.listen(
    config.http.port,
    "0.0.0.0",
    () => {
      console.log(
        `HTTP API started on port ${config.http.port}`
      );
    }
  );

  return server;
}

export async function stopHttpServer() {
  if (!server) {
    return;
  }

  const currentServer = server;
  server = null;

  await new Promise((resolve, reject) => {
    currentServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
