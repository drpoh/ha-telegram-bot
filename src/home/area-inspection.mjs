import { listAreaDevices } from "./area-devices.mjs";

// Read-only device-registry summary. No entity registry claims and no writes.
const ROOM_CASES = new Map([
  ["кухне", "кухня"], ["коридоре", "коридор"],
  ["гостиной", "гостиная"], ["спальне", "спальня"],
  ["ванной", "ванная"], ["сауне", "сауна"],
  ["прихожей", "прихожая"], ["тамбуре", "тамбур"],
]);
function roomKey(value) {
  return String(value ?? "").trim().toLocaleLowerCase("ru").replace(/ё/g, "е");
}

export async function inspectAreaDevices(areaName, callTool) {
  const text = roomKey(areaName);
  if (!text || text.length > 120) return { status: "invalid_area" };
  const response = await callTool("ha_list_floors_areas", {});
  const data = response?.structuredContent ?? response;
  if (response?.isError || data?.success !== true || !Array.isArray(data.floors) || !Array.isArray(data.unassigned_areas)) {
    return { status: "registry_unavailable" };
  }
  const areas = [...data.floors.flatMap(floor => Array.isArray(floor.areas) ? floor.areas : []), ...data.unassigned_areas];
  const exact = areas.filter(a => [a.name, a.area_id, ...(Array.isArray(a.aliases) ? a.aliases : [])].some(value => roomKey(value) === text));
  const canonical = ROOM_CASES.get(text);
  const matches = exact.length ? exact : canonical ? areas.filter(a => [a.name, a.area_id, ...(Array.isArray(a.aliases) ? a.aliases : [])].some(value => roomKey(value) === canonical)) : [];
  if (matches.length !== 1 || !matches[0]?.area_id) {
    return { status: matches.length ? "ambiguous_area" : "area_not_found" };
  }
  const area = matches[0];
  const found = await listAreaDevices(area.area_id, callTool);
  if (!found.complete) return { status: "incomplete", area: area.name, reason: found.reason };
  return {
    status: "complete_device_registry",
    area: area.name,
    count: found.devices.length,
    devices: found.devices.slice(0, 100).map(d => ({
      name: d.name || "Без названия",
      manufacturer: d.manufacturer || null,
      model: d.model || null,
    })),
    note: "Только реестр устройств: сущности без устройства и унаследованные связи помещений не учтены.",
  };
}
