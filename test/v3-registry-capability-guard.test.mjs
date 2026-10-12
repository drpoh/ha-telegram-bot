import test from "node:test";
import assert from "node:assert/strict";
import {assessSatelliteRegistryCapabilities} from "../src/decision/v3-registry-capability-guard.mjs";
const proven={name:"ha_device_registry_snapshot",readOnly:true,completeInventory:true,authenticatedSource:true,providesStableDeviceIds:true,providesAreaIds:true};
test("generic MCP inventory and missing provenance never authorize registry binding",()=>{
 for(const tools of [[],[{name:"ha_search"}],[{name:"ha_get_overview"}],[{...proven,completeInventory:false}],[proven,proven]]){
  assert.equal(assessSatelliteRegistryCapabilities({advertisedTools:tools}).supported,false);
 }
});
test("explicit capability is still review-only, not authorization",()=>{
 assert.deepEqual(assessSatelliteRegistryCapabilities({advertisedTools:[proven]}),{
  supported:true,toolName:"ha_device_registry_snapshot",status:"capability_claim_requires_adapter_review"
 });
});
