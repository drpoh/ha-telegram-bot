import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {normalizeLightingRegistry} from "../src/decision/v3-registry-drift-check.mjs";
import {preflightV3EvidenceBundle} from "../src/decision/v3-evidence-bundle-preflight.mjs";
const now=1000000;
const registry=()=>({success:true,complete:true,capturedAt:now,entityCount:2,deviceCount:1,areaCount:2,
 entities:[{entity_id:"light.ves_svet",platform:"group",area_id:"dom"},{entity_id:"light.fixture",platform:"mqtt",device_id:"d1"}],
 devices:[{id:"d1",area_id:"room"}],areas:[{id:"dom"},{id:"room"}],groupMembers:["light.fixture"]});
test("matching evidence and parsed policy still never authorize",async()=>{
 const directory=mkdtempSync(join(tmpdir(),"gateb-evidence-"));
 try{
  const policy=JSON.stringify({version:1,default:"deny",entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}});
  writeFileSync(join(directory,"policy.json"),policy,{mode:0o600});
  const args={registryReader:()=>registry(),registrySha256:normalizeLightingRegistry(registry()).sha256,
   policyDirectory:directory,policyFilename:"policy.json",
   policySha256:createHash("sha256").update(policy).digest("hex"),now};
  const result=await preflightV3EvidenceBundle(args);
  assert.equal(result.authorized,false);
  assert.equal(result.ready,false);
  assert.equal(result.reason,"independent_owner_approval_and_transport_required");
  assert.match((await preflightV3EvidenceBundle({...args,registrySha256:"0".repeat(64)})).reason,/registry_changed/);
  assert.match((await preflightV3EvidenceBundle({...args,policySha256:"0".repeat(64)})).reason,/policy_digest_mismatch/);
  assert.equal((await preflightV3EvidenceBundle({...args,policySha256:undefined})).reason,"missing_independent_pins");
 }finally{rmSync(directory,{force:true,recursive:true});}
});
