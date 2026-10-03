import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const MAX_HISTORY_MESSAGES = 40;
const DB_PATH = resolve("data/bot.db");

const conversationHistory = [];

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSql(sql) {
  return execFileSync(
    "sqlite3",
    ["-batch", "-noheader", DB_PATH, sql],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    }
  ).trim();
}

export function loadConversationHistory() {
  try {
    const output = execFileSync(
      "sqlite3",
      [
        "-json",
        DB_PATH,
        `
        SELECT role, text
        FROM (
          SELECT id, role, text
          FROM conversation
          ORDER BY id DESC
          LIMIT ${MAX_HISTORY_MESSAGES}
        )
        ORDER BY id ASC;
        `,
      ],
      {
        encoding: "utf8",
        maxBuffer: 1024 * 1024,
      }
    ).trim();

    conversationHistory.length = 0;

    if (output) {
      const rows = JSON.parse(output);

      for (const row of rows) {
        conversationHistory.push({
          role: row.role,
          parts: [{ text: row.text }],
        });
      }
    }

    console.log(
      `Conversation memory loaded → ${conversationHistory.length} messages`
    );

    return conversationHistory.length;
  } catch (error) {
    console.error(
      "Conversation memory load failed:",
      error?.message || error
    );

    return 0;
  }
}

export function addToHistory(role, text) {
  conversationHistory.push({
    role,
    parts: [{ text }],
  });

  while (
    conversationHistory.length >
    MAX_HISTORY_MESSAGES
  ) {
    conversationHistory.shift();
  }

  try {
    runSql(`
      INSERT INTO conversation (role, text)
      VALUES (
        ${sqlString(role)},
        ${sqlString(text)}
      );

      DELETE FROM conversation
      WHERE id NOT IN (
        SELECT id
        FROM conversation
        ORDER BY id DESC
        LIMIT ${MAX_HISTORY_MESSAGES}
      );
    `);
  } catch (error) {
    console.error(
      "Conversation memory save failed:",
      error?.message || error
    );
  }
}

export function getConversationHistory() {
  return [...conversationHistory];
}

export function clearConversationHistory() {
  conversationHistory.length = 0;

  try {
    runSql("DELETE FROM conversation;");
  } catch (error) {
    console.error(
      "Conversation memory clear failed:",
      error?.message || error
    );
  }
}
