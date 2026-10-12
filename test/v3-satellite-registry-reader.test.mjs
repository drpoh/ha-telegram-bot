import test from "node:test";
import assert from "node:assert/strict";
import {acquireSatelliteRegistrySnapshot} from "../src/decision/v3-satellite-registry-reader.mjs";
import {createReviewedSatelliteAreaFixture} from "../src/decision/v3-satellite-area-fixture.mjs";
import {verifySatelliteRegistryBinding} from "../src/decision/v3-satellite-registry-binding.mjs";
const device={deviceId:"ha-001",satelliteId:"echo",areaId:"sauna",available:true,disabled:false};
const inventory={success:true,complete:true,partial:false,has_more:false,next_offset:null,capturedAt:1000,devices:[device]};
test("bounded read-only registry feeds separate reviewed binding, never execution",async()=>{
 let calls=0;
 const snapshot=await acquireSatelliteRegistrySnapshot({now:1010,readRegistry:async args=>{calls++;assert.deepEqual(args,{readOnly:true});return inventory;}});
 const review=createReviewedSatelliteAreaFixture({entries:[{satelliteId:"echo",areaId:"sauna",reviewed:true}]});
 assert.equal(calls,1);
 assert.equal(verifySatelliteRegistryBinding({review,satelliteId:"echo",snapshot,now:1010}).status,"registry_binding_verified_only");
});
test("reader rejects partial paging duplicates stale entries and read failures",async()=>{
 for(const altered of [
  {complete:false},{partial:true},{has_more:true},{next_offset:1},
  {capturedAt:-40000},{devices:[device,{...device,deviceId:"ha-002"}]},
  {devices:[device,{...device,satelliteId:"other"}]},
  {devices:[{...device,areaId:null}]}
 ]){
  const result=await acquireSatelliteRegistrySnapshot({now:1010,readRegistry:async()=>({...inventory,...altered})});
  assert.equal(result.success,false);
 }
 assert.equal((await acquireSatelliteRegistrySnapshot({now:1010,readRegistry:async()=>{throw Error("offline");}})).success,false);
 assert.equal((await acquireSatelliteRegistrySnapshot({now:1010,timeoutMs:10,readRegistry:()=>new Promise(()=>{})})).success,false);
});
