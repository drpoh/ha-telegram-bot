export const autonomyPolicy = Object.freeze({
  default: "suggest",
  entities: Object.freeze({
    "light.kukhnia_svet": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
    "switch.vannaia_svet": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
    "light.wled_gledopto": Object.freeze({
      level: "auto_safe",
      services: Object.freeze(["turn_on", "turn_off"]),
    }),
  }),
});
