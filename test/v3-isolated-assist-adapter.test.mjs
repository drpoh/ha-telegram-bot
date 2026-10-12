import test from "node:test";
import assert from "node:assert/strict";
import {createIsolatedAssistAdapter} from "../src/decision/v3-isolated-assist-adapter.mjs";
const adapter=createIsolatedAssistAdapter({knownSatellites:["m5stack-echo"],clock:()=>1000});
test("approved Assist satellite creates device-only request without execution rights",()=>{
 const result=adapter.receive({satelliteId:"m5stack-echo",transcript:" Включи свет "});
 assert.equal(result.accepted,true);
 assert.equal(result.authorization,"not_granted");
 assert.equal(result.command.originalText,"Включи свет");
 assert.equal(result.command.actorId,null);
 assert.equal(result.command.assurance,"device_only");
 assert.equal(adapter.eligibleForReview(result.command,{risk:"low"}),true);
 assert.equal(adapter.eligibleForReview(result.command,{risk:"high"}),false);
 assert.equal(adapter.eligibleForReview(result.command,{requiresPersonalIdentity:true}),false);
});
test("unregistered satellite and claimed speaker authority are rejected",()=>{
 for(const request of [
  {satelliteId:"unknown",transcript:"Включи свет"},
  {satelliteId:"m5stack-echo",transcript:"Включи свет",claimedUserId:123},
  {satelliteId:"m5stack-echo",transcript:"Включи свет",authenticated:true},
  {satelliteId:"m5stack-echo",transcript:""},
 ])assert.equal(adapter.receive(request).accepted,false);
 const accepted=adapter.receive({satelliteId:"m5stack-echo",transcript:"Включи свет"});
 assert.equal(adapter.eligibleForReview({...accepted.command,source:"telegram"}),false);
});
