export const RISK_CLASSES = Object.freeze({ R0: "R0", R1: "R1", R2: "R2", R3: "R3", R4: "R4" });

const DOMAIN_RISK = Object.freeze({ light: "R1", media_player: "R1", fan: "R1", climate: "R2", water_heater: "R2", switch: "R2", cover: "R3", lock: "R3", valve: "R3", alarm_control_panel: "R4" });
const SERVICE_RISK = Object.freeze({ "lock.unlock": "R4", "alarm_control_panel.alarm_disarm": "R4", "homeassistant.restart": "R4", "homeassistant.stop": "R4" });

export function classifyRisk({ domain, service, stateChanging = true, riskOverride = null } = {}) {
  if (Object.values(RISK_CLASSES).includes(riskOverride)) return riskOverride;
  if (!stateChanging) return RISK_CLASSES.R0;
  const key = domain && service ? `${domain}.${service}` : null;
  if (key && SERVICE_RISK[key]) return SERVICE_RISK[key];
  return DOMAIN_RISK[domain] || RISK_CLASSES.R3;
}
