// Offline reviewed satellite-to-area reference. Not a Home Assistant registry.
// Never infer HA scope from device name, speech, or model output.
export function createReviewedSatelliteAreaFixture({entries=[]}={}){
 const mapping=new Map();
 for(const entry of entries){
  if(typeof entry?.satelliteId!=="string" || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(entry.satelliteId) ||
   typeof entry?.areaId!=="string" || !/^[a-zA-Z0-9_]{1,100}$/.test(entry.areaId) ||
   entry.reviewed!==true || mapping.has(entry.satelliteId))
   throw Error("invalid_or_duplicate_satellite_review");
  mapping.set(entry.satelliteId,entry.areaId);
 }
 return Object.freeze({
  resolve({satelliteId,claimedAreaId}={}){
   if(typeof satelliteId!=="string" || !mapping.has(satelliteId))
    return {status:"denied",reason:"unknown_satellite"};
   if(claimedAreaId!=null && claimedAreaId!==mapping.get(satelliteId))
    return {status:"denied",reason:"untrusted_area_override"};
   return {status:"reviewed_reference_only",areaId:mapping.get(satelliteId),
    reason:"verify_live_ha_registry_before_action"};
  },
 });
}
