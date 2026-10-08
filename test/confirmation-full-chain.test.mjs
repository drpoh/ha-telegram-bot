import test from "node:test";
import assert from "node:assert/strict";
import {clearPendingConfirmations,createPendingConfirmation} from "../src/decision/pending-confirmation.mjs";
import {queueConfirmedAction} from "../src/utils/queue.mjs";
import {authorizeConfirmedAction} from "../src/decision/confirmed-action-gate.mjs";
import {verifyConfirmedLightResult} from "../src/decision/confirmed-result-verification.mjs";

const actor={userId:701,chatId:702};
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const confirmPolicy={entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}};

test.beforeEach(()=>clearPendingConfirmations());

function fixture({policy=confirmPolicy,accepted=true,readback="on",readbackId="light.fixture"}={}){
 let writeCount=0;
 let readCount=0;
 const authorize=async(candidate,who)=>(await authorizeConfirmedAction({
  action:candidate,actor:who,expectedAction:action,policy,
  allowedEntityIds:["light.fixture"],
  readState:async()=>({data:{entity_id:"light.fixture",state:"off"}}),
 })).allowed;
 const execute=async(name,args)=>{
  writeCount++;
  const serviceResult={structuredContent:{success:accepted}};
  const verification=await verifyConfirmedLightResult({
   action:{name,args},serviceResult,
   readState:async()=>{readCount++;return {data:{entity_id:readbackId,state:readback}};},
  });
  return {structuredContent:{success:accepted},verification:{
   status:verification.verified?"confirmed":accepted?"pending":"failed",
   detail:verification.status,
  }};
 };
 return {authorize,execute,metrics:()=>({writeCount,readCount})};
}

test("explicit policy, consumed token, mock service and exact readback complete once",async()=>{
 createPendingConfirmation({...actor,action});
 const f=fixture();
 const first=await queueConfirmedAction(actor,f);
 assert.equal(first.status,"executed");
 assert.equal(first.result.verification.detail,"confirmed");
 assert.deepEqual(f.metrics(),{writeCount:1,readCount:1});
 assert.equal((await queueConfirmedAction(actor,f)).status,"missing");
 assert.equal(f.metrics().writeCount,1);
});

test("mock service success is not confirmation when readback is stale or mismatched",async()=>{
 for(const options of [{readback:"off"},{readbackId:"light.other"},{accepted:false}]){
  clearPendingConfirmations();
  createPendingConfirmation({...actor,action});
  const f=fixture(options);
  const result=await queueConfirmedAction(actor,f);
  assert.notEqual(result.status,"executed");
  assert.equal(f.metrics().writeCount,1);
  assert.equal((await queueConfirmedAction(actor,f)).status,"missing");
 }
});

test("denied policy never reaches mock service",async()=>{
 createPendingConfirmation({...actor,action});
 const f=fixture({policy:{entities:{"light.fixture":"deny"}}});
 assert.equal((await queueConfirmedAction(actor,f)).status,"authorization_denied");
 assert.equal(f.metrics().writeCount,0);
});
