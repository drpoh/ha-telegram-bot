import { verifyLiveAreaLighting } from './live-area-lighting.mjs';
import { checkVerifiedAreaDecision } from './verified-area-decision.mjs';

// Only explicit room-wide lighting intents are checked here. This never expands
// a single-device request and never authorizes an action on its own.
export function extractRoomWideLightQuery(text='') {
 const value=String(text).toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();
 const m=value.match(/^(?:включи|выключи|включить|выключить)\s+весь\s+свет\s+в\s+(.+)$/u);
 return m ? m[1] : null;
}
export async function checkAgentAreaLightScope({userText,toolName,args={},configPath,callTool}={}) {
 const areaQuery=extractRoomWideLightQuery(userText);
 if(toolName!=='ha_call_service'||areaQuery===null)
   return {allowed:true,status:'not_applicable'};
 if(!['turn_on','turn_off'].includes(args.service))
   return {allowed:false,status:'unsupported_area_action'};
 const discovery=await verifyLiveAreaLighting({areaQuery,configPath,callTool});
 if(!discovery.allowed) return {allowed:false,status:discovery.status};
 return checkVerifiedAreaDecision({
   discovery,areaResolved:true,userRequestedArea:true,toolName,args,
 });
}
