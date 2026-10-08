import test from "node:test";
import assert from "node:assert/strict";
import {clearPendingConfirmations,createPendingConfirmation} from "../src/decision/pending-confirmation.mjs";
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
