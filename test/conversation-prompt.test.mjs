import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt } from "../src/ai/prompt.mjs";

test("conversational follow-ups preserve topic without authorizing actions", () => {
  const prompt = buildSystemPrompt("А сейчас?", "", "", "", "");
  assert.match(prompt, /«а сейчас\?»/);
  assert.match(prompt, /продолжай отвечать информационно/);
  assert.match(prompt, /НЕ разрешают новых действий/);
  assert.match(prompt, /Запрос пользователя:\nА сейчас\?/);
});
test("small talk does not imply HA tool calls", () => {
  const prompt = buildSystemPrompt("Спасибо!", "", "", "", "");
  assert.match(prompt, /на приветствия, благодарности/);
  assert.match(prompt, /без вызовов Home Assistant или MCP/);
});
test("ambiguous device write must clarify", () => {
  const prompt = buildSystemPrompt("Включи его", "", "", "", "");
  assert.match(prompt, /спроси одним коротким вопросом/);
  assert.match(prompt, /существующие проверки/);
});
