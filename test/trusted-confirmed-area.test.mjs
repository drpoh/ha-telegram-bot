import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {authorizeConfirmedAreaLight} from "../src/decision/trusted-confirmed-area.mjs";
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
test("trusted area confirmation resolves local review and HA inventory, not model allowlist",async()=>{
 const root=mkdtempSync(join(tmpdir(),"trusted-confirm-"));
 try {
  const configPath=join(root,"approved.json");
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:"room",area_name:"Комната",light_ids:["light.fixture"],excluded_light_ids:[],switch_light_ids:[]}]}));
  const calls=[];
  const callTool=async(name,args)=>{
   calls.push(name);
   if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
   if(name==="ha_search")return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
   if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state:"off"}}};
   throw Error("forbidden HA write");
  };
  const base={action,expectedAction:structuredClone(action),actor:{userId:2,chatId:3},
   policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},
   userText:"Включи весь свет в Комната",areaQuery:"Комната",configPath,callTool,allowedEntityIds:["light.attacker"]};
  const ok=await authorizeConfirmedAreaLight(base);
  assert.equal(ok.allowed,true);
  assert.equal(calls.includes("ha_call_service"),false);
  for(const change of [
   {configPath:join(root,"missing.json")},
   {areaQuery:"Неизвестная"},
   {userText:"Выключи весь свет в Комната"},
   {userText:"Включи весь свет в Кухня"},
   {userText:"Включи свет"},
   {action:{...action,args:{...action.args,entity_id:"light.attacker"}}},
   {callTool:async(name,args)=>{
    const value=await callTool(name,args);
    if(name==="ha_search" && args.domain_filter==="light")value.structuredContent.partial=true;
    return value;
   }},
   {callTool:async()=>{throw Error("MCP offline")}},
  ]){
   const r=await authorizeConfirmedAreaLight({...base,...change});
   assert.equal(r.allowed,false,JSON.stringify(change.action||change.areaQuery||"fault"));
  }
 }finally{rmSync(root,{recursive:true,force:true});}
});
