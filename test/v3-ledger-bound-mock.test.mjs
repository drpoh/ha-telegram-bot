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

test("approved mock execution is single-use; cancellation and competing calls cannot replay",async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import("node:fs");
 const {tmpdir}=await import("node:os");
 const {join}=await import("node:path");
 const dir=mkdtempSync(join(tmpdir(),"v3-bound-"));
 try{
  const configPath=join(dir,"reviewed.json");
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:"room",area_name:"Комната",light_ids:["light.fixture"],excluded_light_ids:[],switch_light_ids:[]}]}));
  const actor={userId:55,chatId:66};
  const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
  const ledger=createV3IntentLedger();
  let state="off",writes=0;
  const readTool=async(name,args)=>{
   if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
   if(name==="ha_search")return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
   if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state}}};
   throw Error("unexpected_tool");
  };
  const dispatch=createLedgerBoundMockDispatcher({ledger,policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},configPath,readTool,simulateWrite:async()=>{writes++;state="on";return {structuredContent:{success:true}};}});
  let issued=ledger.issue({...actor,userText:"Включи весь свет в Комната",action});
  const results=await Promise.all([dispatch({...actor,token:issued.token}),dispatch({...actor,token:issued.token})]);
  assert.deepEqual(results.map(x=>x.status).sort(),["missing","verified"]);
  assert.equal(writes,1);
  assert.equal((await dispatch({...actor,token:issued.token})).status,"missing");
  issued=ledger.issue({...actor,userText:"Включи весь свет в Комната",action});
  assert.equal(ledger.cancel(actor),true);
  assert.equal((await dispatch({...actor,token:issued.token})).status,"missing");
  assert.equal(writes,1);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
