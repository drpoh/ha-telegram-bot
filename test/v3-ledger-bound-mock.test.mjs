import test from "node:test";
import assert from "node:assert/strict";
import {createV3IntentLedger} from "../src/decision/v3-intent-ledger.mjs";
import {createLedgerBoundMockDispatcher} from "../src/decision/v3-ledger-bound-mock.mjs";
test("ledger-bound dispatcher rejects unknown token without invoking any tool",async()=>{
 const ledger=createV3IntentLedger();
 let calls=0;
 const dispatch=createLedgerBoundMockDispatcher({
  ledger,policy:{},configPath:"/missing-fixture",
  readTool:async()=>{calls++;throw Error("must not read");},
  simulateWrite:async()=>{calls++;throw Error("must not write");},
 });
 assert.deepEqual(await dispatch({userId:42,chatId:43,token:"forged"}),{status:"missing"});
 assert.equal(calls,0);
});
test("ledger-bound dispatcher rejects dangerous action without HA tools",async()=>{
 const ledger=createV3IntentLedger();
 const actor={userId:42,chatId:43};
 const {token}=ledger.issue({...actor,userText:"Перезапусти HA",action:{
  name:"ha_call_service",args:{domain:"homeassistant",service:"restart",entity_id:"light.fixture"},
 }});
 let calls=0;
 const dispatch=createLedgerBoundMockDispatcher({
  ledger,policy:{},configPath:"/missing-fixture",
  readTool:async()=>{calls++;},simulateWrite:async()=>{calls++;},
 });
 assert.equal((await dispatch({...actor,token})).status,"denied");
 assert.equal(calls,0);
});
