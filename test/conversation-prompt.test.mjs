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

test("a follow-up about now requires fresh read, not cached temperature", () => {
 const p = buildSystemPrompt("А сейчас?", "", "", "", "");
 assert.match(p, /повторный запрос текущей температуры/);
 assert.match(p, /не пересказ прежнего показания/);
});
test("historical question requires evidence, and unavailable history is acknowledged", () => {
 const p = buildSystemPrompt("А вчера?", "", "", "", "");
 assert.match(p, /инструмент истории/);
 assert.match(p, /данных нет/);
});
test("questions about hypothetical actions cannot trigger execution", () => {
 const p = buildSystemPrompt("Можешь выключить свет?", "", "", "", "");
 assert.match(p, /не выполняй действие/);
});
test("causal explanations distinguish observed facts from speculation", () => {
 const p = buildSystemPrompt("Почему в сауне холодно?", "", "", "", "");
 assert.match(p, /отделяй наблюдаемые факты от возможных причин/);
});

test("battery sensor query preserves device type and room", () => {
  const prompt = buildSystemPrompt("Какой заряд батареи у датчика движения в коридоре?", "", "", "", "");
  assert.match(prompt, /«датчик движения коридор»/);
  assert.match(prompt, /не подставляй ответ от другого устройства/);
  assert.match(prompt, /несколько подходящих датчиков/);
});

test("second sensor reference is read-only", () => {
 const p=buildSystemPrompt("А у второго?", "", "", "", "");
 assert.match(p,/«А у второго\?»/);
 assert.match(p,/Не трактуй фразу/);
});
