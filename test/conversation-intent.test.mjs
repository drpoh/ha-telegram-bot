import test from "node:test";
import assert from "node:assert/strict";
import { isPureSmallTalk } from "../src/ai/conversation-intent.mjs";

test("pure greetings and thanks avoid tools", () => {
  for (const text of ["Привет!", "Спасибо.", "Что ты умеешь?", "Добрый вечер", "Чем ты можешь помочь?"]) {
    assert.equal(isPureSmallTalk(text), true, text);
  }
});
test("house questions and conversational continuations retain tools and policy", () => {
  for (const text of ["Привет, выключи свет", "Спасибо, выключи его", "Сколько градусов в сауне?", "А сейчас?", "Почему?", "Включи свет", "Что ты умеешь в ванной?", ""]) {
    assert.equal(isPureSmallTalk(text), false, text);
  }
});
