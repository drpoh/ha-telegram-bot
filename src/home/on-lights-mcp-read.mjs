import {summarizeOnLights} from './on-lights-summary.mjs';

// Existing HA-MCP read only. Inventory is intentionally a known-device subset,
// never a claim that every light in Home Assistant was inspected.
export async function summarizeConfiguredLights({devices,readTool}={}){
 const deny=()=>({status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось проверить все выбранные светильники. Повтори запрос позднее.'});
 if(!devices||typeof devices!=='object'||Array.isArray(devices)||typeof readTool!=='function')return deny();
 const ids=[...new Set(Object.values(devices).filter(x=>x?.domain==='light').map(x=>x.entity_id))];
 if(!ids.length||ids.length>20)return deny();
 const result=await summarizeOnLights({entityIds:ids,readState:async entityId=>{
  const response=await readTool('ha_get_state',{entity_id:entityId});
  if(response?.isError===true)return null;
  const root=response?.structuredContent??response;
  const data=root?.data??root;
  for(const item of [data,data?.data,data?.state,data?.entity]){
   if(item?.entity_id===entityId&&typeof item.state==='string')return {entity_id:item.entity_id,state:item.state};
  }
  return null;
 }});
 if(result.status!=='complete')return deny();
 return {...result,text:'Проверены только светильники из списка известных устройств. '+result.text};
}
