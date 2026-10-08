// Offline planning only. Does not import Home Assistant, MCP, or timers.
// The future executor MUST independently check authenticated operator consent,
// fixture identity, capabilities, restore safety and exclusive locking.
const MAX_MS=10000;
export function planLightIdentification({entityId,mode="blink",durationMs=8000,intervalMs=2000,state,capabilities=[]}={}){
 const fail=reason=>({ready:false,reason});
 if(entityId!=="light.koridor_2")return fail("candidate_not_reviewed");
 if(!Number.isInteger(durationMs) || durationMs<2000 || durationMs>MAX_MS)return fail("duration_out_of_range");
 if(!Number.isInteger(intervalMs) || intervalMs<2000 || intervalMs>3000)return fail("interval_out_of_range");
 if(state!=="on" && state!=="off")return fail("state_unavailable");
 if(mode!=="blink")return fail("unsupported_mode");
 if(!Array.isArray(capabilities) || !capabilities.includes("turn_on") || !capabilities.includes("turn_off"))
  return fail("unverified_capabilities");
 const operations=[];
 let next=state==="on"?"off":"on";
 for(let atMs=0;atMs<durationMs;atMs+=intervalMs){
  operations.push({atMs,desiredState:next});
  next=next==="on"?"off":"on";
 }
 return {ready:true,kind:"offline_preview_not_authorized",entityId,mode,
  durationMs,intervalMs,initialState:state,operations,
  finalRestore:{atMs:durationMs,desiredState:state},
  safety:{exclusiveDeviceLock:true,stopRequired:true,restoreBestEffort:true}};
}
