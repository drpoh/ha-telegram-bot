import {verifyAssistDeviceArea} from './v3-assist-device-area.mjs';
// No live Assist transport. Only explicit, trusted, single-target read interfaces.
export async function inspectAssistTargetState({entityId,expectedAreaId,readEntity,readDevice,readState}={}){
 const denied=reason=>({status:'denied',reason});
 if(typeof entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entityId)||
   typeof expectedAreaId!=='string'||!expectedAreaId||
   [readEntity,readDevice,readState].some(fn=>typeof fn!=='function'))return denied('invalid_read_contract');
 try{
  const entityResponse=await readEntity({entity_id:entityId});
  const deviceId=entityResponse?.entity_entry?.device_id;
  if(entityResponse?.success!==true||entityResponse.entity_id!==entityId||
     entityResponse.entity_entry?.entity_id!==entityId||typeof deviceId!=='string'||!deviceId)
   return denied('unverified_entity');
  const deviceResponse=await readDevice({device_id:deviceId});
  const binding=verifyAssistDeviceArea({entityResponse,deviceResponse,entityId,expectedAreaId});
  if(!binding.verified)return denied(binding.reason);
  const stateResponse=await readState({entity_id:entityId});
  const state=stateResponse?.structuredContent?.data;
  if(stateResponse?.isError===true||stateResponse?.structuredContent?.success===false||
    state?.entity_id!==entityId||!['on','off'].includes(state?.state))return denied('unverified_state');
  return {status:'observed',entityId,areaId:binding.areaId,state:state.state,authorization:false};
 }catch{return denied('read_failed');}
}
