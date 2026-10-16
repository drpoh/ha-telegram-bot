import { inspectAreaDevices } from "./area-inspection.mjs";

// Narrow, explicitly read-only Russian questions. Anything else uses the AI policy path.
export function extractRoomInventoryQuestion(value) {
  const text = String(value ?? "").trim().replace(/[?!.]+$/gu, "").trim();
  const match = text.match(/^(?:а\s+)?какие\s+устройства\s+(?:есть\s+)?(?:на|в|во)\s+(.+)$/iu);
  const area = match?.[1]?.trim() ?? "";
  return area.length > 0 && area.length <= 120 ? area : null;
}

export async function replyToRoomInventory(text, callTool) {
  const area = extractRoomInventoryQuestion(text);
  if (!area) return null;
  let result;
  try {
    result = await inspectAreaDevices(area, callTool);
  } catch {
    return "Не удалось прочитать реестр устройств Home Assistant. Попробуйте позже.";
  }
  if (result.status === "complete_device_registry") {
    const devices = result.devices.map(device => device.name);
    if (!devices.length) return `В реестре устройств помещения «${result.area}» записей нет. Сущности без устройства здесь не учитываются.`;
    const displayed = devices.slice(0, 30).map(name => String(name).slice(0, 90));
    return `Устройства помещения «${result.area}» (${result.count}):\n${displayed.map((name, i) => `${i+1}. ${name}`).join("\n")}${devices.length > 30 ? "\n… Показана только часть списка." : ""}\n\nЭто реестр устройств, не полный список сущностей Home Assistant.`;
  }
  if (result.status === "area_not_found") return `Не нашёл помещение «${area}» в реестре Home Assistant. Проверьте его название.`;
  if (result.status === "ambiguous_area") return `Название «${area}» неоднозначно. Уточните помещение.`;
  return "Не удалось подтвердить полный список устройств помещения через HA-MCP. Попробуйте позже.";
}
