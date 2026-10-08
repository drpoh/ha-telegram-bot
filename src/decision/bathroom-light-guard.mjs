import { discoverNamedAreaLightSwitch } from './named-light-switch.mjs';

const BATHROOM_LIGHT = 'switch.vannaia_svet';
const BATHROOM_AREA = 'Ванная и Сауна';

// Narrow guard only for an explicit bathroom light on/off request.
// Do not interpret a room-wide or sauna-wide request as a single light request.
export function isBathroomLightRequest(userText = '') {
 const text = String(userText).toLocaleLowerCase('ru-RU').replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();
 return /(?:^|\s)(?:включи|выключи|включить|выключить)(?:\s|$)/u.test(text) &&
   /(?:^|\s)свет(?:\s|$)/u.test(text) &&
   /(?:^|\s)в\s+ванной(?:\s|$)/u.test(text) &&
   !/(?:^|\s)(?:весь|всю|все|всё|саун[ауые]|подсветк[ауи])(\s|$)/u.test(text);
}

export async function checkBathroomLightAction({ userText, toolName, args = {}, callTool } = {}) {
 if (!isBathroomLightRequest(userText) || toolName !== 'ha_call_service') {
   return { allowed: true, status: 'not_applicable' };
 }
 if (args?.domain !== 'switch' || !['turn_on', 'turn_off'].includes(args?.service) ||
     args?.entity_id !== BATHROOM_LIGHT) {
   return { allowed: false, status: 'bathroom_target_mismatch' };
 }
 return discoverNamedAreaLightSwitch({
   areaName: BATHROOM_AREA, entityId: BATHROOM_LIGHT, callTool,
 });
}
