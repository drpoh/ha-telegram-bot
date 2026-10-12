// Offline gate: a reviewed satellite-area reference is NOT authority without
// a complete fresh independent HA device registry snapshot.
export function verifySatelliteRegistryBinding({review, satelliteId, snapshot,now=Date.now(),maxAgeMs=30000}={}){
 const planned=review?.resolve?.({satelliteId});
 if(planned?.status!=="reviewed_reference_only")return {allowed:false,reason:"unreviewed_satellite"};
 if(!snapshot || snapshot.success!==true || snapshot.complete!==true ||
  snapshot.partial===true || !Array.isArray(snapshot.devices) ||
  !Number.isFinite(snapshot.capturedAt) || !Number.isFinite(now) ||
  now<snapshot.capturedAt || now-snapshot.capturedAt>maxAgeMs)
  return {allowed:false,reason:"incomplete_or_stale_registry"};
 const matches=snapshot.devices.filter(device=>device?.satelliteId===satelliteId);
 if(matches.length!==1)return {allowed:false,reason:"missing_or_ambiguous_device"};
 const device=matches[0];
 if(device.disabled===true || device.available!==true ||
  typeof device.deviceId!=="string" || !device.deviceId ||
  !device.areaId || device.areaId!==planned.areaId)
  return {allowed:false,reason:"identity_or_area_mismatch"};
 return {allowed:true,areaId:planned.areaId,deviceId:device.deviceId,
  status:"registry_binding_verified_only"};
}
