import test from "node:test";
import assert from "node:assert/strict";
import {createReviewedSatelliteAreaFixture} from "../src/decision/v3-satellite-area-fixture.mjs";
import {verifySatelliteRegistryBinding} from "../src/decision/v3-satellite-registry-binding.mjs";
const review=createReviewedSatelliteAreaFixture({entries:[{satelliteId:"echo",areaId:"sauna",reviewed:true}]});
const device={satelliteId:"echo",deviceId:"ha-device-1",areaId:"sauna",available:true,disabled:false};
const snapshot={success:true,complete:true,partial:false,capturedAt:1000,devices:[device]};
const verify=(changes={})=>verifySatelliteRegistryBinding({review,satelliteId:"echo",snapshot,now:1010,...changes});
test("fresh complete registry matches reviewed satellite and still grants no action",()=>{
 assert.deepEqual(verify(),{allowed:true,areaId:"sauna",deviceId:"ha-device-1",status:"registry_binding_verified_only"});
});
test("stale partial changed duplicated and unavailable satellite scope denied",()=>{
 for(const altered of [
  {complete:false},{partial:true},{capturedAt:1},
  {devices:[]},{devices:[device,device]},
  {devices:[{...device,areaId:"kitchen"}]},
  {devices:[{...device,available:false}]},
  {devices:[{...device,disabled:true}]},
  {devices:[{...device,deviceId:""}]},
 ])assert.equal(verify({snapshot:{...snapshot,...altered},now:altered.capturedAt===1?50000:1010}).allowed,false);
 assert.equal(verify({satelliteId:"unknown"}).allowed,false);
});
