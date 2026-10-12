import test from "node:test";
import assert from "node:assert/strict";
import {createReviewedSatelliteAreaFixture} from "../src/decision/v3-satellite-area-fixture.mjs";
test("reviewed satellite mapping supplies reference only, not HA authorization",()=>{
 const registry=createReviewedSatelliteAreaFixture({entries:[{satelliteId:"m5stack-echo",areaId:"sauna",reviewed:true}]});
 assert.deepEqual(registry.resolve({satelliteId:"m5stack-echo"}),{
  status:"reviewed_reference_only",areaId:"sauna",reason:"verify_live_ha_registry_before_action"
 });
 assert.equal(registry.resolve({satelliteId:"m5stack-echo",claimedAreaId:"kitchen"}).status,"denied");
 assert.equal(registry.resolve({satelliteId:"unknown"}).status,"denied");
});
test("unreviewed, duplicate and malformed satellite scope cannot enter registry",()=>{
 for(const entries of [
  [{satelliteId:"echo",areaId:"sauna",reviewed:false}],
  [{satelliteId:"echo",areaId:"sauna",reviewed:true},{satelliteId:"echo",areaId:"kitchen",reviewed:true}],
  [{satelliteId:"../echo",areaId:"sauna",reviewed:true}],
 ])assert.throws(()=>createReviewedSatelliteAreaFixture({entries}));
});
