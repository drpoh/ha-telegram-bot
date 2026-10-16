import { listAreaDevices } from "./area-devices.mjs";

// Read-only device-registry summary. No entity registry claims and no writes.
export async function inspectAreaDevices(areaName, callTool) {
  const text = String(areaName ?? "").trim().toLocaleLowerCase("ru");
  if (!text || text.length > 120) return { status: "invalid_area" };
  const response = await callTool("ha_list_floors_areas", {});
  const data = response?.structuredContent ?? response;
  if (response?.isError || data?.success !== true || !Array.isArray(data.floors) || !Array.isArray(data.unassigned_areas)) {
    return { status: "registry_unavailable" };
  }
  const areas = [...data.floors.flatMap(floor => Array.isArray(floor.areas) ? floor.areas : []), ...data.unassigned_areas];
  const matches = areas.filter(a => [a.name, a.area_id, ...(Array.isArray(a.aliases) ? a.aliases : [])].some(value => String(value ?? "").trim().toLocaleLowerCase("ru") === text));
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
