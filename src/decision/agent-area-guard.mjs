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
 const groupLight=/(?:весь|все|всю|всех)\s+(?:свет|светильник\w*|ламп\w*|освещение)/u.test(normalized);
 if(areaQuery===null) return groupLight ? {allowed:false,status:'unresolved_room_wide_intent'} : {allowed:true,status:'not_applicable'};
 if(!['turn_on','turn_off'].includes(args.service))
   return {allowed:false,status:'unsupported_area_action'};
 const discovery=await verifyLiveAreaLighting({areaQuery,configPath,callTool});
 if(!discovery.allowed) return {allowed:false,status:discovery.status};
 return checkVerifiedAreaDecision({
   discovery,areaResolved:true,userRequestedArea:true,toolName,args,
 });
}
