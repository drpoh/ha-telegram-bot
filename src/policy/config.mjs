export const autonomyPolicy = Object.freeze({
  default: "suggest",
  entities: Object.freeze({
    "light.kukhnia_svet": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
    "light.liustra": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
    "light.podsvetka": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
    "light.podsvetka_2": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
  }),
});
