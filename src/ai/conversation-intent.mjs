// Exact, narrow small-talk classification: uncertain messages retain normal HA policy path.
export function isPureSmallTalk(value) {
  const text = String(value ?? "").trim().toLowerCase().replace(/[!?.,…]+$/gu, "").trim();
  return /^(привет|здравствуй|здравствуйте|добрый день|доброе утро|добрый вечер|спасибо|благодарю|пока|до свидания|что ты умеешь|чем ты можешь помочь)$/u.test(text);
}
