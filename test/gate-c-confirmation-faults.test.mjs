import test from "node:test";
import assert from "node:assert/strict";
import {clearPendingConfirmations,createPendingConfirmation,cancelPendingConfirmation} from "../src/decision/pending-confirmation.mjs";
import {queueConfirmedAction} from "../src/utils/queue.mjs";
import {verifyConfirmedLightResult} from "../src/decision/confirmed-result-verification.mjs";

const actor={userId:901,chatId:902};
const action={name:"ha_call_service",args:{domain:"light",service:"turn_off",entity_id:"light.fixture"}};
test.beforeEach(()=>clearPendingConfirmations());

test("Gate C: read timeout/malformed response never triggers automatic second actuation",async()=>{
 for(const fault of [
  async()=>{throw Error("MCP timeout")},
  async()=>({structuredContent:{success:true,data:{entity_id:"light.other",state:"off"}}}),
  async()=>({structuredContent:{data:{entity_id:"light.fixture",state:"unknown"}}}),
 ]){
  clearPendingConfirmations();
  createPendingConfirmation({...actor,action});
  let writes=0;
  const execute=async(name,args)=>{
   writes++;
   const verify=await verifyConfirmedLightResult({
    action:{name,args},serviceResult:{structuredContent:{success:true}},readState:fault,
   });
   return {verification:{status:verify.verified?"confirmed":"pending",detail:verify.status}};
  };
  const first=await queueConfirmedAction(actor,{authorize:async()=>true,execute});
  assert.equal(first.status,"pending");
  assert.equal(writes,1);
  assert.equal((await queueConfirmedAction(actor,{authorize:async()=>true,execute})).status,"missing");
  assert.equal(writes,1);
 }
});

test("Gate C: competing confirmations consume a single action",async()=>{
 createPendingConfirmation({...actor,action});
 let writes=0;
 const execute=async()=>{writes++;return {verification:{status:"confirmed"}};};
 const results=await Promise.all(Array.from({length:6},()=>queueConfirmedAction(actor,{authorize:async()=>true,execute})));
 assert.equal(results.filter(r=>r.status==="executed").length,1);
 assert.equal(results.filter(r=>r.status==="missing").length,5);
 assert.equal(writes,1);
});
test("Gate C: authorization outage and denial do not call executor",async()=>{
 createPendingConfirmation({...actor,action});
 let writes=0;
 const execute=async()=>{writes++;};
 for(const authorize of [async()=>{throw Error("offline")},async()=>false]){
  assert.equal((await queueConfirmedAction(actor,{authorize,execute})).status,"authorization_denied");
 }
 assert.equal(writes,0);
});
test("Gate C: expired confirmation cannot execute after delayed authorization",async()=>{
 const created=createPendingConfirmation({...actor,action,ttlMs:1000});
 let writes=0;
 const execute=async()=>{writes++;};
 const authorize=async()=>{await new Promise(resolve=>setTimeout(resolve,1300));return true;};
 const result=await queueConfirmedAction(actor,{authorize,execute});
 assert.equal(result.status,"expired");
 assert.equal(writes,0);
 assert.ok(created.token);
});

test("Gate C: hung authorization times out without service execution",async()=>{
 createPendingConfirmation({...actor,action});
 let writes=0;
 const result=await queueConfirmedAction(actor,{
  authorize:()=>new Promise(()=>{}),authorizationTimeoutMs:60,
  execute:async()=>{writes++;},
 });
 assert.equal(result.status,"authorization_denied");
 assert.equal(writes,0);
});
test("Gate C: cancellation during policy evaluation prevents execution",async()=>{
 createPendingConfirmation({...actor,action});
 let release;
 const authorize=()=>new Promise(resolve=>{release=()=>resolve(true);});
 let writes=0;
 const request=queueConfirmedAction(actor,{authorize,execute:async()=>{writes++;}});
 // Queue begins asynchronously: wait for authorization to become active.
 for(let i=0;i<100 && !release;i++)await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(typeof release,"function");
 assert.equal(cancelPendingConfirmation(actor),true);
 release();
 assert.equal((await request).status,"expired");
 assert.equal(writes,0);
});

test('Gate C: late positive authorization after timeout cannot dispatch',async()=>{
 createPendingConfirmation({...actor,action});
 let release,writes=0;
 const authorize=()=>new Promise(resolve=>{release=()=>resolve(true);});
 const result=await queueConfirmedAction(actor,{authorize,authorizationTimeoutMs:25,
  execute:async()=>{writes++;return {verification:{status:'confirmed'}};}});
 assert.equal(result.status,'authorization_denied');
 assert.equal(writes,0);
 release();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(writes,0);
});
