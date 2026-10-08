import { verifyLiveAreaLighting } from './live-area-lighting.mjs';
import { checkVerifiedAreaDecision } from './verified-area-decision.mjs';

// Only explicit room-wide lighting intents are checked here. This never expands
// a single-device request and never authorizes an action on its own.
export function extractRoomWideLightQuery(text='') {
 const value=String(text).toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();
 const m=value.match(/^(?:включи|выключи|включить|выключить)\s+(?:весь|все)\s+(?:свет|светильники|лампы)\s+в\s+(.+)$/u);
 return m ? m[1] : null;
}
export async function checkAgentAreaLightScope({userText,toolName,args={},configPath,callTool}={}) {
 const areaQuery=extractRoomWideLightQuery(userText);
 if(toolName!=='ha_call_service') return {allowed:true,status:'not_applicable'};
 // Group intent that cannot be parsed unambiguously must not fall through to generic service execution.
 const normalized=String(userText).toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
 // Unresolved plural or mixed-device requests must never be treated as a single-light request.
 const groupLight=/(?:весь|все|всю|всех)\s+(?:свет|светильник[а-яё]*|ламп[а-яё]*|освещени[а-яё]*|подсветк[а-яё]*)/u.test(normalized);
 const pluralLights=/(?:включи|выключи|погаси|зажги|включить|выключить)\s+(?:лампы|светильники)(?=\s|$)/u.test(normalized);
 const mixedDevices=/(?:свет|освещение|ламп[а-яё]*|светильник[а-яё]*|подсветк[а-яё]*)\s+и\s+(?:розетк[а-яё]*|выключател[а-яё]*|вентилятор[а-яё]*)|(?:розетк[а-яё]*|выключател[а-яё]*|вентилятор[а-яё]*)\s+и\s+(?:свет|освещение|ламп[а-яё]*|светильник[а-яё]*|подсветк[а-яё]*)/u.test(normalized);
 if(mixedDevices) return {allowed:false,status:'mixed_device_intent'};
 if(areaQuery===null) return (groupLight || pluralLights) ? {allowed:false,status:'unresolved_room_wide_intent'} : {allowed:true,status:'not_applicable'};
 if(!['turn_on','turn_off'].includes(args.service))
   return {allowed:false,status:'unsupported_area_action'};
 const discovery=await verifyLiveAreaLighting({areaQuery,configPath,callTool});
 if(!discovery.allowed) return {allowed:false,status:discovery.status};
 return checkVerifiedAreaDecision({
   discovery,areaResolved:true,userRequestedArea:true,toolName,args,
 });
}
