import test from "node:test";
import assert from "node:assert/strict";
import {acquireLightingEvidence} from "../src/decision/v3-registry-evidence-reader.mjs";
import {normalizeLightingRegistry} from "../src/decision/v3-registry-drift-check.mjs";
const now=1780000000000;
const data=()=>({success:true,complete:true,capturedAt:now,entityCount:2,deviceCount:1,areaCount:2,
 entities:[{entity_id:"light.ves_svet",platform:"group",area_id:"dom"},{entity_id:"light.koridor_2",platform:"yandex_station",device_id:"d1"}],
 devices:[{id:"d1",area_id:"koridor"}],areas:[{id:"dom"},{id:"koridor"}],groupMembers:["light.koridor_2"]});
test("fresh complete matching registry remains explicitly unauthorized",async()=>{
 const sample=data(),pin=normalizeLightingRegistry(sample).sha256;
 const result=await acquireLightingEvidence({reader:async({readOnly})=>{assert.equal(readOnly,true);return sample;},expectedSha256:pin,now});
 assert.equal(result.ready,false);assert.equal(result.authorization,false);
 assert.equal(result.reason,"owner_and_transport_approval_required");
});
test("reject partial, stale, count mismatch, changed member and absent trusted pin",async()=>{
 const pin=normalizeLightingRegistry(data()).sha256;
 const cases=[{...data(),partial:true},{...data(),capturedAt:now-31000},
  {...data(),entityCount:50},{...data(),groupMembers:["light.ves_svet"]}];
 for(const item of cases){const r=await acquireLightingEvidence({reader:()=>item,expectedSha256:pin,now});assert.equal(r.ready,false);assert.notEqual(r.reason,"owner_and_transport_approval_required");}
 assert.equal((await acquireLightingEvidence({reader:()=>data(),now})).reason,"missing_evidence_or_pin");
});
test("failed and timed-out adapters deny",async()=>{
 assert.equal((await acquireLightingEvidence({reader:()=>{throw Error("bad")},now})).reason,"registry_read_failed");
 assert.equal((await acquireLightingEvidence({reader:()=>new Promise(()=>{}),now,timeoutMs:5})).reason,"registry_read_failed");
});
