// Offline transport contract only. Metadata claims are NOT proof of authentication.
// The transport implementation must independently establish these guarantees.
export function assessRegistrySourceContract({source, snapshot}={}) {
 const deny=reason=>({accepted:false,authorization:false,reason});
 if(!source||source.kind!=='dedicated_ha_registry_reader'||
    source.readOnly!==true||source.transportAuthenticated!==true||
    source.operatorConfigured!==true||source.completeRegistryGuaranteed!==true||
    source.stableIdsGuaranteed!==true)
  return deny('unverified_source_contract');
 if(!snapshot||snapshot.success!==true||snapshot.complete!==true||
    snapshot.partial!==false||snapshot.has_more!==false||
    snapshot.next_offset!=null||
    !Array.isArray(snapshot.entities)||!Array.isArray(snapshot.devices)||
    !Array.isArray(snapshot.areas)||
    !Number.isSafeInteger(snapshot.entityCount)||snapshot.entityCount!==snapshot.entities.length||
    !Number.isSafeInteger(snapshot.deviceCount)||snapshot.deviceCount!==snapshot.devices.length||
    !Number.isSafeInteger(snapshot.areaCount)||snapshot.areaCount!==snapshot.areas.length)
  return deny('unverified_registry_completeness');
 return {accepted:true,authorization:false,status:'offline_contract_only'};
}
