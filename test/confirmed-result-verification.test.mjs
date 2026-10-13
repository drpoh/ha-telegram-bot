import test from "node:test";
import assert from "node:assert/strict";
import {verifyConfirmedLightResult} from "../src/decision/confirmed-result-verification.mjs";
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
test("readback requires accepted service and exact entity identity",async()=>{
 const readState=async()=>({structuredContent:{data:{entity_id:"light.fixture",state:"on"}}});
 assert.equal((await verifyConfirmedLightResult({action,serviceResult:{structuredContent:{success:true}},readState})).verified,true);
 for(const options of [
  {serviceResult:{structuredContent:{success:false}},readState},
  {serviceResult:{structuredContent:{success:true}},readState:async()=>({data:{entity_id:"light.other",state:"on"}})},
  {serviceResult:{structuredContent:{success:true}},readState:async()=>({data:{entity_id:"light.fixture",state:"off"}})},
  {serviceResult:{structuredContent:{success:true}},readState:async()=>{throw Error("read failed")}},
  {serviceResult:{structuredContent:{success:true}},readState:async()=>({data:{state:"on"}})},
 ]) assert.equal((await verifyConfirmedLightResult({action,...options})).verified,false);
});
