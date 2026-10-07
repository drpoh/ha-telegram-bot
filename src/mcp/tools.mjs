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
        name: "ha_get_history",
        description:
          "Получить ограниченную историю или долгосрочную статистику сущности Home Assistant. Используй history для недавних изменений состояния, statistics для долгосрочных числовых трендов.",
        parameters: {
          type: "OBJECT",
          properties: {
            entity_ids: {
              type: "STRING",
              description: "Точный entity_id. Для AI-запросов предпочитай одну сущность за раз.",
            },
            source: {
              type: "STRING",
              enum: ["history", "statistics"],
              description: "history = недавние состояния; statistics = агрегированная долгосрочная статистика.",
            },
            start_time: {
              type: "STRING",
              description: "ISO datetime или относительное время: 24h, 7d, 30d.",
            },
            end_time: {
              type: "STRING",
              description: "Необязательное конечное время ISO.",
            },
            period: {
              type: "STRING",
              enum: ["5minute", "hour", "day", "week", "month", "year"],
              description: "Период агрегации только для statistics.",
            },
            statistic_types: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Для statistics: mean, min, max, sum, state, change.",
            },
            limit: {
              type: "INTEGER",
              description: "Максимум записей; используй минимально достаточное значение.",
            },
            order: {
              type: "STRING",
              enum: ["asc", "desc"],
              description: "Порядок history; обычно asc для анализа.",
            },
          },
          required: ["entity_ids"],
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
      {
        name: "ai_scene_capture",
        description:
          "Создать новую AI-сцену, сохранив текущее состояние поддерживаемых устройств указанной комнаты. Используй только когда пользователь явно просит запомнить или сохранить текущую обстановку как сцену. Это локальная AI-сцена, не Home Assistant scene.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "Название новой AI-сцены.",
            },
            area: {
              type: "STRING",
              description: "Название помещения Home Assistant.",
            },
          },
          required: ["name", "area"],
        },
      },
      {
        name: "ai_scene_run",
        description:
          "Запустить ранее сохранённую локальную AI-сцену в конкретной комнате. Не используй для обычного управления отдельным устройством.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "Название AI-сцены.",
            },
            area: {
              type: "STRING",
              description: "Название помещения Home Assistant.",
            },
          },
          required: ["name", "area"],
        },
      },
      {
        name: "ai_scene_list",
        description:
          "Показать локальные AI-сцены, сохранённые для конкретной комнаты.",
        parameters: {
          type: "OBJECT",
          properties: {
            area: {
              type: "STRING",
              description: "Название помещения Home Assistant.",
            },
          },
          required: ["area"],
        },
      },
      {
        name: "ai_scene_delete",
        description:
          "Удалить только локальную AI-сцену из памяти бота. Никогда не удаляет и не изменяет сцены Home Assistant.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "Название локальной AI-сцены.",
            },
            area: {
              type: "STRING",
              description: "Название помещения Home Assistant.",
            },
          },
          required: ["name", "area"],
        },
      },
    ],
  },
];
