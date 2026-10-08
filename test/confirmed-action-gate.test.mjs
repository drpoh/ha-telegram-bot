import test from "node:test";
import assert from "node:assert/strict";
import { authorizeConfirmedAction } from "../src/decision/confirmed-action-gate.mjs";
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.test"}};
const actor={userId:1,chatId:2};
const input=(more={})=>({action,expectedAction:structuredClone(action),actor,
 policy:{entities:{"light.test":{level:"confirm",services:["turn_on"]}}},
 allowedEntityIds:["light.test"],
 readState:async()=>({structuredContent:{data:{entity_id:"light.test",state:"off"}}}),...more});
test("isolated confirmed gate approves exact confirm policy and fresh differing state",async()=>{
 const r=await authorizeConfirmedAction(input());
 assert.equal(r.allowed,true);assert.equal(r.status,"authorized_pre_execution_only");
});
test("policy source and scope cannot be silently broadened",async()=>{
 for(const change of [
  {policy:{default:"suggest"}},
  {policy:{entities:{"light.test":"deny"}}},
  {policy:{entities:{"light.test":"auto_safe"}}},
  {policy:{entities:{"light.test":{level:"confirm",services:["turn_off"]}}}},
  {allowedEntityIds:["light.test","light.other"]},
  {allowedEntityIds:["light.other"]},
  {expectedAction:{...action,args:{...action.args,entity_id:"light.other"}}},
  {actor:{userId:1}},
  {action:{name:"ha_call_service",args:{domain:"lock",service:"unlock",entity_id:"lock.front"}}},
 ]) {
  assert.equal((await authorizeConfirmedAction(input(change))).allowed,false,JSON.stringify(change));
 }
});
test("missing or unavailable live preconditions block",async()=>{
 for(const readState of [
  undefined,
  async()=>{throw Error("MCP unavailable")},
  async()=>({structuredContent:{data:{entity_id:"light.test",state:"unavailable"}}}),
  async()=>({structuredContent:{data:{entity_id:"light.test",state:"on"}}}),
 ]) {
  const r=await authorizeConfirmedAction(input({readState}));
  assert.equal(r.allowed,false);
 }
});
