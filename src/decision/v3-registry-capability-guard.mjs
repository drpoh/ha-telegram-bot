// Capability negotiation only. A list of entities or generic overview cannot
// prove complete device-registry membership. Fail closed until a dedicated
// authenticated read-only registry adapter supplies documented provenance.
const REGISTRY_CAPABILITY="ha_device_registry_snapshot";
export function assessSatelliteRegistryCapabilities({advertisedTools=[]}={}){
 if(!Array.isArray(advertisedTools))return {supported:false,reason:"invalid_capabilities"};
 const matches=advertisedTools.filter(x=>x?.name===REGISTRY_CAPABILITY);
 if(matches.length!==1)return {supported:false,reason:"no_unique_registry_snapshot_tool"};
 const entry=matches[0];
 if(entry.readOnly!==true || entry.completeInventory!==true ||
    entry.authenticatedSource!==true || entry.providesStableDeviceIds!==true ||
    entry.providesAreaIds!==true)
  return {supported:false,reason:"unproven_registry_guarantees"};
 return {supported:true,toolName:REGISTRY_CAPABILITY,status:"capability_claim_requires_adapter_review"};
}
