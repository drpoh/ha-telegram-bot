import { callHA } from "../mcp/executor.mjs";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAreas(data) {
  const areas = [];

  for (const floor of data?.floors || []) {
    for (const area of floor?.areas || []) {
      if (!area?.area_id || !area?.name) {
        continue;
      }

      areas.push({
        area_id: area.area_id,
        name: area.name,
        floor_id: floor.floor_id || null,
        floor_name: floor.name || null,
      });
    }
  }

  for (const area of data?.unassigned_areas || []) {
    if (!area?.area_id || !area?.name) {
      continue;
    }

    areas.push({
      area_id: area.area_id,
      name: area.name,
      floor_id: null,
      floor_name: null,
    });
  }

  return areas;
}

export async function getHomeAreas() {
  const result = await callHA(
    "ha_list_floors_areas",
    {
      fields: [
        "floors",
        "unassigned_areas",
      ],
      area_fields: [
        "area_id",
        "name",
      ],
    }
  );

  const data =
    result?.structuredContent ??
    result;

  return extractAreas(data);
}

export async function resolveArea(text) {
  const query = normalize(text);

  if (!query) {
    return null;
  }

  const areas = await getHomeAreas();

  // 1. Точное совпадение с HA name или area_id.
  let match = areas.find(
    (area) =>
      normalize(area.name) === query ||
      normalize(area.area_id) === query
  );

  if (match) {
    return match;
  }

  // 2. Название Area содержится в пользовательской фразе.
  match = areas.find((area) =>
    query.includes(normalize(area.name))
  );

  if (match) {
    return match;
  }

  // 3. Пользовательская фраза содержится в названии Area.
  // Например "сауна" -> "Ванная и Сауна".
  const partial = areas.filter((area) =>
    normalize(area.name).includes(query)
  );

  // Используем только однозначный результат.
  if (partial.length === 1) {
    return partial[0];
  }

  return null;
}
