import test from "node:test";
import assert from "node:assert/strict";
import {planLightIdentification} from "../src/commissioning/light-identify-plan.mjs";
const base={entityId:"light.koridor_2",state:"off",capabilities:["turn_on","turn_off"]};
test("isolated candidate plan alternates at most 10 seconds and restores",()=>{
 const p=planLightIdentification(base);
 assert.equal(p.ready,true);
 assert.equal(p.kind,"offline_preview_not_authorized");
 assert.deepEqual(p.operations.map(s=>s.atMs),[0,2000,4000,6000]);
 assert.deepEqual(p.operations.map(s=>s.desiredState),["on","off","on","off"]);
 assert.deepEqual(p.finalRestore,{atMs:8000,desiredState:"off"});
 assert.equal(planLightIdentification({...base,state:"on"}).finalRestore.desiredState,"on");
});
test("non-candidate, unavailable or unsafe plans are denied",()=>{
 for(const change of [
  {entityId:"light.ves_svet"},{entityId:"light.ves_svet_2"},
  {entityId:"light.koridor"},{state:"unavailable"},
  {capabilities:["turn_on"]},{durationMs:12000},{intervalMs:1000},
  {mode:"brightness"},
 ])assert.equal(planLightIdentification({...base,...change}).ready,false);
});
