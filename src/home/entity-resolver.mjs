import fs from "node:fs";

const devices = JSON.parse(
  fs.readFileSync(
    new URL("../../config/devices.json", import.meta.url),
    "utf8"
  )
);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .trim();
}

export function resolveKnownDevice(text) {
  const normalized = normalize(text);

  for (const [id, device] of Object.entries(devices)) {
    for (const alias of device.aliases || []) {
      if (normalized.includes(normalize(alias))) {
        return {
          id,
          ...device,
        };
      }
    }
  }

  return null;
}

export function getKnownDevices() {
  return devices;
}
export function getKnownDeviceContext(text) {
  const device = resolveKnownDevice(text);

  if (!device) {
    return "Известное устройство для этого запроса не найдено.";
  }

  return `
Для текущего запроса найдено точное известное устройство:
Название: ${device.name}
Entity ID: ${device.entity_id}
Домен: ${device.domain}

Используй этот entity_id напрямую.
НЕ выполняй ha_search для этого устройства.
`;
}
