// Read-only targeted HA registry chain: entity -> exact device -> effective area.
// No authorization and no Home Assistant service calls.
export function verifyAssistDeviceArea({entityResponse,deviceResponse,entityId,expectedAreaId}={}){
 const deny=reason=>({verified:false,reason});
 const e=entityResponse?.entity_entry;
 if(entityResponse?.success!==true||entityResponse.entity_id!==entityId||e?.entity_id!==entityId||
    !/^light\.[a-z0-9_]+$/.test(entityId||''))return deny('entity_mismatch');
 if(e.enabled!==true||e.disabled_by!=null||e.hidden===true||e.hidden_by!=null||
   typeof e.device_id!=='string'||!e.device_id||typeof e.unique_id!=='string'||!e.unique_id)
  return deny('invalid_entity');
 const device=deviceResponse?.device;
 if(deviceResponse?.success!==true||!device||device.device_id!==e.device_id||device.disabled_by!=null)
  return deny('device_mismatch_or_disabled');
 if(typeof expectedAreaId!=='string'||!expectedAreaId)return deny('missing_expected_area');
 const area=e.area_id??device.area_id;
 if(typeof area!=='string'||area!==expectedAreaId)return deny('area_mismatch');
 if(e.area_id!=null&&device.area_id!=null&&e.area_id!==device.area_id)
  return deny('conflicting_area_assignment');
 return {verified:true,entityId,areaId:area,deviceId:e.device_id,status:'registry_binding_only'};
}
