// Per-target read-only HA registry lookup. Never grants room or action scope.
export async function inspectAssistEntity({entityId,readEntity}={}){
 const deny=reason=>({verified:false,reason});
 if(typeof entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entityId)||typeof readEntity!=='function')return deny('invalid_lookup');
 try{
  const result=await readEntity({entity_id:entityId});
  const entry=result?.entity_entry;
  if(result?.success!==true||result?.entity_id!==entityId||!entry||entry.entity_id!==entityId)return deny('entity_response_mismatch');
  if(entry.enabled!==true||entry.disabled_by!=null||entry.hidden===true||entry.hidden_by!=null)return deny('entity_disabled_or_hidden');
  if(typeof entry.device_id!=='string'||!entry.device_id||typeof entry.unique_id!=='string'||!entry.unique_id||typeof entry.platform!=='string'||!entry.platform)return deny('incomplete_entity_identity');
  if(typeof entry.area_id!=='string'||!entry.area_id)return deny('area_requires_device_registry');
  return {verified:true,entityId,deviceId:entry.device_id,areaId:entry.area_id,status:'entity_registry_verified_not_authorized'};
 }catch{return deny('lookup_failed');}
}
