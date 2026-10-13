import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createV3IntentLedger} from "../src/decision/v3-intent-ledger.mjs";
import {createLedgerBoundMockDispatcher} from "../src/decision/v3-ledger-bound-mock.mjs";
const actor={userId:771,chatId:772};
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const intent={...actor,userText:"Включи весь свет в Комната",action};
for(const fault of ["cancel","replace","expire"]){
 test("in-flight authorization is invalidated by "+fault,async()=>{
  const root=mkdtempSync(join(tmpdir(),"v3-inflight-"));
  try{
   const configPath=join(root,"reviewed.json");
   writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:"room",area_name:"Комната",light_ids:["light.fixture"],excluded_light_ids:[],switch_light_ids:[]}]}));
   let now=1000,writes=0,release,started;
   const entered=new Promise(resolve=>started=resolve);
   const gate=new Promise(resolve=>release=resolve);
   const ledger=createV3IntentLedger({clock:()=>now});
   const {token}=ledger.issue({...intent,ttlMs:100});
   const readTool=async(name,args)=>{
    if(name==="ha_list_floors_areas"){
     started();await gate;
     return {structuredContent:{success:true,floors:[{areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
    }
    if(name==="ha_search")return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
    if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state:"off"}}};
    throw Error("unexpected_tool");
   };
   const dispatch=createLedgerBoundMockDispatcher({ledger,policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},configPath,readTool,simulateWrite:async()=>{writes++;return {structuredContent:{success:true}};}});
   const running=dispatch({...actor,token});
   await entered;
   if(fault==="cancel")ledger.cancel(actor);
   else if(fault==="replace")ledger.issue({...intent,userText:"Выключи весь свет в Комната"});
   else now=1100;
   release();
   const outcome=await running;
   assert.notEqual(outcome.status,"verified");
   assert.equal(writes,0);
  }finally{rmSync(root,{recursive:true,force:true});}
 });
}
