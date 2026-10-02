export const tools = [
  {
    functionDeclarations: [
      {
        name: "ha_search",
        description:
          "Поиск сущностей Home Assistant. Для управления всегда используй domain_filter, если тип устройства известен.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "Короткое название комнаты или устройства.",
            },
            domain_filter: {
              type: "STRING",
              description:
                "Домен Home Assistant: light, switch, sensor, climate, cover, fan.",
            },
            area_filter: {
              type: "STRING",
              description: "Комната/area Home Assistant, если точно известна.",
            },
            state_filter: {
              type: "STRING",
              description: "Фильтр состояния: on, off, unavailable.",
            },
            limit: {
              type: "INTEGER",
              description: "Максимальное количество результатов.",
            },
            offset: {
              type: "INTEGER",
              description: "Смещение результатов.",
            },
            include_hidden: {
              type: "BOOLEAN",
              description: "Включать скрытые сущности.",
            },
            result_fields: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Поля результата.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "ha_get_state",
        description:
          "Получить текущее состояние конкретной сущности Home Assistant.",
        parameters: {
          type: "OBJECT",
          properties: {
            entity_id: {
              type: "STRING",
              description: "Точный entity_id.",
            },
          },
          required: ["entity_id"],
        },
      },
      {
        name: "ha_get_overview",
        description: "Получить общий обзор Home Assistant.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "ha_call_service",
        description:
          "Вызвать сервис Home Assistant для управления сущностью.",
        parameters: {
          type: "OBJECT",
          properties: {
            domain: {
              type: "STRING",
              description: "Домен Home Assistant.",
            },
            service: {
              type: "STRING",
              description: "Сервис: turn_on, turn_off или toggle.",
            },
            entity_id: {
              type: "STRING",
              description: "Точный entity_id.",
            },
          },
          required: ["domain", "service", "entity_id"],
        },
      },
    ],
  },
];
